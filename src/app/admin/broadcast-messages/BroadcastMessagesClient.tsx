
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Eye, Send, Clock, CheckCircle, XCircle, Search, Download, FileText as ExportFileText, FileSpreadsheet, Printer, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { BroadcastMessageItem, BroadcastMessageStatus, SortableBroadcastMessageKeys, CreateBroadcastMessageFormValues } from "@/types/broadcast-messages"; // Updated import
import { BROADCAST_MESSAGE_STATUSES, BROADCAST_MESSAGE_AUDIENCE_TYPES } from "@/types/broadcast-messages"; // Updated import
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateBroadcastMessageSheet } from "@/components/admin/broadcast-messages/CreateBroadcastMessageSheet"; // Updated import

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const MOCK_BASE_TIMESTAMP = new Date("2024-07-25T10:00:00.000Z").getTime();

const mockBroadcastMessagesData: BroadcastMessageItem[] = [ // Renamed from mockNotificationsData
  { id: "msg_001", title: "Platform Maintenance Alert", message: "Our platform will undergo scheduled maintenance on July 28th from 2 AM to 4 AM IST. Services might be temporarily unavailable.", audienceType: "AllUsers", status: "Sent", createdAt: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 2).toISOString(), sentAt: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 5).toISOString() },
  { id: "msg_002", title: "New Feature: Bulk Upload for Sellers!", message: "Exciting news! Sellers can now bulk upload products using our new CSV import tool. Check your dashboard for details.", audienceType: "AllSellers", status: "Sent", createdAt: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24).toISOString(), sentAt: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 + 1000 * 60 * 10).toISOString() },
  { id: "msg_003", title: "Welcome Bonus for New Users", message: "Sign up this week and get a 10% discount on your first purchase! Use code WELCOME10.", audienceType: "UserGroup", audienceTarget: "NewSignupsJuly", status: "Draft", createdAt: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 30).toISOString() },
  { id: "msg_004", title: "KYC Update Required for SellerXYZ", message: "Dear SellerXYZ, please update your KYC documents by August 5th to continue uninterrupted service.", audienceType: "SpecificSeller", audienceTarget: "seller_xyz_123", status: "Scheduled", createdAt: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 5).toISOString(), scheduledAt: new Date(MOCK_BASE_TIMESTAMP + 1000 * 60 * 60 * 24 * 3).toISOString() },
  { id: "msg_005", title: "Holiday Sale Announcement", message: "Get ready for our big holiday sale starting next Monday! Up to 50% off on select items.", audienceType: "AllUsers", status: "Draft", createdAt: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 15).toISOString() },
];

const statusVariantMap: Record<BroadcastMessageStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Draft: "outline",
  Sent: "default",
  Scheduled: "secondary",
  Failed: "destructive",
};

const statusIconMap: Record<BroadcastMessageStatus, React.ElementType> = {
  Draft: Edit,
  Sent: CheckCircle,
  Scheduled: Clock,
  Failed: XCircle,
};


export function BroadcastMessagesClient() { // Renamed from NotificationsClient
  const { toast } = useToast();
  const [messages, setMessages] = useState<BroadcastMessageItem[]>(mockBroadcastMessagesData); // Renamed from notifications
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BroadcastMessageStatus | "All">("All");
  const [sortConfig, setSortConfig] = useState<{ key: SortableBroadcastMessageKeys; direction: 'ascending' | 'descending' }>({ key: 'createdAt', direction: 'descending' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<BroadcastMessageItem | null>(null); // Renamed from editingNotification


  const processedMessages = useMemo(() => { // Renamed from processedNotifications
    let filtered = [...messages];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(msg => // Renamed from notif
        msg.title.toLowerCase().includes(lowerSearch) ||
        msg.message.toLowerCase().includes(lowerSearch) ||
        (msg.audienceTarget && msg.audienceTarget.toLowerCase().includes(lowerSearch))
      );
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter(msg => msg.status === statusFilter);
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'createdAt' || sortConfig.key === 'sentAt') {
          valA = valA ? new Date(valA as string).getTime() : 0;
          valB = valB ? new Date(valB as string).getTime() : 0;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [messages, searchTerm, statusFilter, sortConfig]);

  const paginatedMessages = useMemo(() => { // Renamed from paginatedNotifications
    const start = (currentPage - 1) * itemsPerPage;
    return processedMessages.slice(start, start + itemsPerPage);
  }, [processedMessages, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedMessages.length / itemsPerPage);

  const handleSort = (key: SortableBroadcastMessageKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const renderSortIcon = (columnKey: SortableBroadcastMessageKeys) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };
  
  const formatDateForDisplay = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "PPpp");
    } catch (e) { 
      return "Invalid Date"; 
    }
  };
  
  const formatDateForExport = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "yyyy-MM-dd HH:mm:ss");
    } catch (e) { 
      return "Invalid Date"; 
    }
  };

  const handleViewDetails = (message: BroadcastMessageItem) => { // Renamed from notification
    toast({
      title: message.title,
      description: (
        <div className="space-y-1 text-sm">
          <p><strong>Message:</strong> {message.message}</p>
          <p><strong>Audience:</strong> {message.audienceType} {message.audienceTarget ? `(${message.audienceTarget})` : ''}</p>
          <p><strong>Status:</strong> {message.status}</p>
          <p><strong>Created:</strong> {formatDateForDisplay(message.createdAt)}</p>
          {message.sentAt && <p><strong>Sent:</strong> {formatDateForDisplay(message.sentAt)}</p>}
          {message.scheduledAt && <p><strong>Scheduled:</strong> {formatDateForDisplay(message.scheduledAt)}</p>}
        </div>
      ),
      duration: 10000,
    });
  };
  
  const handleEditMessage = (message: BroadcastMessageItem) => { // Renamed from handleEditNotification
    if (message.status === 'Draft' || message.status === 'Scheduled') {
      setEditingMessage(message);
      setIsCreateSheetOpen(true);
    } else {
      toast({title: "Cannot Edit", description: "Only Draft or Scheduled messages can be edited.", variant: "destructive"});
    }
  };
  
  const handleDeleteMessage = (messageId: string) => { // Renamed from handleDeleteNotification
    if(window.confirm("Are you sure you want to delete this broadcast message? This action is local and cannot be undone.")) {
        setMessages(prev => prev.filter(n => n.id !== messageId));
        toast({ title: "Broadcast Message Deleted", description: `Message ${messageId} removed (locally).`, variant: "destructive" });
    }
  };

  const handleCreateOrUpdateMessage = (data: CreateBroadcastMessageFormValues) => { // Renamed from handleCreateOrUpdateNotification
    if (editingMessage) { 
        setMessages(prev => prev.map(msg => msg.id === editingMessage.id ? {
            ...msg,
            ...data,
        } : msg));
        toast({title: "Broadcast Message Updated (Locally)", description: `Message "${data.title}" updated.`});
    } else { 
        const newMessage: BroadcastMessageItem = {
            id: `msg_${Date.now()}`,
            ...data,
            status: "Draft", 
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [newMessage, ...prev]);
        toast({title: "Broadcast Message Created (Locally)", description: `Message "${data.title}" created as Draft.`});
    }
    setEditingMessage(null);
    setIsCreateSheetOpen(false);
  };
  
  const handleSendMessage = (messageId: string) => { // Renamed from handleSendNotification
    setMessages(prev => prev.map(msg => msg.id === messageId ? {
        ...msg,
        status: "Sent",
        sentAt: new Date().toISOString(),
        scheduledAt: null, 
    } : msg));
    const message = messages.find(msg => msg.id === messageId);
    toast({title: "Broadcast Message Sent (Mock)", description: `Message "${message?.title}" marked as Sent.`});
  };


  const handleExport = (formatType: 'csv' | 'excel' | 'pdf') => {
    const dataToExport = processedMessages;
    const filenamePrefix = 'broadcast_messages_export';

    if (formatType === 'csv') {
      const headers = ["ID", "Title", "Message", "Audience Type", "Audience Target", "Status", "Created At", "Sent At", "Scheduled At"];
      const csvRows = [
        headers.join(','),
        ...dataToExport.map(msg => [
          msg.id, msg.title, msg.message.substring(0, 50) + "...", msg.audienceType, msg.audienceTarget || '', msg.status,
          formatDateForExport(msg.createdAt), formatDateForExport(msg.sentAt), formatDateForExport(msg.scheduledAt)
        ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filenamePrefix}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast({ title: "CSV Exported", description: "Broadcast message data exported." });
    } else if (formatType === 'excel') {
      const wsData = dataToExport.map(msg => ({
        ID: msg.id, Title: msg.title, Message: msg.message, "Audience Type": msg.audienceType, 
        "Audience Target": msg.audienceTarget || '', Status: msg.status, 
        "Created At": formatDateForExport(msg.createdAt), "Sent At": formatDateForExport(msg.sentAt), "Scheduled At": formatDateForExport(msg.scheduledAt)
      }));
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new(); 
      XLSX.utils.book_append_sheet(wb, ws, "BroadcastMessages"); 
      XLSX.writeFile(wb, `${filenamePrefix}.xlsx`); 
      toast({ title: "Excel Exported", description: "Broadcast message data exported." });
    } else if (formatType === 'pdf') {
      const doc = new jsPDF({orientation: "landscape"});
      const tableColumn = ["ID", "Title", "Audience", "Status", "Created", "Sent/Scheduled"];
      const tableRows = dataToExport.map(msg => [
        msg.id.substring(0,10), msg.title.substring(0,20), `${msg.audienceType}${msg.audienceTarget ? ` (${msg.audienceTarget.substring(0,10)})` : ''}`, 
        msg.status, formatDateForExport(msg.createdAt).substring(5,16), 
        msg.status === 'Sent' ? formatDateForExport(msg.sentAt).substring(5,16) : msg.status === 'Scheduled' ? formatDateForExport(msg.scheduledAt).substring(5,16) : 'N/A'
      ]);
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20, styles: { fontSize: 7, cellPadding: 1.5 } });
      doc.text("Broadcast Messages Report", 14, 15);
      doc.save(`${filenamePrefix}.pdf`);
      toast({ title: "PDF Exported", description: "Broadcast message data exported." });
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle>Broadcast Messages Log</CardTitle>
              <CardDescription>History of all created, scheduled, and sent broadcast messages.</CardDescription>
            </div>
            <Button onClick={() => { setEditingMessage(null); setIsCreateSheetOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Broadcast Message
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-end gap-2 pt-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Title, Message, Target..."
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <Select value={statusFilter} onValueChange={(value) => {setStatusFilter(value as BroadcastMessageStatus | "All"); setCurrentPage(1);}}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  {BROADCAST_MESSAGE_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Export Data</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('csv')}><ExportFileText className="mr-2 h-4 w-4" />Export CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('excel')}><FileSpreadsheet className="mr-2 h-4 w-4" />Export Excel</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('pdf')}><Printer className="mr-2 h-4 w-4" />Export PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('title')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Title {renderSortIcon('title')}</div></TableHead>
                <TableHead>Message Snippet</TableHead>
                <TableHead onClick={() => handleSort('audienceType')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Audience {renderSortIcon('audienceType')}</div></TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Status {renderSortIcon('status')}</div></TableHead>
                <TableHead onClick={() => handleSort('createdAt')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Created {renderSortIcon('createdAt')}</div></TableHead>
                <TableHead onClick={() => handleSort('sentAt')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Sent/Scheduled {renderSortIcon('sentAt')}</div></TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No broadcast messages found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMessages.map((msg) => {
                  const StatusIcon = statusIconMap[msg.status];
                  return (
                    <TableRow key={msg.id}>
                      <TableCell className="font-medium max-w-[200px] truncate" title={msg.title}>{msg.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[250px] truncate" title={msg.message}>{msg.message}</TableCell>
                      <TableCell className="text-xs">
                        {msg.audienceType}
                        {msg.audienceTarget && <span className="block text-muted-foreground text-[0.7rem]">({msg.audienceTarget})</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariantMap[msg.status]} className={msg.status === "Sent" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                           <StatusIcon className="mr-1.5 h-3 w-3" />
                           <span className="text-xs">{msg.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{formatDateForDisplay(msg.createdAt)}</TableCell>
                      <TableCell className="text-xs">
                        {msg.status === "Sent" && msg.sentAt ? formatDateForDisplay(msg.sentAt) : 
                         msg.status === "Scheduled" && msg.scheduledAt ? formatDateForDisplay(msg.scheduledAt) : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions for {msg.title}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(msg)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            {(msg.status === "Draft" || msg.status === "Scheduled") && (
                              <DropdownMenuItem onClick={() => handleEditMessage(msg)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            )}
                            {(msg.status === "Draft" || msg.status === "Scheduled") && (
                              <DropdownMenuItem onClick={() => handleSendMessage(msg.id)} className="text-green-600 focus:text-green-700">
                                <Send className="mr-2 h-4 w-4" /> Send Now (Mock)
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteMessage(msg.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages > 0 ? totalPages : 1} ({processedMessages.length} total messages)
            </span>
            <div className="flex items-center gap-2">
                <Select
                    value={String(itemsPerPage)}
                    onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}
                >
                    <SelectTrigger className="w-[80px] h-9"><SelectValue placeholder={String(itemsPerPage)} /></SelectTrigger>
                    <SelectContent>{[5, 10, 20, 50, 100].map(size => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">items per page</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} variant="outline" size="sm">Previous</Button>
              <Button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateBroadcastMessageSheet
        isOpen={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
        onSubmit={handleCreateOrUpdateMessage}
        initialData={editingMessage}
      />
    </div>
  );
}
