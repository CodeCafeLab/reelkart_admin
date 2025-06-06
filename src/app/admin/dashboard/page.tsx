
import { StatCard } from "@/components/dashboard/StatCard";
import { ExampleChart } from "@/components/dashboard/ExampleChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck, Film, Truck, BrainCircuit, Activity, UserMinus, DollarSign, PlayCircle } from "lucide-react";

const topSellers = [
  { id: "seller1", name: "Chic Boutique", itemsSold: 1204, revenue: "₹5,50,200" },
  { id: "seller2", name: "Gadget Hub", itemsSold: 980, revenue: "₹12,30,000" },
  { id: "seller3", name: "Home Decor Inc.", itemsSold: 750, revenue: "₹3,10,500" },
  { id: "seller4", name: "Book Worm Store", itemsSold: 620, revenue: "₹95,000" },
];

export default function DashboardPage() {
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
        <ExampleChart /> {/* GMV Analytics */}
        
        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <StatCard title="Total GMV" value="₹1.25 Cr" icon={DollarSign} description="This month" className="shadow-none border"/>
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
