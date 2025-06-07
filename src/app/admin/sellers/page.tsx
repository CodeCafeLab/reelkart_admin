
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserCheck, UserX, Eye, Store, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { SellerProfileSheet } from "@/components/admin/sellers/SellerProfileSheet"; // Import the new sheet

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Define Seller type matching the data structure
interface Seller {
  id: string;
  name: string;
  businessName: string;
  status: SellerStatus;
  joinedDate: string; 
}

const initialSellersData: Seller[] = [
  { id: "usr001-sel", name: "Rajesh Kumar", businessName: "RK Electronics", status: "Approved", joinedDate: "2024-06-01" },
  { id: "usr002-sel", name: "Anjali Desai", businessName: "Anjali's Artistry", status: "Pending", joinedDate: "2024-07-10" },
  { id: "usr003-sel", name: "Mohammed Khan", businessName: "Khan's Spices", status: "Approved", joinedDate: "2024-05-15" },
  { id: "usr004-sel", name: "Priya Singh", businessName: "Fashion Forward", status: "Rejected", joinedDate: "2024-07-01" },
  { id: "usr005-sel", name: "Amit Patel", businessName: "Patel's Organics", status: "Pending", joinedDate: "2024-07-18" },
  { id: "usr006-sel", name: "Sneha Iyer", businessName: "Iyer Books", status: "Approved", joinedDate: "2024-04-20" },
  { id: "usr007-sel", name: "Vikram Rathore", businessName: "Rathore Mobiles", status: "Pending", joinedDate: "2024-07-20" },
  { id: "usr008-sel", name: "Deepa Sharma", businessName: "Sharma Decor", status: "Rejected", joinedDate: "2024-06-10" },
  { id: "usr009-sel", name: "Arjun Mehra", businessName: "Mehra Fitness", status: "Approved", joinedDate: "2024-03-01" },
  { id: "usr010-sel", name: "Meena Kumari", businessName: "Kumari Crafts", status: "Pending", joinedDate: "2024-07-22" },
  { id: "usr011-sel", name: "Ravi Shankar", businessName: "Shankar Sounds", status: "Approved", joinedDate: "2024-02-15" },
  { id: "usr012-sel", name: "Kavita Nair", businessName: "Nair Apparel", status: "Rejected", joinedDate: "2024-05-05" },
  { id: "usr013-sel", name: "Sunil Gupta", businessName: "Gupta Groceries", status: "Pending", joinedDate: "2024-07-25" },
  { id: "usr014-sel", name: "Pooja Reddy", businessName: "Reddy Beauty", status: "Approved", joinedDate: "2024-01-10" },
  { id: "usr015-sel", name: "Imran Ali", businessName: "Ali Auto", status: "Pending", joinedDate: "2024-07-28" },
];

type SellerStatus = "Pending" | "Approved" | "Rejected";
type SortableSellerKeys = keyof Seller;

const statusVariant: Record<SellerStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default",
  Rejected: "destructive",
};

export default function SellersPage() {
  const { toast } = useToast();
  const [sellersData, setSellersData] = useState<Seller[]>(initialSellersData); 
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<SellerStatus | "All">("All");
  const [sortConfig, setSortConfig] = useState<{ key: SortableSellerKeys; direction: 'ascending' | 'descending' }>({ key: 'joinedDate', direction: 'descending' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const processedSellers = useMemo(() => {
    let filteredItems = [...sellersData];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(seller =>
        seller.id.toLowerCase().includes(lowerSearchTerm) ||
        seller.name.toLowerCase().includes(lowerSearchTerm) ||
        seller.businessName.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (statusFilter !== "All") {
      filteredItems = filteredItems.filter(seller => seller.status === statusFilter);
    }

    if (sortConfig.key) {
      filteredItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'joinedDate') {
          valA = new Date(valA as string).getTime();
          valB = new Date(valB as string).getTime();
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredItems;
  }, [sellersData, searchTerm, statusFilter, sortConfig]);
  
  const paginatedSellers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedSellers.slice(startIndex, endIndex);
  }, [processedSellers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedSellers.length / itemsPerPage);

  const handleSort = (key: SortableSellerKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };
  
  const renderSortIcon = (columnKey: SortableSellerKeys) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 opacity-30 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const formatDateDisplay = (dateString: string) => {
    try {
      return format(parseISO(dateString), "PP"); 
    } catch (error) {
      return format(new Date(dateString), "PP"); 
    }
  };

  const handleViewProfile = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsProfileSheetOpen(true);
  };
  
  const handleExportCSV = () => {
    const headers = ["Seller ID", "Business Name", "Contact Name", "Joined Date", "Status"];
    const csvRows = [
      headers.join(','),
      ...processedSellers.map(seller => 
        [
          seller.id,
          seller.businessName,
          seller.name,
          formatDateDisplay(seller.joinedDate),
          seller.status
        ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
      )
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "sellers_data.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    toast({ title: "CSV Exported", description: "Sellers data exported to CSV." });
  };

  const handleExportExcel = () => {
    const worksheetData = processedSellers.map(seller => ({
        "Seller ID": seller.id,
        "Business Name": seller.businessName,
        "Contact Name": seller.name,
        "Joined Date": formatDateDisplay(seller.joinedDate),
        "Status": seller.status,
      }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sellers_Data");
    XLSX.writeFile(workbook, "sellers_data.xlsx");
    toast({ title: "Excel Exported", description: "Sellers data exported to Excel." });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Business Name", "Contact Name", "Joined Date", "Status"];
    const tableRows: (string | number)[][] = [];

    processedSellers.forEach(seller => {
      const sellerData = [
        seller.id,
        seller.businessName,
        seller.name,
        formatDateDisplay(seller.joinedDate),
        seller.status,
      ];
      tableRows.push(sellerData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [75, 75, 75] },
    });
    doc.text("Sellers Data Report", 14, 15);
    doc.save("sellers_data.pdf");
    toast({ title: "PDF Exported", description: "Sellers data exported to PDF." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Seller Onboarding</h1>
          <p className="text-muted-foreground">Manage seller applications and profiles.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-grow">
                <CardTitle>Seller Applications & Profiles</CardTitle>
                <CardDescription>Track and manage seller onboarding status.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center">
                <Input 
                  placeholder="Search ID, Name, Business..." 
                  value={searchTerm}
                  onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                  className="max-w-full sm:max-w-xs flex-grow" 
                />
                <Select value={statusFilter} onValueChange={(value) => {setStatusFilter(value as SellerStatus | "All"); setCurrentPage(1);}}>
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
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleExportCSV}>Export CSV</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportExcel}>Export Excel</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportPDF}>Export PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('id')} className="cursor-pointer hover:bg-muted/50 group">
                  <div className="flex items-center gap-1">Seller ID {renderSortIcon('id')}</div>
                </TableHead>
                <TableHead onClick={() => handleSort('businessName')} className="cursor-pointer hover:bg-muted/50 group">
                    <div className="flex items-center gap-1"><Store className="h-4 w-4 text-muted-foreground mr-1" />Business Name {renderSortIcon('businessName')}</div>
                </TableHead>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-muted/50 group">
                  <div className="flex items-center gap-1">Contact Name {renderSortIcon('name')}</div>
                </TableHead>
                <TableHead onClick={() => handleSort('joinedDate')} className="cursor-pointer hover:bg-muted/50 group">
                  <div className="flex items-center gap-1">Joined Date {renderSortIcon('joinedDate')}</div>
                </TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-muted/50 group">
                  <div className="flex items-center gap-1">Status {renderSortIcon('status')}</div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSellers.length > 0 ? (
                paginatedSellers.map((seller) => (
                  <TableRow key={seller.id}>
                    <TableCell className="font-medium">{seller.id}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      {seller.businessName}
                    </TableCell>
                    <TableCell>{seller.name}</TableCell>
                    <TableCell>{formatDateDisplay(seller.joinedDate)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={statusVariant[seller.status as SellerStatus]}
                        className={seller.status === 'Approved' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                      >
                        {seller.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions for {seller.name}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProfile(seller)}>
                            <Eye className="mr-2 h-4 w-4" /> View Profile
                          </DropdownMenuItem>
                          {seller.status === "Pending" && (
                            <DropdownMenuItem 
                              className="text-green-600 focus:text-green-700 focus:bg-green-50"
                              onClick={() => {
                                setSellersData(prev => prev.map(s => s.id === seller.id ? {...s, status: "Approved"} : s));
                                toast({ title: "Seller Approved", description: `${seller.businessName} approved.`});
                              }}
                            >
                              <UserCheck className="mr-2 h-4 w-4" /> Approve Application
                            </DropdownMenuItem>
                          )}
                           {seller.status === "Approved" && (
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-700 focus:bg-red-50"
                               onClick={() => {
                                setSellersData(prev => prev.map(s => s.id === seller.id ? {...s, status: "Rejected"} : s)); 
                                toast({ title: "Seller Role Suspended", description: `${seller.businessName} role suspended.`, variant: "destructive"});
                              }}
                            >
                              <UserX className="mr-2 h-4 w-4" /> Suspend Seller Role
                            </DropdownMenuItem>
                          )}
                          {seller.status === "Rejected" && (
                             <DropdownMenuItem 
                              className="text-green-600 focus:text-green-700 focus:bg-green-50"
                              onClick={() => {
                                setSellersData(prev => prev.map(s => s.id === seller.id ? {...s, status: "Approved"} : s));
                                toast({ title: "Seller Re-Approved", description: `${seller.businessName} re-approved.`});
                              }}
                            >
                              <UserCheck className="mr-2 h-4 w-4" /> Re-Approve
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No sellers found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages > 0 ? totalPages : 1}
            </span>
             <div className="flex items-center gap-2">
                <Select
                    value={String(itemsPerPage)}
                    onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                    }}
                >
                    <SelectTrigger className="w-[80px] h-9">
                        <SelectValue placeholder={String(itemsPerPage)} />
                    </SelectTrigger>
                    <SelectContent>
                        {[5, 10, 20, 50].map(size => (
                            <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">items per page</span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSeller && (
        <SellerProfileSheet
          isOpen={isProfileSheetOpen}
          onOpenChange={setIsProfileSheetOpen}
          seller={selectedSeller}
        />
      )}
    </div>
  );
}
