
"use client";
    
import { useState, useMemo } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ExampleChart } from "@/components/dashboard/ExampleChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, ShieldCheck, Film, Truck, BrainCircuit, Activity, UserMinus, DollarSign, PlayCircle, Search as SearchIcon } from "lucide-react";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const topSellersData = [
  { id: "seller1", name: "Chic Boutique", itemsSold: 1204, revenueAmount: 550200 },
  { id: "seller2", name: "Gadget Hub", itemsSold: 980, revenueAmount: 1230000 },
  { id: "seller3", name: "Home Decor Inc.", itemsSold: 750, revenueAmount: 310500 },
  { id: "seller4", name: "Book Worm Store", itemsSold: 620, revenueAmount: 95000 },
  { id: "seller5", name: "Alpha Retailers", itemsSold: 1500, revenueAmount: 750000 },
  { id: "seller6", name: "Beta Goods", itemsSold: 800, revenueAmount: 400000 },
  { id: "seller7", name: "Gamma Services", itemsSold: 1100, revenueAmount: 650000 },
  { id: "seller8", name: "Delta Supplies", itemsSold: 450, revenueAmount: 150000 },
  { id: "seller9", name: "Epsilon Finds", itemsSold: 180, revenueAmount: 60000 },
];

// Helper for formatting large numbers into Indian numbering system (Lakhs, Crores)
const formatIndianCurrency = (amount: number, symbol: string, code: string): string => {
    if (code === "INR") {
        if (amount >= 10000000) { // 1 Crore
        return `${symbol}${(amount / 10000000).toFixed(2)} Cr`;
        }
        if (amount >= 100000) { // 1 Lakh
        return `${symbol}${(amount / 100000).toFixed(2)} L`;
        }
    }
    // Fallback for other currencies or smaller INR amounts
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: code, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

type ItemsSoldFilter = "all" | "high" | "medium" | "low";

export default function DashboardPage() {
  const { settings: appSettings } = useAppSettings();
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsSoldFilter, setItemsSoldFilter] = useState<ItemsSoldFilter>("all");

  const totalGMVAmount = 12500000; // 1.25 Cr

  const filteredTopSellers = useMemo(() => {
    let sellers = topSellersData.map(seller => ({
        ...seller,
        revenue: formatIndianCurrency(seller.revenueAmount, appSettings.currencySymbol, appSettings.currencyCode)
    }));

    // Apply items sold filter
    if (itemsSoldFilter !== "all") {
      sellers = sellers.filter(seller => {
        if (itemsSoldFilter === "high") return seller.itemsSold >= 1000;
        if (itemsSoldFilter === "medium") return seller.itemsSold >= 500 && seller.itemsSold < 1000;
        if (itemsSoldFilter === "low") return seller.itemsSold < 500;
        return true;
      });
    }

    // Apply search term filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      sellers = sellers.filter(seller => 
        seller.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        String(seller.itemsSold).includes(lowerCaseSearchTerm) || 
        seller.revenue.toLowerCase().includes(lowerCaseSearchTerm) 
      );
    }
    return sellers;
  }, [searchTerm, itemsSoldFilter, appSettings.currencySymbol, appSettings.currencyCode]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Active Sellers" value="1,280" icon={Users} description="+20 this week" />
        <StatCard title="Active Buyers" value="3,450" icon={Users} description="+50 today" />
        <StatCard title="KYC Pending" value="75" icon={ShieldCheck} description="+5 from yesterday" />
        <StatCard title="Avg Watch Time" value="2m 35s" icon={PlayCircle} description="Per active user daily" />
        <StatCard title="Content Queue" value="212" icon={Film} description="Videos awaiting review" />
        <StatCard title="Orders Shipped" value="850" icon={Truck} description="Last 24 hours" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ExampleChart currencySymbol={appSettings.currencySymbol} currencyCode={appSettings.currencyCode} />
        
        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <StatCard 
                title="Total GMV" 
                value={formatIndianCurrency(totalGMVAmount, appSettings.currencySymbol, appSettings.currencyCode)} 
                icon={DollarSign} 
                description="This month" 
                className="shadow-none border"/>
            <StatCard title="Bounce Rate" value="35.2%" icon={UserMinus} description="-2.1% from last month" className="shadow-none border"/>
            <StatCard title="AI Log Events" value="15,602" icon={BrainCircuit} description="Last 7 days" className="shadow-none border"/>
            <StatCard title="Active Users" value="25.4k" icon={Activity} description="Daily average" className="shadow-none border"/>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Top Sellers</CardTitle>
              <CardDescription>Sellers with highest performance this month.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-56">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search"
                  placeholder="Search sellers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <Select value={itemsSoldFilter} onValueChange={(value) => setItemsSoldFilter(value as ItemsSoldFilter)}>
                <SelectTrigger className="w-full sm:w-[200px] h-9"> {/* Increased width for filter text */}
                  <SelectValue placeholder="Filter by items sold..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sellers</SelectItem>
                  <SelectItem value="high">High Sellers (&gt;=1000 items)</SelectItem>
                  <SelectItem value="medium">Medium Sellers (500-999 items)</SelectItem>
                  <SelectItem value="low">Emerging (&lt;500 items)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller Name</TableHead>
                <TableHead className="text-right">Items Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTopSellers.length > 0 ? (
                filteredTopSellers.map((seller) => (
                  <TableRow key={seller.id}>
                    <TableCell className="font-medium">{seller.name}</TableCell>
                    <TableCell className="text-right">{seller.itemsSold}</TableCell>
                    <TableCell className="text-right">{seller.revenue}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                    No sellers found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

