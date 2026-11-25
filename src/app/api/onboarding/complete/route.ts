import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types/api";
import type { SupabaseClient } from "@supabase/supabase-js";

function parseDataUrl(dataUrl: string): { buffer: Buffer; mime: string; ext: string } | null {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i);
  if (!match) return null;
  const mime = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase();
  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  return { buffer: Buffer.from(match[2], "base64"), mime, ext };
}

async function uploadIdentityAsset(
  supabase: SupabaseClient,
  bucket: "identity-selfies" | "identity-documents",
  userId: string,
  fileOrDataUrl: File | string | null,
  fallbackPath: string
): Promise<string> {
  if (!fileOrDataUrl) return fallbackPath;

  if (fileOrDataUrl instanceof File && fileOrDataUrl.size > 0) {
    const ext =
      fileOrDataUrl.type === "image/png" ? "png" : fileOrDataUrl.type === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, await fileOrDataUrl.arrayBuffer(), {
        contentType: fileOrDataUrl.type || "image/jpeg",
        upsert: true,
      });
    return error ? fallbackPath : path;
  }

  if (typeof fileOrDataUrl === "string" && fileOrDataUrl.startsWith("data:image/")) {
    const parsed = parseDataUrl(fileOrDataUrl);
    if (!parsed) return fallbackPath;
    const path = `${userId}/${Date.now()}.${parsed.ext}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, parsed.buffer, { contentType: parsed.mime, upsert: true });
    return error ? fallbackPath : path;
  }

  return typeof fileOrDataUrl === "string" && fileOrDataUrl.trim() ? fileOrDataUrl.trim() : fallbackPath;
}

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

    const contentType = request.headers.get("content-type") || "";
    let role = "customer";
    let state = "lagos";
    let city: string | null = null;
    let lga: string | null = null;
    let locationArea = "";
    let businessName = "";
    let serviceTitle = "";
    let serviceCategory = "plumber";
    let serviceDescription = "";
    let serviceAreas: string[] = [];
    let phone = "";
    let whatsapp = "";
    let idType = "nin";
    let selfieInput: File | string | null = null;
    let idDocInput: File | string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const str = (k: string) => {
        const v = form.get(k);
        return typeof v === "string" ? v.trim() : "";
      };
      role = str("role") || "customer";
      state = str("state") || "lagos";
      city = str("city") || null;
      lga = str("lga") || null;
      locationArea = str("locationArea");
      businessName = str("businessName");
      serviceTitle = str("serviceTitle");
      serviceCategory = str("serviceCategory") || "plumber";
      serviceDescription = str("serviceDescription");
      const rawAreas = str("serviceAreas");
      if (rawAreas) {
        try {
          const parsed = JSON.parse(rawAreas);
          if (Array.isArray(parsed)) serviceAreas = parsed.map((x) => String(x).trim()).filter(Boolean);
        } catch {
          serviceAreas = rawAreas.split(",").map((x) => x.trim()).filter(Boolean);
        }
      }
      phone = str("phone");
      whatsapp = str("whatsapp") || phone;
      idType = str("idType") || "nin";
      const selfieVal = form.get("selfieImage");
      selfieInput = selfieVal instanceof File ? selfieVal : typeof selfieVal === "string" ? selfieVal : null;
      const idVal = form.get("idDocumentImage");
      idDocInput = idVal instanceof File ? idVal : typeof idVal === "string" ? idVal : null;
    } else {
      const body = await request.json();
      role = body.role || "customer";
      state = body.state || "lagos";
      city = body.city || null;
      lga = body.lga || null;
      locationArea = body.locationArea || "";
      businessName = body.businessName || "";
      serviceTitle = body.serviceTitle || "";
      serviceCategory = body.serviceCategory || "plumber";
      serviceDescription = body.serviceDescription || "";
      serviceAreas = Array.isArray(body.serviceAreas) ? body.serviceAreas : [];
      phone = body.phone || "";
      whatsapp = body.whatsapp || phone;
      idType = body.idType || "nin";
      selfieInput = body.selfieImage || body.selfiePath || null;
      idDocInput = body.idDocumentImage || body.idDocPath || null;
    }

    // 1. Update public.users record (fallback gracefully if city/lga aren't migrated)
    const userBase = {
      id: user.id,
      email: user.email!,
      full_name: businessName || user.user_metadata?.full_name || user.email!.split("@")[0],
      role: role === "provider" ? "provider" : "customer",
      state,
      location_area: locationArea,
      email_verified_at: new Date().toISOString(),
    };
    const uRes = await supabase.from("users").upsert({ ...userBase, city, lga });
    if (uRes.error) {
      await supabase.from("users").upsert(userBase);
    }

    // 2. Upload & save identity records
    const selfiePath = await uploadIdentityAsset(
      supabase,
      "identity-selfies",
      user.id,
      selfieInput,
      `${user.id}/selfie-${Date.now()}.jpg`
    );
    const idDocPath = await uploadIdentityAsset(
      supabase,
      "identity-documents",
      user.id,
      idDocInput,
      `${user.id}/id-${Date.now()}.jpg`
    );

    await supabase.from("identity_records").upsert(
      {
        user_id: user.id,
        id_document_type: idType,
        selfie_storage_path: selfiePath,
        id_document_storage_path: idDocPath,
        capture_status: "submitted",
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    // 3. If role is provider, create provider_profile and grant 1-month free trial
    if (role === "provider") {
      const descriptionFallback =
        serviceDescription || (serviceAreas.length > 0 ? serviceAreas.join(", ") : "Local certified service provider.");

      const basePayload = {
        user_id: user.id,
        business_name: businessName,
        service_category: serviceCategory,
        service_description: descriptionFallback,
        state,
        location_area: locationArea,
        phone_number: phone,
        whatsapp_number: whatsapp || phone,
      };

      let { data: profile, error: profileErr } = await supabase
        .from("provider_profiles")
        .upsert(
          {
            ...basePayload,
            city,
            lga,
            service_title: serviceTitle || businessName,
            service_areas: serviceAreas,
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (profileErr) {
        const retry = await supabase
          .from("provider_profiles")
          .upsert(basePayload, { onConflict: "user_id" })
          .select()
          .single();
        profile = retry.data;
        profileErr = retry.error;
      }

      if (profileErr || !profile) {
        throw new Error(profileErr?.message || "Failed to create provider profile");
      }

      try {
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("provider_id", profile.id)
          .maybeSingle();

        if (!existingSub) {
          const now = new Date();
          const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          await supabase.from("subscriptions").insert({
            provider_id: profile.id,
            plan_type: "free_trial",
            amount_ngn: 0,
            status: "active",
            current_period_start: now.toISOString(),
            current_period_end: end.toISOString(),
          });
        }
      } catch {
        // Non-fatal under RLS
      }

      return NextResponse.json<ApiResponse>({
        ok: true,
        data: {
          providerId: profile.id,
          trialStarted: true,
          message: "You have successfully completed your profile setup as a service provider.",
          redirect: "/provider/dashboard?trial=started",
        },
      });
    }

    return NextResponse.json<ApiResponse>({
      ok: true,
      data: {
        message: "Registration completed successfully.",
        redirect: "/explore",
      },
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      { ok: false, error: { code: "ONBOARDING_ERROR", message: (error as Error).message } },
      { status: 500 }
    );
  }
}
