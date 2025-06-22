
import { z } from 'zod';

export const REFERRAL_STATUSES = ["Pending", "Completed", "Converted"] as const;
export type ReferralStatus = typeof REFERRAL_STATUSES[number];

export const PAYOUT_STATUSES = ["Pending", "Paid", "Rejected"] as const;
export type PayoutStatus = typeof PAYOUT_STATUSES[number];

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
  coinsAwarded: number;
  payoutStatus: PayoutStatus;
}

export type SortableReferralKeys = keyof Pick<Referral, 'referralDate' | 'status' | 'coinsAwarded' | 'payoutStatus'>;
