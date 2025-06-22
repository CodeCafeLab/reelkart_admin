
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

interface OrderDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  order: Order | null;
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


export function OrderDetailsSheet({
  isOpen,
  onOpenChange,
  order,
}: OrderDetailsSheetProps) {
  if (!order) {
    return null;
  }

  const currentOrderStatusVariant = statusVariantMap[order.status];
  const OrderStatusIcon = statusIconMap[order.status];

  const formatDate = (dateString: string | undefined | null, includeTime = true) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), includeTime ? "PPpp" : "PP"); 
    } catch (e) {
      try { return format(new Date(dateString), includeTime ? "PPpp" : "PP"); }
      catch (e2) { 
        console.error("Error formatting date in OrderDetailsSheet:", e2);
        return dateString; 
      }
    }
  };

  const ReturnStatusIcon = order.returnDetails ? returnStatusIconMap[order.returnDetails.status] || Info : Info;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Order Details
          </SheetTitle>
          <SheetDescription>
            Viewing details for Order ID: <span className="font-medium text-primary">{order.id}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Order Information</h3>
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
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Order Date</p>
                  <p className="font-medium">{formatDate(order.date)}</p>
                </div>
              </div>
               <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                <OrderStatusIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Order Status</p>
                  <Badge variant={currentOrderStatusVariant}
                         className={`${order.status === 'Delivered' ? 'bg-green-500 hover:bg-green-600 text-white' : order.status === 'Shipped' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}>
                    {order.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tracking ID</p>
                  <p className="font-medium">{order.trackingId || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {order.returnDetails && (
            <div>
              <h3 className="text-lg font-medium text-foreground mb-1">Return Request Information</h3>
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
          )}

          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Items in this Order (Placeholder)</h3>
            <Separator className="mb-3"/>
            <div className="text-sm text-muted-foreground border rounded-md p-4 bg-muted/30">
              <p>Product item details would be listed here.</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Item 1: Premium Wireless Headphones (Qty: 1) - {order.seller}</li>
                <li>Item 2: Ergonomic Mouse Pad (Qty: 2) - {order.seller}</li>
              </ul>
            </div>
          </div>
          
           <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Shipping Address (Placeholder)</h3>
            <Separator className="mb-3"/>
            <div className="text-sm text-muted-foreground border rounded-md p-4 bg-muted/30">
                <p className="font-medium">{order.customer}</p>
                <p>123 E-commerce Lane, Apt 4B</p>
                <p>Tech City, State 54321</p>
                <p>India</p>
                <p>Phone: +91 98XXXXXX00 (mock)</p>
            </div>
          </div>

        </div>

        <SheetFooter className="p-6 pt-4 border-t mt-auto flex flex-col sm:flex-row sm:justify-end gap-2">
          <SheetClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
