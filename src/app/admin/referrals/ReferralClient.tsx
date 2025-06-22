
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Download, FileText as ExportFileText, FileSpreadsheet, Printer, ArrowUpDown, ArrowUp, ArrowDown, User, Eye, CheckCircle, XCircle, Clock, UserPlus, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { useAppSettings } from "@/contexts/AppSettingsContext";
import type { Referral, ReferralStatus, CommissionStatus, SortableReferralKeys } from "@/types/referral";
import { REFERRAL_STATUSES, COMMISSION_STATUSES } from "@/types/referral";
import { ReferralDetailsSheet } from "@/components/admin/referrals/ReferralDetailsSheet";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const mockReferrals: Omit<Referral, 'currency'>[] = [
  { id: "ref_001", referrerId: "user_001", referrerName: "Aisha Sharma", referrerEmail: "aisha.sharma@example.com", refereeId: "user_101", refereeName: "Ravi Kumar", refereeEmail: "ravi.k@example.com", referralDate: "2024-07-25T10:00:00Z", status: "Completed", commissionAmount: 50, commissionStatus: "Pending" },
  { id: "ref_002", referrerId: "seller_002", referrerName: "Anjali Desai", referrerEmail: "anjali@artistry.com", refereeId: "user_102", refereeName: "Sunita Gupta", refereeEmail: "sunita.g@example.com", referralDate: "2024-07-24T14:30:00Z", status: "Converted", commissionAmount: 150, commissionStatus: "Paid" },
  { id: "ref_003", referrerId: "user_004", referrerName: "Karan Singh", referrerEmail: "karan.s@example.com", refereeId: "user_103", refereeName: "Amit Patel", refereeEmail: "amit.p@example.com", referralDate: "2024-07-23T09:00:00Z", status: "Pending", commissionAmount: 0, commissionStatus: "Pending" },
  { id: "ref_004", referrerId: "user_001", referrerName: "Aisha Sharma", referrerEmail: "aisha.sharma@example.com", refereeId: "user_104", refereeName: "Meera Iyer", refereeEmail: "meera.i@example.com", referralDate: "2024-07-22T18:00:00Z", status: "Converted", commissionAmount: 200, commissionStatus: "Pending" },
  { id: "ref_005", referrerId: "seller_003", referrerName: "Mohammed Khan", referrerEmail: "mohammed@khanspices.com", refereeId: "user_105", refereeName: "Vikram Singh", refereeEmail: "vikram.s@example.com", referralDate: "2024-07-21T11:45:00Z", status: "Completed", commissionAmount: 75, commissionStatus: "Rejected" },
];

const referralStatusVariantMap: Record<ReferralStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "secondary",
  Completed: "default",
  Converted: "default",
};

const referralStatusIconMap: Record<ReferralStatus, React.ElementType> = {
  Pending: Clock,
  Completed: UserPlus,
  Converted: CheckCircle,
};

const commissionStatusVariantMap: Record<CommissionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "secondary",
  Paid: "default",
  Rejected: "destructive",
};

const commissionStatusIconMap: Record<CommissionStatus, React.ElementType> = {
  Pending: Clock,
  Paid: CheckCircle,
  Rejected: XCircle,
};

export function ReferralClient() {
  const { toast } = useToast();
  const { settings: appSettings } = useAppSettings();

  const [referrals, setReferrals] = useState<Referral[]>(() => mockReferrals.map(r => ({ ...r, currency: appSettings.currencyCode })));
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | "All">("All");
  const [commissionStatusFilter, setCommissionStatusFilter] = useState<CommissionStatus | "All">("All");
  const [sortConfig, setSortConfig] = useState<{ key: SortableReferralKeys; direction: 'ascending' | 'descending' }>({ key: 'referralDate', direction: 'descending' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: appSettings.currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, [appSettings.currencyCode]);

  useEffect(() => {
    setReferrals(prev => prev.map(r => ({...r, currency: appSettings.currencyCode})));
  }, [appSettings.currencyCode]);

  const processedReferrals = useMemo(() => {
    let filtered = [...referrals];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(ref =>
        ref.id.toLowerCase().includes(lowerSearch) ||
        ref.referrerName.toLowerCase().includes(lowerSearch) ||
        ref.referrerEmail.toLowerCase().includes(lowerSearch) ||
        ref.refereeName.toLowerCase().includes(lowerSearch) ||
        ref.refereeEmail.toLowerCase().includes(lowerSearch)
      );
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter(ref => ref.status === statusFilter);
    }
    if (commissionStatusFilter !== "All") {
        filtered = filtered.filter(ref => ref.commissionStatus === commissionStatusFilter);
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'referralDate') {
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
  }, [referrals, searchTerm, statusFilter, commissionStatusFilter, sortConfig]);

  const paginatedReferrals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedReferrals.slice(start, start + itemsPerPage);
  }, [processedReferrals, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedReferrals.length / itemsPerPage);

  const handleSort = (key: SortableReferralKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const renderSortIcon = (columnKey: SortableReferralKeys) => {
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

  const handleViewDetails = (referral: Referral) => {
    setSelectedReferral(referral);
    setIsDetailsSheetOpen(true);
  };

  const handleUpdateCommissionStatus = (referralId: string, newStatus: CommissionStatus) => {
    setReferrals(prev => prev.map(r => r.id === referralId ? {...r, commissionStatus: newStatus} : r));
    setSelectedReferral(prev => prev && prev.id === referralId ? {...prev, commissionStatus: newStatus} : prev);
    toast({title: "Commission Status Updated", description: `Referral ${referralId} commission status changed to ${newStatus}.`});
  }

  const handleExport = (formatType: 'csv' | 'excel' | 'pdf') => {
    toast({ title: "Export Placeholder", description: `Export to ${formatType} is not yet implemented.`});
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Referral Log</CardTitle>
          <CardDescription>Monitor all referral activities and commission statuses.</CardDescription>
          <div className="flex flex-col sm:flex-row justify-between items-end gap-2 pt-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Referrer, Referee, Email, ID..."
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <Select value={statusFilter} onValueChange={(value) => {setStatusFilter(value as ReferralStatus | "All"); setCurrentPage(1);}}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by referral status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Referral Statuses</SelectItem>
                  {REFERRAL_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={commissionStatusFilter} onValueChange={(value) => {setCommissionStatusFilter(value as CommissionStatus | "All"); setCurrentPage(1);}}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by commission..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Commission Statuses</SelectItem>
                  {COMMISSION_STATUSES.map(status => (
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
                <TableHead>Referrer</TableHead>
                <TableHead>Referee</TableHead>
                <TableHead onClick={() => handleSort('referralDate')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Date {renderSortIcon('referralDate')}</div></TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Referral Status {renderSortIcon('status')}</div></TableHead>
                <TableHead onClick={() => handleSort('commissionAmount')} className="cursor-pointer hover:bg-muted/50 group text-right"><div className="flex items-center justify-end gap-1">Commission {renderSortIcon('commissionAmount')}</div></TableHead>
                <TableHead onClick={() => handleSort('commissionStatus')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Commission Status {renderSortIcon('commissionStatus')}</div></TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReferrals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No referrals found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReferrals.map((ref) => {
                  const ReferralStatusIcon = referralStatusIconMap[ref.status];
                  const CommissionStatusIcon = commissionStatusIconMap[ref.commissionStatus];
                  return (
                    <TableRow key={ref.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{ref.referrerName}</div>
                        <div className="text-xs text-muted-foreground">{ref.referrerEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{ref.refereeName}</div>
                        <div className="text-xs text-muted-foreground">{ref.refereeEmail}</div>
                      </TableCell>
                      <TableCell className="text-xs">{formatDateForDisplay(ref.referralDate)}</TableCell>
                      <TableCell>
                        <Badge variant={referralStatusVariantMap[ref.status]} className={ref.status === "Converted" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                           <ReferralStatusIcon className="mr-1.5 h-3 w-3" />
                           <span className="text-xs">{ref.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCurrency(ref.commissionAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={commissionStatusVariantMap[ref.commissionStatus]} className={ref.commissionStatus === "Paid" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                           <CommissionStatusIcon className="mr-1.5 h-3 w-3" />
                           <span className="text-xs">{ref.commissionStatus}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions for {ref.id}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(ref)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Update Commission</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={ref.commissionStatus} onValueChange={(val) => handleUpdateCommissionStatus(ref.id, val as CommissionStatus)}>
                                {COMMISSION_STATUSES.map(status => (
                                    <DropdownMenuRadioItem key={status} value={status}>{status}</DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
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
              Page {currentPage} of {totalPages > 0 ? totalPages : 1} ({processedReferrals.length} total referrals)
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

      {selectedReferral && (
        <ReferralDetailsSheet
          isOpen={isDetailsSheetOpen}
          onOpenChange={setIsDetailsSheetOpen}
          referral={selectedReferral}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
