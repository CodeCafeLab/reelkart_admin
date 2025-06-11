
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserCheck, UserX, Eye, Store, Download, ArrowUpDown, ArrowUp, ArrowDown, FileText, FileSpreadsheet, Printer, XCircle, Tag, PlusCircle, Star as StarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { SellerProfileSheet } from "@/components/admin/sellers/SellerProfileSheet";
import type { SellerRole } from "@/types/seller-package";
import { SELLER_ROLES } from "@/types/seller-package";
import { ImagePopup } from "@/components/admin/kyc/ImagePopup"; // Re-using ImagePopup
import { AddSellerSheet, type NewSellerFormData } from "@/components/admin/sellers/AddSellerSheet";
import { StarRatingDisplay } from "@/components/ui/StarRatingDisplay";


import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Define Seller related interfaces
interface SellerDocument {
  name: string;
  url: string;
  aiHint: string;
}

interface SocialMediaProfile {
  platform: 'Instagram' | 'Facebook' | 'Twitter' | 'YouTube' | 'LinkedIn' | 'Other';
  link: string;
}

interface BankAccountDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
}

export interface SellerLoginLog {
  id: string;
  timestamp: string; // ISO String
  ipAddress: string;
  status: 'Success' | 'Failed' | 'Attempt';
  userAgent?: string;
}

export interface Seller {
  id: string;
  name: string; // Contact person name
  businessName: string;
  email?: string; // Added optional email
  phone?: string; // Added optional phone
  sellerType: SellerRole;
  status: SellerStatus;
  joinedDate: string; // "YYYY-MM-DD"
  rejectionReason?: string;
  socialMediaProfiles?: SocialMediaProfile[];
  bankAccountDetails?: BankAccountDetails;
  verificationDocuments?: SellerDocument[];
  averageRating?: number | null; // 0-5, can be null or undefined
  loginLogs?: SellerLoginLog[];
}

const initialSellersData: Seller[] = [
  {
    id: "usr001-sel", name: "Rajesh Kumar", businessName: "RK Electronics", email: "rajesh@rkelectronics.com", phone: "9876543210", sellerType: "ECommerceSeller", status: "Approved", joinedDate: "2024-06-01", averageRating: 4.5,
    socialMediaProfiles: [{ platform: 'Facebook', link: 'https://facebook.com/rkelectronics' }],
    bankAccountDetails: { accountHolderName: "RK Electronics", accountNumber: "123456789012", ifscCode: "HDFC0000123", bankName: "HDFC Bank" },
    verificationDocuments: [
      { name: "GST Certificate", url: "https://placehold.co/600x400.png?text=GST+Cert", aiHint: "tax registration" },
      { name: "Business PAN", url: "https://placehold.co/600x400.png?text=Biz+PAN", aiHint: "tax document" }
    ],
    loginLogs: [
      { id: "log_rk1", timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), ipAddress: "103.22.182.0", status: "Success", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" },
      { id: "log_rk2", timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), ipAddress: "103.22.182.0", status: "Success", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1" },
    ]
  },
  {
    id: "usr002-sel", name: "Anjali Desai", businessName: "Anjali's Artistry", email: "anjali@artistry.com", phone: "9876500000", sellerType: "IndividualMerchant", status: "Pending", joinedDate: "2024-07-10", averageRating: null,
    socialMediaProfiles: [{ platform: 'Instagram', link: 'https://instagram.com/anjaliart' }],
    bankAccountDetails: { accountHolderName: "Anjali Desai", accountNumber: "098765432109", ifscCode: "ICIC0000456", bankName: "ICICI Bank" },
    verificationDocuments: [
      { name: "Aadhaar Card - Front", url: "https://placehold.co/600x400.png?text=Aadhaar+Front", aiHint: "identity document" },
      { name: "Aadhaar Card - Back", url: "https://placehold.co/600x400.png?text=Aadhaar+Back", aiHint: "identity document" }
    ],
    loginLogs: [
        { id: "log_ad1", timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), ipAddress: "202.142.66.10", status: "Attempt", userAgent: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"},
        { id: "log_ad2", timestamp: new Date(Date.now() - 86400000 * 3 - 60000).toISOString(), ipAddress: "202.142.66.10", status: "Failed", userAgent: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"},
    ]
  },
  {
    id: "usr003-sel", name: "Mohammed Khan", businessName: "Khan's Spices", sellerType: "ECommerceSeller", status: "Approved", joinedDate: "2024-05-15", averageRating: 3.8,
    bankAccountDetails: { accountHolderName: "Mohammed Khan", accountNumber: "112233445566", ifscCode: "SBIN0000789", bankName: "State Bank of India" },
    verificationDocuments: [
      { name: "GST Certificate", url: "https://placehold.co/600x400.png?text=GST+Spices", aiHint: "tax registration" }
    ]
  },
  {
    id: "usr004-sel", name: "Priya Singh", businessName: "Fashion Forward", sellerType: "Influencer", status: "Rejected", joinedDate: "2024-07-01", rejectionReason: "Incomplete documentation", averageRating: 2.1,
    socialMediaProfiles: [{ platform: 'YouTube', link: 'https://youtube.com/fashionforwardpriya' }],
    verificationDocuments: [
      { name: "Aadhaar Card - Front", url: "https://placehold.co/600x400.png?text=Aadhaar+Priya+F", aiHint: "identity document" },
      { name: "Aadhaar Card - Back", url: "https://placehold.co/600x400.png?text=Aadhaar+Priya+B", aiHint: "identity document" }
    ]
  },
  {
    id: "usr005-sel", name: "Amit Patel", businessName: "Patel's Organics", sellerType: "OnlineSeller", status: "Pending", joinedDate: "2024-07-18", averageRating: 4.9,
    verificationDocuments: [
        { name: "GST Certificate (Optional for OnlineSeller)", url: "https://placehold.co/600x400.png?text=GST+Patel", aiHint: "tax registration" }
    ],
    loginLogs: [
        { id: "log_ap1", timestamp: new Date(Date.now() - 86400000 * 0.5).toISOString(), ipAddress: "117.200.50.1", status: "Success", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"},
    ]
  },
  {
    id: "usr006-sel", name: "Sneha Iyer", businessName: "Iyer Books", sellerType: "ECommerceSeller", status: "Approved", joinedDate: "2024-04-20", averageRating: 4.2,
    verificationDocuments: [
      { name: "GST Certificate", url: "https://placehold.co/600x400.png?text=GST+IyerBooks", aiHint: "tax registration" }
    ]
  },
  {
    id: "usr007-sel", name: "Vikram Rathore", businessName: "Rathore Mobiles", sellerType: "Wholesaler", status: "Pending", joinedDate: "2024-07-20",
    bankAccountDetails: { accountHolderName: "Rathore Mobiles Pvt Ltd", accountNumber: "223344556677", ifscCode: "AXIS0000112", bankName: "Axis Bank" },
    verificationDocuments: [
      { name: "GST Certificate", url: "https://placehold.co/600x400.png?text=GST+Rathore", aiHint: "tax registration" },
      { name: "Trade Registration Certificate", url: "https://placehold.co/600x400.png?text=Trade+Cert+Rathore", aiHint: "business license" }
    ]
  },
  {
    id: "usr008-sel", name: "Deepa Sharma", businessName: "Sharma Decor", sellerType: "IndividualMerchant", status: "Rejected", joinedDate: "2024-06-10", rejectionReason: "Business not verifiable", averageRating: 1.5,
    verificationDocuments: [
      { name: "Aadhaar Card - Front", url: "https://placehold.co/600x400.png?text=Aadhaar+Deepa+F", aiHint: "identity document" },
      { name: "Aadhaar Card - Back", url: "https://placehold.co/600x400.png?text=Aadhaar+Deepa+B", aiHint: "identity document" }
    ]
  },
  {
    id: "usr009-sel", name: "Arjun Mehra", businessName: "Mehra Fitness", sellerType: "Influencer", status: "Approved", joinedDate: "2024-03-01", averageRating: 5.0,
    socialMediaProfiles: [{ platform: 'Instagram', link: 'https://instagram.com/mehrafitness' }, { platform: 'YouTube', link: 'https://youtube.com/mehrafit' }],
    verificationDocuments: [
      { name: "Aadhaar Card - Front", url: "https://placehold.co/600x400.png?text=Aadhaar+Arjun+F", aiHint: "identity document" },
      { name: "Aadhaar Card - Back", url: "https://placehold.co/600x400.png?text=Aadhaar+Arjun+B", aiHint: "identity document" }
    ]
  },
  {
    id: "usr010-sel", name: "Meena Kumari", businessName: "Kumari Crafts", sellerType: "IndividualMerchant", status: "Pending", joinedDate: "2024-07-22", averageRating: 3.2,
    verificationDocuments: [
      { name: "Aadhaar Card - Front", url: "https://placehold.co/600x400.png?text=Aadhaar+Meena+F", aiHint: "identity document" },
      { name: "Aadhaar Card - Back", url: "https://placehold.co/600x400.png?text=Aadhaar+Meena+B", aiHint: "identity document" }
    ]
  },
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
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isAddSellerSheetOpen, setIsAddSellerSheetOpen] = useState(false);


  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<SellerStatus | "All">("All");
  const [sortConfig, setSortConfig] = useState<{ key: SortableSellerKeys; direction: 'ascending' | 'descending' }>({ key: 'joinedDate', direction: 'descending' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSellerAdded = (newSellerData: NewSellerFormData) => {
    const newSeller: Seller = {
      id: `usr${Date.now()}-sel`,
      joinedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      name: newSellerData.contactName,
      businessName: newSellerData.businessName,
      email: newSellerData.email,
      phone: newSellerData.phone,
      sellerType: newSellerData.sellerType,
      status: newSellerData.status,
      socialMediaProfiles: (newSellerData.socialPlatform && newSellerData.socialLink)
        ? [{ platform: newSellerData.socialPlatform as SocialMediaProfile['platform'], link: newSellerData.socialLink }]
        : [],
      bankAccountDetails: (newSellerData.accountHolderName && newSellerData.accountNumber && newSellerData.ifscCode && newSellerData.bankName)
        ? {
            accountHolderName: newSellerData.accountHolderName,
            accountNumber: newSellerData.accountNumber,
            ifscCode: newSellerData.ifscCode,
            bankName: newSellerData.bankName,
          }
        : undefined,
      verificationDocuments: [], // Placeholder for future document uploads
      averageRating: null, // Default to null or no rating for new sellers
      loginLogs: [], // New sellers start with no login logs
    };
    setSellersData(prevSellers => [newSeller, ...prevSellers]);
    toast({ title: "Seller Added", description: `${newSeller.businessName} has been added to the local list.` });
    setIsAddSellerSheetOpen(false);
  };

  const processedSellers = useMemo(() => {
    let filteredItems = [...sellersData];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(seller =>
        seller.id.toLowerCase().includes(lowerSearchTerm) ||
        seller.name.toLowerCase().includes(lowerSearchTerm) ||
        seller.businessName.toLowerCase().includes(lowerSearchTerm) ||
        (seller.email && seller.email.toLowerCase().includes(lowerSearchTerm)) ||
        (seller.phone && seller.phone.includes(lowerSearchTerm)) ||
        seller.sellerType.toLowerCase().includes(lowerSearchTerm)
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
        } else if (sortConfig.key === 'averageRating') {
          valA = typeof valA === 'number' ? valA : -1; // Treat null/undefined ratings as -1 for sorting
          valB = typeof valB === 'number' ? valB : -1;
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
      // Fallback for dates not in ISO format (e.g., "YYYY-MM-DD" from manual add)
      try {
        return format(new Date(dateString), "PP");
      } catch (secondError) {
        return dateString; // If still error, return original
      }
    }
  };

  const handleViewProfile = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsProfileSheetOpen(true);
  };

  const handleOpenImagePopup = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImagePopupOpen(true);
  };

  const handleCloseImagePopup = () => {
    setIsImagePopupOpen(false);
    setSelectedImageUrl(null);
  };

  const handleApproveApplication = (sellerId: string) => {
    setSellersData(prev => prev.map(s => s.id === sellerId ? {...s, status: "Approved", rejectionReason: undefined} : s));
    setSelectedSeller(prev => prev && prev.id === sellerId ? {...prev, status: "Approved", rejectionReason: undefined } : prev);
    const seller = sellersData.find(s => s.id === sellerId);
    toast({ title: "Seller Approved", description: `${seller?.businessName || 'Seller'} application approved.`});
    if(selectedSeller?.id === sellerId && isProfileSheetOpen) setIsProfileSheetOpen(false);
  };

  const handleDeclineApplication = (sellerId: string) => {
    const reason = window.prompt("Please enter the reason for declining this application:");
    if (reason === null) return;

    const finalReason = reason.trim() || "Reason not specified";
    setSellersData(prev => prev.map(s => s.id === sellerId ? {...s, status: "Rejected", rejectionReason: finalReason} : s));
    setSelectedSeller(prev => prev && prev.id === sellerId ? {...prev, status: "Rejected", rejectionReason: finalReason } : prev);
    const seller = sellersData.find(s => s.id === sellerId);
    toast({
        title: "Seller Application Declined",
        description: `${seller?.businessName || 'Seller'} application declined. Reason: ${finalReason}`,
        variant: "destructive"
    });
    if(selectedSeller?.id === sellerId && isProfileSheetOpen) setIsProfileSheetOpen(false);
  };

  const handleSuspendSellerRole = (sellerId: string) => {
    const reason = window.prompt("Please enter the reason for suspending this seller:");
    if (reason === null) return;
    const finalReason = reason.trim() || "Account suspended by admin";
    setSellersData(prev => prev.map(s => s.id === sellerId ? {...s, status: "Rejected", rejectionReason: finalReason} : s));
    setSelectedSeller(prev => prev && prev.id === sellerId ? {...prev, status: "Rejected", rejectionReason: finalReason } : prev);
    const seller = sellersData.find(s => s.id === sellerId);
    toast({ title: "Seller Role Suspended", description: `${seller?.businessName || 'Seller'} role suspended. Reason: ${finalReason}`, variant: "destructive"});
    if(selectedSeller?.id === sellerId && isProfileSheetOpen) setIsProfileSheetOpen(false);
  };

  const handleReactivateSeller = (sellerId: string) => {
    setSellersData(prev => prev.map(s => s.id === sellerId ? {...s, status: "Approved", rejectionReason: undefined} : s));
    setSelectedSeller(prev => prev && prev.id === sellerId ? {...prev, status: "Approved", rejectionReason: undefined } : prev);
    const seller = sellersData.find(s => s.id === sellerId);
    toast({ title: "Seller Re-Approved", description: `${seller?.businessName || 'Seller'} has been re-approved.`});
    if(selectedSeller?.id === sellerId && isProfileSheetOpen) setIsProfileSheetOpen(false);
  };


  const handleExportCSV = () => {
    const headers = ["Seller ID", "Business Name", "Contact Name", "Email", "Phone", "Seller Type", "Joined Date", "Status", "Rejection Reason", "Average Rating"];
    const csvRows = [
      headers.join(','),
      ...processedSellers.map(seller =>
        [
          seller.id,
          seller.businessName,
          seller.name,
          seller.email || "",
          seller.phone || "",
          seller.sellerType,
          formatDateDisplay(seller.joinedDate),
          seller.status,
          seller.rejectionReason || "",
          seller.averageRating !== null && seller.averageRating !== undefined ? seller.averageRating.toFixed(1) : "N/A"
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
        "Email": seller.email || "",
        "Phone": seller.phone || "",
        "Seller Type": seller.sellerType,
        "Joined Date": formatDateDisplay(seller.joinedDate),
        "Status": seller.status,
        "Rejection Reason": seller.rejectionReason || "",
        "Average Rating": seller.averageRating !== null && seller.averageRating !== undefined ? seller.averageRating.toFixed(1) : "N/A"
      }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sellers_Data");
    XLSX.writeFile(workbook, "sellers_data.xlsx");
    toast({ title: "Excel Exported", description: "Sellers data exported to Excel." });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Business Name", "Contact Name", "Seller Type", "Joined Date", "Status", "Reason", "Rating"];
    const tableRows: (string | number)[][] = [];

    processedSellers.forEach(seller => {
      const sellerData = [
        seller.id,
        seller.businessName,
        seller.name,
        seller.sellerType,
        formatDateDisplay(seller.joinedDate),
        seller.status,
        seller.rejectionReason || "",
        seller.averageRating !== null && seller.averageRating !== undefined ? seller.averageRating.toFixed(1) : "N/A"
      ];
      tableRows.push(sellerData);
    });

    autoTable(doc, {
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
          <h1 className="text-3xl font-bold font-headline">Sellers Management</h1>
          <p className="text-muted-foreground">Manage seller accounts, profiles, and statuses.</p>
        </div>
        <Button onClick={() => setIsAddSellerSheetOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Seller
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-grow">
                <CardTitle>Seller Accounts & Profiles</CardTitle>
                <CardDescription>Track and manage seller statuses and applications.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center">
                <Input
                  placeholder="Search ID, Name, Business, Type..."
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
                        <DropdownMenuItem onClick={handleExportCSV}>
                            <FileText className="mr-2 h-4 w-4" /> Export CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportExcel}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportPDF}>
                            <Printer className="mr-2 h-4 w-4" /> Export PDF
                        </DropdownMenuItem>
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
                <TableHead onClick={() => handleSort('sellerType')} className="cursor-pointer hover:bg-muted/50 group">
                  <div className="flex items-center gap-1"><Tag className="h-4 w-4 text-muted-foreground mr-1" />Seller Type {renderSortIcon('sellerType')}</div>
                </TableHead>
                <TableHead onClick={() => handleSort('averageRating')} className="cursor-pointer hover:bg-muted/50 group">
                  <div className="flex items-center gap-1"><StarIcon className="h-4 w-4 text-muted-foreground mr-1" />Avg. Rating {renderSortIcon('averageRating')}</div>
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
                    <TableCell className="font-medium">
                       <Button
                        variant="link"
                        className="p-0 h-auto text-primary hover:underline"
                        onClick={() => handleViewProfile(seller)}
                      >
                        {seller.id}
                      </Button>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      {seller.businessName}
                    </TableCell>
                    <TableCell>{seller.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{seller.sellerType.replace(/([A-Z])/g, ' $1').trim()}</Badge>
                    </TableCell>
                    <TableCell>
                      <StarRatingDisplay rating={seller.averageRating} />
                    </TableCell>
                    <TableCell>{formatDateDisplay(seller.joinedDate)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariant[seller.status as SellerStatus]}
                        className={seller.status === 'Approved' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                      >
                        {seller.status}
                      </Badge>
                      {seller.status === "Rejected" && seller.rejectionReason && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate" title={seller.rejectionReason}>
                          Reason: {seller.rejectionReason}
                        </p>
                      )}
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
                            <>
                              <DropdownMenuItem
                                className="text-green-600 focus:text-green-700 focus:bg-green-50"
                                onClick={() => handleApproveApplication(seller.id)}
                              >
                                <UserCheck className="mr-2 h-4 w-4" /> Approve Application
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                onClick={() => handleDeclineApplication(seller.id)}
                              >
                                <XCircle className="mr-2 h-4 w-4" /> Decline Application
                              </DropdownMenuItem>
                            </>
                          )}
                           {seller.status === "Approved" && (
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-700 focus:bg-red-50"
                              onClick={() => handleSuspendSellerRole(seller.id)}
                            >
                              <UserX className="mr-2 h-4 w-4" /> Suspend Seller Role
                            </DropdownMenuItem>
                          )}
                          {seller.status === "Rejected" && (
                             <DropdownMenuItem
                              className="text-green-600 focus:text-green-700 focus:bg-green-50"
                              onClick={() => handleReactivateSeller(seller.id)}
                            >
                              <UserCheck className="mr-2 h-4 w-4" /> Re-Approve Application
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                    No sellers found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages > 0 ? totalPages : 1} ({processedSellers.length} total sellers)
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
          onOpenImagePopup={handleOpenImagePopup}
          onApprove={handleApproveApplication}
          onReject={handleDeclineApplication}
          onSuspend={handleSuspendSellerRole}
          onReactivate={handleReactivateSeller}
        />
      )}

      {selectedImageUrl && (
        <ImagePopup
          isOpen={isImagePopupOpen}
          onOpenChange={handleCloseImagePopup}
          imageUrl={selectedImageUrl}
        />
      )}

      <AddSellerSheet 
        isOpen={isAddSellerSheetOpen}
        onOpenChange={setIsAddSellerSheetOpen}
        onSellerAdded={handleSellerAdded}
      />
    </div>
  );
}

