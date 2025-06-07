
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Film, FileText, User, CalendarDays, AlertTriangle } from "lucide-react";
import type { ContentItem, ContentStatus } from "@/app/admin/content/page"; // Ensure correct path

interface ContentDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contentItem: ContentItem;
  onApprove: (itemId: string) => void;
  onReject: (itemId: string, reason?: string) => void;
}

const statusVariant: Record<ContentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default",
  Rejected: "destructive",
};

export function ContentDetailsSheet({
  isOpen,
  onOpenChange,
  contentItem,
  onApprove,
  onReject,
}: ContentDetailsSheetProps) {
  if (!contentItem) {
    return null;
  }

  const currentStatusVariant = statusVariant[contentItem.status];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            {contentItem.type === "Video" ? <Film className="h-6 w-6 text-primary" /> : <FileText className="h-6 w-6 text-primary" />}
            {contentItem.title}
          </SheetTitle>
          <SheetDescription>
            Details for content ID: <span className="font-medium text-primary">{contentItem.id}</span>
          </SheetDescription>
        </SheetHeader>
        
        <div className="p-6 space-y-6">
          {contentItem.type === "Video" && contentItem.thumbnailUrl && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Video Preview</h3>
               <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
                {contentItem.videoUrl ? (
                    <video controls className="w-full h-full object-contain bg-black" poster={contentItem.thumbnailUrl} data-ai-hint="product video">
                        <source src={contentItem.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <Image
                        src={contentItem.thumbnailUrl}
                        alt={contentItem.title}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                        data-ai-hint="video thumbnail"
                    />
                )}
              </div>
            </div>
          )}

          {contentItem.type === "Description" && contentItem.descriptionText && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Description Text</h3>
              <Card>
                <CardContent className="p-4 text-sm bg-muted/50 rounded-md">
                  <p className="whitespace-pre-wrap">{contentItem.descriptionText}</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Details</h3>
            <Separator className="mb-3"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Uploader</p>
                  <p className="font-medium">{contentItem.uploader}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{contentItem.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                <contentItem.type === "Video" ? Film className="h-4 w-4 text-muted-foreground" /> : <FileText className="h-4 w-4 text-muted-foreground" />
                 <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium">{contentItem.type}</p>
                </div>
              </div>
              <div className="col-span-1 sm:col-span-2 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={currentStatusVariant} className={contentItem.status === 'Approved' ? 'bg-green-500 hover:bg-green-600 text-white' : contentItem.status === 'Rejected' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}>
                        {contentItem.status}
                    </Badge>
                    {contentItem.status === "Rejected" && contentItem.reason && (
                        <p className="text-xs text-destructive mt-1">Reason: {contentItem.reason}</p>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="p-6 pt-4 border-t">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          {contentItem.status === "Pending" && (
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={() => {
                    const reason = prompt("Enter reason for rejection (optional):");
                    onReject(contentItem.id, reason || "Violation of guidelines");
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
              <Button 
                onClick={() => onApprove(contentItem.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Approve
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Need to import Card and CardContent if they are not already imported
import { Card, CardContent } from "@/components/ui/card";

