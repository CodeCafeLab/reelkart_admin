
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
import { CalendarDays, User, Store, Truck, XCircle, ShoppingCart, DollarSign, PackageSearch, PackageCheck } from "lucide-react";
import type { Order, OrderStatus } from "@/app/admin/logistics/page";
import { format } from 'date-fns'; // Simplified import, parseISO not strictly needed if date is already Date object or valid string for `new Date()`

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
};

const statusIconMap: Record<OrderStatus, React.ElementType> = {
  "Pending Payment": DollarSign,
  Processing: PackageSearch,
  Shipped: Truck,
  Delivered: PackageCheck,
  Cancelled: XCircle,
};

export function OrderDetailsSheet({
  isOpen,
  onOpenChange,
  order,
}: OrderDetailsSheetProps) {
  if (!order) {
    return null;
  }

  const currentStatusVariant = statusVariantMap[order.status];
  const StatusIcon = statusIconMap[order.status];

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPpp"); // e.g. Jul 22, 2024, 4:30 PM
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString; // fallback
    }
  };

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
                <StatusIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={currentStatusVariant}
                         className={order.status === 'Delivered' ? 'bg-green-500 hover:bg-green-600 text-white' : order.status === 'Shipped' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}>
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

        <SheetFooter className="p-6 pt-4 border-t mt-auto">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
