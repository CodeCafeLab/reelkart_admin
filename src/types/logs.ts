
export const THIRD_PARTY_SERVICES = ["OpenAI", "SMSProvider", "LogisticsAPI", "RunwayML", "PaymentGateway", "AnalyticsTool"] as const;
export type ThirdPartyService = (typeof THIRD_PARTY_SERVICES)[number];

export const LOG_STATUSES = ["Success", "Failed", "Pending", "Warning"] as const;
export type LogStatus = (typeof LOG_STATUSES)[number];

export interface LogEntry {
  id: string;
  timestamp: string; // ISO string date
  service: ThirdPartyService;
  event: string; // e.g., "API Call: /v1/chat/completions", "Message Sent", "Shipment Created"
  userId?: string | null;
  cost?: number | null; // Cost in the platform's base currency unit (e.g., cents, paisa, or main unit)
  status: LogStatus;
  durationMs?: number | null; // Duration of the event in milliseconds
  ipAddress?: string | null;
  details?: string | Record<string, any> | null; // Can be simple string or a structured object
  correlationId?: string | null; // For tracking related events
}

export type SortableLogKeys = keyof Pick<LogEntry, 'timestamp' | 'service' | 'event' | 'userId' | 'cost' | 'status' | 'durationMs'>;

export interface DashboardStat {
    service: ThirdPartyService | "Total";
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalCost: number; // Stored as main unit (e.g. INR, USD)
}
