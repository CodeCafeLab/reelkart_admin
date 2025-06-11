
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Download, AlertOctagon, CheckSquare, Eye, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IssueDetailsSheet } from "@/components/admin/reports/IssueDetailsSheet"; // Import the new sheet

export interface Issue {
  id: string;
  reporter: string;
  type: string;
  status: IssueStatus;
  date: string;
  summary: string;
  description?: string; // Added for more detail
  priority?: "Low" | "Medium" | "High" | "Critical";
  assignedTo?: string;
  resolution?: string;
}

const initialIssues: Issue[] = [
  { id: "iss001", reporter: "UserX123", type: "Bug Report", status: "Open", date: "2024-07-19", summary: "Login button not working on Safari", description: "The login button on the main page does not respond to clicks when using Safari version 15. Browser console shows a 'TypeError: undefined is not a function'. Works fine on Chrome and Firefox.", priority: "High", assignedTo: "DevTeamA" },
  { id: "iss002", reporter: "SellerABC", type: "Feature Request", status: "In Progress", date: "2024-07-18", summary: "Bulk product upload via CSV", description: "Requesting a feature to allow sellers to upload multiple products at once using a CSV file. This would save a lot of time for sellers with large inventories.", priority: "Medium", assignedTo: "ProductTeam" },
  { id: "iss003", reporter: "AdminKYC", type: "System Issue", status: "Resolved", date: "2024-07-17", summary: "Image upload failing for KYC docs", description: "Users reported that KYC document image uploads were failing with a '503 Service Unavailable' error. Issue was traced to a misconfigured S3 bucket policy.", priority: "Critical", assignedTo: "InfraTeam", resolution: "Corrected S3 bucket policy. Verified image uploads are now working." },
  { id: "iss004", reporter: "UserY456", type: "Payment Issue", status: "Open", date: "2024-07-20", summary: "Payment failed with error code 500", description: "Attempted to make a payment for order #ORD123 but received an internal server error (500). Payment gateway dashboard shows no transaction attempt.", priority: "High" },
  { id: "iss005", reporter: "SupportAgent1", type: "UI Glitch", status: "Open", date: "2024-07-21", summary: "User profile avatar overlaps name on mobile", description: "On smaller mobile screens (e.g., iPhone SE), the user avatar in the top navigation bar slightly overlaps the username.", priority: "Low", assignedTo: "FrontendTeam" },
];

export type IssueStatus = "Open" | "In Progress" | "Resolved" | "Closed";

const statusVariant: Record<IssueStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Open: "destructive",
  "In Progress": "secondary",
  Resolved: "default", // Greenish
  Closed: "outline",
};

export default function ReportsPage() {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const handleViewDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsSheetOpen(true);
  };

  const handleUpdateStatus = (issueId: string, newStatus: IssueStatus) => {
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      )
    );
    // In a real app, also update this on the backend
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Reports & Issue Handling</h1>
      <p className="text-muted-foreground">Generate reports and manage platform issues.</p>

      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>Select a report type to generate and download.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="grid w-full sm:max-w-xs items-center gap-1.5">
            <label htmlFor="report-type" className="text-sm font-medium">Report Type</label>
            <Select>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select report..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales Report</SelectItem>
                <SelectItem value="user_activity">User Activity Report</SelectItem>
                <SelectItem value="seller_performance">Seller Performance Report</SelectItem>
                <SelectItem value="content_moderation">Content Moderation Stats</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Generate & Download
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Issue Tracker</CardTitle>
          <CardDescription>Manage reported issues and track their resolution.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue ID</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">{issue.id}</TableCell>
                  <TableCell className="max-w-xs truncate" title={issue.summary}>{issue.summary}</TableCell>
                  <TableCell>{issue.reporter}</TableCell>
                  <TableCell>{issue.type}</TableCell>
                  <TableCell>{issue.date}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[issue.status as IssueStatus]}
                           className={issue.status === 'Resolved' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                    >
                      {issue.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                           <span className="sr-only">Actions for {issue.id}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(issue)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        {issue.status === "Open" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(issue.id, "In Progress")}>
                            <CheckSquare className="mr-2 h-4 w-4" /> Mark as In Progress
                          </DropdownMenuItem>
                        )}
                        {issue.status === "In Progress" && (
                           <DropdownMenuItem onClick={() => handleUpdateStatus(issue.id, "Resolved")}>
                            <CheckSquare className="mr-2 h-4 w-4" /> Mark as Resolved
                          </DropdownMenuItem>
                        )}
                         {issue.status === "Resolved" && (
                           <DropdownMenuItem onClick={() => handleUpdateStatus(issue.id, "Closed")}>
                            <CheckSquare className="mr-2 h-4 w-4" /> Mark as Closed
                          </DropdownMenuItem>
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

      {selectedIssue && (
        <IssueDetailsSheet
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          issue={selectedIssue}
        />
      )}
    </div>
  );
}
