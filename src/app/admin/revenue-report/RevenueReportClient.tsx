
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Download, FileText as ExportFileText, FileSpreadsheet, Printer, ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, Users, ShoppingBag, DollarSign as DollarSignIcon, AlertCircle, XCircle, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { StatCard } from "@/components/dashboard/StatCard";
import type { SubscriptionPurchase, SubscriptionStatus, SortableSubscriptionKeys } from "@/types/revenue";
import { SubscriptionDetailsSheet } from "@/components/admin/revenue-report/SubscriptionDetailsSheet";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const MOCK_BASE_TIMESTAMP = new Date("2024-07-20T10:00:00.000Z").getTime();

const mockSubscriptionPurchases: SubscriptionPurchase[] = [
  { id: "sub_001", sellerId: "seller_123", sellerName: "Rajesh Kumar", sellerBusinessName: "RK Electronics", packageId: "pkg_001", packageName: "Basic Seller Kit", price: 499, currency: "INR", billingInterval: "monthly", purchaseDate: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 30).toISOString(), renewalDate: new Date(MOCK_BASE_TIMESTAMP).toISOString(), status: "Active", paymentMethod: "Credit Card", transactionId: "txn_abc123" },
  { id: "sub_002", sellerId: "seller_456", sellerName: "Anjali Desai", sellerBusinessName: "Anjali's Artistry", packageId: "pkg_002", packageName: "Influencer Pro", price: 1999, currency: "INR", billingInterval: "monthly", purchaseDate: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 15).toISOString(), renewalDate: new Date(MOCK_BASE_TIMESTAMP + 1000 * 60 * 60 * 24 * 15).toISOString(), status: "Active", paymentMethod: "UPI", transactionId: "txn_def456" },
  { id: "sub_003", sellerId: "seller_789", sellerName: "Mohammed Khan", sellerBusinessName: "Khan's Spices", packageId: "pkg_003", packageName: "Wholesale Partner", price: 4999, currency: "INR", billingInterval: "annually", purchaseDate: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 90).toISOString(), renewalDate: new Date(MOCK_BASE_TIMESTAMP + 1000 * 60 * 60 * 24 * 275).toISOString(), status: "Active", paymentMethod: "Net Banking", transactionId: "txn_ghi789" },
  { id: "sub_004", sellerId: "seller_101", sellerName: "Priya Singh", sellerBusinessName: "Fashion Forward", packageId: "pkg_001", packageName: "Basic Seller Kit", price: 499, currency: "INR", billingInterval: "monthly", purchaseDate: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 60).toISOString(), status: "Expired", paymentMethod: "Credit Card", transactionId: "txn_jkl101" },
  { id: "sub_005", sellerId: "seller_112", sellerName: "Amit Patel", sellerBusinessName: "Patel's Organics", packageId: "pkg_004", packageName: "Affiliate Starter", price: 0, currency: "INR", billingInterval: "one-time", purchaseDate: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 5).toISOString(), status: "Active", paymentMethod: "N/A", transactionId: "txn_mno112" },
  { id: "sub_006", sellerId: "seller_113", sellerName: "Sneha Iyer", sellerBusinessName: "Iyer Books", packageId: "pkg_002", packageName: "Influencer Pro", price: 1999, currency: "INR", billingInterval: "monthly", purchaseDate: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 40).toISOString(), status: "Cancelled", paymentMethod: "PayPal", transactionId: "txn_pqr113", renewalDate: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 10).toISOString() },
];

const statusVariantMap: Record<SubscriptionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Active: "default",
  Expired: "outline",
  Cancelled: "destructive",
  PendingPayment: "secondary"
};

const statusIconMap: Record<SubscriptionStatus, React.ElementType> = {
  Active: TrendingUp,
  Expired: AlertCircle,
  Cancelled: XCircle,
  PendingPayment: DollarSignIcon
};

export function RevenueReportClient() {
  const { toast } = useToast();
  const { settings: appSettings } = useAppSettings();
  
  const [subscriptions, setSubscriptions] = useState<SubscriptionPurchase[]>(mockSubscriptionPurchases);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "All">("All");
  const [sortConfig, setSortConfig] = useState<{ key: SortableSubscriptionKeys; direction: 'ascending' | 'descending' }>({ key: 'purchaseDate', direction: 'descending' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionPurchase | null>(null);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: appSettings.currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, [appSettings.currencyCode]);

  const revenueDashboardStats = useMemo(() => {
    const totalRevenue = subscriptions.reduce((acc, sub) => acc + sub.price, 0);
    const activeSubscriptions = subscriptions.filter(sub => sub.status === "Active").length;
    const uniqueSellers = new Set(subscriptions.map(s => s.sellerId)).size;
    const averageRevenuePerSeller = uniqueSellers > 0 ? totalRevenue / uniqueSellers : 0;

    return [
      { title: "Total Revenue", value: formatCurrency(totalRevenue), icon: DollarSignIcon, description: "All time" },
      { title: "Active Subscriptions", value: activeSubscriptions.toLocaleString(), icon: TrendingUp, description: "Currently active" },
      { title: "Total Paying Sellers", value: uniqueSellers.toLocaleString(), icon: Users, description: "Unique sellers with subscriptions" },
      { title: "Avg. Revenue / Seller", value: formatCurrency(averageRevenuePerSeller), icon: ShoppingBag, description: "All time average" },
    ];
  }, [subscriptions, formatCurrency]);


  const processedSubscriptions = useMemo(() => {
    let filtered = [...subscriptions].map(sub => ({...sub, currency: appSettings.currencyCode})); // Ensure currency is up-to-date
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.sellerName.toLowerCase().includes(lowerSearch) ||
        sub.sellerBusinessName.toLowerCase().includes(lowerSearch) ||
        sub.packageName.toLowerCase().includes(lowerSearch) ||
        sub.sellerId.toLowerCase().includes(lowerSearch) ||
        (sub.transactionId && sub.transactionId.toLowerCase().includes(lowerSearch))
      );
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'purchaseDate') {
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
  }, [subscriptions, searchTerm, statusFilter, sortConfig, appSettings.currencyCode]);

  const paginatedSubscriptions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedSubscriptions.slice(start, start + itemsPerPage);
  }, [processedSubscriptions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedSubscriptions.length / itemsPerPage);

  const handleSort = (key: SortableSubscriptionKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const renderSortIcon = (columnKey: SortableSubscriptionKeys) => {
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
      console.error("Error formatting date for display:", e);
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

  const handleViewDetails = (subscription: SubscriptionPurchase) => {
    setSelectedSubscription(subscription);
    setIsDetailsSheetOpen(true);
  };

  const handleExport = (formatType: 'csv' | 'excel' | 'pdf') => {
    const dataToExport = processedSubscriptions;
    const filenamePrefix = 'subscription_revenue_report';

    if (formatType === 'csv') {
      const headers = ["ID", "Seller Name", "Business Name", "Package Name", "Price ("+appSettings.currencySymbol+")", "Billing Interval", "Purchase Date", "Renewal Date", "Status", "Payment Method", "Transaction ID"];
      const csvRows = [
        headers.join(','),
        ...dataToExport.map(sub => [
          sub.id, sub.sellerName, sub.sellerBusinessName, sub.packageName, sub.price.toFixed(2), sub.billingInterval,
          formatDateForExport(sub.purchaseDate), formatDateForExport(sub.renewalDate), sub.status,
          sub.paymentMethod || '', sub.transactionId || ''
        ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filenamePrefix}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast({ title: "CSV Exported", description: "Subscription data exported." });
    } else if (formatType === 'excel') {
      const wsData = dataToExport.map(sub => ({
        ID: sub.id, "Seller Name": sub.sellerName, "Business Name": sub.sellerBusinessName, "Package Name": sub.packageName,
        Price: sub.price, Currency: sub.currency, "Billing Interval": sub.billingInterval, 
        "Purchase Date": formatDateForExport(sub.purchaseDate), "Renewal Date": formatDateForExport(sub.renewalDate),
        Status: sub.status, "Payment Method": sub.paymentMethod || '', "Transaction ID": sub.transactionId || ''
      }));
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new(); 
      XLSX.utils.book_append_sheet(wb, ws, "Subscriptions"); 
      XLSX.writeFile(wb, `${filenamePrefix}.xlsx`); 
      toast({ title: "Excel Exported", description: "Subscription data exported." });
    } else if (formatType === 'pdf') {
      const doc = new jsPDF({orientation: "landscape"});
      const tableColumn = ["ID", "Seller", "Package", "Price", "Purchased", "Status"];
      const tableRows = dataToExport.map(sub => [
        sub.id.substring(0,10), `${sub.sellerName} (${sub.sellerBusinessName.substring(0,15)})`, sub.packageName.substring(0,15),
        formatCurrency(sub.price), formatDateForExport(sub.purchaseDate).substring(0,10), sub.status
      ]);
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20, styles: { fontSize: 7, cellPadding: 1.5 } });
      doc.text("Subscription Revenue Report", 14, 15);
      doc.save(`${filenamePrefix}.pdf`);
      toast({ title: "PDF Exported", description: "Subscription data exported." });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
            <CardTitle>Revenue Dashboard</CardTitle>
            <CardDescription>Key financial metrics from seller subscriptions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {revenueDashboardStats.map(stat => (
                <StatCard 
                  key={stat.title} 
                  title={stat.title} 
                  value={stat.value} 
                  icon={stat.icon} 
                  description={stat.description} 
                  className="shadow-md border"
                />
            ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Seller Subscriptions List</CardTitle>
          <CardDescription>Detailed list of all packages purchased by sellers.</CardDescription>
          <div className="flex flex-col sm:flex-row justify-between items-end gap-2 pt-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Seller, Package, ID..."
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <Select value={statusFilter} onValueChange={(value) => {setStatusFilter(value as SubscriptionStatus | "All"); setCurrentPage(1);}}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  {(Object.keys(statusVariantMap) as SubscriptionStatus[]).map(status => (
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
                <TableHead onClick={() => handleSort('sellerName')} className="cursor-pointer hover:bg-muted/50 group">
                  <div className="flex items-center gap-1">Seller {renderSortIcon('sellerName')}</div>
                </TableHead>
                <TableHead onClick={() => handleSort('packageName')} className="cursor-pointer hover:bg-muted/50 group">
                  <div className="flex items-center gap-1">Package {renderSortIcon('packageName')}</div>
                </TableHead>
                <TableHead onClick={() => handleSort('price')} className="cursor-pointer hover:bg-muted/50 group text-right">
                  <div className="flex items-center justify-end gap-1">Price {renderSortIcon('price')}</div>
                </TableHead>
                <TableHead onClick={() => handleSort('purchaseDate')} className="cursor-pointer hover:bg-muted/50 group">
                  <div className="flex items-center gap-1">Purchase Date {renderSortIcon('purchaseDate')}</div>
                </TableHead>
                 <TableHead>Renewal Date</TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-muted/50 group">
                  <div className="flex items-center gap-1">Status {renderSortIcon('status')}</div>
                </TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No subscriptions found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSubscriptions.map((sub) => {
                  const StatusIcon = statusIconMap[sub.status];
                  return (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="font-medium">{sub.sellerName}</div>
                        <div className="text-xs text-muted-foreground">{sub.sellerBusinessName} ({sub.sellerId})</div>
                      </TableCell>
                      <TableCell className="text-xs">{sub.packageName}</TableCell>
                      <TableCell className="text-xs text-right">{formatCurrency(sub.price)} <span className="text-muted-foreground">({sub.billingInterval})</span></TableCell>
                      <TableCell className="text-xs">{formatDateForDisplay(sub.purchaseDate)}</TableCell>
                      <TableCell className="text-xs">{formatDateForDisplay(sub.renewalDate)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariantMap[sub.status]} className={sub.status === "Active" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                           <StatusIcon className="mr-1.5 h-3 w-3" />
                           <span className="text-xs">{sub.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions for {sub.id}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(sub)}>
                              <Eye className="mr-2 h-4 w-4" /> View Full Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast({title: "Manage Subscription (Placeholder)", description: `Manage actions for ${sub.id}`})}>
                              Manage Subscription
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
              Page {currentPage} of {totalPages > 0 ? totalPages : 1} ({processedSubscriptions.length} total subscriptions)
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

      {selectedSubscription && (
        <SubscriptionDetailsSheet
            isOpen={isDetailsSheetOpen}
            onOpenChange={setIsDetailsSheetOpen}
            subscription={selectedSubscription}
            formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
