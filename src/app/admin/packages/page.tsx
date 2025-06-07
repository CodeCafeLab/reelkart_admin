
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash2, ToggleLeft, ToggleRight, Package } from "lucide-react";
import type { SellerPackage, SellerRole } from "@/types/seller-package"; // Assuming types are defined here
import { useToast } from "@/hooks/use-toast";

const mockPackages: SellerPackage[] = [
  {
    id: "pkg_001",
    name: "Basic Seller Kit",
    description: "Essential tools for new sellers.",
    price: 499,
    currency: "INR",
    billing_interval: "monthly",
    features: ["Basic Storefront", "50 Product Listings", "Email Support"],
    applicable_seller_roles: ["IndividualMerchant", "OnlineSeller"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "pkg_002",
    name: "Influencer Pro",
    description: "Advanced features for content creators and influencers.",
    price: 1999,
    currency: "INR",
    billing_interval: "monthly",
    features: ["Customizable Profile", "Analytics Dashboard", "Affiliate Tools", "Priority Support"],
    applicable_seller_roles: ["Influencer", "Celebrity"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "pkg_003",
    name: "Wholesale Partner",
    description: "Package for bulk sellers and wholesalers.",
    price: 4999,
    currency: "INR",
    billing_interval: "annually",
    features: ["Unlimited Listings", "Volume Discounts Setup", "Dedicated Account Manager", "API Access"],
    applicable_seller_roles: ["Wholesaler", "ECommerceSeller"],
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "pkg_004",
    name: "Affiliate Starter",
    description: "Tools for affiliate marketers to promote products.",
    price: 0,
    currency: "INR",
    billing_interval: "one-time", // Could be free or a one-time setup
    features: ["Link Generation", "Commission Tracking", "Promotional Materials"],
    applicable_seller_roles: ["Affiliator"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];


export default function PackagesPage() {
  const { toast } = useToast();
  const [packages, setPackages] = React.useState<SellerPackage[]>(mockPackages);

  const handleToggleActive = (packageId: string) => {
    setPackages(prevPackages =>
      prevPackages.map(pkg =>
        pkg.id === packageId ? { ...pkg, is_active: !pkg.is_active } : pkg
      )
    );
    const pkg = packages.find(p => p.id === packageId);
    toast({
      title: "Status Updated",
      description: `${pkg?.name} is now ${!pkg?.is_active ? "Active" : "Inactive"}. (Mock action)`,
    });
  };

  const handleEdit = (packageId: string) => {
    toast({ title: "Edit Package (Placeholder)", description: `Would open form to edit package ID: ${packageId}` });
  };

  const handleDelete = (packageId: string) => {
    // In a real app, show a confirmation dialog
    setPackages(prevPackages => prevPackages.filter(pkg => pkg.id !== packageId));
    toast({ title: "Package Deleted (Placeholder)", description: `Package ID: ${packageId} removed from list. (Mock action)`, variant: "destructive" });
  };
  
  const handleAddNewPackage = () => {
    toast({ title: "Add New Package (Placeholder)", description: "Would open a form to create a new package." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center">
            <Package className="mr-3 h-8 w-8" />
            Package Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage service packages for different types of seller roles.
          </p>
        </div>
        <Button onClick={handleAddNewPackage}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Package
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Seller Packages</CardTitle>
          <CardDescription>
            Define features, pricing, and target roles for each package.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Targeted Seller Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No packages defined yet. Click "Add New Package" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: pkg.currency }).format(pkg.price)}
                      {pkg.billing_interval !== 'one-time' ? `/${pkg.billing_interval.replace('ly', '')}` : ''}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {pkg.applicable_seller_roles.map(role => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role.replace(/([A-Z])/g, ' $1').trim()}
                          </Badge>
                        ))}
                        {pkg.applicable_seller_roles.length === 0 && <span className="text-xs text-muted-foreground">All Roles</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={pkg.is_active ? "default" : "outline"} className={pkg.is_active ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                        {pkg.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions for {pkg.name}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(pkg.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Package
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(pkg.id)}>
                            {pkg.is_active ? <ToggleLeft className="mr-2 h-4 w-4" /> : <ToggleRight className="mr-2 h-4 w-4" />}
                            Set {pkg.is_active ? "Inactive" : "Active"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(pkg.id)}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Package
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
