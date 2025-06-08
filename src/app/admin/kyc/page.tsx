
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, CheckCircle, XCircle, Eye, ArrowUpDown, ArrowUp, ArrowDown, Download, FileSpreadsheet, Printer, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KycDetailsSheet } from "@/components/admin/kyc/KycDetailsSheet";
import { ImagePopup } from "@/components/admin/kyc/ImagePopup";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';


interface KycDocumentImage {
  name: string;
  url: string;
  aiHint: string;
}
export interface KycRequest {
  id: string;
  userId: string;
  name: string;
  submissionDate: string; // ISO string date for easier sorting
  status: "Pending" | "Approved" | "Rejected";
  documentType: string;
  documentImages: KycDocumentImage[];
  details?: Record<string, string>;
  rejectionReason?: string;
}

const kycRequestsData: KycRequest[] = [
  {
    id: "kyc001",
    userId: "usr101",
    name: "Aarav Sharma",
    submissionDate: "2024-07-15T10:30:00Z",
    status: "Pending",
    documentType: "Aadhaar",
    documentImages: [
      { name: "Aadhaar Front", url: "https://placehold.co/600x400.png?text=Aadhaar+Front", aiHint: "document identity" },
      { name: "Aadhaar Back", url: "https://placehold.co/600x400.png?text=Aadhaar+Back", aiHint: "document identity" },
    ],
    details: { "Aadhaar Number": "XXXX-XXXX-1234", "Date of Birth": "1990-01-01" }
  },
  {
    id: "kyc002",
    userId: "usr102",
    name: "Priya Patel",
    submissionDate: "2024-07-14T11:00:00Z",
    status: "Approved",
    documentType: "PAN Card",
    documentImages: [
      { name: "PAN Card", url: "https://placehold.co/600x400.png?text=PAN+Card", aiHint: "document tax" },
    ],
    details: { "PAN Number": "ABCDE1234F", "Father's Name": "Ramesh Patel" }
  },
  {
    id: "kyc003",
    userId: "usr103",
    name: "Rohan Das",
    submissionDate: "2024-07-13T09:15:00Z",
    status: "Rejected",
    documentType: "Passport",
    documentImages: [
      { name: "Passport Front", url: "https://placehold.co/600x400.png?text=Passport+Front", aiHint: "document passport" },
      { name: "Passport Back", url: "https://placehold.co/600x400.png?text=Passport+Back", aiHint: "document passport" },
    ],
    details: { "Passport Number": "Z1234567", "Expiry Date": "2030-12-31" },
    rejectionReason: "Image unclear"
  },
  {
    id: "kyc004",
    userId: "usr104",
    name: "Sneha Reddy",
    submissionDate: "2024-07-16T14:00:00Z",
    status: "Pending",
    documentType: "Voter ID",
    documentImages: [
      { name: "Voter ID Front", url: "https://placehold.co/600x400.png?text=Voter+ID+Front", aiHint: "document voting" },
    ],
    details: { "Voter ID Number": "XYZ1234567", "Constituency": "South Bangalore"}
  },
  {
    id: "kyc005",
    userId: "usr105",
    name: "Vikram Singh",
    submissionDate: "2024-07-12T16:45:00Z",
    status: "Approved",
    documentType: "Driving License",
    documentImages: [
      { name: "Driving License Front", url: "https://placehold.co/600x400.png?text=DL+Front", aiHint: "document license" },
    ],
    details: { "License Number": "KA0120200012345", "Valid Till": "2035-05-20" }
  },
  { id: "kyc006", userId: "usr106", name: "Anika Mehra", submissionDate: "2024-07-18T10:00:00Z", status: "Pending", documentType: "Aadhaar", documentImages: [{ name: "Aadhaar", url: "https://placehold.co/600x400.png", aiHint: "document identity" }], details: { "Aadhaar Number": "XXXX-XXXX-5678" } },
  { id: "kyc007", userId: "usr107", name: "Kabir Yadav", submissionDate: "2024-07-18T11:00:00Z", status: "Approved", documentType: "PAN Card", documentImages: [{ name: "PAN", url: "https://placehold.co/600x400.png", aiHint: "document tax" }], details: { "PAN Number": "FGHIJ5678K" } },
  { id: "kyc008", userId: "usr108", name: "Diya Chopra", submissionDate: "2024-07-17T12:00:00Z", status: "Rejected", documentType: "Passport", documentImages: [{ name: "Passport", url: "https://placehold.co/600x400.png", aiHint: "document passport" }], details: { "Passport Number": "AB1234567" }, rejectionReason: "Signature mismatch" },
  { id: "kyc009", userId: "usr109", name: "Ishaan Gupta", submissionDate: "2024-07-17T13:00:00Z", status: "Pending", documentType: "Voter ID", documentImages: [{ name: "Voter ID", url: "https://placehold.co/600x400.png", aiHint: "document voting" }], details: { "Voter ID Number": "LMN6789012" } },
  { id: "kyc010", userId: "usr110", name: "Myra Bhat", submissionDate: "2024-07-16T14:00:00Z", status: "Approved", documentType: "Driving License", documentImages: [{ name: "License", url: "https://placehold.co/600x400.png", aiHint: "document license" }], details: { "License Number": "MH0220230012345" } },
  { id: "kyc011", userId: "usr111", name: "Arjun Reddy", submissionDate: "2024-07-16T15:00:00Z", status: "Pending", documentType: "Aadhaar", documentImages: [{ name: "Aadhaar", url: "https://placehold.co/600x400.png", aiHint: "document identity" }], details: { "Aadhaar Number": "XXXX-XXXX-1122" } },
  { id: "kyc012", userId: "usr112", name: "Kiara Agarwal", submissionDate: "2024-07-15T16:00:00Z", status: "Approved", documentType: "PAN Card", documentImages: [{ name: "PAN", url: "https://placehold.co/600x400.png", aiHint: "document tax" }], details: { "PAN Number": "PQRST1122U" } },
  { id: "kyc013", userId: "usr113", name: "Vivaan Joshi", submissionDate: "2024-07-15T17:00:00Z", status: "Rejected", documentType: "Passport", documentImages: [{ name: "Passport", url: "https://placehold.co/600x400.png", aiHint: "document passport" }], details: { "Passport Number": "CD3456789" }, rejectionReason: "Photo not clear" },
  { id: "kyc014", userId: "usr114", name: "Sara Khan", submissionDate: "2024-07-14T18:00:00Z", status: "Pending", documentType: "Voter ID", documentImages: [{ name: "Voter ID", url: "https://placehold.co/600x400.png", aiHint: "document voting" }], details: { "Voter ID Number": "VWX3456789" } },
  { id: "kyc015", userId: "usr115", name: "Reyansh Kumar", submissionDate: "2024-07-14T19:00:00Z", status: "Approved", documentType: "Driving License", documentImages: [{ name: "License", url: "https://placehold.co/600x400.png", aiHint: "document license" }], details: { "License Number": "UP3220220054321" } },
  { id: "kyc016", userId: "usr116", name: "Aisha Verma", submissionDate: "2024-07-13T20:00:00Z", status: "Pending", documentType: "Aadhaar", documentImages: [{ name: "Aadhaar", url: "https://placehold.co/600x400.png", aiHint: "document identity" }], details: { "Aadhaar Number": "XXXX-XXXX-3344" } },
  { id: "kyc017", userId: "usr117", name: "Dev Singhania", submissionDate: "2024-07-13T21:00:00Z", status: "Approved", documentType: "PAN Card", documentImages: [{ name: "PAN", url: "https://placehold.co/600x400.png", aiHint: "document tax" }], details: { "PAN Number": "YZABC3344D" } },
  { id: "kyc018", userId: "usr118", name: "Zara Ali", submissionDate: "2024-07-12T22:00:00Z", status: "Rejected", documentType: "Passport", documentImages: [{ name: "Passport", url: "https://placehold.co/600x400.png", aiHint: "document passport" }], details: { "Passport Number": "EF5678901" }, rejectionReason: "Document expired" },
  { id: "kyc019", userId: "usr119", name: "Rudra Shah", submissionDate: "2024-07-12T23:00:00Z", status: "Pending", documentType: "Voter ID", documentImages: [{ name: "Voter ID", url: "https://placehold.co/600x400.png", aiHint: "document voting" }], details: { "Voter ID Number": "QRS6789012" } },
  { id: "kyc020", userId: "usr120", name: "Anya Iyer", submissionDate: "2024-07-11T10:00:00Z", status: "Approved", documentType: "Driving License", documentImages: [{ name: "License", url: "https://placehold.co/600x400.png", aiHint: "document license" }], details: { "License Number": "TN0520210067890" } },
];

type KYCStatus = "Pending" | "Approved" | "Rejected";
type SortableKycKeys = keyof Pick<KycRequest, 'id' | 'name' | 'submissionDate' | 'documentType' | 'status'>;

const statusVariant: Record<KYCStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default",
  Rejected: "destructive",
};


export default function KycPage() {
  const { toast } = useToast();
  const [kycRequests, setKycRequests] = useState<KycRequest[]>(kycRequestsData);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedKycRequest, setSelectedKycRequest] = useState<KycRequest | null>(null);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<KYCStatus | "All">("All");
  const [sortConfig, setSortConfig] = useState<{ key: SortableKycKeys; direction: 'ascending' | 'descending' }>({ key: 'submissionDate', direction: 'descending' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const processedKycRequests = useMemo(() => {
    let filteredItems = [...kycRequests];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(req =>
        req.id.toLowerCase().includes(lowerSearchTerm) ||
        req.name.toLowerCase().includes(lowerSearchTerm) ||
        req.userId.toLowerCase().includes(lowerSearchTerm) ||
        req.documentType.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (statusFilter !== "All") {
      filteredItems = filteredItems.filter(req => req.status === statusFilter);
    }

    if (sortConfig.key) {
      filteredItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'submissionDate') {
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
  }, [kycRequests, searchTerm, statusFilter, sortConfig]);

  const paginatedKycRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedKycRequests.slice(startIndex, endIndex);
  }, [processedKycRequests, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedKycRequests.length / itemsPerPage);

  const handleSort = (key: SortableKycKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const renderSortIcon = (columnKey: SortableKycKeys) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 opacity-30 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const handleViewDetails = (request: KycRequest) => {
    setSelectedKycRequest(request);
    setIsSheetOpen(true);
  };

  const handleOpenImagePopup = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImagePopupOpen(true);
  };

  const handleCloseImagePopup = () => {
    setIsImagePopupOpen(false);
    setSelectedImageUrl(null);
  };

  const handleApproveKyc = (kycId: string) => {
    setKycRequests(prevRequests =>
      prevRequests.map(req => req.id === kycId ? {...req, status: "Approved", rejectionReason: undefined } : req)
    );
    setSelectedKycRequest(prev => prev && prev.id === kycId ? {...prev, status: "Approved", rejectionReason: undefined } : prev);
    toast({
      title: "KYC Approved",
      description: `KYC request ${kycId} has been successfully approved.`,
      variant: "default",
    });
    if(selectedKycRequest?.id === kycId && isSheetOpen) setIsSheetOpen(false);
  };

  const handleRejectKyc = (kycId: string, reason?: string) => {
     const finalReason = reason?.trim() === "" || !reason ? "Reason not specified" : reason;
     setKycRequests(prevRequests =>
      prevRequests.map(req => req.id === kycId ? {...req, status: "Rejected", rejectionReason: finalReason } : req)
    );
    setSelectedKycRequest(prev => prev && prev.id === kycId ? {...prev, status: "Rejected", rejectionReason: finalReason } : prev);
    toast({
      title: "KYC Rejected",
      description: `KYC request ${kycId} has been rejected. Reason: ${finalReason}`,
      variant: "destructive",
    });
    if(selectedKycRequest?.id === kycId && isSheetOpen) setIsSheetOpen(false);
  };

  const promptAndReject = (kycId: string) => {
    const reason = window.prompt("Please enter the reason for rejection (optional):");
    // If user clicks "Cancel", prompt returns null. If they click "OK" with empty input, it's an empty string.
    if (reason !== null) {
      handleRejectKyc(kycId, reason);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Request ID", "User Name", "Submission Date", "Document Type", "Status", "Details", "Rejection Reason"];
    const csvRows = [
      headers.join(','),
      ...processedKycRequests.map(req => {
        const detailsString = req.details ? Object.entries(req.details).map(([k,v]) => `${k}: ${v}`).join('; ') : '';
        return [
          req.id,
          req.name,
          format(parseISO(req.submissionDate), "yyyy-MM-dd HH:mm:ss"),
          req.documentType,
          req.status,
          detailsString,
          req.rejectionReason || ''
        ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(',');
      })
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "kyc_requests.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    toast({ title: "CSV Exported", description: "KYC data exported to CSV." });
  };

  const handleExportExcel = () => {
    const worksheetData = processedKycRequests.map(req => {
      const flattenedDetails = req.details ? req.details : {};
      return {
        "Request ID": req.id,
        "User ID": req.userId,
        "User Name": req.name,
        "Submission Date": format(parseISO(req.submissionDate), "yyyy-MM-dd HH:mm:ss"),
        "Document Type": req.documentType,
        "Status": req.status,
        ...flattenedDetails,
        "Rejection Reason": req.rejectionReason || ''
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "KYC_Requests");
    XLSX.writeFile(workbook, "kyc_requests.xlsx");
    toast({ title: "Excel Exported", description: "KYC data exported to Excel." });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Name", "Date", "Doc Type", "Status", "Details", "Reason"];
    const tableRows: (string | number)[][] = [];

    processedKycRequests.forEach(req => {
      const detailsString = req.details ? Object.entries(req.details).map(([k,v]) => `${k}: ${v}`).join('; ') : '';
      const kycData = [
        req.id,
        req.name,
        format(parseISO(req.submissionDate), "PP"),
        req.documentType,
        req.status,
        detailsString,
        req.rejectionReason || ''
      ];
      tableRows.push(kycData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [75, 75, 75] },
      columnStyles: { 5: { cellWidth: 'auto' }, 6: { cellWidth: 'auto' } }
    });
    doc.text("KYC Requests Report", 14, 15);
    doc.save("kyc_requests.pdf");
    toast({ title: "PDF Exported", description: "KYC data exported to PDF." });
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">KYC Management</h1>
          <p className="text-muted-foreground">Review and manage user KYC submissions.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-grow">
                <CardTitle>KYC Submissions</CardTitle>
                <CardDescription>
                    SuperAdmins and KYCReviewers can approve or reject submissions.
                </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center">
                <Input
                  placeholder="Search ID, Name, User ID, Doc Type..."
                  value={searchTerm}
                  onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                  className="max-w-full sm:max-w-xs flex-grow"
                />
                <Select value={statusFilter} onValueChange={(value) => {setStatusFilter(value as KYCStatus | "All"); setCurrentPage(1);}}>
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
                  <div className="flex items-center gap-1">Request ID {renderSortIcon('id')}</div>
                </TableHead>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-muted/50 group">
                  <div className="flex items-center gap-1">User Name {renderSortIcon('name')}</div>
                </TableHead>
                <TableHead onClick={() => handleSort('submissionDate')} className="cursor-pointer hover:bg-muted/50 group">
                  <div className="flex items-center gap-1">Submission Date {renderSortIcon('submissionDate')}</div>
                </TableHead>
                <TableHead onClick={() => handleSort('documentType')} className="cursor-pointer hover:bg-muted/50 group">
                  <div className="flex items-center gap-1">Document Type {renderSortIcon('documentType')}</div>
                </TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-muted/50 group">
                  <div className="flex items-center gap-1">Status {renderSortIcon('status')}</div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!hasMounted && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin inline-block mr-2" /> Loading KYC data...
                  </TableCell>
                </TableRow>
              )}
              {hasMounted && paginatedKycRequests.length > 0 ? (
                paginatedKycRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.id}</TableCell>
                    <TableCell>{request.name}</TableCell>
                    <TableCell>{format(parseISO(request.submissionDate), "PPpp")}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {request.documentType}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[request.status as KYCStatus]}
                             className={request.status === 'Approved' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                        {request.status}
                      </Badge>
                      {request.status === "Rejected" && request.rejectionReason && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate" title={request.rejectionReason}>
                          Reason: {request.rejectionReason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions for {request.name}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(request)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-green-600 focus:text-green-700 focus:bg-green-50"
                            onClick={() => handleApproveKyc(request.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                            onClick={() => promptAndReject(request.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : hasMounted && paginatedKycRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No KYC requests found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages > 0 ? totalPages : 1} ({processedKycRequests.length} total requests)
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

      {selectedKycRequest && (
        <KycDetailsSheet
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          kycRequest={selectedKycRequest}
          onOpenImagePopup={handleOpenImagePopup}
          onApprove={handleApproveKyc}
          onReject={handleRejectKyc} 
        />
      )}

      {selectedImageUrl && (
        <ImagePopup
          isOpen={isImagePopupOpen}
          onOpenChange={handleCloseImagePopup}
          imageUrl={selectedImageUrl}
        />
      )}
    </div>
  );
}
