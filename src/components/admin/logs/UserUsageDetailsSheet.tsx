
"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, DollarSign, Hash, Activity, Server } from "lucide-react";
import type { LogEntry, ThirdPartyService, LogStatus } from "@/types/logs";
import { StatCard } from "@/components/dashboard/StatCard";

// Helper component for client-side date formatting
function ClientFormattedDateTime({ 
  isoDateString, 
  fullFormatFn, 
  initialFormatFn 
}: { 
  isoDateString: string;
  fullFormatFn: (dateStr: string) => string;
  initialFormatFn: (dateStr: string) => string;
}) {
  const [formattedDate, setFormattedDate] = useState(() => initialFormatFn(isoDateString));

  useEffect(() => {
    setFormattedDate(fullFormatFn(isoDateString));
  }, [isoDateString, fullFormatFn, initialFormatFn]); // Added initialFormatFn to dependencies

  return <>{formattedDate}</>;
}


interface UserUsageDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  userId: string | null;
  allLogs: LogEntry[];
  formatCurrency: (amount: number | null | undefined) => string;
  serviceIconMap: Record<ThirdPartyService, React.ElementType>;
  statusIconMap: Record<LogStatus, React.ElementType>;
  statusVariantMap: Record<LogStatus, "default" | "secondary" | "destructive" | "outline">;
  formatDateForDisplay: (dateString: string) => string; // Full format "PPpp"
  initialFormatDateForDisplay: (dateString: string) => string; // Initial format "PP"
}

interface UserAggregatedStats {
  totalRequests: number;
  totalCost: number;
  servicesUsed: Set<ThirdPartyService>;
}

interface PerServiceUserStats {
  service: ThirdPartyService;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: number;
}

export function UserUsageDetailsSheet({
  isOpen,
  onOpenChange,
  userId,
  allLogs,
  formatCurrency,
  serviceIconMap,
  statusIconMap,
  statusVariantMap,
  formatDateForDisplay, // This is the full "PPpp" formatter
  initialFormatDateForDisplay, // This is the "PP" formatter
}: UserUsageDetailsSheetProps) {
  const userLogs = useMemo(() => {
    if (!userId) return [];
    return allLogs.filter(log => log.userId === userId);
  }, [allLogs, userId]);

  const userAggregatedStats = useMemo((): UserAggregatedStats => {
    const stats: UserAggregatedStats = {
      totalRequests: 0,
      totalCost: 0,
      servicesUsed: new Set(),
    };
    userLogs.forEach(log => {
      stats.totalRequests++;
      stats.totalCost += log.cost || 0;
      stats.servicesUsed.add(log.service);
    });
    return stats;
  }, [userLogs]);

  const perServiceUserStats = useMemo((): PerServiceUserStats[] => {
    const statsMap: Map<ThirdPartyService, PerServiceUserStats> = new Map();
    userLogs.forEach(log => {
      if (!statsMap.has(log.service)) {
        statsMap.set(log.service, {
          service: log.service,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          totalCost: 0,
        });
      }
      const serviceStat = statsMap.get(log.service)!;
      serviceStat.totalRequests++;
      serviceStat.totalCost += log.cost || 0;
      if (log.status === "Success") serviceStat.successfulRequests++;
      if (log.status === "Failed") serviceStat.failedRequests++;
    });
    return Array.from(statsMap.values());
  }, [userLogs]);

  const recentUserLogs = useMemo(() => {
    return userLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Show latest 10 logs for this user
  }, [userLogs]);

  if (!userId) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-[95vw] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            User Usage Details
          </SheetTitle>
          <SheetDescription>
            Viewing usage for User ID: <span className="font-medium text-primary">{userId}</span>
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow">
          <div className="p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Summary for {userId}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Total Requests" value={userAggregatedStats.totalRequests.toLocaleString()} icon={Hash} />
                <StatCard title="Total Est. Cost" value={formatCurrency(userAggregatedStats.totalCost)} icon={DollarSign} />
                <StatCard title="Services Used" value={userAggregatedStats.servicesUsed.size} icon={Activity} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage by Service</CardTitle>
                <CardDescription>Breakdown of API calls and costs per third-party service for this user.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {perServiceUserStats.length > 0 ? perServiceUserStats.map(stat => {
                  const ServiceIcon = serviceIconMap[stat.service] || Server;
                  return (
                    <Card key={stat.service} className="shadow-md border">
                      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-md font-medium flex items-center gap-2">
                          <ServiceIcon className="h-5 w-5 text-muted-foreground" />
                          {stat.service}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm pt-2">
                        <p>Requests: <span className="font-semibold">{stat.totalRequests}</span></p>
                        <p>Successful: <span className="font-semibold text-green-600">{stat.successfulRequests}</span></p>
                        <p>Failed: <span className="font-semibold text-red-600">{stat.failedRequests}</span></p>
                        <p>Est. Cost: <span className="font-semibold">{formatCurrency(stat.totalCost)}</span></p>
                      </CardContent>
                    </Card>
                  );
                }) : (
                    <p className="text-muted-foreground text-sm">No service usage recorded for this user.</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Last 10 log entries for this user.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentUserLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Timestamp</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUserLogs.map(log => {
                      const ServiceIcon = serviceIconMap[log.service] || Server;
                      const StatusIcon = statusIconMap[log.status];
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs">
                             <ClientFormattedDateTime 
                                isoDateString={log.timestamp} 
                                fullFormatFn={formatDateForDisplay}
                                initialFormatFn={initialFormatDateForDisplay}
                              />
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-1.5">
                              <ServiceIcon className="h-4 w-4 text-muted-foreground" />
                              {log.service}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs max-w-[150px] truncate" title={log.event}>{log.event}</TableCell>
                          <TableCell className="text-xs text-right">{formatCurrency(log.cost)}</TableCell>
                          <TableCell className="text-xs">
                            <Badge variant={statusVariantMap[log.status]} className={log.status === "Success" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {log.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                ) : (
                    <p className="text-muted-foreground text-sm">No recent activity found for this user.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
        
        <SheetFooter className="p-6 pt-4 border-t mt-auto">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

