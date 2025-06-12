
import { z } from 'zod';

// Renamed from NOTIFICATION_AUDIENCE_TYPES
export const BROADCAST_MESSAGE_AUDIENCE_TYPES = [
  "AllUsers", 
  "AllSellers", 
  "SpecificUser", 
  "SpecificSeller", 
  "UserGroup", 
  "SellerGroup" 
] as const;
export type BroadcastMessageAudienceType = (typeof BROADCAST_MESSAGE_AUDIENCE_TYPES)[number];

// Renamed from NOTIFICATION_STATUSES
export const BROADCAST_MESSAGE_STATUSES = ["Draft", "Sent", "Scheduled", "Failed"] as const;
export type BroadcastMessageStatus = (typeof BROADCAST_MESSAGE_STATUSES)[number];

// Renamed from NotificationItem
export interface BroadcastMessageItem {
  id: string;
  title: string;
  message: string;
  audienceType: BroadcastMessageAudienceType;
  audienceTarget?: string | null; 
  status: BroadcastMessageStatus;
  createdAt: string; 
  sentAt?: string | null; 
  scheduledAt?: string | null; 
}

// Renamed from SortableNotificationKeys
export type SortableBroadcastMessageKeys = keyof Pick<BroadcastMessageItem, 'title' | 'audienceType' | 'status' | 'createdAt' | 'sentAt'>;

// Renamed from createNotificationSchema
export const createBroadcastMessageSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long.").max(100, "Title must be 100 characters or less."),
  message: z.string().min(10, "Message must be at least 10 characters long.").max(1000, "Message must be 1000 characters or less."),
  audienceType: z.enum(BROADCAST_MESSAGE_AUDIENCE_TYPES),
  audienceTarget: z.string().optional(), 
}).refine(data => {
  if ((data.audienceType === "SpecificUser" || data.audienceType === "SpecificSeller" || data.audienceType === "UserGroup" || data.audienceType === "SellerGroup") && (!data.audienceTarget || data.audienceTarget.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Audience Target is required for this audience type.",
  path: ["audienceTarget"],
});

// Renamed from CreateNotificationFormValues
export type CreateBroadcastMessageFormValues = z.infer<typeof createBroadcastMessageSchema>;
