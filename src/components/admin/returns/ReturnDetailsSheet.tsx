
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
import { CalendarDays, User, Store, Truck, XCircle, ShoppingCart, DollarSign as DollarSignIcon, PackageSearch, PackageCheck, CornerDownLeft, ThumbsUp, ThumbsDown, Info, Clock, CheckCircle } from "lucide-react";
import type { Order, OrderStatus, ReturnDetails, ReturnStatus } from "@/types/order";
import { format, parseISO } from 'date-fns';

interface ReturnDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  order: Order | null;
  onApproveReturn: (orderId: string) => void;
  onRejectReturn: (orderId: string) => void;
}

const statusVariantMap: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  "Pending Payment": "outline",
  Processing: "secondary",
  Shipped: "default",
  Delivered: "default",
  Cancelled: "destructive",
  "Returned": "outline",
};

const statusIconMap: Record<OrderStatus, React.ElementType> = {
  "Pending Payment": DollarSignIcon,
  Processing: PackageSearch,
  Shipped: Truck,
  Delivered: PackageCheck,
  Cancelled: XCircle,
  "Returned": CornerDownLeft,
};

const returnStatusVariantMap: Record<ReturnStatus, "default" | "secondary" | "destructive" | "outline"> = {
  "Pending": "secondary",
  "Approved": "default",
  "Rejected": "destructive",
  "In Transit": "secondary",
  "Received": "default",
  "Completed": "default"
};

const returnStatusIconMap: Record<ReturnStatus, React.ElementType> = {
  "Pending": Clock,
  "Approved": ThumbsUp,
  "Rejected": ThumbsDown,
  "In Transit": Truck,
  "Received": PackageCheck,
  "Completed": CheckCircle
};


export function ReturnDetailsSheet({
  isOpen,
  onOpenChange,
  order,
  onApproveReturn,
  onRejectReturn,
}: ReturnDetailsSheetProps) {
  if (!order || !order.returnDetails) {
    return null;
  }

  const currentOrderStatusVariant = statusVariantMap[order.status];
  const OrderStatusIcon = statusIconMap[order.status];
  const ReturnStatusIcon = returnStatusIconMap[order.returnDetails.status] || Info;


  const formatDate = (dateString: string | undefined | null, includeTime = true) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), includeTime ? "PPpp" : "PP"); 
    } catch (e) {
      try { return format(new Date(dateString), includeTime ? "PPpp" : "PP"); }
      catch (e2) { 
        console.error("Error formatting date in ReturnDetailsSheet:", e2);
        return dateString; 
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            <CornerDownLeft className="h-6 w-6 text-primary" />
            Return Request Details
          </SheetTitle>
          <SheetDescription>
            Viewing return for Order ID: <span className="font-medium text-primary">{order.id}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Return Information</h3>
            <Separator className="mb-3"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm bg-muted/30 p-4 rounded-md border">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Return Request ID</p>
                  <p className="font-medium">{order.returnDetails.requestId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Return Requested On</p>
                  <p className="font-medium">{formatDate(order.returnDetails.requestedDate)}</p>
                </div>
              </div>
              <div className="col-span-full flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Reason for Return</p>
                  <p className="font-medium">{order.returnDetails.reason}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <ReturnStatusIcon className="h-4 w-4 text-muted-foreground" />
                 <div>
                  <p className="text-xs text-muted-foreground">Return Status</p>
                  <Badge variant={returnStatusVariantMap[order.returnDetails.status]}
                         className={order.returnDetails.status === 'Approved' || order.returnDetails.status === 'Received' || order.returnDetails.status === 'Completed' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                     {order.returnDetails.status}
                  </Badge>
                 </div>
              </div>
              {order.returnDetails.rejectionReason && (
                  <div className="col-span-full flex items-start gap-2 text-destructive">
                      <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                          <p className="text-xs">Rejection Reason</p>
                          <p className="font-medium">{order.returnDetails.rejectionReason}</p>
                      </div>
                  </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Original Order Information</h3>
            <Separator className="mb-3"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-medium">{order.customer}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Seller</p>
                  <p className="font-medium">{order.seller}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <SheetFooter className="p-6 pt-4 border-t mt-auto flex flex-col sm:flex-row sm:justify-between gap-2">
          <SheetClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">Close</Button>
          </SheetClose>
          {order.returnDetails.status === "Pending" && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => onRejectReturn(order.id)}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <ThumbsDown className="mr-2 h-4 w-4" /> Reject Return
              </Button>
              <Button 
                onClick={() => onApproveReturn(order.id)}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                <ThumbsUp className="mr-2 h-4 w-4" /> Approve Return
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
