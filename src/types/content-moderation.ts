
export const FLAG_TYPES = [
  "Nudity or Sexual Content",
  "Hate Speech or Symbols",
  "Violent or Graphic Content",
  "Harassment or Bullying",
  "Misinformation",
  "Copyright Infringement",
  "Spam or Scams",
  "Illegal Activities",
  "Other Violation"
] as const;
export type FlagType = typeof FLAG_TYPES[number];

export interface FlagDetails {
  type: FlagType;
  reason?: string;
  flaggedAt: string; // ISO Date
}

export type ContentStatus = "Pending" | "Approved" | "Rejected";

export interface AdminComment {
  id: string;
  adminName: string;
  text: string;
  timestamp: string; // ISO Date string
}

export interface ContentItem {
  id: string;
  type: "Video" | "Description";
  title: string;
  uploader: string;
  date: string; // "YYYY-MM-DDTHH:mm:ssZ"
  status: ContentStatus;
  reason?: string;
  thumbnailUrl?: string; // For videos
  descriptionText?: string; // For descriptions
  videoUrl?: string; // For video playback
  avgWatchTimeSeconds?: number;
  flagDetails?: FlagDetails;
  adminComments?: AdminComment[];
  // New product fields
  price?: number;
  category?: string;
  stockQuantity?: number;
  isProductVisible?: boolean;
}

export type SortableContentKeys = keyof Pick<ContentItem, 'id' | 'title' | 'uploader' | 'date' | 'status' | 'avgWatchTimeSeconds' | 'price' | 'category' | 'stockQuantity'>;


export const PREDEFINED_CONTENT_REJECTION_REASONS = [
  "Copyright Infringement",
  "Inappropriate Content (Nudity, Violence, Hate Speech)",
  "Low Video/Audio Quality",
  "Misleading Information or Clickbait",
  "Spam or Unsolicited Commercial Content",
  "Violates Platform Policy",
  "Other (Please specify)"
] as const;
export type PredefinedContentRejectionReason = typeof PREDEFINED_CONTENT_REJECTION_REASONS[number];
