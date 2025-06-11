
import { z } from 'zod';

export const NOTIFICATION_AUDIENCE_TYPES = [
  "AllUsers", 
  "AllSellers", 
  "SpecificUser", // Requires a userId
  "SpecificSeller", // Requires a sellerId
  "UserGroup", // Requires a group name/ID
  "SellerGroup" // Requires a group name/ID
] as const;
export type NotificationAudienceType = (typeof NOTIFICATION_AUDIENCE_TYPES)[number];

export const NOTIFICATION_STATUSES = ["Draft", "Sent", "Scheduled", "Failed"] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  audienceType: NotificationAudienceType;
  audienceTarget?: string | null; // e.g., User ID, Group Name
  status: NotificationStatus;
  createdAt: string; // ISO string date
  sentAt?: string | null; // ISO string date
  scheduledAt?: string | null; // ISO string date
}

export type SortableNotificationKeys = keyof Pick<NotificationItem, 'title' | 'audienceType' | 'status' | 'createdAt' | 'sentAt'>;

// Schema for creating a new notification
export const createNotificationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long.").max(100, "Title must be 100 characters or less."),
  message: z.string().min(10, "Message must be at least 10 characters long.").max(1000, "Message must be 1000 characters or less."),
  audienceType: z.enum(NOTIFICATION_AUDIENCE_TYPES),
  audienceTarget: z.string().optional(), // Required based on audienceType, handled in form logic
}).refine(data => {
  if ((data.audienceType === "SpecificUser" || data.audienceType === "SpecificSeller" || data.audienceType === "UserGroup" || data.audienceType === "SellerGroup") && (!data.audienceTarget || data.audienceTarget.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Audience Target is required for this audience type.",
  path: ["audienceTarget"],
});

export type CreateNotificationFormValues = z.infer<typeof createNotificationSchema>;
