
export interface RevenueMetric {
  title: string;
  value: string | number;
  description?: string;
}

export type SubscriptionStatus = "Active" | "Expired" | "Cancelled" | "PendingPayment";

export interface SubscriptionPurchase {
  id: string;
  sellerId: string;
  sellerName: string; 
  sellerBusinessName: string;
  packageId: string;
  packageName: string;
  price: number;
  currency: string; 
  billingInterval: "monthly" | "annually" | "one-time";
  purchaseDate: string; // ISO string "YYYY-MM-DDTHH:mm:ssZ"
  renewalDate?: string | null; // ISO string, if applicable
  status: SubscriptionStatus;
  paymentMethod?: string; 
  transactionId?: string;
}

export type SortableSubscriptionKeys = keyof Pick<SubscriptionPurchase, 'sellerName' | 'packageName' | 'price' | 'purchaseDate' | 'status'>;
