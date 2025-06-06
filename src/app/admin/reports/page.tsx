import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Download, AlertOctagon, CheckSquare, Eye, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const issues = [
  { id: "iss001", reporter: "UserX123", type: "Bug Report", status: "Open", date: "2024-07-19", summary: "Login button not working on Safari" },
  { id: "iss002", reporter: "SellerABC", type: "Feature Request", status: "In Progress", date: "2024-07-18", summary: "Bulk product upload via CSV" },
  { id: "iss003", reporter: "AdminKYC", type: "System Issue", status: "Resolved", date: "2024-07-17", summary: "Image upload failing for KYC docs" },
  { id: "iss004", reporter: "UserY456", type: "Payment Issue", status: "Open", date: "2024-07-20", summary: "Payment failed with error code 500" },
];

type IssueStatus = "Open" | "In Progress" | "Resolved" | "Closed";

const statusVariant: Record<IssueStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Open: "destructive",
  "In Progress": "secondary",
  Resolved: "default", // Greenish
  Closed: "outline",
};

export default function ReportsPage() {
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
                           <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        {issue.status === "Open" && (
                          <DropdownMenuItem>
                            <CheckSquare className="mr-2 h-4 w-4" /> Mark as In Progress
                          </DropdownMenuItem>
                        )}
                        {issue.status === "In Progress" && (
                           <DropdownMenuItem>
                            <CheckSquare className="mr-2 h-4 w-4" /> Mark as Resolved
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
    </div>
  );
}
