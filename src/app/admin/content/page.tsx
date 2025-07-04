
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, ThumbsUp, ThumbsDown, Flag, Loader2, Search, Download, FileText as ExportFileText, FileSpreadsheet, Printer, ArrowUpDown, ArrowUp, ArrowDown, Clock, Package, Archive, Tag, DollarSign, Power, Gavel } from "lucide-react";
import NextImage from "next/image"; // Renamed to avoid conflict
import { ContentDetailsSheet } from "@/components/admin/content/ContentDetailsSheet"; // Changed import
import { FlagContentDialog } from "@/components/admin/content/FlagContentDialog";
import { RejectContentDialog } from "@/components/admin/content/RejectContentDialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { format, parseISO } from 'date-fns';
import type { ContentItem, FlagType, ContentStatus, SortableContentKeys, AdminComment, Bid, SellerRole } from "@/types/content-moderation"; // Updated import path
import { FLAG_TYPES } from "@/types/content-moderation";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { ViewBidsDialog } from "@/components/admin/content/ViewBidsDialog";


import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const MOCK_COMMENT_TIMESTAMP_1 = new Date(Date.now() - 86400000 * 2).toISOString(); // 2 days ago
const MOCK_COMMENT_TIMESTAMP_2 = new Date(Date.now() - 86400000 * 1).toISOString(); // 1 day ago


const initialContentItems: ContentItem[] = [
  { 
    id: "vid001", type: "Video", title: "Amazing Product Demo", uploader: "SellerStore A", uploaderType: "ECommerceSeller", date: "2024-07-18T10:30:00Z", status: "Pending", thumbnailUrl: `https://placehold.co/300x200.png?text=Vid+Demo`, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    avgWatchTimeSeconds: 95,
    adminComments: [
      { id: "cmt001", adminName: "AdminJane", text: "Needs review for product claims.", timestamp: MOCK_COMMENT_TIMESTAMP_1 },
      { id: "cmt002", adminName: "AdminAlex", text: "Seems okay, but let's check background music for copyright.", timestamp: MOCK_COMMENT_TIMESTAMP_2 }
    ],
    price: 2999, category: "Electronics", stockQuantity: 150, isProductVisible: false,
  },
  { id: "dsc001", type: "Description", title: "Handcrafted Leather Wallet", uploader: "ArtisanGoods", uploaderType: "IndividualMerchant", date: "2024-07-17T11:00:00Z", status: "Approved", descriptionText: "This premium handcrafted leather wallet offers a sleek design with multiple card slots and a durable finish. Made from 100% genuine leather.",
    price: 899, category: "Fashion", stockQuantity: 75, isProductVisible: true,
  },
  { 
    id: "vid002", type: "Video", title: "Unboxing New Gadget", uploader: "TechGuru", uploaderType: "Influencer", date: "2024-07-16T12:15:00Z", status: "Rejected", reason: "Copyright Claim", thumbnailUrl: `https://placehold.co/300x200.png?text=Gadget+Unbox`, videoUrl: "https://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    avgWatchTimeSeconds: 45,
    adminComments: [
      { id: "cmt003", adminName: "AdminModerator", text: "Rejected due to copyrighted music track starting at 0:35.", timestamp: MOCK_COMMENT_TIMESTAMP_1 }
    ],
    price: 15000, category: "Gadgets", stockQuantity: 0, isProductVisible: false,
  },
  { id: "vid004", type: "Video", title: "Exclusive Signed Poster Auction", uploader: "Star Power", uploaderType: "Celebrity", date: "2024-07-20T14:00:00Z", status: "Approved", thumbnailUrl: `https://placehold.co/300x200.png?text=Signed+Poster`, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    avgWatchTimeSeconds: 32,
    price: 5000, // Starting bid price
    category: "Memorabilia", stockQuantity: 1, isProductVisible: true,
    bids: [
      { id: "bid_001", userName: "SuperFan1", bidAmount: 5500, timestamp: new Date(Date.now() - 86400000 * 0.5).toISOString() },
      { id: "bid_002", userName: "CollectorZ", bidAmount: 6000, timestamp: new Date(Date.now() - 86400000 * 0.4).toISOString() },
      { id: "bid_003", userName: "TopBidder", bidAmount: 6250, timestamp: new Date(Date.now() - 86400000 * 0.3).toISOString() },
    ]
  },
  { id: "dsc002", type: "Description", title: "Organic Green Tea", uploader: "HealthyLiving", uploaderType: "OnlineSeller", date: "2024-07-19T09:00:00Z", status: "Pending", descriptionText: "Experience the refreshing taste of our 100% organic green tea, sourced from the finest tea gardens. Rich in antioxidants.",
    price: 450, category: "Groceries", stockQuantity: 200, isProductVisible: false,
  },
  { 
    id: "vid003", type: "Video", title: "DIY Home Decor Ideas", uploader: "CreativeHome", uploaderType: "IndividualMerchant", date: "2024-07-15T14:30:00Z", status: "Approved", thumbnailUrl: `https://placehold.co/300x200.png?text=DIY+Decor`, videoUrl: "https://download.blender.org/peach/trailer/trailer_480p.mov",
    avgWatchTimeSeconds: 182,
    price: 1200, category: "Home Decor", stockQuantity: 40, isProductVisible: true,
  },
];


const statusVariant: Record<ContentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default",
  Rejected: "destructive",
};

export default function ContentPage() {
  const { toast } = useToast();
  const { settings: appSettings } = useAppSettings();

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

  // State for Bids Dialog
  const [isBidsDialogOpen, setIsBidsDialogOpen] = useState(false);
  const [itemForBids, setItemForBids] = useState<ContentItem | null>(null);


  useEffect(() => {
    setHasMounted(true);
  }, []);

  const formatCurrency = useCallback((amount: number | null | undefined) => {
    if (amount == null) return "N/A";
    const localeForFormatting = appSettings.currencyCode === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(localeForFormatting, { 
      style: 'currency',
      currency: appSettings.currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2, 
    }).format(amount);
  }, [appSettings.currencyCode]);

  const handleViewDetails = (item: ContentItem) => { // Renamed function
    setSelectedItemForDetails(item);
    setIsDetailsSheetOpen(true);
  };

  const handleToggleVisibility = (itemId: string, newVisibility: boolean) => {
    setContentItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, isProductVisible: newVisibility } : item
      )
    );
    setSelectedItemForDetails(prev => prev && prev.id === itemId ? { ...prev, isProductVisible: newVisibility } : prev);
    toast({
      title: "Visibility Updated",
      description: `Product visibility for ${itemId} set to ${newVisibility ? 'Visible' : 'Hidden'}.`,
    });
  };

  const handleApproveContent = (itemId: string) => {
    setContentItems(prev => prev.map(item => item.id === itemId ? { ...item, status: "Approved" as ContentStatus, reason: undefined, flagDetails: undefined, isProductVisible: true } : item));
    setSelectedItemForDetails(prev => prev && prev.id === itemId ? { ...prev, status: "Approved" as ContentStatus, reason: undefined, flagDetails: undefined, isProductVisible: true } : prev);
    toast({ title: "Content Approved", description: `Content item ${itemId} has been approved and product is now visible.` });
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
    setContentItems(prev => prev.map(item => item.id === contentId ? { ...item, status: "Rejected" as ContentStatus, reason: finalReason, flagDetails: undefined, isProductVisible: false } : item));
    setSelectedItemForDetails(prev => prev && prev.id === contentId ? { ...prev, status: "Rejected"as ContentStatus, reason: finalReason, flagDetails: undefined, isProductVisible: false } : prev);
    toast({ title: "Content Rejected", description: `Content item ${contentId} has been rejected. Product is hidden.`, variant: "destructive" });
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
  
  const handleViewBids = (item: ContentItem) => {
    setItemForBids(item);
    setIsBidsDialogOpen(true);
  };


  // Processing and Pagination for Videos
  const processedVideoItems = useMemo(() => {
    let filtered = contentItems.filter(item => item.type === "Video");
    if (videoSearchTerm) {
      const lowerSearch = videoSearchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.id.toLowerCase().includes(lowerSearch) ||
        item.title.toLowerCase().includes(lowerSearch) ||
        item.uploader.toLowerCase().includes(lowerSearch) ||
        (item.category && item.category.toLowerCase().includes(lowerSearch))
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
        } else if (['avgWatchTimeSeconds', 'price', 'stockQuantity'].includes(videoSortConfig.key)) {
          valA = typeof valA === 'number' ? valA : -1;
          valB = typeof valB === 'number' ? valB : -1;
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

  const formatWatchTime = (seconds: number | undefined): string => {
    if (seconds === undefined || seconds === null || isNaN(seconds)) {
      return "N/A";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

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
            const ws = XLSX.utils.book_new();
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
          <CardDescription>Review videos uploaded by sellers and manage associated product details.</CardDescription>
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
            onViewBids={handleViewBids}
            sortConfig={videoSortConfig}
            onSort={handleVideoSort}
            renderSortIcon={(key) => renderSortIcon(key, videoSortConfig)}
            formatDate={formatDateForDisplay}
            formatWatchTime={formatWatchTime}
            formatCurrency={formatCurrency}
            onToggleVisibility={handleToggleVisibility}
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
          onViewBids={handleViewBids}
          formatWatchTime={formatWatchTime}
          formatCurrency={formatCurrency}
          onToggleVisibility={handleToggleVisibility}
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

      <ViewBidsDialog
        isOpen={isBidsDialogOpen}
        onOpenChange={setIsBidsDialogOpen}
        contentItem={itemForBids}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}


interface VideoContentTableProps {
  items: ContentItem[];
  onViewDetails: (item: ContentItem) => void;
  onApprove: (itemId: string) => void;
  onReject: (itemId: string) => void; 
  onFlag: (itemId: string) => void; 
  onViewBids: (item: ContentItem) => void;
  onToggleVisibility: (itemId: string, newVisibility: boolean) => void;
  sortConfig: { key: SortableContentKeys; direction: string };
  onSort: (key: SortableContentKeys) => void;
  renderSortIcon: (key: SortableContentKeys) => JSX.Element;
  formatDate: (dateString: string) => string;
  formatWatchTime: (seconds: number | undefined) => string;
  formatCurrency: (amount: number | null | undefined) => string;
}

function VideoContentTable({ items, onViewDetails, onApprove, onReject, onFlag, onViewBids, onToggleVisibility, sortConfig, onSort, renderSortIcon, formatDate, formatWatchTime, formatCurrency }: VideoContentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Thumbnail</TableHead>
          <TableHead onClick={() => onSort('title')} className="cursor-pointer hover:bg-muted/50 group">
            <div className="flex items-center gap-1">Title {renderSortIcon('title')}</div>
          </TableHead>
          <TableHead onClick={() => onSort('category')} className="cursor-pointer hover:bg-muted/50 group">
             <div className="flex items-center gap-1">Category {renderSortIcon('category')}</div>
          </TableHead>
          <TableHead onClick={() => onSort('price')} className="cursor-pointer hover:bg-muted/50 group text-right">
             <div className="flex items-center justify-end gap-1">Price {renderSortIcon('price')}</div>
          </TableHead>
           <TableHead onClick={() => onSort('stockQuantity')} className="cursor-pointer hover:bg-muted/50 group text-right">
             <div className="flex items-center justify-end gap-1">Stock {renderSortIcon('stockQuantity')}</div>
          </TableHead>
          <TableHead onClick={() => onSort('status')} className="cursor-pointer hover:bg-muted/50 group">
            <div className="flex items-center gap-1">Status {renderSortIcon('status')}</div>
          </TableHead>
          <TableHead>Visibility</TableHead>
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
            <TableCell>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.uploader} ({item.uploaderType.replace(/([A-Z])/g, ' $1').trim()})</p>
            </TableCell>
            <TableCell>
                <Badge variant="secondary">{item.category || "N/A"}</Badge>
            </TableCell>
            <TableCell className="text-right font-mono text-sm">{formatCurrency(item.price)}</TableCell>
            <TableCell className="text-right font-mono text-sm">{item.stockQuantity ?? "N/A"}</TableCell>
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
            <TableCell>
                <Switch
                    checked={item.isProductVisible}
                    onCheckedChange={(checked) => onToggleVisibility(item.id, checked)}
                    aria-label="Toggle product visibility"
                />
            </TableCell>
            <TableCell className="text-right">
              <ContentActions item={item} onViewDetails={() => onViewDetails(item)} onApprove={onApprove} onReject={onReject} onFlag={onFlag} onViewBids={() => onViewBids(item)} />
            </TableCell>
          </TableRow>
        ))}
         {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
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
  onViewBids: (item: ContentItem) => void;
}

function ContentActions({ item, onViewDetails, onApprove, onReject, onFlag, onViewBids }: ContentActionsProps) {
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
        {item.uploaderType === 'Celebrity' && (
          <DropdownMenuItem onClick={() => onViewBids(item)}>
            <Gavel className="mr-2 h-4 w-4" /> View Bids
          </DropdownMenuItem>
        )}
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
