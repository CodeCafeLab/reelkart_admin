
"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, Mail, DollarSign, CheckCircle, XCircle, Clock, UserPlus, Share2, Gem } from "lucide-react";
import type { Referral, ReferralStatus, PayoutStatus } from "@/types/referral";
import { format, parseISO } from 'date-fns';

interface ReferralDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  referral: Referral | null;
}

const referralStatusVariantMap: Record<ReferralStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "secondary",
  Completed: "default",
  Converted: "default",
};

const referralStatusIconMap: Record<ReferralStatus, React.ElementType> = {
  Pending: Clock,
  Completed: UserPlus,
  Converted: CheckCircle,
};

const payoutStatusVariantMap: Record<PayoutStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "secondary",
  Paid: "default",
  Rejected: "destructive",
};

const payoutStatusIconMap: Record<PayoutStatus, React.ElementType> = {
  Pending: Clock,
  Paid: CheckCircle,
  Rejected: XCircle,
};

export function ReferralDetailsSheet({
  isOpen,
  onOpenChange,
  referral,
}: ReferralDetailsSheetProps) {
  if (!referral) {
    return null;
  }

  const ReferralStatusIcon = referralStatusIconMap[referral.status];
  const PayoutStatusIcon = payoutStatusIconMap[referral.payoutStatus];

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "PPpp");
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            <Share2 className="h-6 w-6 text-primary" />
            Referral Details
          </SheetTitle>
          <SheetDescription>
            Viewing details for Referral ID: <span className="font-medium text-primary">{referral.id}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Referrer Details (Who referred)</h3>
            <Separator className="mb-3"/>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Name:</span> {referral.referrerName}</p>
              <p><span className="font-semibold">Email:</span> {referral.referrerEmail}</p>
              <p><span className="font-semibold">User ID:</span> {referral.referrerId}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Referee Details (Who was referred)</h3>
            <Separator className="mb-3"/>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Name:</span> {referral.refereeName}</p>
              <p><span className="font-semibold">Email:</span> {referral.refereeEmail}</p>
              <p><span className="font-semibold">User ID:</span> {referral.refereeId}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Referral Status & Reward</h3>
            <Separator className="mb-3"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Referral Date</p>
                  <p className="font-medium">{formatDate(referral.referralDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ReferralStatusIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Referral Status</p>
                  <Badge variant={referralStatusVariantMap[referral.status]} className={referral.status === "Converted" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                    {referral.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Gem className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Coins Awarded</p>
                  <p className="font-medium">{referral.coinsAwarded}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PayoutStatusIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Payout Status</p>
                  <Badge variant={payoutStatusVariantMap[referral.payoutStatus]} className={referral.payoutStatus === "Paid" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                    {referral.payoutStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="p-6 pt-4 border-t mt-auto">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
