
export type UserStatus = "Active" | "Suspended" | "PendingVerification";
export type UserType = "Buyer" | "Normal User";

export interface UserLoginLog {
  id: string;
  timestamp: string; // ISO String
  ipAddress: string;
  status: 'Success' | 'Failed' | 'Attempt';
  userAgent?: string;
}

export interface PurchaseHistoryItem {
  orderId: string;
  productName: string;
  purchaseDate: string; // ISO String
  amount: number;
  currency: string; // e.g., "INR", "USD"
  status: "Completed" | "Pending" | "Failed" | "Refunded";
}

export interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string; // "YYYY-MM-DDTHH:mm:ssZ" for easier sorting
  status: UserStatus;
  userType: UserType;
  profileImageUrl?: string;
  loginLogs?: UserLoginLog[];
  lastLogin?: string | null; // ISO string
  emailVerified: boolean;
  phone?: string | null;
  purchaseHistory?: PurchaseHistoryItem[];
}

export type SortableUserKeys = keyof Pick<User, 'id' | 'name' | 'email' | 'joinDate' | 'status' | 'lastLogin' | 'userType'>;
