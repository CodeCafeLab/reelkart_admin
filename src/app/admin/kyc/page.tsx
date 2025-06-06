import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, CheckCircle, XCircle, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";

const kycRequests = [
  { id: "kyc001", userId: "usr101", name: "Aarav Sharma", submissionDate: "2024-07-15", status: "Pending", documentType: "Aadhaar" },
  { id: "kyc002", userId: "usr102", name: "Priya Patel", submissionDate: "2024-07-14", status: "Approved", documentType: "PAN Card" },
  { id: "kyc003", userId: "usr103", name: "Rohan Das", submissionDate: "2024-07-13", status: "Rejected", documentType: "Passport" },
  { id: "kyc004", userId: "usr104", name: "Sneha Reddy", submissionDate: "2024-07-16", status: "Pending", documentType: "Voter ID" },
  { id: "kyc005", userId: "usr105", name: "Vikram Singh", submissionDate: "2024-07-12", status: "Approved", documentType: "Driving License" },
];

type KYCStatus = "Pending" | "Approved" | "Rejected";

const statusVariant: Record<KYCStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default", // Using 'default' for a positive status, it will take primary color
  Rejected: "destructive",
};

// Custom style for approved badge to be greenish. Shadcn default is primary color.
// If specific green is needed, CSS override or a new variant would be required.
// For now, 'default' variant (primary color) will be used.

export default function KycPage() {
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
              {kycRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.name}</TableCell>
                  <TableCell>{request.submissionDate}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {request.documentType}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[request.status as KYCStatus]}>
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        {request.status === "Pending" && (
                          <>
                            <DropdownMenuItem className="text-green-600 focus:text-green-700 focus:bg-green-50">
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50">
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
    </div>
  );
}
