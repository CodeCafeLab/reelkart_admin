
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
import { CalendarDays, User, Store, Package, DollarSign as DollarSignIcon, CreditCard, Settings, RefreshCw, ShieldAlert, Trash2 } from "lucide-react";
import type { SubscriptionPurchase, SubscriptionStatus } from "@/types/revenue";
import { format, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

interface ManageSubscriptionSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  subscription: SubscriptionPurchase | null;
  formatCurrency: (amount: number) => string;
  // Add a callback for when a subscription is updated locally (placeholder for now)
  onSubscriptionUpdated?: (updatedSubscription: SubscriptionPurchase) => void;
}

const statusVariantMap: Record<SubscriptionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Active: "default",
  Expired: "outline",
  Cancelled: "destructive",
  PendingPayment: "secondary"
};

export function ManageSubscriptionSheet({
  isOpen,
  onOpenChange,
  subscription,
  formatCurrency,
  onSubscriptionUpdated,
}: ManageSubscriptionSheetProps) {
  const { toast } = useToast();

  if (!subscription) {
    return null;
  }

  const currentStatusVariant = statusVariantMap[subscription.status];

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "PPpp"); 
    } catch (e) {
      return "Invalid Date";
    }
  };

  const handlePlaceholderAction = (actionName: string) => {
    toast({
      title: "Placeholder Action",
      description: `${actionName} for subscription ${subscription.id}. This functionality is not yet implemented.`,
    });
  };
  
  // Example of a more specific placeholder action
  const handleCancelSubscription = () => {
     if (window.confirm(`Are you sure you want to cancel the subscription for ${subscription.packageName} for ${subscription.sellerName}? This is a local mock action.`)) {
        // In a real app, you'd call an API here and then update state
        if (onSubscriptionUpdated) {
            const updatedSub = { ...subscription, status: "Cancelled" as SubscriptionStatus, renewalDate: null };
            onSubscriptionUpdated(updatedSub);
        }
        toast({
            title: "Subscription Cancelled (Locally)",
            description: `Subscription ${subscription.id} has been marked as cancelled.`,
            variant: "destructive"
        });
        onOpenChange(false); // Close sheet after action
     }
  };


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Manage Subscription
          </SheetTitle>
          <SheetDescription>
            Modifying subscription for: <span className="font-medium text-primary">{subscription.sellerName} - {subscription.packageName}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-md font-medium text-muted-foreground mb-2">Key Details</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border p-3 rounded-md bg-muted/30">
              <p><span className="font-semibold">Seller:</span> {subscription.sellerName}</p>
              <p><span className="font-semibold">Package:</span> {subscription.packageName}</p>
              <p><span className="font-semibold">Price:</span> {formatCurrency(subscription.price)} ({subscription.billingInterval})</p>
              <p><span className="font-semibold">Status:</span> <Badge variant={currentStatusVariant}>{subscription.status}</Badge></p>
              <p className="col-span-2"><span className="font-semibold">Purchase Date:</span> {formatDate(subscription.purchaseDate)}</p>
              {subscription.renewalDate && <p className="col-span-2"><span className="font-semibold">Renewal Date:</span> {formatDate(subscription.renewalDate)}</p>}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-md font-medium text-muted-foreground mb-3">Management Actions (Placeholders)</h4>
            <div className="space-y-3">
               {subscription.status === "Active" && (
                <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={handleCancelSubscription}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Cancel Subscription
                </Button>
              )}
               {subscription.status === "Cancelled" && (
                 <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handlePlaceholderAction("Reactivate Subscription")}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Reactivate Subscription
                </Button>
               )}
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handlePlaceholderAction("Update Payment Method")}
              >
                <CreditCard className="mr-2 h-4 w-4" /> Update Payment Method
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handlePlaceholderAction("Change Renewal Date")}
              >
                <CalendarDays className="mr-2 h-4 w-4" /> Change Renewal Date
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handlePlaceholderAction("View Payment History")}
              >
                <DollarSignIcon className="mr-2 h-4 w-4" /> View Payment History
              </Button>
              {subscription.status === "Expired" && (
                <Button 
                    variant="default" 
                    className="w-full justify-start"
                    onClick={() => handlePlaceholderAction("Send Renewal Reminder")}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Send Renewal Reminder
                </Button>
              )}
              {(subscription.status === "Active" || subscription.status === "PendingPayment") && (
                <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handlePlaceholderAction("Issue Refund / Adjustment")}
                >
                  <DollarSignIcon className="mr-2 h-4 w-4" /> Issue Refund / Adjustment
                </Button>
              )}
               <Button 
                variant="outline" 
                className="w-full justify-start text-amber-600 hover:text-amber-700 border-amber-500 hover:bg-amber-50"
                onClick={() => handlePlaceholderAction("Escalate Issue")}
              >
                <ShieldAlert className="mr-2 h-4 w-4" /> Escalate Issue
              </Button>
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
