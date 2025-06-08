
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type { KycRequest } from "@/app/admin/kyc/page";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileText } from "lucide-react";
import { format, parseISO } from 'date-fns';

interface KycDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  kycRequest: KycRequest;
  onOpenImagePopup: (imageUrl: string) => void;
  onApprove: (kycId: string) => void;
  onReject: (kycId: string, reason?: string) => void;
}

export function KycDetailsSheet({
  isOpen,
  onOpenChange,
  kycRequest,
  onOpenImagePopup,
  onApprove,
  onReject,
}: KycDetailsSheetProps) {

  const statusVariant: Record<KycRequest['status'], "default" | "secondary" | "destructive" | "outline"> = {
    Pending: "outline",
    Approved: "default",
    Rejected: "destructive",
  };

  const currentStatusVariant = statusVariant[kycRequest.status];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-semibold">KYC Request Details</SheetTitle>
          <SheetDescription>
            Review details for KYC ID: <span className="font-medium text-primary">{kycRequest.id}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Applicant Information</h3>
            <Separator className="mb-3"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p><span className="font-medium text-muted-foreground">User ID:</span> {kycRequest.userId}</p>
              <p><span className="font-medium text-muted-foreground">Name:</span> {kycRequest.name}</p>
              <p><span className="font-medium text-muted-foreground">Submission Date:</span> {format(parseISO(kycRequest.submissionDate), "PPpp")}</p>
              <p><span className="font-medium text-muted-foreground">Document Type:</span> {kycRequest.documentType}</p>
              <div className="col-span-1 sm:col-span-2 flex items-center">
                <span className="font-medium text-muted-foreground mr-2">Status:</span>
                <Badge variant={currentStatusVariant} className={kycRequest.status === 'Approved' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                  {kycRequest.status}
                </Badge>
              </div>
              {kycRequest.status === "Rejected" && kycRequest.rejectionReason && (
                <p className="col-span-1 sm:col-span-2"><span className="font-medium text-muted-foreground">Rejection Reason:</span> {kycRequest.rejectionReason}</p>
              )}
            </div>
          </div>

          {kycRequest.details && Object.keys(kycRequest.details).length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-foreground mb-1">Additional Document Details</h3>
              <Separator className="mb-3"/>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {Object.entries(kycRequest.details).map(([key, value]) => (
                  <p key={key}><span className="font-medium text-muted-foreground">{key}:</span> {value}</p>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Submitted Documents</h3>
            <Separator className="mb-3"/>
            {kycRequest.documentImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {kycRequest.documentImages.map((image, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center">
                      <FileText className="w-4 h-4 mr-1.5"/>
                      {image.name}
                    </p>
                    <div
                      className="relative aspect-[3/2] w-full rounded-md overflow-hidden border border-muted cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onOpenImagePopup(image.url)}
                    >
                      <Image
                        src={image.url}
                        alt={image.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                        data-ai-hint={image.aiHint}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No documents uploaded.</p>
            )}
          </div>
        </div>

        <SheetFooter className="mt-8 pt-6 border-t">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                const reason = window.prompt("Please enter the reason for rejection (optional):");
                if (reason !== null) { // User didn't cancel
                  onReject(kycRequest.id, reason);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <XCircle className="mr-2 h-4 w-4" /> Reject
            </Button>
            <Button
              onClick={() => onApprove(kycRequest.id)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Approve
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
