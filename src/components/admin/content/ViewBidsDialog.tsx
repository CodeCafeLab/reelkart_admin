
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Gavel, User, CalendarDays } from "lucide-react";
import type { ContentItem } from "@/types/content-moderation";
import { format, parseISO } from 'date-fns';

interface ViewBidsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contentItem: ContentItem | null;
  formatCurrency: (amount: number) => string;
}

export function ViewBidsDialog({
  isOpen,
  onOpenChange,
  contentItem,
  formatCurrency
}: ViewBidsDialogProps) {
  if (!contentItem) {
    return null;
  }

  const sortedBids = [...(contentItem.bids || [])].sort((a, b) => b.bidAmount - a.bidAmount);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "PPpp");
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-[95vw] p-0 flex flex-col max-h-[80vh]">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            Bids for "{contentItem.title}"
          </DialogTitle>
          <DialogDescription>
            Highest bids are shown first. Total bids: {sortedBids.length}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow">
          <div className="p-6">
            {sortedBids.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bidder</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead className="text-right">Bid Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBids.map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell className="font-medium text-sm flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {bid.userName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(bid.timestamp)}
                      </TableCell>
                      <TableCell className="text-right font-semibold font-mono">
                        {formatCurrency(bid.bidAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <Gavel className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="font-semibold">No Bids Yet</p>
                <p className="text-sm text-muted-foreground">No bids have been placed for this item.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t mt-auto">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
