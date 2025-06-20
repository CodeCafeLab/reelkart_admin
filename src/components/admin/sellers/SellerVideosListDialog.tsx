
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Video } from "lucide-react";
import type { SellerVideoCounts } from "@/app/admin/sellers/page";

interface SellerVideosListDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  sellerName: string;
  videoCounts: SellerVideoCounts;
}

interface MockVideo {
  id: string;
  title: string;
  status: "Approved" | "Rejected" | "Pending";
  uploadDate: string; // Mock date
}

export function SellerVideosListDialog({
  isOpen,
  onOpenChange,
  sellerName,
  videoCounts,
}: SellerVideosListDialogProps) {

  const generateMockVideos = (count: number, status: MockVideo['status']): MockVideo[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `mock_vid_${status.toLowerCase()}_${i + 1}`,
      title: `${status} Video ${i + 1} for ${sellerName}`,
      status: status,
      uploadDate: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toLocaleDateString(), // Random date in last 30 days
    }));
  };

  const approvedVideos = generateMockVideos(videoCounts.approved, "Approved");
  const rejectedVideos = generateMockVideos(videoCounts.rejected, "Rejected");
  const pendingVideos = generateMockVideos(videoCounts.pending, "Pending");

  const renderVideoList = (videos: MockVideo[], status: MockVideo['status']) => {
    if (videos.length === 0) {
      return <p className="text-sm text-muted-foreground py-4 text-center">No {status.toLowerCase()} videos found.</p>;
    }
    return (
      <ul className="space-y-2">
        {videos.map((video) => (
          <li key={video.id} className="flex items-center justify-between p-2 border rounded-md bg-card hover:bg-muted/50">
            <div>
              <p className="text-sm font-medium">{video.title}</p>
              <p className="text-xs text-muted-foreground">Uploaded: {video.uploadDate} (Mock ID: {video.id})</p>
            </div>
            <Badge variant={status === "Approved" ? "default" : status === "Rejected" ? "destructive" : "secondary"}
                   className={status === "Approved" ? "bg-green-500" : ""}>
              {status}
            </Badge>
          </li>
        ))}
      </ul>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-[95vw] p-0 flex flex-col max-h-[80vh]">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Videos by {sellerName}
          </DialogTitle>
          <DialogDescription>
            List of videos uploaded by this seller, categorized by status. (Mock Data)
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="approved" className="flex-grow flex flex-col overflow-hidden p-6 pb-0">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="approved">Approved ({videoCounts.approved})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({videoCounts.rejected})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({videoCounts.pending})</TabsTrigger>
          </TabsList>
          <ScrollArea className="flex-grow pr-3 -mr-3"> {/* Negative margin to hide scrollbar visual space if not needed */}
            <TabsContent value="approved" className="mt-0">
              {renderVideoList(approvedVideos, "Approved")}
            </TabsContent>
            <TabsContent value="rejected" className="mt-0">
              {renderVideoList(rejectedVideos, "Rejected")}
            </TabsContent>
            <TabsContent value="pending" className="mt-0">
              {renderVideoList(pendingVideos, "Pending")}
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <DialogFooter className="p-6 pt-4 border-t mt-auto">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

