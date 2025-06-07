
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, CheckCircle, XCircle, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { KycDetailsSheet } from "@/components/admin/kyc/KycDetailsSheet";
import { ImagePopup } from "@/components/admin/kyc/ImagePopup";

interface KycDocumentImage {
  name: string;
  url: string;
  aiHint: string;
}
export interface KycRequest {
  id: string;
  userId: string;
  name: string;
  submissionDate: string;
  status: "Pending" | "Approved" | "Rejected";
  documentType: string;
  documentImages: KycDocumentImage[];
  details?: Record<string, string>; // For other textual details
}


const kycRequestsData: KycRequest[] = [
  { 
    id: "kyc001", 
    userId: "usr101", 
    name: "Aarav Sharma", 
    submissionDate: "2024-07-15", 
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
    submissionDate: "2024-07-14", 
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
    submissionDate: "2024-07-13", 
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
    submissionDate: "2024-07-16", 
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
    submissionDate: "2024-07-12", 
    status: "Approved", 
    documentType: "Driving License",
    documentImages: [
      { name: "Driving License Front", url: "https://placehold.co/600x400.png?text=DL+Front", aiHint: "document license" },
    ],
    details: { "License Number": "KA0120200012345", "Valid Till": "2035-05-20" }
  },
];

type KYCStatus = "Pending" | "Approved" | "Rejected";

const statusVariant: Record<KYCStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default", 
  Rejected: "destructive",
};


export default function KycPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedKycRequest, setSelectedKycRequest] = useState<KycRequest | null>(null);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

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
    // Placeholder: Implement actual approval logic
    console.log("Approving KYC:", kycId);
    // Example: Update local state or refetch data
    alert(`KYC ${kycId} approved (placeholder).`);
    setIsSheetOpen(false); // Close sheet after action
  };

  const handleRejectKyc = (kycId: string) => {
    // Placeholder: Implement actual rejection logic
    console.log("Rejecting KYC:", kycId);
    // Example: Update local state or refetch data
    alert(`KYC ${kycId} rejected (placeholder).`);
    setIsSheetOpen(false); // Close sheet after action
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">KYC Management</h1>
          <p className="text-muted-foreground">Review and manage user KYC submissions.</p>
        </div>
        <div className="w-full sm:w-auto">
          <Input placeholder="Search by User ID or Name..." className="max-w-xs" />
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kycRequestsData.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.name}</TableCell>
                  <TableCell>{request.submissionDate}</TableCell>
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
              ))}
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
