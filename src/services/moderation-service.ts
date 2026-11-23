import { createAdminClient } from "@/lib/supabase/admin";
import { AppError, ValidationError } from "@/lib/errors";
import type { ReportReason } from "@/types/database";

export interface SubmitReportInput {
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  details?: string | null;
}

export const moderationService = {
  async submitReport(input: SubmitReportInput) {
    if (input.reporterId === input.reportedUserId) {
      throw new ValidationError("You cannot report your own account");
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("reports")
      .insert({
        reporter_id: input.reporterId,
        reported_user_id: input.reportedUserId,
        reason: input.reason,
        details: input.details || null,
        status: "open",
      })
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 500, "REPORT_SUBMISSION_ERROR");
    }

    return data;
  },

  async blockUser(blockerId: string, blockedUserId: string) {
    if (blockerId === blockedUserId) {
      throw new ValidationError("You cannot block your own account");
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("user_blocks")
      .upsert({ blocker_id: blockerId, blocked_user_id: blockedUserId }, { onConflict: "blocker_id,blocked_user_id" })
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 500, "BLOCK_USER_ERROR");
    }

    return data;
  },

  async unblockUser(blockerId: string, blockedUserId: string) {
    const admin = createAdminClient();
    const { error } = await admin
      .from("user_blocks")
      .delete()
      .match({ blocker_id: blockerId, blocked_user_id: blockedUserId });

    if (error) {
      throw new AppError(error.message, 500, "UNBLOCK_USER_ERROR");
    }

    return { success: true };
  },
};
