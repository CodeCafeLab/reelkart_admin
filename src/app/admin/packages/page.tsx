
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit, Trash2, ToggleLeft, ToggleRight, Package, Search, Download, FileText as ExportFileText, FileSpreadsheet, Printer, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { SellerPackage, SellerRole } from "@/types/seller-package"; // Keep SELLER_ROLES import from here
import { useToast } from "@/hooks/use-toast";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from 'date-fns';
import { AddPackageSheet, type NewPackageData } from "@/components/admin/packages/AddPackageSheet";
import { EditPackageSheet, type UpdatedPackageData } from "@/components/admin/packages/EditPackageSheet";


import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const mockPackagesData: Omit<SellerPackage, 'currency'>[] = [ 
  {
    id: "pkg_001",
    name: "Basic Seller Kit",
    description: "Essential tools for new sellers.",
    price: 499,
    billing_interval: "monthly",
    features: ["Basic Storefront", "50 Product Listings", "Email Support"],
    applicable_seller_roles: ["IndividualMerchant", "OnlineSeller"],
    is_active: true,
    created_at: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
  },
  {
    id: "pkg_002",
    name: "Influencer Pro",
    description: "Advanced features for content creators and influencers.",
    price: 1999,
    billing_interval: "monthly",
    features: ["Customizable Profile", "Analytics Dashboard", "Affiliate Tools", "Priority Support"],
    applicable_seller_roles: ["Influencer", "Celebrity"],
    is_active: true,
    created_at: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
  },
  {
    id: "pkg_003",
    name: "Wholesale Partner",
    description: "Package for bulk sellers and wholesalers.",
    price: 4999,
    billing_interval: "annually",
    features: ["Unlimited Listings", "Volume Discounts Setup", "Dedicated Account Manager", "API Access"],
    applicable_seller_roles: ["Wholesaler", "ECommerceSeller"],
    is_active: false,
    created_at: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
  },
  {
    id: "pkg_004",
    name: "Affiliate Starter",
    description: "Tools for affiliate marketers to promote products.",
    price: 0,
    billing_interval: "one-time", 
    features: ["Link Generation", "Commission Tracking", "Promotional Materials"],
    applicable_seller_roles: ["Affiliator"],
    is_active: true,
    created_at: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
  },
  {
    id: "pkg_005",
    name: "Enterprise Solution",
    description: "Full suite for large e-commerce businesses.",
    price: 9999,
    billing_interval: "annually",
    features: ["All Wholesale Features", "Custom Branding", "Advanced API Integrations", "Personalized Support"],
    applicable_seller_roles: ["ECommerceSeller"],
    is_active: true,
    created_at: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

type SortablePackageKeys = keyof Pick<SellerPackage, 'name' | 'price' | 'billing_interval' | 'is_active' | 'created_at'>;
type PackageStatusFilter = "All" | "Active" | "Inactive";

export default function PackagesPage() {
  const { toast } = useToast();
  const { settings: appSettings } = useAppSettings();
  
  const [packages, setPackagesState] = React.useState<SellerPackage[]>(
    mockPackagesData.map(pkg => ({ ...pkg, currency: appSettings.currencyCode }))
  );

  const [isAddSheetOpen, setIsAddSheetOpen] = React.useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false);
  const [editingPackage, setEditingPackage] = React.useState<SellerPackage | null>(null);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<PackageStatusFilter>("All");
  const [sortConfig, setSortConfig] = React.useState<{ key: SortablePackageKeys; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);


  React.useEffect(() => {
    setPackagesState(prevPackages => 
      prevPackages.map(pkg => ({ ...pkg, currency: appSettings.currencyCode }))
    );
  }, [appSettings.currencyCode]);

  const formatPrice = React.useCallback((price: number, billing_interval: SellerPackage['billing_interval'], currencyCodeParam?: string, currencySymbolParam?: string) => {
    const code = currencyCodeParam || appSettings.currencyCode;
    const symbol = currencySymbolParam || appSettings.currencySymbol;

    const formattedPrice = new Intl.NumberFormat('en-IN', { 
        style: 'currency', 
        currency: code,
        currencyDisplay: 'symbol',
        minimumFractionDigits: price === 0 ? 0 : 2,
        maximumFractionDigits: 2
    }).format(price);
    
    const symbolAdjustedPrice = formattedPrice.includes(symbol) ? formattedPrice : `${symbol}${new Intl.NumberFormat('en-IN', {minimumFractionDigits: price === 0 ? 0 : 2, maximumFractionDigits: 2}).format(price)}`;


    if (billing_interval !== 'one-time') {
      return `${symbolAdjustedPrice}/${billing_interval.replace('ly', '')}`;
    }
    return symbolAdjustedPrice;
  }, [appSettings.currencyCode, appSettings.currencySymbol]);

  const processedPackages = React.useMemo(() => {
    let filtered = [...packages];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(pkg =>
        pkg.name.toLowerCase().includes(lowerSearchTerm) ||
        (pkg.description && pkg.description.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (statusFilter !== "All") {
      const isActiveFilter = statusFilter === "Active";
      filtered = filtered.filter(pkg => pkg.is_active === isActiveFilter);
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (typeof valA === 'boolean' && typeof valB === 'boolean') {
          valA = valA ? 1 : 0;
          valB = valB ? 1 : 0;
        } else if (sortConfig.key === 'created_at' || sortConfig.key === 'updated_at') {
           valA = new Date(valA as string).getTime();
           valB = new Date(valB as string).getTime();
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [packages, searchTerm, statusFilter, sortConfig]);

  const paginatedPackages = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedPackages.slice(start, start + itemsPerPage);
  }, [processedPackages, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedPackages.length / itemsPerPage);

  const handleSort = (key: SortablePackageKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const renderSortIcon = (columnKey: SortablePackageKeys) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 opacity-30 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };


  const handleToggleActive = (packageId: string) => {
    setPackagesState(prevPackages =>
      prevPackages.map(pkg =>
        pkg.id === packageId ? { ...pkg, is_active: !pkg.is_active, updated_at: new Date().toISOString() } : pkg
      )
    );
    const pkg = packages.find(p => p.id === packageId);
    toast({
      title: "Status Updated",
      description: `${pkg?.name} is now ${!pkg?.is_active ? "Active" : "Inactive"}.`,
    });
  };

  const handleEditClick = (pkg: SellerPackage) => {
    setEditingPackage(pkg);
    setIsEditSheetOpen(true);
  };

  const handleDelete = (packageId: string) => {
    // Confirm before deleting (optional but good practice)
    if (window.confirm("Are you sure you want to delete this package? This action cannot be undone.")) {
        setPackagesState(prevPackages => prevPackages.filter(pkg => pkg.id !== packageId));
        toast({ title: "Package Deleted", description: `Package ID: ${packageId} has been deleted.`, variant: "destructive" });
    }
  };
  
  const handleAddNewPackage = () => {
    setIsAddSheetOpen(true);
  };

  const handlePackageAdded = (formData: NewPackageData) => {
    const newPackage: SellerPackage = {
      ...formData,
      id: `pkg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 5)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      currency: appSettings.currencyCode,
    };
    setPackagesState(prevPackages => [newPackage, ...prevPackages]);
    setIsAddSheetOpen(false); 
    toast({
      title: "Package Created",
      description: `Package "${newPackage.name}" has been successfully created.`,
    });
  };

  const handlePackageUpdated = (updatedData: UpdatedPackageData) => {
    setPackagesState(prevPackages => 
      prevPackages.map(pkg => 
        pkg.id === updatedData.id 
          ? { ...pkg, ...updatedData, updated_at: new Date().toISOString(), currency: appSettings.currencyCode } 
          : pkg
      )
    );
    setIsEditSheetOpen(false);
    setEditingPackage(null);
    toast({
      title: "Package Updated",
      description: `Package "${updatedData.name}" has been successfully updated.`,
    });
  };

  const formatDateForExport = (dateString: string) => format(parseISO(dateString), "yyyy-MM-dd HH:mm:ss");

  const handleExport = (formatType: 'csv' | 'excel' | 'pdf') => {
    const dataToExport = processedPackages;
    const filenamePrefix = 'seller_packages_export';

    if (formatType === 'csv') {
      const headers = ["ID", "Name", "Description", "Price", "Currency", "Billing Interval", "Features", "Applicable Seller Roles", "Is Active", "Created At", "Updated At"];
      const csvRows = [
        headers.join(','),
        ...dataToExport.map(pkg => [
          pkg.id, pkg.name, pkg.description || '', pkg.price, pkg.currency, pkg.billing_interval,
          pkg.features.join('; '), pkg.applicable_seller_roles.join('; '), pkg.is_active,
          formatDateForExport(pkg.created_at), formatDateForExport(pkg.updated_at)
        ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${filenamePrefix}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast({ title: "CSV Exported", description: "Seller packages data exported." });
    } else if (formatType === 'excel') {
      const wsData = dataToExport.map(pkg => ({
        ID: pkg.id, Name: pkg.name, Description: pkg.description || '', Price: pkg.price, Currency: pkg.currency,
        "Billing Interval": pkg.billing_interval, Features: pkg.features.join('; '),
        "Applicable Seller Roles": pkg.applicable_seller_roles.join('; '), "Is Active": pkg.is_active,
        "Created At": formatDateForExport(pkg.created_at), "Updated At": formatDateForExport(pkg.updated_at)
      }));
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "SellerPackages");
      XLSX.writeFile(wb, `${filenamePrefix}.xlsx`);
      toast({ title: "Excel Exported", description: "Seller packages data exported." });
    } else if (formatType === 'pdf') {
      const doc = new jsPDF({ orientation: 'landscape' });
      const tableColumn = ["ID", "Name", "Price ("+appSettings.currencySymbol+")", "Billing", "Status", "Roles", "Created At"];
      const tableRows = dataToExport.map(pkg => [
        pkg.id, pkg.name, formatPrice(pkg.price, pkg.billing_interval, pkg.currency, appSettings.currencySymbol), pkg.billing_interval,
        pkg.is_active ? "Active" : "Inactive", pkg.applicable_seller_roles.join(', '),
        format(parseISO(pkg.created_at), "PP")
      ]);
      autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20, styles: { fontSize: 8 } });
      doc.text("Seller Packages Report", 14, 15);
      doc.save(`${filenamePrefix}.pdf`);
      toast({ title: "PDF Exported", description: "Seller packages data exported." });
    }
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
            Define features, pricing, and target roles. Prices shown in: {appSettings.currencySymbol} ({appSettings.currencyCode})
          </CardDescription>
           <div className="flex flex-col sm:flex-row justify-between items-end gap-2 pt-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search packages (Name, Desc)..."
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={(value) => {setStatusFilter(value as PackageStatusFilter); setCurrentPage(1);}}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Packages</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('csv')}><ExportFileText className="mr-2 h-4 w-4" />Export CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('excel')}><FileSpreadsheet className="mr-2 h-4 w-4" />Export Excel</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('pdf')}><Printer className="mr-2 h-4 w-4" />Export PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-muted/50 group">
                    <div className="flex items-center gap-1">Package Name {renderSortIcon('name')}</div>
                </TableHead>
                <TableHead onClick={() => handleSort('price')} className="cursor-pointer hover:bg-muted/50 group">
                    <div className="flex items-center gap-1">Price {renderSortIcon('price')}</div>
                </TableHead>
                <TableHead>Targeted Seller Roles</TableHead>
                <TableHead onClick={() => handleSort('is_active')} className="cursor-pointer hover:bg-muted/50 group">
                    <div className="flex items-center gap-1">Status {renderSortIcon('is_active')}</div>
                </TableHead>
                <TableHead onClick={() => handleSort('created_at')} className="cursor-pointer hover:bg-muted/50 group hidden md:table-cell">
                    <div className="flex items-center gap-1">Created At {renderSortIcon('created_at')}</div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPackages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No packages found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">
                        <Button 
                            variant="link" 
                            className="p-0 h-auto text-primary hover:underline"
                            onClick={() => handleEditClick(pkg)}
                        >
                            {pkg.name}
                        </Button>
                        {pkg.description && <p className="text-xs text-muted-foreground max-w-xs truncate">{pkg.description}</p>}
                    </TableCell>
                    <TableCell>
                      {formatPrice(pkg.price, pkg.billing_interval)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {pkg.applicable_seller_roles.map(role => (
                          <Badge key={role} variant="secondary" className="text-xs whitespace-nowrap">
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
                     <TableCell className="hidden md:table-cell">
                        {format(parseISO(pkg.created_at), "PP")}
                        <p className="text-xs text-muted-foreground">Updated: {format(parseISO(pkg.updated_at), "PP")}</p>
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
                          <DropdownMenuItem onClick={() => handleEditClick(pkg)}>
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
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages > 0 ? totalPages : 1} ({processedPackages.length} total packages)
            </span>
            <div className="flex items-center gap-2">
                <Select
                    value={String(itemsPerPage)}
                    onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}
                >
                    <SelectTrigger className="w-[80px] h-9"><SelectValue placeholder={String(itemsPerPage)} /></SelectTrigger>
                    <SelectContent>{[5, 10, 20, 50].map(size => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">items per page</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} variant="outline" size="sm">Previous</Button>
              <Button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddPackageSheet 
        isOpen={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        onPackageAdded={handlePackageAdded}
      />

      <EditPackageSheet
        isOpen={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        packageToEdit={editingPackage}
        onPackageUpdated={handlePackageUpdated}
      />
    </div>
  );
}
