
export interface ReturnDetails {
  requestId: string;
  reason: string;
  requestedDate: string; // ISO Date
  status: "Pending" | "Approved" | "Rejected" | "In Transit" | "Received" | "Completed";
  adminNotes?: string;
  rejectionReason?: string;
}

export type ReturnStatus = ReturnDetails['status'];

export const ALL_RETURN_STATUSES: ReturnStatus[] = ["Pending", "Approved", "Rejected", "In Transit", "Received", "Completed"];


export type OrderStatus =
  | "Pending Payment"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned";

export const ALL_ORDER_STATUSES: OrderStatus[] = [
    "Pending Payment", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"
];

export interface Order {
  id: string;
  customer: string;
  seller: string;
  date: string;
  status: OrderStatus;
  trackingId: string | null;
  returnDetails?: ReturnDetails | null;
}

export type SortableOrderKeys = keyof Order;
export type SortableReturnKeys = keyof Order | 'returnStatus' | 'returnReason';
