
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, PackageCheck, PackageSearch, Truck, Edit, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const ordersData = [
  { id: "ord001", customer: "Ananya Sharma", seller: "RK Electronics", date: "2024-07-18", status: "Shipped", trackingId: "TRK12345678" },
  { id: "ord002", customer: "Rohan Verma", seller: "Anjali's Artistry", date: "2024-07-17", status: "Processing", trackingId: null },
  { id: "ord003", customer: "Priya Mehta", seller: "Khan's Spices", date: "2024-07-16", status: "Delivered", trackingId: "TRK98765432" },
  { id: "ord004", customer: "Sameer Ali", seller: "Fashion Forward", date: "2024-07-19", status: "Pending Payment", trackingId: null },
  { id: "ord005", customer: "Deepika Nair", seller: "Patel's Organics", date: "2024-07-15", status: "Shipped", trackingId: "TRK24681357" },
];

type OrderStatus = "Pending Payment" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

const statusVariant: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  "Pending Payment": "outline",
  Processing: "secondary",
  Shipped: "default", 
  Delivered: "default", 
  Cancelled: "destructive",
};

export default function LogisticsPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [currentStatus, setCurrentStatus] = React.useState<OrderStatus>("Processing");
  const [orders, setOrders] = useState(ordersData); // If orders could be modified

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading logistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Order Logistics</h1>
          <p className="text-muted-foreground">Track and manage order fulfillment.</p>
        </div>
        <div className="w-full sm:w-auto">
          <Input placeholder="Search by Order ID or Customer..." className="max-w-xs" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Tracking</CardTitle>
          <CardDescription>Overview of all customer orders and their statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracking ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.seller}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[order.status as OrderStatus]}
                           className={order.status === 'Delivered' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.trackingId || "N/A"}</TableCell>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                        <DropdownMenuRadioGroup 
                            value={order.status} // Bind to individual order status
                            onValueChange={(newStatus) => {
                                setOrders(prevOrders => 
                                    prevOrders.map(o => 
                                        o.id === order.id ? {...o, status: newStatus as OrderStatus} : o
                                    )
                                );
                            }}
                        >
                          <DropdownMenuRadioItem value="Processing">
                            <PackageSearch className="mr-2 h-4 w-4" /> Processing
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="Shipped">
                            <Truck className="mr-2 h-4 w-4" /> Shipped
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="Delivered">
                            <PackageCheck className="mr-2 h-4 w-4" /> Delivered
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                         <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Edit Tracking Info
                        </DropdownMenuItem>
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
