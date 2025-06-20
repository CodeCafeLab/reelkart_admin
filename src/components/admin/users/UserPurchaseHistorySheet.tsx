
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, User, ShoppingCart, CalendarDays, DollarSign, CheckCircle, AlertCircle, Clock } from "lucide-react";
import type { User as UserData, PurchaseHistoryItem } from "@/types/user";
import { format, parseISO } from 'date-fns';

interface UserPurchaseHistorySheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: UserData | null;
}

const purchaseStatusVariantMap: Record<PurchaseHistoryItem['status'], "default" | "secondary" | "destructive" | "outline"> = {
  Completed: "default",
  Pending: "secondary",
  Failed: "destructive",
  Refunded: "outline",
};

const purchaseStatusIconMap: Record<PurchaseHistoryItem['status'], React.ElementType> = {
  Completed: CheckCircle,
  Pending: Clock,
  Failed: AlertCircle,
  Refunded: DollarSign, // Using DollarSign for refunded for now
};


export function UserPurchaseHistorySheet({
  isOpen,
  onOpenChange,
  user,
}: UserPurchaseHistorySheetProps) {
  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "PPpp"); 
    } catch (e) {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currencyCode }).format(amount);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-[95vw] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Purchase History
          </SheetTitle>
          <SheetDescription>
            Viewing purchase history for User: <span className="font-medium text-primary">{user.name} ({user.id})</span>
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow">
          <div className="p-6">
            {user.purchaseHistory && user.purchaseHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Order ID</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.purchaseHistory.map((item) => {
                    const StatusIcon = purchaseStatusIconMap[item.status];
                    return (
                        <TableRow key={item.orderId}>
                        <TableCell className="font-medium text-xs">{item.orderId}</TableCell>
                        <TableCell className="text-sm">{item.productName}</TableCell>
                        <TableCell className="text-xs">{formatDate(item.purchaseDate)}</TableCell>
                        <TableCell className="text-xs text-right">{formatCurrency(item.amount, item.currency)}</TableCell>
                        <TableCell>
                            <Badge variant={purchaseStatusVariantMap[item.status]} className={item.status === "Completed" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                                <StatusIcon className="mr-1.5 h-3 w-3" />
                                {item.status}
                            </Badge>
                        </TableCell>
                        </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">No Purchase History</p>
                <p className="text-sm">This user has not made any purchases yet.</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <SheetFooter className="p-6 pt-4 border-t mt-auto">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
