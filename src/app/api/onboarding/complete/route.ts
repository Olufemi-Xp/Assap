import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApiResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ApiResponse>(
        { ok: false, error: { code: "UNAUTHORIZED", message: "You must be signed in to complete registration" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      role,
      state,
      locationArea,
      businessName,
      serviceCategory,
      serviceDescription,
      phone,
      whatsapp,
      idType,
      selfiePath,
      idDocPath,
    } = body;

    const admin = createAdminClient();

    // 1. Update public.users record
    await admin
      .from("users")
      .upsert({
        id: user.id,
        email: user.email!,
        full_name: businessName || user.user_metadata?.full_name || user.email!.split("@")[0],
        role: role === "provider" ? "provider" : "customer",
        state: state || "lagos",
        location_area: locationArea || "",
        email_verified_at: new Date().toISOString(),
      });

    // 2. Save identity records if captured
    if (selfiePath && idDocPath) {
      await admin.from("identity_records").upsert({
        user_id: user.id,
        id_document_type: idType || "nin",
        selfie_storage_path: selfiePath,
        id_document_storage_path: idDocPath,
        capture_status: "submitted",
        submitted_at: new Date().toISOString(),
      });
    }

    // 3. If role is provider, create provider_profile and grant 1-month free trial
    if (role === "provider") {
      const { data: profile, error: profileErr } = await admin
        .from("provider_profiles")
        .upsert(
          {
            user_id: user.id,
            business_name: businessName,
            service_category: serviceCategory || "plumber",
            service_description: serviceDescription || "Local certified service provider.",
            state: state || "lagos",
            location_area: locationArea,
            phone_number: phone,
            whatsapp_number: whatsapp || phone,
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (profileErr) {
        throw new Error(profileErr.message);
      }

      // Check if provider already has a subscription
      const { data: existingSub } = await admin
        .from("subscriptions")
        .select("id")
        .eq("provider_id", profile.id)
        .single();

      if (!existingSub) {
        const now = new Date();
        const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days free trial

        await admin.from("subscriptions").insert({
          provider_id: profile.id,
          plan_type: "free_trial",
          amount_ngn: 0,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: end.toISOString(),
        });
      }

      return NextResponse.json<ApiResponse>({
        ok: true,
        data: { providerId: profile.id, redirect: "/provider/dashboard?trial=started" },
      });
    }

    return NextResponse.json<ApiResponse>({
      ok: true,
      data: { redirect: "/explore" },
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: "ONBOARDING_ERROR", message: (error as Error).message } },
      { status: 500 }
    );
  }
}
