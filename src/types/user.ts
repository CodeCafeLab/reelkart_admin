
export type UserStatus = "Active" | "Suspended" | "PendingVerification";

export interface UserLoginLog {
  id: string;
  timestamp: string; // ISO String
  ipAddress: string;
  status: 'Success' | 'Failed' | 'Attempt';
  userAgent?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string; // "YYYY-MM-DDTHH:mm:ssZ" for easier sorting
  status: UserStatus;
  profileImageUrl?: string;
  loginLogs?: UserLoginLog[];
  lastLogin?: string | null; // ISO string
  emailVerified: boolean;
  phone?: string | null;
}

export type SortableUserKeys = keyof Pick<User, 'id' | 'name' | 'email' | 'joinDate' | 'status' | 'lastLogin'>;
