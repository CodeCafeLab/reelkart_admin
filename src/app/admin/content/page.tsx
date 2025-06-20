
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, ThumbsUp, ThumbsDown, Flag, Loader2, Search, Download, FileText as ExportFileText, FileSpreadsheet, Printer, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import NextImage from "next/image"; // Renamed to avoid conflict
import { ContentDetailsSheet } from "@/components/admin/content/ContentDetailsSheet"; // Changed import
import { FlagContentDialog } from "@/components/admin/content/FlagContentDialog";
import { RejectContentDialog } from "@/components/admin/content/RejectContentDialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from 'date-fns';
import type { ContentItem, FlagType, ContentStatus, SortableContentKeys, AdminComment } from "@/types/content-moderation"; // Updated import path
import { FLAG_TYPES } from "@/types/content-moderation";


import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const MOCK_COMMENT_TIMESTAMP_1 = new Date(Date.now() - 86400000 * 2).toISOString(); // 2 days ago
const MOCK_COMMENT_TIMESTAMP_2 = new Date(Date.now() - 86400000 * 1).toISOString(); // 1 day ago


const initialContentItems: ContentItem[] = [
  { 
    id: "vid001", type: "Video", title: "Amazing Product Demo", uploader: "SellerStore A", date: "2024-07-18T10:30:00Z", status: "Pending", thumbnailUrl: `https://placehold.co/300x200.png?text=Vid+Demo`, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    adminComments: [
      { id: "cmt001", adminName: "AdminJane", text: "Needs review for product claims.", timestamp: MOCK_COMMENT_TIMESTAMP_1 },
      { id: "cmt002", adminName: "AdminAlex", text: "Seems okay, but let's check background music for copyright.", timestamp: MOCK_COMMENT_TIMESTAMP_2 }
    ]
  },
  { id: "dsc001", type: "Description", title: "Handcrafted Leather Wallet", uploader: "ArtisanGoods", date: "2024-07-17T11:00:00Z", status: "Approved", descriptionText: "This premium handcrafted leather wallet offers a sleek design with multiple card slots and a durable finish. Made from 100% genuine leather." },
  { 
    id: "vid002", type: "Video", title: "Unboxing New Gadget", uploader: "TechGuru", date: "2024-07-16T12:15:00Z", status: "Rejected", reason: "Copyright Claim", thumbnailUrl: `https://placehold.co/300x200.png?text=Gadget+Unbox`, videoUrl: "https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    adminComments: [
      { id: "cmt003", adminName: "AdminModerator", text: "Rejected due to copyrighted music track starting at 0:35.", timestamp: MOCK_COMMENT_TIMESTAMP_1 }
    ]
  },
  { id: "dsc002", type: "Description", title: "Organic Green Tea", uploader: "HealthyLiving", date: "2024-07-19T09:00:00Z", status: "Pending", descriptionText: "Experience the refreshing taste of our 100% organic green tea, sourced from the finest tea gardens. Rich in antioxidants." },
  { id: "vid003", type: "Video", title: "DIY Home Decor Ideas", uploader: "CreativeHome", date: "2024-07-15T14:30:00Z", status: "Approved", thumbnailUrl: `https://placehold.co/300x200.png?text=DIY+Decor`, videoUrl: "https://download.blender.org/peach/trailer/trailer_480p.mov" },
];


const statusVariant: Record<ContentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default",
  Rejected: "destructive",
};

export default function ContentPage() {
  const { toast } = useToast();
  const [contentItems, setContentItems] = useState<ContentItem[]>(initialContentItems);
  
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false); // Renamed state
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<ContentItem | null>(null); // Renamed state

  const [hasMounted, setHasMounted] = useState(false);

  // State for Video Table
  const [videoSearchTerm, setVideoSearchTerm] = useState("");
  const [videoStatusFilter, setVideoStatusFilter] = useState<ContentStatus | "All">("All");
  const [videoSortConfig, setVideoSortConfig] = useState<{ key: SortableContentKeys; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
  const [videoCurrentPage, setVideoCurrentPage] = useState(1);
  const [videoItemsPerPage, setVideoItemsPerPage] = useState(10);

  // State for Flag Content Dialog
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false);
  const [itemToFlag, setItemToFlag] = useState<ContentItem | null>(null);

  // State for Reject Content Dialog
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [itemToReject, setItemToReject] = useState<ContentItem | null>(null);


  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleViewDetails = (item: ContentItem) => { // Renamed function
    setSelectedItemForDetails(item);
    setIsDetailsSheetOpen(true);
  };

  const handleApproveContent = (itemId: string) => {
    setContentItems(prev => prev.map(item => item.id === itemId ? { ...item, status: "Approved" as ContentStatus, reason: undefined, flagDetails: undefined } : item));
    setSelectedItemForDetails(prev => prev && prev.id === itemId ? { ...prev, status: "Approved" as ContentStatus, reason: undefined, flagDetails: undefined } : prev);
    toast({ title: "Content Approved", description: `Content item ${itemId} has been approved.` });
    if (selectedItemForDetails?.id === itemId) setIsDetailsSheetOpen(false);
    if (itemToReject?.id === itemId) setIsRejectDialogOpen(false);
  };

  const handleRejectContent = (itemId: string) => {
    const item = contentItems.find(ci => ci.id === itemId);
    if (item) {
      setItemToReject(item);
      setIsRejectDialogOpen(true);
    } else {
      toast({ title: "Error", description: "Content item not found.", variant: "destructive" });
    }
  };

  const handleConfirmReject = (contentId: string, reason: string) => {
    const finalReason = reason?.trim() === "" || !reason ? "Violation of guidelines" : reason;
    setContentItems(prev => prev.map(item => item.id === contentId ? { ...item, status: "Rejected" as ContentStatus, reason: finalReason, flagDetails: undefined } : item));
    setSelectedItemForDetails(prev => prev && prev.id === contentId ? { ...prev, status: "Rejected"as ContentStatus, reason: finalReason, flagDetails: undefined } : prev);
    toast({ title: "Content Rejected", description: `Content item ${contentId} has been rejected. Reason: ${finalReason}`, variant: "destructive" });
    if (selectedItemForDetails?.id === contentId) setIsDetailsSheetOpen(false);
    setIsRejectDialogOpen(false);
    setItemToReject(null);
  };
  
  const handleFlagContent = (itemId: string) => {
    const item = contentItems.find(ci => ci.id === itemId);
    if (item) {
      setItemToFlag(item);
      setIsFlagDialogOpen(true); 
    } else {
      toast({ title: "Error", description: "Content item not found.", variant: "destructive" });
    }
  };

  const handleConfirmFlag = (contentId: string, flagType: FlagType, reason?: string) => {
    setContentItems(prevItems =>
      prevItems.map(item =>
        item.id === contentId
          ? {
              ...item,
              status: item.status === "Rejected" ? "Rejected" : "Pending", 
              flagDetails: { type: flagType, reason: reason || "N/A", flaggedAt: new Date().toISOString() },
            }
          : item
      )
    );
  
    const updatedItem = contentItems.find(ci => ci.id === contentId); 
    const finalStatus = updatedItem && updatedItem.status === "Rejected" ? "Rejected" : "Pending";

    toast({ title: "Content Flagged", description: `Item ${contentId} flagged as ${flagType}. Status: ${finalStatus}.` });
    setIsFlagDialogOpen(false);
    setItemToFlag(null);
  };


  // Processing and Pagination for Videos
  const processedVideoItems = useMemo(() => {
    let filtered = contentItems.filter(item => item.type === "Video");
    if (videoSearchTerm) {
      const lowerSearch = videoSearchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.id.toLowerCase().includes(lowerSearch) ||
        item.title.toLowerCase().includes(lowerSearch) ||
        item.uploader.toLowerCase().includes(lowerSearch)
      );
    }
    if (videoStatusFilter !== "All") {
      filtered = filtered.filter(item => item.status === videoStatusFilter);
    }
    if (videoSortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[videoSortConfig.key];
        let valB = b[videoSortConfig.key];
        if (videoSortConfig.key === 'date') {
          valA = new Date(valA as string).getTime();
          valB = new Date(valB as string).getTime();
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) return videoSortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return videoSortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [contentItems, videoSearchTerm, videoStatusFilter, videoSortConfig]);

  const paginatedVideoItems = useMemo(() => {
    const start = (videoCurrentPage - 1) * videoItemsPerPage;
    return processedVideoItems.slice(start, start + videoItemsPerPage);
  }, [processedVideoItems, videoCurrentPage, videoItemsPerPage]);
  const totalVideoPages = Math.ceil(processedVideoItems.length / videoItemsPerPage);

  const handleVideoSort = (key: SortableContentKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (videoSortConfig.key === key && videoSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setVideoSortConfig({ key, direction });
    setVideoCurrentPage(1);
  };

  const renderSortIcon = (columnKey: SortableContentKeys, currentSortConfig: { key: SortableContentKeys; direction: string;}) => {
    if (currentSortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 opacity-30 group-hover:opacity-100" />;
    }
    return currentSortConfig.direction === 'ascending' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const formatDateForDisplay = (dateString: string) => format(parseISO(dateString), "PPpp");
  const formatDateForExport = (dateString: string) => format(parseISO(dateString), "yyyy-MM-dd HH:mm:ss");

  const createExportHandler = (contentType: 'video') => {
    const dataToExport = contentType === 'video' ? processedVideoItems : [];
    const filenamePrefix = contentType === 'video' ? 'video_content' : 'description_content';

    return (formatType: 'csv' | 'excel' | 'pdf') => {
        if (formatType === 'csv') {
            const headers = ["ID", "Title", "Uploader", "Date", "Status", "Reason", "Flag Type", "Flag Reason"];
            const csvRows = [
                headers.join(','),
                ...dataToExport.map(item => [
                    item.id, item.title, item.uploader, formatDateForExport(item.date), item.status, item.reason || '',
                    item.flagDetails?.type || '', item.flagDetails?.reason || ''
                ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
            ];
            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${filenamePrefix}_export.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
            toast({ title: "CSV Exported", description: `${contentType} data exported.` });
        } else if (formatType === 'excel') {
            const wsData = dataToExport.map(item => ({
                ID: item.id, Title: item.title, Uploader: item.uploader, 
                Date: formatDateForExport(item.date), Status: item.status, Reason: item.reason || '',
                "Flag Type": item.flagDetails?.type || '', "Flag Reason": item.flagDetails?.reason || ''
            }));
            const ws = XLSX.utils.json_to_sheet(wsData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, contentType === 'video' ? "Videos" : "Descriptions");
            XLSX.writeFile(wb, `${filenamePrefix}_export.xlsx`);
            toast({ title: "Excel Exported", description: `${contentType} data exported.` });
        } else if (formatType === 'pdf') {
            const doc = new jsPDF();
            const tableColumn = ["ID", "Title", "Uploader", "Date", "Status", "Reason", "Flag Type"];
            const tableRows = dataToExport.map(item => [
                item.id, item.title, item.uploader, formatDateForExport(item.date), item.status, item.reason || '',
                item.flagDetails?.type || ''
            ]);
            autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
            doc.text(`${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Content Report`, 14, 15);
            doc.save(`${filenamePrefix}_export.pdf`);
            toast({ title: "PDF Exported", description: `${contentType} data exported.` });
        }
    };
  };

  const handleVideoExport = createExportHandler('video');


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
      <h1 className="text-3xl font-bold font-headline">Content Management</h1>
      <p className="text-muted-foreground">Manage user-generated video content and related assets.</p>

      <Card>
        <CardHeader>
          <CardTitle>Video Moderation Queue</CardTitle>
          <CardDescription>Review videos uploaded by sellers.</CardDescription>
          <div className="flex flex-col sm:flex-row justify-between items-end gap-2 pt-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search videos (ID, Title, Uploader)..."
                value={videoSearchTerm}
                onChange={(e) => {setVideoSearchTerm(e.target.value); setVideoCurrentPage(1);}}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={videoStatusFilter} onValueChange={(value) => {setVideoStatusFilter(value as ContentStatus | "All"); setVideoCurrentPage(1);}}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Videos</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleVideoExport('csv')}><ExportFileText className="mr-2 h-4 w-4" />Export CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleVideoExport('excel')}><FileSpreadsheet className="mr-2 h-4 w-4" />Export Excel</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleVideoExport('pdf')}><Printer className="mr-2 h-4 w-4" />Export PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <VideoContentTable 
            items={paginatedVideoItems} 
            onViewDetails={handleViewDetails} // Changed prop name
            onApprove={handleApproveContent}
            onReject={handleRejectContent} 
            onFlag={handleFlagContent}
            sortConfig={videoSortConfig}
            onSort={handleVideoSort}
            renderSortIcon={(key) => renderSortIcon(key, videoSortConfig)}
            formatDate={formatDateForDisplay}
          />
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-muted-foreground">
              Page {videoCurrentPage} of {totalVideoPages > 0 ? totalVideoPages : 1} ({processedVideoItems.length} total videos)
            </span>
            <div className="flex items-center gap-2">
                <Select
                    value={String(videoItemsPerPage)}
                    onValueChange={(value) => { setVideoItemsPerPage(Number(value)); setVideoCurrentPage(1); }}
                >
                    <SelectTrigger className="w-[80px] h-9"><SelectValue placeholder={String(videoItemsPerPage)} /></SelectTrigger>
                    <SelectContent>{[5, 10, 20, 50].map(size => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">items per page</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setVideoCurrentPage(p => Math.max(p - 1, 1))} disabled={videoCurrentPage === 1} variant="outline" size="sm">Previous</Button>
              <Button onClick={() => setVideoCurrentPage(p => Math.min(p + 1, totalVideoPages))} disabled={videoCurrentPage === totalVideoPages || totalVideoPages === 0} variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedItemForDetails && ( // Changed state variable name
        <ContentDetailsSheet
          isOpen={isDetailsSheetOpen}
          onOpenChange={setIsDetailsSheetOpen}
          contentItem={selectedItemForDetails}
          onApprove={handleApproveContent}
          onReject={handleRejectContent} 
          onFlag={handleFlagContent} 
        />
      )}

      <FlagContentDialog
        isOpen={isFlagDialogOpen}
        onOpenChange={setIsFlagDialogOpen}
        contentItem={itemToFlag}
        onFlagSubmit={handleConfirmFlag}
      />

      <RejectContentDialog
        isOpen={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        contentItem={itemToReject}
        onRejectSubmit={handleConfirmReject}
      />
    </div>
  );
}


interface VideoContentTableProps {
  items: ContentItem[];
  onViewDetails: (item: ContentItem) => void; // Changed prop name
  onApprove: (itemId: string) => void;
  onReject: (itemId: string) => void; 
  onFlag: (itemId: string) => void; 
  sortConfig: { key: SortableContentKeys; direction: string };
  onSort: (key: SortableContentKeys) => void;
  renderSortIcon: (key: SortableContentKeys) => JSX.Element;
  formatDate: (dateString: string) => string;
}

function VideoContentTable({ items, onViewDetails, onApprove, onReject, onFlag, sortConfig, onSort, renderSortIcon, formatDate }: VideoContentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Thumbnail</TableHead>
          <TableHead onClick={() => onSort('title')} className="cursor-pointer hover:bg-muted/50 group">
            <div className="flex items-center gap-1">Title {renderSortIcon('title')}</div>
          </TableHead>
          <TableHead onClick={() => onSort('uploader')} className="cursor-pointer hover:bg-muted/50 group">
            <div className="flex items-center gap-1">Uploader {renderSortIcon('uploader')}</div>
          </TableHead>
          <TableHead onClick={() => onSort('date')} className="cursor-pointer hover:bg-muted/50 group">
            <div className="flex items-center gap-1">Date {renderSortIcon('date')}</div>
          </TableHead>
          <TableHead onClick={() => onSort('status')} className="cursor-pointer hover:bg-muted/50 group">
            <div className="flex items-center gap-1">Status {renderSortIcon('status')}</div>
          </TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="cursor-pointer" onClick={() => onViewDetails(item)}>
                <NextImage 
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
            <TableCell>{formatDate(item.date)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Badge variant={statusVariant[item.status as ContentStatus]} className={item.status === 'Approved' ? 'bg-green-500 hover:bg-green-600 text-white' : item.status === 'Rejected' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}>
                  {item.status}
                </Badge>
                {item.flagDetails && (
                  <Badge variant="destructive" className="ml-1 text-xs opacity-80">
                    Flag: {item.flagDetails.type.length > 15 ? item.flagDetails.type.substring(0,12) + "..." : item.flagDetails.type}
                  </Badge>
                )}
              </div>
              {item.status === "Rejected" && item.reason && (
                <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
              )}
            </TableCell>
            <TableCell className="text-right">
              <ContentActions item={item} onViewDetails={() => onViewDetails(item)} onApprove={onApprove} onReject={onReject} onFlag={onFlag} />
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


interface ContentActionsProps {
  item: ContentItem;
  onViewDetails: (item: ContentItem) => void;
  onApprove: (itemId: string) => void;
  onReject: (itemId: string) => void; 
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
        <DropdownMenuItem 
          className="text-green-600 focus:text-green-700 focus:bg-green-50"
          onClick={() => onApprove(item.id)}
          disabled={item.status === "Approved"}
        >
          <ThumbsUp className="mr-2 h-4 w-4" /> Approve
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-red-600 focus:text-red-700 focus:bg-red-50"
          onClick={() => onReject(item.id)} 
          disabled={item.status === "Rejected"}
        >
          <ThumbsDown className="mr-2 h-4 w-4" /> Reject
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFlag(item.id)}>
          <Flag className="mr-2 h-4 w-4" /> Flag Content
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
