"use client";
    
import { StatCard } from "@/components/dashboard/StatCard";
import { ExampleChart } from "@/components/dashboard/ExampleChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, ShieldCheck, Film, Truck, BrainCircuit, Activity, UserMinus, DollarSign, PlayCircle } from "lucide-react";
import { useTranslations } from "next-intl";

const topSellers = [
  { id: "seller1", name: "Chic Boutique", itemsSold: 1204, revenue: "₹5,50,200" },
  { id: "seller2", name: "Gadget Hub", itemsSold: 980, revenue: "₹12,30,000" },
  { id: "seller3", name: "Home Decor Inc.", itemsSold: 750, revenue: "₹3,10,500" },
  { id: "seller4", name: "Book Worm Store", itemsSold: 620, revenue: "₹95,000" },
];

export default function DashboardPage() {
  const t = useTranslations('DashboardPage');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">{t('title')}</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard title={t('kycPending')} value="75" icon={ShieldCheck} description="+5 from yesterday" />
        <StatCard title={t('activeSellers')} value="1,280" icon={Users} description="+20 this week" />
        <StatCard title={t('avgWatchTime')} value="2m 35s" icon={PlayCircle} description="Per active user daily" />
        <StatCard title={t('contentQueue')} value="212" icon={Film} description="Videos awaiting review" />
        <StatCard title={t('ordersShipped')} value="850" icon={Truck} description="Last 24 hours" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ExampleChart />
        
        <Card>
          <CardHeader>
            <CardTitle>{t('platformAnalyticsTitle')}</CardTitle>
            <CardDescription>{t('platformAnalyticsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <StatCard title={t('totalGMV')} value="₹1.25 Cr" icon={DollarSign} description="This month" className="shadow-none border"/>
            <StatCard title={t('bounceRate')} value="35.2%" icon={UserMinus} description="-2.1% from last month" className="shadow-none border"/>
            <StatCard title={t('aiLogEvents')} value="15,602" icon={BrainCircuit} description="Last 7 days" className="shadow-none border"/>
            <StatCard title={t('activeUsers')} value="25.4k" icon={Activity} description="Daily average" className="shadow-none border"/>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('topSellersTitle')}</CardTitle>
          <CardDescription>{t('topSellersDescription')}</CardDescription>
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
