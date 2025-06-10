
"use client";

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
import { CalendarDays, User, Store, Package, DollarSign as DollarSignIcon, CreditCard, Tag, RefreshCw, CheckCircle, XCircle, AlertCircle, Hash } from "lucide-react";
import type { SubscriptionPurchase, SubscriptionStatus } from "@/types/revenue";
import { format, parseISO } from 'date-fns';

interface SubscriptionDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  subscription: SubscriptionPurchase | null;
  formatCurrency: (amount: number) => string;
}

const statusVariantMap: Record<SubscriptionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Active: "default",
  Expired: "outline",
  Cancelled: "destructive",
  PendingPayment: "secondary"
};

const statusIconMap: Record<SubscriptionStatus, React.ElementType> = {
  Active: CheckCircle,
  Expired: AlertCircle,
  Cancelled: XCircle,
  PendingPayment: DollarSignIcon
};

export function SubscriptionDetailsSheet({
  isOpen,
  onOpenChange,
  subscription,
  formatCurrency,
}: SubscriptionDetailsSheetProps) {
  if (!subscription) {
    return null;
  }

  const currentStatusVariant = statusVariantMap[subscription.status];
  const StatusIcon = statusIconMap[subscription.status];

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "PPpp"); // e.g. Jul 22, 2024, 4:30 PM
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            <DollarSignIcon className="h-6 w-6 text-primary" />
            Subscription Details
          </SheetTitle>
          <SheetDescription>
            Viewing details for Subscription ID: <span className="font-medium text-primary">{subscription.id}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Seller Information</h3>
            <Separator className="mb-3"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Seller Name</p>
                  <p className="font-medium">{subscription.sellerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Business Name</p>
                  <p className="font-medium">{subscription.sellerBusinessName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-full">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Seller ID</p>
                  <p className="font-medium">{subscription.sellerId}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Package & Billing</h3>
            <Separator className="mb-3"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Package Name</p>
                  <p className="font-medium">{subscription.packageName}</p>
                </div>
              </div>
               <div className="flex items-center gap-2">
                <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-medium">{formatCurrency(subscription.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Billing Interval</p>
                  <p className="font-medium capitalize">{subscription.billingInterval}</p>
                </div>
              </div>
               <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Package ID</p>
                  <p className="font-medium">{subscription.packageId}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Subscription Dates & Status</h3>
            <Separator className="mb-3"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Purchase Date</p>
                  <p className="font-medium">{formatDate(subscription.purchaseDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Next Renewal Date</p>
                  <p className="font-medium">{formatDate(subscription.renewalDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-full">
                <StatusIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={currentStatusVariant} className={subscription.status === 'Active' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                    {subscription.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Payment Information</h3>
            <Separator className="mb-3"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                 <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-xs text-muted-foreground">Payment Method</p>
                        <p className="font-medium">{subscription.paymentMethod || "N/A"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <p className="text-xs text-muted-foreground">Transaction ID</p>
                        <p className="font-medium">{subscription.transactionId || "N/A"}</p>
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
