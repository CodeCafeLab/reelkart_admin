
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, UserX, UserCheck, Search, Download, FileText as ExportFileText, FileSpreadsheet, Printer, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle, AlertTriangle, XCircle, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import type { User, UserStatus, SortableUserKeys, UserLoginLog, PurchaseHistoryItem } from "@/types/user";
import { UserProfileSheet } from "@/components/admin/users/UserProfileSheet";
import { UserPurchaseHistorySheet } from "@/components/admin/users/UserPurchaseHistorySheet"; // New import

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const MOCK_BASE_TIMESTAMP = new Date("2024-07-26T10:00:00.000Z").getTime();

const mockUsersData: User[] = [
  {
    id: "user_001", name: "Aisha Sharma", email: "aisha.sharma@example.com", joinDate: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 10).toISOString(), status: "Active", profileImageUrl: "https://placehold.co/100x100.png?text=AS", emailVerified: true, phone: "9876543210", lastLogin: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 2).toISOString(),
    loginLogs: [
      { id: "log_a1", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 2).toISOString(), ipAddress: "192.168.1.10", status: "Success", userAgent: "Chrome/Desktop" },
      { id: "log_a2", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 3).toISOString(), ipAddress: "10.0.0.5", status: "Success", userAgent: "Safari/Mobile" },
    ],
    purchaseHistory: [
      { orderId: "ORD1001", productName: "Premium Wireless Headphones", purchaseDate: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 5).toISOString(), amount: 2999, currency: "INR", status: "Completed" },
      { orderId: "ORD1005", productName: "Ergonomic Mouse Pad", purchaseDate: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 2).toISOString(), amount: 799, currency: "INR", status: "Completed" },
    ]
  },
  { id: "user_002", name: "Rohan Verma", email: "rohan.v@example.com", joinDate: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 5).toISOString(), status: "PendingVerification", emailVerified: false, lastLogin: null, loginLogs: [], purchaseHistory: [] },
  {
    id: "user_003", name: "Priya Mehta", email: "priya.mehta@example.com", joinDate: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 20).toISOString(), status: "Suspended", profileImageUrl: "https://placehold.co/100x100.png?text=PM", emailVerified: true, phone: "9988776655", lastLogin: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 7).toISOString(),
    loginLogs: [
      { id: "log_p1", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 7).toISOString(), ipAddress: "203.0.113.45", status: "Success" },
      { id: "log_p2", timestamp: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 7 - 60000).toISOString(), ipAddress: "203.0.113.45", status: "Failed", userAgent: "Firefox/Desktop" },
    ],
    purchaseHistory: [
        { orderId: "ORD0950", productName: "Designer Phone Case", purchaseDate: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 10).toISOString(), amount: 1200, currency: "INR", status: "Refunded" },
    ]
  },
  { id: "user_004", name: "Karan Singh", email: "karan.s@example.com", joinDate: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 60 * 24 * 2).toISOString(), status: "Active", emailVerified: true, lastLogin: new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 30).toISOString(), loginLogs: [{id: "log_k1", timestamp:new Date(MOCK_BASE_TIMESTAMP - 1000 * 60 * 30).toISOString(), ipAddress: "172.16.0.100", status: "Success"}] },
];

const statusVariantMap: Record<UserStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Active: "default",
  Suspended: "destructive",
  PendingVerification: "secondary",
};

const userStatusIcons: Record<UserStatus, React.ElementType> = {
    Active: CheckCircle,
    Suspended: XCircle,
    PendingVerification: AlertTriangle,
};


export function UsersManagementClient() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsersData);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "All">("All");
  const [sortConfig, setSortConfig] = useState<{ key: SortableUserKeys; direction: 'ascending' | 'descending' }>({ key: 'joinDate', direction: 'descending' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isPurchaseHistorySheetOpen, setIsPurchaseHistorySheetOpen] = useState(false);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<User | null>(null);


  const processedUsers = useMemo(() => {
    let filtered = [...users];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.id.toLowerCase().includes(lowerSearch) ||
        user.name.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch)
      );
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'joinDate' || sortConfig.key === 'lastLogin') {
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
  }, [users, searchTerm, statusFilter, sortConfig]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedUsers.slice(start, start + itemsPerPage);
  }, [processedUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedUsers.length / itemsPerPage);

  const handleSort = (key: SortableUserKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const renderSortIcon = (columnKey: SortableUserKeys) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };
  
  const formatDateForDisplay = (dateString: string | null | undefined, includeTime = true) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), includeTime ? "PPpp" : "PP");
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

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setIsProfileSheetOpen(true);
  };

  const handleViewPurchaseHistory = (user: User) => {
    setSelectedUserForHistory(user);
    setIsPurchaseHistorySheetOpen(true);
  };

  const handleUpdateUserStatus = (userId: string, newStatus: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? {...u, status: newStatus} : u));
    setSelectedUser(prev => prev && prev.id === userId ? {...prev, status: newStatus} : prev);
    toast({title: "User Status Updated", description: `User ${userId} status changed to ${newStatus}.`});
  };

  const handleExport = (formatType: 'csv' | 'excel' | 'pdf') => {
    const dataToExport = processedUsers;
    const filenamePrefix = 'app_users_export';

    if (formatType === 'csv') {
      const headers = ["ID", "Name", "Email", "Phone", "Join Date", "Last Login", "Status", "Email Verified"];
      const csvRows = [
        headers.join(','),
        ...dataToExport.map(u => [
          u.id, u.name, u.email, u.phone || '', formatDateForExport(u.joinDate), formatDateForExport(u.lastLogin), u.status, u.emailVerified
        ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filenamePrefix}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast({ title: "CSV Exported", description: "User data exported." });
    } else if (formatType === 'excel') {
      const wsData = dataToExport.map(u => ({
        ID: u.id, Name: u.name, Email: u.email, Phone: u.phone || '', 
        "Join Date": formatDateForExport(u.joinDate), "Last Login": formatDateForExport(u.lastLogin), 
        Status: u.status, "Email Verified": u.emailVerified
      }));
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new(); 
      XLSX.utils.book_append_sheet(wb, ws, "Users"); 
      XLSX.writeFile(wb, `${filenamePrefix}.xlsx`); 
      toast({ title: "Excel Exported", description: "User data exported." });
    } else if (formatType === 'pdf') {
      const doc = new jsPDF({orientation: "landscape"});
      const tableColumn = ["ID", "Name", "Email", "Joined", "Status"];
      const tableRows = dataToExport.map(u => [
        u.id.substring(0,10), u.name.substring(0,20), u.email.substring(0,25), 
        formatDateForDisplay(u.joinDate, false), u.status
      ]);
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20, styles: { fontSize: 8, cellPadding: 1.5 } });
      doc.text("App Users Report", 14, 15);
      doc.save(`${filenamePrefix}.pdf`);
      toast({ title: "PDF Exported", description: "User data exported." });
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>List of all registered application users.</CardDescription>
          <div className="flex flex-col sm:flex-row justify-between items-end gap-2 pt-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, Name, Email..."
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <Select value={statusFilter} onValueChange={(value) => {setStatusFilter(value as UserStatus | "All"); setCurrentPage(1);}}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  {(Object.keys(statusVariantMap) as UserStatus[]).map(status => (
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
                <TableHead onClick={() => handleSort('id')} className="cursor-pointer hover:bg-muted/50 group w-[120px]"><div className="flex items-center gap-1">User ID {renderSortIcon('id')}</div></TableHead>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Name {renderSortIcon('name')}</div></TableHead>
                <TableHead onClick={() => handleSort('email')} className="cursor-pointer hover:bg-muted/50 group"><div className="flex items-center gap-1">Email {renderSortIcon('email')}</div></TableHead>
                <TableHead onClick={() => handleSort('joinDate')} className="cursor-pointer hover:bg-muted/50 group w-[160px]"><div className="flex items-center gap-1">Join Date {renderSortIcon('joinDate')}</div></TableHead>
                <TableHead onClick={() => handleSort('lastLogin')} className="cursor-pointer hover:bg-muted/50 group w-[160px]"><div className="flex items-center gap-1">Last Login {renderSortIcon('lastLogin')}</div></TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-muted/50 group w-[140px]"><div className="flex items-center gap-1">Status {renderSortIcon('status')}</div></TableHead>
                <TableHead className="text-right w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => {
                  const StatusIcon = userStatusIcons[user.status];
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-xs">
                        <Button variant="link" className="p-0 h-auto text-primary hover:underline text-xs" onClick={() => handleViewProfile(user)}>
                          {user.id}
                        </Button>
                      </TableCell>
                      <TableCell className="text-sm">{user.name}</TableCell>
                      <TableCell className="text-xs">{user.email}</TableCell>
                      <TableCell className="text-xs">{formatDateForDisplay(user.joinDate, false)}</TableCell>
                      <TableCell className="text-xs">{formatDateForDisplay(user.lastLogin, true)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariantMap[user.status]} className={user.status === "Active" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                           <StatusIcon className="mr-1.5 h-3 w-3" />
                           <span className="text-xs">{user.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions for {user.name}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProfile(user)}>
                              <Eye className="mr-2 h-4 w-4" /> View Profile & Logs
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewPurchaseHistory(user)}>
                              <History className="mr-2 h-4 w-4" /> See Purchase History
                            </DropdownMenuItem>
                            {user.status === "Active" && (
                              <DropdownMenuItem onClick={() => handleUpdateUserStatus(user.id, "Suspended")} className="text-red-600 focus:text-red-700">
                                <UserX className="mr-2 h-4 w-4" /> Suspend User
                              </DropdownMenuItem>
                            )}
                            {user.status === "Suspended" && (
                              <DropdownMenuItem onClick={() => handleUpdateUserStatus(user.id, "Active")} className="text-green-600 focus:text-green-700">
                                <UserCheck className="mr-2 h-4 w-4" /> Activate User
                              </DropdownMenuItem>
                            )}
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
              Page {currentPage} of {totalPages > 0 ? totalPages : 1} ({processedUsers.length} total users)
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

      {selectedUser && (
        <UserProfileSheet
          isOpen={isProfileSheetOpen}
          onOpenChange={setIsProfileSheetOpen}
          user={selectedUser}
          onUpdateStatus={handleUpdateUserStatus}
        />
      )}

      {selectedUserForHistory && (
        <UserPurchaseHistorySheet
          isOpen={isPurchaseHistorySheetOpen}
          onOpenChange={setIsPurchaseHistorySheetOpen}
          user={selectedUserForHistory}
        />
      )}
    </div>
  );
}
