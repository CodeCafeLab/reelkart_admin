
"use client";

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
import { ThumbsUp, ThumbsDown, Flag, Video } from "lucide-react";
import type { ContentItem } from "@/types/content-moderation"; // Updated import path

interface VideoPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contentItem: ContentItem | null;
  onApprove: (itemId: string) => void;
  onReject: (itemId: string) => void; // No longer takes reason here
  onFlag: (itemId: string) => void;
}

export function VideoPreviewDialog({
  isOpen,
  onOpenChange,
  contentItem,
  onApprove,
  onReject,
  onFlag,
}: VideoPreviewDialogProps) {
  if (!contentItem || contentItem.type !== "Video") {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-[90vw] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            {contentItem.title}
          </DialogTitle>
          <DialogDescription>
            Previewing video ID: <span className="font-medium text-primary">{contentItem.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4">
          {contentItem.videoUrl ? (
            <video
              controls
              className="w-full aspect-video rounded-md bg-black"
              poster={contentItem.thumbnailUrl}
              data-ai-hint="video content"
            >
              <source src={contentItem.videoUrl} type="video/mp4" />
              <source src={contentItem.videoUrl} type="video/webm" />
              <source src={contentItem.videoUrl} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-full aspect-video rounded-md bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">No video URL provided.</p>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-4 border-t bg-muted/50 flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={() => onFlag(contentItem.id)}>
            <Flag className="mr-2 h-4 w-4" /> Flag Content
          </Button>
          {contentItem.status === "Pending" && (
            <>
              <Button
                variant="destructive"
                onClick={() => onReject(contentItem.id)} // Now calls the prop that opens the dialog
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <ThumbsDown className="mr-2 h-4 w-4" /> Reject
              </Button>
              <Button
                onClick={() => onApprove(contentItem.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <ThumbsUp className="mr-2 h-4 w-4" /> Approve
              </Button>
            </>
          )}
          {(contentItem.status === "Approved" || contentItem.status === "Rejected") && (
             <>
                <Button
                    variant="destructive"
                    onClick={() => onReject(contentItem.id)}
                    disabled={contentItem.status === "Rejected"}
                    className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-600/50"
                >
                    <ThumbsDown className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button
                    onClick={() => onApprove(contentItem.id)}
                    disabled={contentItem.status === "Approved"}
                    className="bg-green-600 hover:bg-green-700 text-white disabled:bg-green-600/50"
                >
                    <ThumbsUp className="mr-2 h-4 w-4" /> Approve
                </Button>
             </>
          )}
          <DialogClose asChild>
            <Button variant="outline" className="sm:ml-auto">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
