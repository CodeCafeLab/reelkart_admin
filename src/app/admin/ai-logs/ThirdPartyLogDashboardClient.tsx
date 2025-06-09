
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Download, FileText as ExportFileText, FileSpreadsheet, Printer, ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, CheckCircle, Clock, DollarSign, Server, MessageSquare, Truck as LogisticsIcon, Brain, CreditCard, BarChartHorizontal, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { useLocale } from 'next-intl';
import { enUS, hi as hiLocale } from 'date-fns/locale';
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { StatCard } from "@/components/dashboard/StatCard";
import type { LogEntry, ThirdPartyService, LogStatus, SortableLogKeys, DashboardStat } from "@/types/logs";
import { THIRD_PARTY_SERVICES, LOG_STATUSES } from "@/types/logs";
import { UserUsageDetailsSheet } from "@/components/admin/logs/UserUsageDetailsSheet";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Use a fixed base time to generate static timestamps for mock data
const MOCK_BASE_TIMESTAMP = new Date("2024-07-20T10:00:00.000Z").getTime();

const mockLogEntries: LogEntry[] = [
  { id: "log001", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 5).toISOString(), service: "OpenAI", event: "Completion API Call", userId: "usr_abc", cost: 0.02, status: "Success", durationMs: 1500, details: "Model: gpt-4o, Tokens: 150" },
  { id: "log002", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 10).toISOString(), service: "SMSProvider", event: "OTP Sent", userId: "usr_xyz", cost: 0.50, status: "Success", durationMs: 200, details: { to: "+91XXXXXX", messageId: "sms_123" } },
  { id: "log003", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 15).toISOString(), service: "LogisticsAPI", event: "Create Shipment", userId: "seller_1", cost: 75.00, status: "Pending", durationMs: 500, details: "AWB: LP789543" },
  { id: "log004", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 20).toISOString(), service: "RunwayML", event: "Image Generation", userId: "usr_designer", cost: 1.00, status: "Success", durationMs: 12000, details: "Prompt: 'cosmic cat'" },
  { id: "log005", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 25).toISOString(), service: "OpenAI", event: "Embedding API Call", userId: "sys_batch", cost: 0.005, status: "Failed", durationMs: 300, details: "Error: API Key Invalid" },
  { id: "log006", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 30).toISOString(), service: "PaymentGateway", event: "Process Payment", userId: "buyer_789", cost: 2.50, status: "Success", durationMs: 800, details: { amount: 1200, transactionId: "txn_pqr" } },
  { id: "log007", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 35).toISOString(), service: "AnalyticsTool", event: "Track Event: PageView", userId: "usr_visitor", cost: 0.001, status: "Success", durationMs: 50, details: { page: "/products/123" } },
  { id: "log008", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 40).toISOString(), service: "SMSProvider", event: "Delivery Notification", userId: "usr_qwe", cost: 0.50, status: "Failed", durationMs: 150, details: "Error: Invalid Number" },
  { id: "log009", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 45).toISOString(), service: "LogisticsAPI", event: "Track Shipment", userId: "usr_qwe", cost: 0.10, status: "Success", durationMs: 300, details: "AWB: LP789543, Status: In Transit" },
  { id: "log010", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 50).toISOString(), service: "OpenAI", event: "Moderation API Call", userId: "usr_mod", cost: 0.002, status: "Success", durationMs: 100, details: "Input: 'Some text', Flagged: false" },
  { id: "log011", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 55).toISOString(), service: "OpenAI", event: "Completion API Call", userId: "usr_abc", cost: 0.015, status: "Success", durationMs: 1200, details: "Model: gpt-4o, Tokens: 120" },
  { id: "log012", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60).toISOString(), service: "SMSProvider", event: "OTP Sent", userId: "usr_abc", cost: 0.45, status: "Success", durationMs: 180, details: { to: "+91YYYYYY", messageId: "sms_456" } },
];


const statusVariantMap: Record<LogStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Success: "default",
  Failed: "destructive",
  Pending: "secondary",
  Warning: "outline",
};
const statusIconMap: Record<LogStatus, React.ElementType> = {
  Success: CheckCircle,
  Failed: AlertCircle,
  Pending: Clock,
  Warning: AlertCircle,
};
export const serviceIconMap: Record<ThirdPartyService, React.ElementType> = {
  OpenAI: Brain,
  SMSProvider: MessageSquare,
  LogisticsAPI: LogisticsIcon,
  RunwayML: Server, 
  PaymentGateway: CreditCard,
  AnalyticsTool: BarChartHorizontal,
};

// Helper component for client-side date formatting to avoid hydration mismatches
function ClientFormattedDateTime({ 
  isoDateString, 
  fullFormatFn, 
  initialFormatFn 
}: { 
  isoDateString: string;
  fullFormatFn: (dateStr: string) => string;
  initialFormatFn: (dateStr: string) => string;
}) {
  const [formattedDate, setFormattedDate] = useState(() => initialFormatFn(isoDateString));

  useEffect(() => {
    setFormattedDate(fullFormatFn(isoDateString));
  }, [isoDateString, fullFormatFn, initialFormatFn]); // Added initialFormatFn

  return <>{formattedDate}</>;
}


export function ThirdPartyLogDashboardClient() {
  const { toast } = useToast();
  const { settings: appSettings } = useAppSettings();
  const currentLocale = useLocale();
  
  const [logEntries, setLogEntries] = useState<LogEntry[]>(mockLogEntries);
  const [dashboardStats, setDashboardStats] = useState<DashboardStat[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState<ThirdPartyService | "All">("All");
  const [statusFilter, setStatusFilter] = useState<LogStatus | "All">("All");
  const [sortConfig, setSortConfig] = useState<{ key: SortableLogKeys; direction: 'ascending' | 'descending' }>({ key: 'timestamp', direction: 'descending' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);
  const [selectedUserIdForSheet, setSelectedUserIdForSheet] = useState<string | null>(null);

  const dateFnsLocale = useMemo(() => {
    switch (currentLocale) {
      case 'hi':
        return hiLocale;
      default:
        return enUS;
    }
  }, [currentLocale]);

  const formatDateForDisplay = useCallback((dateString: string) => {
    if (!dateString) return "Invalid Date";
    try {
      return format(parseISO(dateString), "PPpp", { locale: dateFnsLocale });
    } catch (e) { 
      console.error("Error formatting date for display:", e, "Input:", dateString);
      return "Format Error"; 
    }
  }, [dateFnsLocale]);

  const initialFormatDateForDisplay = useCallback((dateString: string) => {
    if (!dateString) return "Invalid Date";
    try {
      return format(parseISO(dateString), "PP", { locale: dateFnsLocale });
    } catch (e) { 
      console.error("Error formatting initial date for display:", e, "Input:", dateString);
      return "Format Error"; 
    }
  }, [dateFnsLocale]);
  
  const formatDateForExport = useCallback((dateString: string) => {
    if (!dateString) return "Invalid Date";
    try {
      return format(parseISO(dateString), "yyyy-MM-dd HH:mm:ss", { locale: dateFnsLocale });
    } catch (e) { 
      console.error("Error formatting date for export:", e, "Input:", dateString);
      return "Format Error"; 
    }
  }, [dateFnsLocale]);


  useEffect(() => {
    const stats: Record<ThirdPartyService | "Total", DashboardStat> = {} as any;

    THIRD_PARTY_SERVICES.forEach(service => {
        stats[service] = { service, totalRequests: 0, successfulRequests: 0, failedRequests: 0, totalCost: 0 };
    });
    stats["Total"] = { service: "Total", totalRequests: 0, successfulRequests: 0, failedRequests: 0, totalCost: 0 };

    logEntries.forEach(log => {
        stats[log.service].totalRequests++;
        stats["Total"].totalRequests++;
        if (log.status === "Success") {
            stats[log.service].successfulRequests++;
            stats["Total"].successfulRequests++;
        } else if (log.status === "Failed") {
            stats[log.service].failedRequests++;
            stats["Total"].failedRequests++;
        }
        const cost = log.cost || 0;
        stats[log.service].totalCost += cost;
        stats["Total"].totalCost += cost;
    });
    setDashboardStats(Object.values(stats));
  }, [logEntries]);


  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return "N/A";
    return new Intl.NumberFormat(currentLocale === 'hi' ? 'hi-IN' : 'en-IN', { // Use next-intl locale for number formatting consistency
      style: 'currency',
      currency: appSettings.currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4, 
    }).format(amount);
  };

  const processedLogEntries = useMemo(() => {
    let filtered = [...logEntries];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.id.toLowerCase().includes(lowerSearch) ||
        log.event.toLowerCase().includes(lowerSearch) ||
        (log.userId && log.userId.toLowerCase().includes(lowerSearch)) ||
        (typeof log.details === 'string' && log.details.toLowerCase().includes(lowerSearch)) ||
        (log.correlationId && log.correlationId.toLowerCase().includes(lowerSearch))
      );
    }
    if (serviceFilter !== "All") {
      filtered = filtered.filter(log => log.service === serviceFilter);
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'timestamp') {
          valA = new Date(valA as string).getTime();
          valB = new Date(valB as string).getTime();
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          // Standard number comparison
        } else { 
          valA = valA ?? (sortConfig.direction === 'ascending' ? Infinity : -Infinity);
          valB = valB ?? (sortConfig.direction === 'ascending' ? Infinity : -Infinity);
        }
        
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [logEntries, searchTerm, serviceFilter, statusFilter, sortConfig]);

  const paginatedLogEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedLogEntries.slice(start, start + itemsPerPage);
  }, [processedLogEntries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedLogEntries.length / itemsPerPage);

  const handleSort = (key: SortableLogKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const renderSortIcon = (columnKey: SortableLogKeys) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const handleUserClick = (userId: string | null | undefined) => {
    if (userId) {
      setSelectedUserIdForSheet(userId);
      setIsUserSheetOpen(true);
    }
  };

  const handleExport = (formatType: 'csv' | 'excel' | 'pdf') => {
    const dataToExport = processedLogEntries;
    const filenamePrefix = 'third_party_usage_logs';

    const getDetailsString = (details: any): string => {
      if (typeof details === 'string') return details;
      if (typeof details === 'object' && details !== null) return JSON.stringify(details);
      return '';
    };

    if (formatType === 'csv') {
      const headers = ["ID", "Timestamp", "Service", "Event", "User ID", "Cost ("+appSettings.currencySymbol+")", "Status", "Duration (ms)", "IP Address", "Details", "Correlation ID"];
      const csvRows = [
        headers.join(','),
        ...dataToExport.map(log => [
          log.id, formatDateForExport(log.timestamp), log.service, log.event, log.userId || '',
          log.cost != null ? log.cost.toFixed(4) : '', log.status, log.durationMs || '', log.ipAddress || '',
          getDetailsString(log.details), log.correlationId || ''
        ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filenamePrefix}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast({ title: "CSV Exported", description: "Log data exported." });
    } else if (formatType === 'excel') {
      const wsData = dataToExport.map(log => ({
        ID: log.id, Timestamp: formatDateForExport(log.timestamp), Service: log.service, Event: log.event, 
        "User ID": log.userId || '', "Cost": log.cost != null ? log.cost : '', Status: log.status, 
        "Duration (ms)": log.durationMs || '', "IP Address": log.ipAddress || '', 
        Details: getDetailsString(log.details), "Correlation ID": log.correlationId || ''
      }));
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new(); // Create a new workbook
      XLSX.utils.book_append_sheet(wb, ws, "Logs"); // Append the worksheet to the workbook
      XLSX.writeFile(wb, `${filenamePrefix}.xlsx`); // Write the workbook to a file
      toast({ title: "Excel Exported", description: "Log data exported." });
    } else if (formatType === 'pdf') {
      const doc = new jsPDF({orientation: "landscape"});
      const tableColumn = ["ID", "Timestamp", "Service", "Event", "User", "Cost", "Status", "Details"];
      const tableRows = dataToExport.map(log => [
        log.id, formatDateForExport(log.timestamp).substring(5,16), log.service, log.event.substring(0,20), log.userId || '-',
        log.cost != null ? formatCurrency(log.cost) : '-', log.status, getDetailsString(log.details).substring(0,30)
      ]);
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20, styles: { fontSize: 7, cellPadding: 1.5 } });
      doc.text("Third Party Usage Logs", 14, 15);
      doc.save(`${filenamePrefix}.pdf`);
      toast({ title: "PDF Exported", description: "Log data exported." });
    }
  };
  
  const totalStat = dashboardStats.find(s => s.service === "Total");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <CardTitle>Usage Summary</CardTitle>
            <CardDescription>Overview of third-party service utilization.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {totalStat && (
                <>
                <StatCard title="Total API Requests" value={totalStat.totalRequests.toLocaleString()} icon={Server} />
                <StatCard title="Total Successful" value={totalStat.successfulRequests.toLocaleString()} icon={CheckCircle} className="border-green-500/50" />
                <StatCard title="Total Failed" value={totalStat.failedRequests.toLocaleString()} icon={AlertCircle} className="border-red-500/50" />
                <StatCard title="Total Estimated Cost" value={formatCurrency(totalStat.totalCost)} icon={DollarSign} />
                </>
            )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardStats.filter(s => s.service !== "Total").map(stat => (
            <Card key={stat.service}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        {React.createElement(serviceIconMap[stat.service] || Server, {className: "h-5 w-5 text-muted-foreground"})}
                        {stat.service}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <p>Total Requests: <span className="font-medium">{stat.totalRequests.toLocaleString()}</span></p>
                    <p>Successful: <span className="font-medium text-green-600">{stat.successfulRequests.toLocaleString()}</span></p>
                    <p>Failed: <span className="font-medium text-red-600">{stat.failedRequests.toLocaleString()}</span></p>
                    <p>Est. Cost: <span className="font-medium">{formatCurrency(stat.totalCost)}</span></p>
                </CardContent>
            </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Log Entries</CardTitle>
          <CardDescription>Individual records of third-party service interactions.</CardDescription>
          <div className="flex flex-col sm:flex-row justify-between items-end gap-2 pt-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs (ID, Event, User, Details)..."
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <Select value={serviceFilter} onValueChange={(value) => {setServiceFilter(value as ThirdPartyService | "All"); setCurrentPage(1);}}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Filter by service..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Services</SelectItem>
                  {THIRD_PARTY_SERVICES.map(service => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => {setStatusFilter(value as LogStatus | "All"); setCurrentPage(1);}}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  {LOG_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Export Logs</Button>
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
                <TableHead onClick={() => handleSort('timestamp')} className="cursor-pointer hover:bg-muted/50 group w-[180px]"><div className="flex items-center gap-1">Timestamp {renderSortIcon('timestamp')}</div></TableHead>
                <TableHead onClick={() => handleSort('service')} className="cursor-pointer hover:bg-muted/50 group w-[140px]"><div className="flex items-center gap-1">Service {renderSortIcon('service')}</div></TableHead>
                <TableHead onClick={() => handleSort('event')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Event {renderSortIcon('event')}</div></TableHead>
                <TableHead onClick={() => handleSort('userId')} className="cursor-pointer hover:bg-muted/50 group w-[120px]"><div className="flex items-center gap-1"><User className="h-4 w-4 text-muted-foreground mr-1" />User ID {renderSortIcon('userId')}</div></TableHead>
                <TableHead onClick={() => handleSort('cost')} className="cursor-pointer hover:bg-muted/50 group w-[100px] text-right"><div className="flex items-center justify-end gap-1">Cost {renderSortIcon('cost')}</div></TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-muted/50 group w-[110px]"><div className="flex items-center gap-1">Status {renderSortIcon('status')}</div></TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                    No log entries found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogEntries.map((log) => {
                  const ServiceIcon = serviceIconMap[log.service] || Server;
                  const StatusIcon = statusIconMap[log.status] || AlertCircle;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">
                        <ClientFormattedDateTime 
                            isoDateString={log.timestamp} 
                            fullFormatFn={formatDateForDisplay}
                            initialFormatFn={initialFormatDateForDisplay}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <ServiceIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs">{log.service}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate" title={log.event}>{log.event}</TableCell>
                      <TableCell className="text-xs">
                        {log.userId ? (
                           <Button 
                              variant="link" 
                              className="p-0 h-auto text-xs text-primary hover:underline"
                              onClick={() => handleUserClick(log.userId)}
                            >
                              {log.userId}
                            </Button>
                        ) : "N/A"}
                      </TableCell>
                      <TableCell className="text-xs text-right">{formatCurrency(log.cost)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariantMap[log.status]} className={log.status === "Success" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                           <StatusIcon className="mr-1.5 h-3 w-3" />
                           <span className="text-xs">{log.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-[250px] truncate" title={typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}>
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions for {log.id}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toast({title: "View Full Log (Placeholder)", description: `Would show full details for log ${log.id}`})}>
                              View Full Log
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
              Page {currentPage} of {totalPages > 0 ? totalPages : 1} ({processedLogEntries.length} total logs)
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

      {selectedUserIdForSheet && (
        <UserUsageDetailsSheet
          isOpen={isUserSheetOpen}
          onOpenChange={setIsUserSheetOpen}
          userId={selectedUserIdForSheet}
          allLogs={logEntries}
          formatCurrency={formatCurrency}
          serviceIconMap={serviceIconMap}
          statusIconMap={statusIconMap}
          statusVariantMap={statusVariantMap}
          formatDateForDisplay={formatDateForDisplay} 
          initialFormatDateForDisplay={initialFormatDateForDisplay}
        />
      )}
    </div>
  );
}

