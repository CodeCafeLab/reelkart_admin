
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, ThumbsUp, ThumbsDown, Flag, Video, FileText, Loader2 } from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentDetailsSheet } from "@/components/admin/content/ContentDetailsSheet";
import { VideoPreviewDialog } from "@/components/admin/content/VideoPreviewDialog"; // New import
import { useToast } from "@/hooks/use-toast";

export interface ContentItem {
  id: string;
  type: "Video" | "Description";
  title: string;
  uploader: string;
  date: string; // "YYYY-MM-DD"
  status: ContentStatus;
  reason?: string;
  thumbnailUrl?: string; // For videos
  descriptionText?: string; // For descriptions
  videoUrl?: string; // For video playback
}

const initialContentItems: ContentItem[] = [
  { id: "vid001", type: "Video", title: "Amazing Product Demo", uploader: "SellerStore A", date: "2024-07-18", status: "Pending", thumbnailUrl: `https://placehold.co/300x200.png?text=Vid+Demo`, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: "dsc001", type: "Description", title: "Handcrafted Leather Wallet", uploader: "ArtisanGoods", date: "2024-07-17", status: "Approved", descriptionText: "This premium handcrafted leather wallet offers a sleek design with multiple card slots and a durable finish. Made from 100% genuine leather." },
  { id: "vid002", type: "Video", title: "Unboxing New Gadget", uploader: "TechGuru", date: "2024-07-16", status: "Rejected", reason: "Copyright Claim", thumbnailUrl: `https://placehold.co/300x200.png?text=Gadget+Unbox`, videoUrl: "https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" },
  { id: "dsc002", type: "Description", title: "Organic Green Tea", uploader: "HealthyLiving", date: "2024-07-19", status: "Pending", descriptionText: "Experience the refreshing taste of our 100% organic green tea, sourced from the finest tea gardens. Rich in antioxidants." },
  { id: "vid003", type: "Video", title: "DIY Home Decor Ideas", uploader: "CreativeHome", date: "2024-07-15", status: "Approved", thumbnailUrl: `https://placehold.co/300x200.png?text=DIY+Decor`, videoUrl: "https://download.blender.org/peach/trailer/trailer_480p.mov" },
];

export type ContentStatus = "Pending" | "Approved" | "Rejected";

const statusVariant: Record<ContentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default",
  Rejected: "destructive",
};

export default function ContentPage() {
  const { toast } = useToast();
  const [contentItems, setContentItems] = useState<ContentItem[]>(initialContentItems);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedContentItemForSheet, setSelectedContentItemForSheet] = useState<ContentItem | null>(null);

  const [isVideoPreviewOpen, setIsVideoPreviewOpen] = useState(false);
  const [selectedVideoForPreview, setSelectedVideoForPreview] = useState<ContentItem | null>(null);

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleViewTextDetails = (item: ContentItem) => {
    setSelectedContentItemForSheet(item);
    setIsSheetOpen(true);
  };

  const handleOpenVideoPreview = (item: ContentItem) => {
    setSelectedVideoForPreview(item);
    setIsVideoPreviewOpen(true);
  };

  const handleApproveContent = (itemId: string) => {
    setContentItems(prev => prev.map(item => item.id === itemId ? { ...item, status: "Approved" as ContentStatus, reason: undefined } : item));
    setSelectedContentItemForSheet(prev => prev && prev.id === itemId ? { ...prev, status: "Approved" as ContentStatus, reason: undefined } : prev);
    setSelectedVideoForPreview(prev => prev && prev.id === itemId ? { ...prev, status: "Approved" as ContentStatus, reason: undefined } : prev);
    toast({ title: "Content Approved", description: `Content item ${itemId} has been approved.` });
    if (selectedContentItemForSheet?.id === itemId) setIsSheetOpen(false);
    if (selectedVideoForPreview?.id === itemId) setIsVideoPreviewOpen(false);
  };

  const handleRejectContent = (itemId: string, reason?: string) => {
    const finalReason = reason?.trim() === "" || !reason ? "Violation of guidelines" : reason;
    setContentItems(prev => prev.map(item => item.id === itemId ? { ...item, status: "Rejected" as ContentStatus, reason: finalReason } : item));
    setSelectedContentItemForSheet(prev => prev && prev.id === itemId ? { ...prev, status: "Rejected" as ContentStatus, reason: finalReason } : prev);
    setSelectedVideoForPreview(prev => prev && prev.id === itemId ? { ...prev, status: "Rejected" as ContentStatus, reason: finalReason } : prev);
    toast({ title: "Content Rejected", description: `Content item ${itemId} has been rejected. Reason: ${finalReason}`, variant: "destructive" });
    if (selectedContentItemForSheet?.id === itemId) setIsSheetOpen(false);
    if (selectedVideoForPreview?.id === itemId) setIsVideoPreviewOpen(false);
  };
  
  const handleFlagContent = (itemId: string) => {
    toast({title: "Content Flagged", description: `Content item ${itemId} has been flagged. (Placeholder)`});
    // Future: Implement actual flagging logic, e.g., API call
  };

  if (!hasMounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Content Moderation</h1>
      <p className="text-muted-foreground">Review and moderate user-generated content.</p>

      <Tabs defaultValue="videos">
        <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="descriptions">Descriptions</TabsTrigger>
        </TabsList>
        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Video Moderation Queue</CardTitle>
              <CardDescription>Review videos uploaded by sellers.</CardDescription>
            </CardHeader>
            <CardContent>
              <VideoContentTable 
                items={contentItems.filter(item => item.type === "Video")} 
                onOpenVideoPreview={handleOpenVideoPreview}
                onApprove={handleApproveContent}
                onReject={handleRejectContent}
                onFlag={handleFlagContent}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="descriptions">
          <Card>
            <CardHeader>
              <CardTitle>Description Moderation Queue</CardTitle>
              <CardDescription>Review product descriptions submitted by sellers.</CardDescription>
            </CardHeader>
            <CardContent>
              <TextContentTable 
                items={contentItems.filter(item => item.type === "Description")} 
                onViewDetails={handleViewTextDetails}
                onApprove={handleApproveContent}
                onReject={handleRejectContent}
                onFlag={handleFlagContent}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedContentItemForSheet && selectedContentItemForSheet.type === "Description" && (
        <ContentDetailsSheet
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          contentItem={selectedContentItemForSheet}
          onApprove={handleApproveContent}
          onReject={handleRejectContent}
        />
      )}

      {selectedVideoForPreview && selectedVideoForPreview.type === "Video" && (
        <VideoPreviewDialog
          isOpen={isVideoPreviewOpen}
          onOpenChange={setIsVideoPreviewOpen}
          contentItem={selectedVideoForPreview}
          onApprove={handleApproveContent}
          onReject={handleRejectContent}
          onFlag={handleFlagContent}
        />
      )}
    </div>
  );
}


interface VideoContentTableProps {
  items: ContentItem[];
  onOpenVideoPreview: (item: ContentItem) => void;
  onApprove: (itemId: string) => void;
  onReject: (itemId: string, reason?: string) => void;
  onFlag: (itemId: string) => void;
}

function VideoContentTable({ items, onOpenVideoPreview, onApprove, onReject, onFlag }: VideoContentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Thumbnail</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Uploader</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="cursor-pointer" onClick={() => onOpenVideoPreview(item)}>
                <Image 
                  src={item.thumbnailUrl || `https://placehold.co/100x75.png`} 
                  alt={item.title} 
                  width={100} 
                  height={75} 
                  className="rounded-md object-cover hover:opacity-80 transition-opacity"
                  data-ai-hint="video thumbnail" 
                />
              </div>
            </TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.uploader}</TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[item.status as ContentStatus]} className={item.status === 'Approved' ? 'bg-green-500 hover:bg-green-600 text-white' : item.status === 'Rejected' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}>
                {item.status}
              </Badge>
              {item.status === "Rejected" && item.reason && (
                <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
              )}
            </TableCell>
            <TableCell className="text-right">
              <ContentActions item={item} onViewDetails={() => onOpenVideoPreview(item)} onApprove={onApprove} onReject={onReject} onFlag={onFlag} />
            </TableCell>
          </TableRow>
        ))}
         {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
              No video content to display.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

interface TextContentTableProps {
  items: ContentItem[];
  onViewDetails: (item: ContentItem) => void;
  onApprove: (itemId: string) => void;
  onReject: (itemId: string, reason?: string) => void;
  onFlag: (itemId: string) => void;
}

function TextContentTable({ items, onViewDetails, onApprove, onReject, onFlag }: TextContentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Uploader</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <FileText className="h-4 w-4 text-muted-foreground inline mr-1" />
              {item.type}
            </TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.uploader}</TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[item.status as ContentStatus]} className={item.status === 'Approved' ? 'bg-green-500 hover:bg-green-600 text-white' : item.status === 'Rejected' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}>
                {item.status}
              </Badge>
              {item.status === "Rejected" && item.reason && (
                <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
              )}
            </TableCell>
            <TableCell className="text-right">
             <ContentActions item={item} onViewDetails={onViewDetails} onApprove={onApprove} onReject={onReject} onFlag={onFlag}/>
            </TableCell>
          </TableRow>
        ))}
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
              No description content to display.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

interface ContentActionsProps {
  item: ContentItem;
  onViewDetails: (item: ContentItem) => void;
  onApprove: (itemId: string) => void;
  onReject: (itemId: string, reason?: string) => void;
  onFlag: (itemId: string) => void;
}

function ContentActions({ item, onViewDetails, onApprove, onReject, onFlag }: ContentActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewDetails(item)}>
          <Eye className="mr-2 h-4 w-4" /> View Content
        </DropdownMenuItem>
        {item.status === "Pending" && (
          <>
            <DropdownMenuItem 
              className="text-green-600 focus:text-green-700 focus:bg-green-50"
              onClick={() => onApprove(item.id)}
            >
              <ThumbsUp className="mr-2 h-4 w-4" /> Approve
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-700 focus:bg-red-50"
              onClick={() => {
                const reason = prompt("Enter reason for rejection (optional):");
                onReject(item.id, reason === null ? undefined : reason);
              }}
            >
              <ThumbsDown className="mr-2 h-4 w-4" /> Reject
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={() => onFlag(item.id)}>
          <Flag className="mr-2 h-4 w-4" /> Flag Content
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
