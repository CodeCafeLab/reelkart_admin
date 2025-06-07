
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserCheck, UserX, Eye, Store } from "lucide-react";
import { Input } from "@/components/ui/input";

const sellers = [
  { id: "usr001-sel", name: "Rajesh Kumar", businessName: "RK Electronics", status: "Approved", joinedDate: "2024-06-01" },
  { id: "usr002-sel", name: "Anjali Desai", businessName: "Anjali's Artistry", status: "Pending", joinedDate: "2024-07-10" },
  { id: "usr003-sel", name: "Mohammed Khan", businessName: "Khan's Spices", status: "Approved", joinedDate: "2024-05-15" },
  { id: "usr004-sel", name: "Priya Singh", businessName: "Fashion Forward", status: "Rejected", joinedDate: "2024-07-01" },
  { id: "usr005-sel", name: "Amit Patel", businessName: "Patel's Organics", status: "Pending", joinedDate: "2024-07-18" },
];

type SellerStatus = "Pending" | "Approved" | "Rejected";

const statusVariant: Record<SellerStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default",
  Rejected: "destructive",
};

export default function SellersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Seller Role Management</h1>
          <p className="text-muted-foreground">Manage users' seller applications and their seller profiles.</p>
        </div>
        <div className="w-full sm:w-auto">
          <Input placeholder="Search by User Name or Business..." className="max-w-xs" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seller Applications & Profiles</CardTitle>
          <CardDescription>Track and manage the status of users' seller onboardings and active seller profiles.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Contact Name</TableHead>
                <TableHead>Application/Joined Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell className="font-medium">{seller.id}</TableCell>
                  <TableCell className="flex items-center gap-2">
                     <Store className="h-4 w-4 text-muted-foreground" />
                    {seller.businessName}
                  </TableCell>
                  <TableCell>{seller.name}</TableCell>
                  <TableCell>{seller.joinedDate}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[seller.status as SellerStatus]}>
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View User/Seller Profile
                        </DropdownMenuItem>
                        {seller.status === "Pending" && (
                          <DropdownMenuItem className="text-green-600 focus:text-green-700 focus:bg-green-50">
                            <UserCheck className="mr-2 h-4 w-4" /> Approve Seller Application
                          </DropdownMenuItem>
                        )}
                        {seller.status === "Approved" && (
                          <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50">
                            <UserX className="mr-2 h-4 w-4" /> Suspend Seller Role
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
