
export const SELLER_ROLES = [
  "ECommerceSeller",
  "Influencer",
  "Affiliator",
  "IndividualMerchant",
  "Wholesaler",
  "Celebrity",
  "ProductManager", // As listed by user, might be an internal role.
  "OnlineSeller",   // General category
] as const;

export type SellerRole = (typeof SELLER_ROLES)[number];

export interface SellerPackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string; // e.g., "INR", "USD"
  billing_interval: "monthly" | "annually" | "one-time";
  features: string[];
  applicable_seller_roles: SellerRole[];
  is_active: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
