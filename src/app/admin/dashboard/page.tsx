
"use client";
    
import { StatCard } from "@/components/dashboard/StatCard";
import { ExampleChart } from "@/components/dashboard/ExampleChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, ShieldCheck, Film, Truck, BrainCircuit, Activity, UserMinus, DollarSign, PlayCircle } from "lucide-react";
import { useAppSettings } from "@/contexts/AppSettingsContext";

const topSellersData = [
  { id: "seller1", name: "Chic Boutique", itemsSold: 1204, revenueAmount: 550200 },
  { id: "seller2", name: "Gadget Hub", itemsSold: 980, revenueAmount: 1230000 },
  { id: "seller3", name: "Home Decor Inc.", itemsSold: 750, revenueAmount: 310500 },
  { id: "seller4", name: "Book Worm Store", itemsSold: 620, revenueAmount: 95000 },
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


export default function DashboardPage() {
  const { settings: appSettings } = useAppSettings();

  const totalGMVAmount = 12500000; // 1.25 Cr

  const topSellers = topSellersData.map(seller => ({
      ...seller,
      revenue: formatIndianCurrency(seller.revenueAmount, appSettings.currencySymbol, appSettings.currencyCode)
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard title="KYC Pending" value="75" icon={ShieldCheck} description="+5 from yesterday" />
        <StatCard title="Active Sellers" value="1,280" icon={Users} description="+20 this week" />
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
          <CardTitle>Top Sellers</CardTitle>
          <CardDescription>Sellers with highest performance this month.</CardDescription>
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
              {topSellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell className="font-medium">{seller.name}</TableCell>
                  <TableCell className="text-right">{seller.itemsSold}</TableCell>
                  <TableCell className="text-right">{seller.revenue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
