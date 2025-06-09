
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, PackageCheck, PackageSearch, Truck, Edit, Loader2, Search, Download, FileText as ExportFileText, FileSpreadsheet, Printer, ArrowUpDown, ArrowUp, ArrowDown, ShoppingCart, DollarSign, XCircle } from "lucide-react"; // Added ShoppingCart, DollarSign, XCircle
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns'; 
import { OrderDetailsSheet } from "@/components/admin/logistics/OrderDetailsSheet"; 

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface Order { 
  id: string;
  customer: string;
  seller: string;
  date: string; 
  status: OrderStatus;
  trackingId: string | null;
}

const initialOrdersData: Order[] = [
  { id: "ord001", customer: "Ananya Sharma", seller: "RK Electronics", date: "2024-07-18", status: "Shipped", trackingId: "TRK12345678" },
  { id: "ord002", customer: "Rohan Verma", seller: "Anjali's Artistry", date: "2024-07-17", status: "Processing", trackingId: null },
  { id: "ord003", customer: "Priya Mehta", seller: "Khan's Spices", date: "2024-07-16", status: "Delivered", trackingId: "TRK98765432" },
  { id: "ord004", customer: "Sameer Ali", seller: "Fashion Forward", date: "2024-07-19", status: "Pending Payment", trackingId: null },
  { id: "ord005", customer: "Deepika Nair", seller: "Patel's Organics", date: "2024-07-15", status: "Shipped", trackingId: "TRK24681357" },
  { id: "ord006", customer: "Arjun Kumar", seller: "Gadget World", date: "2024-07-20", status: "Processing", trackingId: null },
  { id: "ord007", customer: "Sneha Reddy", seller: "Home Comforts", date: "2024-07-14", status: "Delivered", trackingId: "TRK13579246" },
  { id: "ord008", customer: "Vikram Singh", seller: "Book Haven", date: "2024-07-21", status: "Cancelled", trackingId: null },
  { id: "ord009", customer: "Natasha Roy", seller: "Beauty Box", date: "2024-07-13", status: "Shipped", trackingId: "TRK56789012" },
  { id: "ord010", customer: "Aditya Rao", seller: "Sports Gear", date: "2024-07-22", status: "Pending Payment", trackingId: null },
];

export type OrderStatus = "Pending Payment" | "Processing" | "Shipped" | "Delivered" | "Cancelled"; 
export type SortableOrderKeys = keyof Order;

const ALL_ORDER_STATUSES: OrderStatus[] = ["Pending Payment", "Processing", "Shipped", "Delivered", "Cancelled"];


const statusVariant: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  "Pending Payment": "outline",
  Processing: "secondary",
  Shipped: "default", 
  Delivered: "default", 
  Cancelled: "destructive",
};

export default function LogisticsPage() {
  const { toast } = useToast();
  const [hasMounted, setHasMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>(initialOrdersData); 

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const [sortConfig, setSortConfig] = useState<{ key: SortableOrderKeys; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const processedOrders = useMemo(() => {
    let filtered = [...orders];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(lowerSearch) ||
        order.customer.toLowerCase().includes(lowerSearch) ||
        order.seller.toLowerCase().includes(lowerSearch) ||
        (order.trackingId && order.trackingId.toLowerCase().includes(lowerSearch))
      );
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'date') {
          valA = new Date(valA as string).getTime();
          valB = new Date(valB as string).getTime();
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
  }, [orders, searchTerm, statusFilter, sortConfig]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedOrders.slice(start, start + itemsPerPage);
  }, [processedOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedOrders.length / itemsPerPage);

  const handleSort = (key: SortableOrderKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const renderSortIcon = (columnKey: SortableOrderKeys) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 opacity-30 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };
  
  const formatDateForDisplay = (dateString: string) => {
    try {
      return format(new Date(dateString), "PP"); 
    } catch (e) {
      return dateString; 
    }
  };
  const formatDateForExport = (dateString: string) => {
     try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch (e) {
      return dateString; 
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders => 
        prevOrders.map(o => 
            o.id === orderId ? {...o, status: newStatus} : o
        )
    );
    toast({ title: "Order Status Updated", description: `Order ${orderId} status changed to ${newStatus}.` });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  const handleExport = (formatType: 'csv' | 'excel' | 'pdf') => {
    const dataToExport = processedOrders;
    const filenamePrefix = 'orders_export';

    if (formatType === 'csv') {
      const headers = ["Order ID", "Customer", "Seller", "Date", "Status", "Tracking ID"];
      const csvRows = [
        headers.join(','),
        ...dataToExport.map(order => [
          order.id, order.customer, order.seller, formatDateForExport(order.date), order.status, order.trackingId || ''
        ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filenamePrefix}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast({ title: "CSV Exported", description: "Orders data exported." });
    } else if (formatType === 'excel') {
      const wsData = dataToExport.map(order => ({
        "Order ID": order.id, Customer: order.customer, Seller: order.seller, 
        Date: formatDateForExport(order.date), Status: order.status, "Tracking ID": order.trackingId || ''
      }));
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Orders");
      XLSX.writeFile(wb, `${filenamePrefix}.xlsx`);
      toast({ title: "Excel Exported", description: "Orders data exported." });
    } else if (formatType === 'pdf') {
      const doc = new jsPDF();
      const tableColumn = ["ID", "Customer", "Seller", "Date", "Status", "Tracking ID"];
      const tableRows = dataToExport.map(order => [
        order.id, order.customer, order.seller, formatDateForExport(order.date), order.status, order.trackingId || ''
      ]);
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
      doc.text("Orders Report", 14, 15);
      doc.save(`${filenamePrefix}.pdf`);
      toast({ title: "PDF Exported", description: "Orders data exported." });
    }
  };


  if (!hasMounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading orders management...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Orders Management</h1>
      <p className="text-muted-foreground">Track and manage order fulfillment and statuses.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Order Tracking</CardTitle>
          <CardDescription>Overview of all customer orders and their statuses.</CardDescription>
          <div className="flex flex-col sm:flex-row justify-between items-end gap-2 pt-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Orders (ID, Customer, Seller)..."
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={(value) => {setStatusFilter(value as OrderStatus | "All"); setCurrentPage(1);}}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  {ALL_ORDER_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Orders</Button>
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
                <TableHead onClick={() => handleSort('id')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Order ID {renderSortIcon('id')}</div></TableHead>
                <TableHead onClick={() => handleSort('customer')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Customer {renderSortIcon('customer')}</div></TableHead>
                <TableHead onClick={() => handleSort('seller')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Seller {renderSortIcon('seller')}</div></TableHead>
                <TableHead onClick={() => handleSort('date')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Date {renderSortIcon('date')}</div></TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Status {renderSortIcon('status')}</div></TableHead>
                <TableHead onClick={() => handleSort('trackingId')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Tracking ID {renderSortIcon('trackingId')}</div></TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary hover:underline"
                      onClick={() => handleViewDetails(order)}
                    >
                      {order.id}
                    </Button>
                  </TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.seller}</TableCell>
                  <TableCell>{formatDateForDisplay(order.date)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[order.status]}
                           className={order.status === 'Delivered' ? 'bg-green-500 hover:bg-green-600 text-white' : order.status === 'Shipped' ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.trackingId || "N/A"}</TableCell>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuRadioGroup 
                            value={order.status} 
                            onValueChange={(newStatus) => handleUpdateStatus(order.id, newStatus as OrderStatus)}
                        >
                          {ALL_ORDER_STATUSES.filter(s => s !== "Pending Payment").map(statusOption => ( 
                             <DropdownMenuRadioItem key={statusOption} value={statusOption}>
                                {statusOption === "Processing" && <PackageSearch className="mr-2 h-4 w-4" />}
                                {statusOption === "Shipped" && <Truck className="mr-2 h-4 w-4" />}
                                {statusOption === "Delivered" && <PackageCheck className="mr-2 h-4 w-4" />}
                                {statusOption === "Cancelled" && <XCircle className="mr-2 h-4 w-4" />}
                                {statusOption}
                             </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toast({title: "Edit Tracking (Placeholder)", description: `Editing tracking for order ${order.id}`})}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Tracking Info
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {paginatedOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                      No orders found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages > 0 ? totalPages : 1} ({processedOrders.length} total orders)
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

      <OrderDetailsSheet 
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        order={selectedOrder}
      />
    </div>
  );
}

