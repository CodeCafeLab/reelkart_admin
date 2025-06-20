
"use client";

import React, { useState, useEffect } from "react";
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
import { AlertCircle, CheckCircle, Clock, Server, User, DollarSign, Hash, CalendarDays, ArrowRightLeft, Info } from "lucide-react";
import type { LogEntry, ThirdPartyService, LogStatus } from "@/types/logs";

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
  }, [isoDateString, fullFormatFn, initialFormatFn]);

  return <>{formattedDate}</>;
}


interface LogEntryDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  logEntry: LogEntry | null;
  formatCurrency: (amount: number | null | undefined) => string;
  formatDateForDisplay: (dateString: string) => string;
  initialFormatDateForDisplay: (dateString: string) => string;
  serviceIconMap: Record<ThirdPartyService, React.ElementType>;
  statusIconMap: Record<LogStatus, React.ElementType>;
  statusVariantMap: Record<LogStatus, "default" | "secondary" | "destructive" | "outline">;
}

export function LogEntryDetailsSheet({
  isOpen,
  onOpenChange,
  logEntry,
  formatCurrency,
  formatDateForDisplay,
  initialFormatDateForDisplay,
  serviceIconMap,
  statusIconMap,
  statusVariantMap,
}: LogEntryDetailsSheetProps) {
  if (!logEntry) {
    return null;
  }

  const ServiceIcon = serviceIconMap[logEntry.service] || Server;
  const StatusIcon = statusIconMap[logEntry.status] || AlertCircle;
  const currentStatusVariant = statusVariantMap[logEntry.status];

  const renderDetailItem = (label: string, value: React.ReactNode, icon?: React.ElementType) => {
    const IconComponent = icon || Info;
    return (
      <div className="flex items-start gap-3">
        <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="font-medium text-sm">{value || "N/A"}</div>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-[95vw] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            <ServiceIcon className="h-6 w-6 text-primary" />
            Log Entry Details
          </SheetTitle>
          <SheetDescription>
            Viewing full details for Log ID: <span className="font-medium text-primary">{logEntry.id}</span>
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-grow">
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-lg font-medium text-foreground mb-1">Core Information</h4>
              <Separator className="mb-3"/>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                {renderDetailItem("Timestamp", 
                    <ClientFormattedDateTime 
                        isoDateString={logEntry.timestamp}
                        fullFormatFn={formatDateForDisplay}
                        initialFormatFn={initialFormatDateForDisplay}
                    />, CalendarDays)}
                {renderDetailItem("Service", logEntry.service, ServiceIcon)}
                {renderDetailItem("Event", logEntry.event, Info)}
                {renderDetailItem("User ID", logEntry.userId || "N/A", User)}
                {renderDetailItem("Cost", formatCurrency(logEntry.cost), DollarSign)}
                {renderDetailItem("Status", 
                  <Badge variant={currentStatusVariant} className={logEntry.status === "Success" ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                    <StatusIcon className="mr-1.5 h-3 w-3" /> {logEntry.status}
                  </Badge>, 
                StatusIcon)}
                {renderDetailItem("Duration", `${logEntry.durationMs || 0} ms`, Clock)}
                {renderDetailItem("IP Address", logEntry.ipAddress, Info)}
                {renderDetailItem("Correlation ID", logEntry.correlationId, ArrowRightLeft)}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-medium text-foreground mb-1">Detailed Information</h4>
              <Separator className="mb-3"/>
              <div className="bg-muted/50 p-4 rounded-md border">
                {typeof logEntry.details === 'string' && (
                  <p className="text-sm whitespace-pre-wrap">{logEntry.details}</p>
                )}
                {typeof logEntry.details === 'object' && logEntry.details !== null && (
                  <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(logEntry.details, null, 2)}
                  </pre>
                )}
                {(logEntry.details === null || logEntry.details === undefined) && (
                  <p className="text-sm text-muted-foreground italic">No detailed information provided.</p>
                )}
              </div>
            </div>
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

