
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Loader2, Search, Download, FileText as ExportFileText, FileSpreadsheet, Printer, ArrowUpDown, ArrowUp, ArrowDown, ThumbsUp, ThumbsDown, Clock, CheckCircle, Info, Truck, PackageCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns'; 
import { ReturnDetailsSheet } from "@/components/admin/returns/ReturnDetailsSheet";
import type { Order, ReturnStatus, SortableReturnKeys } from "@/types/order";
import { ALL_RETURN_STATUSES } from "@/types/order";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Mock data source - in a real app, this would be fetched
const MOCK_RETURN_REQUEST_DATE_1 = new Date(Date.now() - 86400000 * 2).toISOString();
const MOCK_RETURN_REQUEST_DATE_2 = new Date(Date.now() - 86400000 * 1).toISOString();

const initialOrdersData: Order[] = [
  { id: "ord001", customer: "Ananya Sharma", seller: "RK Electronics", date: "2024-07-18", status: "Shipped", trackingId: "TRK12345678" },
  { id: "ord002", customer: "Rohan Verma", seller: "Anjali's Artistry", date: "2024-07-17", status: "Processing", trackingId: null },
  { id: "ord003", customer: "Priya Mehta", seller: "Khan's Spices", date: "2024-07-16", status: "Delivered", trackingId: "TRK98765432" },
  { id: "ord004", customer: "Sameer Ali", seller: "Fashion Forward", date: "2024-07-19", status: "Pending Payment", trackingId: null },
  { id: "ord005", customer: "Deepika Nair", seller: "Patel's Organics", date: "2024-07-15", status: "Delivered", trackingId: "TRK24681357", returnDetails: { requestId: "RET001", reason: "Item not as described", requestedDate: MOCK_RETURN_REQUEST_DATE_1, status: "Pending" } },
  { id: "ord006", customer: "Arjun Kumar", seller: "Gadget World", date: "2024-07-20", status: "Processing", trackingId: null },
  { id: "ord007", customer: "Sneha Reddy", seller: "Home Comforts", date: "2024-07-14", status: "Returned", trackingId: "TRK13579246", returnDetails: { requestId: "RET003", reason: "Wrong item delivered", requestedDate: new Date(Date.now() - 86400000 * 5).toISOString(), status: "Completed" } },
  { id: "ord008", customer: "Vikram Singh", seller: "Book Haven", date: "2024-07-21", status: "Cancelled", trackingId: null },
  { id: "ord009", customer: "Natasha Roy", seller: "Beauty Box", date: "2024-07-13", status: "Delivered", trackingId: "TRK56789012", returnDetails: { requestId: "RET002", reason: "Accidental order", requestedDate: MOCK_RETURN_REQUEST_DATE_2, status: "Approved" } },
  { id: "ord010", customer: "Aditya Rao", seller: "Sports Gear", date: "2024-07-22", status: "Pending Payment", trackingId: null },
];

const returnStatusVariantMap: Record<ReturnStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "secondary",
  Approved: "default",
  Rejected: "destructive",
  "In Transit": "secondary",
  Received: "default",
  Completed: "default",
};

const returnStatusIconMap: Record<ReturnStatus, React.ElementType> = {
  Pending: Clock,
  Approved: ThumbsUp,
  Rejected: ThumbsDown,
  "In Transit": Truck,
  Received: PackageCheck,
  Completed: CheckCircle,
};

export function ReturnsClient() {
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);
  
  const [returnsData, setReturnsData] = useState<Order[]>(initialOrdersData.filter(o => o.returnDetails));

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | "All">("All");
  const [sortConfig, setSortConfig] = useState<{ key: SortableReturnKeys; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Order | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const processedReturns = useMemo(() => {
    let filtered = [...returnsData];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(lowerSearch) ||
        order.customer.toLowerCase().includes(lowerSearch) ||
        order.seller.toLowerCase().includes(lowerSearch) ||
        (order.returnDetails?.reason.toLowerCase().includes(lowerSearch))
      );
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter(order => order.returnDetails?.status === statusFilter);
    }
    // Add sorting logic if needed
    return filtered;
  }, [returnsData, searchTerm, statusFilter, sortConfig]);

  const paginatedReturns = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedReturns.slice(start, start + itemsPerPage);
  }, [processedReturns, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedReturns.length / itemsPerPage);

  const formatDateForDisplay = (dateString: string) => {
    try {
      return format(parseISO(dateString), "PP");
    } catch (e) {
      return dateString;
    }
  };

  const handleApproveReturn = (orderId: string) => {
    setReturnsData(prev =>
      prev.map(o =>
        o.id === orderId && o.returnDetails
          ? { ...o, returnDetails: { ...o.returnDetails, status: "Approved" } }
          : o
      )
    );
    setSelectedReturn(prev => prev && prev.id === orderId && prev.returnDetails ? { ...prev, returnDetails: { ...prev.returnDetails, status: "Approved" } } : prev);
    toast({ title: "Return Approved", description: `Return request for order ${orderId} approved.` });
  };
  
  const handleRejectReturn = (orderId: string) => {
    const reason = window.prompt("Enter reason for rejecting the return:");
    if (reason === null) return;
    const finalReason = reason.trim() || "Reason not specified by admin.";
    setReturnsData(prev =>
      prev.map(o =>
        o.id === orderId && o.returnDetails
          ? { ...o, returnDetails: { ...o.returnDetails, status: "Rejected", rejectionReason: finalReason } }
          : o
      )
    );
    setSelectedReturn(prev => prev && prev.id === orderId && prev.returnDetails ? { ...prev, returnDetails: { ...prev.returnDetails, status: "Rejected", rejectionReason: finalReason } } : prev);
    toast({ title: "Return Rejected", description: `Return for order ${orderId} rejected. Reason: ${finalReason}`, variant: "destructive" });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedReturn(order);
    setIsSheetOpen(true);
  };

  if (!hasMounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading returns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Return Requests</CardTitle>
          <CardDescription>Review and process all pending and historical return requests.</CardDescription>
          <div className="flex flex-col sm:flex-row justify-between items-end gap-2 pt-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Order ID, Customer, Reason..."
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={(value) => {setStatusFilter(value as ReturnStatus | "All"); setCurrentPage(1);}}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by return status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  {ALL_RETURN_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Return Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReturns.map((order) => {
                if (!order.returnDetails) return null;
                const StatusIcon = returnStatusIconMap[order.returnDetails.status];
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell className="max-w-xs truncate" title={order.returnDetails.reason}>{order.returnDetails.reason}</TableCell>
                    <TableCell>{formatDateForDisplay(order.returnDetails.requestedDate)}</TableCell>
                    <TableCell>
                      <Badge variant={returnStatusVariantMap[order.returnDetails.status]}
                             className={order.returnDetails.status === 'Approved' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                        <StatusIcon className="mr-1.5 h-3 w-3" />
                        {order.returnDetails.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions for {order.id}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          {order.returnDetails.status === "Pending" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleApproveReturn(order.id)} className="text-green-600 focus:text-green-700">
                                <ThumbsUp className="mr-2 h-4 w-4" /> Approve Return
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRejectReturn(order.id)} className="text-red-600 focus:text-red-700">
                                <ThumbsDown className="mr-2 h-4 w-4" /> Reject Return
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              {paginatedReturns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No return requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
           <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages > 0 ? totalPages : 1} ({processedReturns.length} total returns)
            </span>
            <div className="flex items-center gap-2">
                <Select
                    value={String(itemsPerPage)}
                    onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}
                >
                    <SelectTrigger className="w-[80px] h-9"><SelectValue placeholder={String(itemsPerPage)} /></SelectTrigger>
                    <SelectContent>{[5, 10, 20, 50].map(size => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent>
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
      
      {selectedReturn && (
        <ReturnDetailsSheet
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          order={selectedReturn}
          onApproveReturn={handleApproveReturn}
          onRejectReturn={handleRejectReturn}
        />
      )}
    </div>
  );
}
