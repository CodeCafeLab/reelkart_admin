
import { z } from 'zod';

export const REFERRAL_STATUSES = ["Pending", "Completed", "Converted"] as const;
export type ReferralStatus = typeof REFERRAL_STATUSES[number];

export const COMMISSION_STATUSES = ["Pending", "Paid", "Rejected"] as const;
export type CommissionStatus = typeof COMMISSION_STATUSES[number];

export interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referrerEmail: string;
  refereeId: string;
  refereeName: string;
  refereeEmail: string;
  referralDate: string; // ISO String
  status: ReferralStatus;
  commissionAmount: number;
  currency: string;
  commissionStatus: CommissionStatus;
}

export type SortableReferralKeys = keyof Pick<Referral, 'referralDate' | 'status' | 'commissionAmount' | 'commissionStatus'>;
