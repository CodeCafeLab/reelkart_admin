
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, CheckCircle, XCircle, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KycDetailsSheet } from "@/components/admin/kyc/KycDetailsSheet";
import { ImagePopup } from "@/components/admin/kyc/ImagePopup";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';

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
    details: { "Passport Number": "Z1234567", "Expiry Date": "2030-12-31", "Reason for Rejection": "Image unclear" }
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

  const handleSort = (key: SortableKycKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
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
      prevRequests.map(req => req.id === kycId ? {...req, status: "Approved"} : req)
    );
    setSelectedKycRequest(prev => prev && prev.id === kycId ? {...prev, status: "Approved"} : prev);
    toast({
      title: "KYC Approved",
      description: `KYC request ${kycId} has been successfully approved.`,
      variant: "default",
    });
    if(selectedKycRequest?.id === kycId) setIsSheetOpen(false);
  };

  const handleRejectKyc = (kycId: string) => {
     setKycRequests(prevRequests => 
      prevRequests.map(req => req.id === kycId ? {...req, status: "Rejected"} : req)
    );
    setSelectedKycRequest(prev => prev && prev.id === kycId ? {...prev, status: "Rejected"} : prev);
    toast({
      title: "KYC Rejected",
      description: `KYC request ${kycId} has been rejected.`,
      variant: "destructive",
    });
    if(selectedKycRequest?.id === kycId) setIsSheetOpen(false);
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
          <CardTitle>KYC Submissions</CardTitle>
          <CardDescription>
            SuperAdmins and KYCReviewers can approve or reject submissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
            <Input 
              placeholder="Search by ID, Name, User ID, Doc Type..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-full sm:max-w-sm flex-grow" 
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as KYCStatus | "All")}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              {processedKycRequests.length > 0 ? (
                processedKycRequests.map((request) => (
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
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(request)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          {request.status === "Pending" && (
                            <>
                              <DropdownMenuItem 
                                className="text-green-600 focus:text-green-700 focus:bg-green-50"
                                onClick={() => handleApproveKyc(request.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                onClick={() => handleRejectKyc(request.id)}
                              >
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No KYC requests found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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

    