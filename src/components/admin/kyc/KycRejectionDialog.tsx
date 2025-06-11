
"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface KycRejectionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmitReason: (reason: string) => void; 
  kycIdToShow?: string;
}

export function KycRejectionDialog({
  isOpen,
  onOpenChange,
  onSubmitReason,
  kycIdToShow,
}: KycRejectionDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason(""); 
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onSubmitReason(reason.trim() || "Reason not specified");
    onOpenChange(false); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject KYC Submission</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting KYC ID: <span className="font-semibold text-primary">{kycIdToShow || "N/A"}</span>.
            This reason will be recorded.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="rejection-reason" className="text-left">
            Rejection Reason
          </Label>
          <Textarea
            id="rejection-reason"
            placeholder="Type your reason here (optional, default will be used if empty)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>
            Submit Reason & Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
