import { createAdminClient } from "@/lib/supabase/admin";
import { AppError } from "@/lib/errors";
import type { IdDocumentType } from "@/types/database";

export interface IdentityCaptureData {
  userId: string;
  idDocumentType: IdDocumentType;
  selfieStoragePath: string;
  idDocumentStoragePath: string;
}

export const identityService = {
  async recordIdentityCapture(data: IdentityCaptureData) {
    const admin = createAdminClient();

    const { data: record, error } = await admin
      .from("identity_records")
      .upsert({
        user_id: data.userId,
        id_document_type: data.idDocumentType,
        selfie_storage_path: data.selfieStoragePath,
        id_document_storage_path: data.idDocumentStoragePath,
        capture_status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 500, "IDENTITY_RECORD_ERROR");
    }

    return record;
  },

  async activateProviderFreeTrial(providerId: string) {
    const admin = createAdminClient();

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const { data: subscription, error } = await admin
      .from("subscriptions")
      .insert({
        provider_id: providerId,
        plan_type: "free_trial",
        amount_ngn: 0,
        status: "active",
        current_period_start: startDate.toISOString(),
        current_period_end: endDate.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 500, "FREE_TRIAL_ACTIVATION_ERROR");
    }

    return subscription;
  },
};
