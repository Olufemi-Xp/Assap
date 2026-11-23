import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AppError, ValidationError } from "@/lib/errors";
import type { UserRole } from "@/types/database";

export const authService = {
  async sendOtp(email: string) {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      throw new AppError(error.message, 400, "AUTH_OTP_ERROR");
    }

    return { sent: true };
  },

  async verifyOtp(email: string, token: string, role: UserRole = "customer", fullName?: string) {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error || !data.user) {
      throw new ValidationError(error?.message || "Invalid or expired OTP");
    }

    // Upsert local application user profile
    const adminClient = createAdminClient();
    const { data: userProfile, error: profileError } = await adminClient
      .from("users")
      .upsert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName || data.user.email!.split("@")[0],
        role,
        email_verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      throw new AppError(profileError.message, 500, "PROFILE_CREATION_ERROR");
    }

    return { user: userProfile, session: data.session };
  },
};
