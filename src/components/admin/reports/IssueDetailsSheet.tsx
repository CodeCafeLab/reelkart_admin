
"use client";

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
import { CalendarDays, User, AlertTriangle, Tag, MessageSquare, UserCheck, CheckCircle, Info } from "lucide-react";
import type { Issue, IssueStatus } from "@/app/admin/reports/page";
import { format, parseISO } from 'date-fns';

interface IssueDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  issue: Issue | null;
}

const statusVariantMap: Record<IssueStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Open: "destructive",
  "In Progress": "secondary",
  Resolved: "default",
  Closed: "outline",
};

const priorityVariantMap: Record<NonNullable<Issue['priority']>, "destructive" | "secondary" | "default" | "outline"> = {
    Critical: "destructive",
    High: "destructive", // can be same as critical or slightly different
    Medium: "secondary",
    Low: "outline",
};

export function IssueDetailsSheet({
  isOpen,
  onOpenChange,
  issue,
}: IssueDetailsSheetProps) {
  if (!issue) {
    return null;
  }

  const currentStatusVariant = statusVariantMap[issue.status];
  const currentPriorityVariant = issue.priority ? priorityVariantMap[issue.priority] : "outline";


  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "PPpp"); 
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString; // fallback
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-primary" />
            Issue Details
          </SheetTitle>
          <SheetDescription>
            Viewing details for Issue ID: <span className="font-medium text-primary">{issue.id}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-md font-medium text-foreground mb-2">Issue Summary</h4>
            <p className="text-sm bg-muted/30 p-3 rounded-md border">{issue.summary}</p>
          </div>
          
          {issue.description && (
            <div>
              <h4 className="text-md font-medium text-foreground mb-2">Full Description</h4>
              <p className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-md border leading-relaxed">{issue.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Details</h3>
            <Separator className="mb-3"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Reporter</p>
                  <p className="font-medium">{issue.reporter}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium">{issue.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Reported Date</p>
                  <p className="font-medium">{formatDate(issue.date)}</p>
                </div>
              </div>
               <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <Badge variant={currentPriorityVariant}>
                    {issue.priority || "N/A"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={currentStatusVariant}
                         className={issue.status === 'Resolved' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                    {issue.status}
                  </Badge>
                </div>
              </div>
               {issue.assignedTo && (
                <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <div>
                    <p className="text-xs text-muted-foreground">Assigned To</p>
                    <p className="font-medium">{issue.assignedTo}</p>
                    </div>
                </div>
              )}
            </div>
          </div>

          {issue.resolution && (
            <div>
              <h3 className="text-lg font-medium text-foreground mb-1">Resolution Details</h3>
              <Separator className="mb-3"/>
              <div className="text-sm bg-green-500/10 p-3 rounded-md border border-green-500/30">
                <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="whitespace-pre-wrap leading-relaxed">{issue.resolution}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Placeholder for comments - Future Enhancement
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Comments</h3>
            <Separator className="mb-3"/>
            <div className="space-y-3 text-sm">
                <div className="bg-muted/30 p-2 rounded-md border">
                    <p className="font-semibold text-xs">DevTeamA <span className="text-muted-foreground font-normal">- 2 days ago</span></p>
                    <p>Looking into this now. Seems to be Safari specific.</p>
                </div>
                 <div className="bg-muted/30 p-2 rounded-md border">
                    <p className="font-semibold text-xs">UserX123 <span className="text-muted-foreground font-normal">- 1 day ago</span></p>
                    <p>Thanks for the update!</p>
                </div>
            </div>
          </div>
          */}
        </div>

        <SheetFooter className="p-6 pt-4 border-t mt-auto">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
