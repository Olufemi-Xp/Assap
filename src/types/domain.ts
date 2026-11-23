import type {
  DbUser,
  DbProviderProfile,
  DbSubscription,
  DbRating,
  UserRole,
  SubscriptionPlanType,
  SubscriptionStatus,
} from "./database";
import type { NigeriaState } from "@/lib/constants/nigeria-states";
import type { ServiceCategory } from "@/lib/constants/service-categories";

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  state: NigeriaState | null;
}

export interface ProviderListItemDTO {
  id: string;
  userId: string;
  businessName: string;
  serviceCategory: ServiceCategory;
  serviceDescription: string;
  state: NigeriaState;
  locationArea: string;
  averageRating: number;
  ratingCount: number;
  // Contact gating fields (strictly sanitized)
  canContact: boolean;
  phoneNumber?: string;
  whatsappNumber?: string;
  subscriptionStatusBadge: "trial_active" | "paid_active" | "contact_hidden";
}

export interface ProviderDetailDTO extends ProviderListItemDTO {
  ratings: Array<{
    id: string;
    customerName: string;
    stars: number;
    comment: string | null;
    createdAt: string;
  }>;
}

export interface SubscriptionStatusDTO {
  providerId: string;
  planType: SubscriptionPlanType;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  daysRemaining: number;
  isActive: boolean;
  canContact: boolean;
  renewalAmountNgn: number;
}
