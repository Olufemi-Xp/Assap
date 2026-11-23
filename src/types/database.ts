export type UserRole = "customer" | "provider" | "admin";

export type IdDocumentType = "nin" | "voters_card" | "drivers_license" | "international_passport";

export type IdentityCaptureStatus = "submitted" | "flagged" | "reviewed";

export type SubscriptionPlanType = "free_trial" | "monthly_1000_ngn";

export type SubscriptionStatus = "pending_payment" | "active" | "expired" | "cancelled";

export type PaymentEventStatus = "initialized" | "succeeded" | "failed" | "ignored_duplicate";

export type ReportReason = "fraud_or_scam" | "fake_profile_or_id" | "harassment_or_abuse" | "misleading_service" | "other";

export type ReportStatus = "open" | "under_review" | "resolved" | "dismissed";

export interface DbUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  email_verified_at: string | null;
  state: string | null;
  location_area: string | null;
  is_suspended: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbIdentityRecord {
  id: string;
  user_id: string;
  id_document_type: IdDocumentType;
  selfie_storage_path: string;
  id_document_storage_path: string;
  capture_status: IdentityCaptureStatus;
  submitted_at: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProviderProfile {
  id: string;
  user_id: string;
  business_name: string;
  service_category: string;
  service_description: string;
  state: string;
  location_area: string;
  phone_number: string;
  whatsapp_number: string;
  average_rating: number;
  rating_count: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbSubscription {
  id: string;
  provider_id: string;
  plan_type: SubscriptionPlanType;
  amount_ngn: number;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  paystack_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbPaymentEvent {
  id: string;
  subscription_id: string | null;
  provider_id: string;
  paystack_reference: string;
  amount_ngn: number;
  currency: string;
  status: PaymentEventStatus;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbRating {
  id: string;
  provider_id: string;
  customer_id: string;
  stars: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbUserBlock {
  id: string;
  blocker_id: string;
  blocked_user_id: string;
  created_at: string;
  updated_at: string;
}
