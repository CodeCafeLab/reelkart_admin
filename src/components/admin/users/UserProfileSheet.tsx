
"use client";

import NextImage from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, CalendarDays, UserCheck, UserX, CheckCircle, AlertTriangle, XCircle, ShieldCheck, ShieldAlert } from "lucide-react";
import { format, parseISO } from 'date-fns';
import type { User, UserStatus, UserLoginLog } from "@/types/user";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserProfileSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: User | null;
  onUpdateStatus: (userId: string, newStatus: UserStatus) => void;
}

const statusVariantMap: Record<UserStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Active: "default",
  Suspended: "destructive",
  PendingVerification: "secondary",
};

const loginStatusVariantMap: Record<UserLoginLog['status'], "default" | "secondary" | "destructive" | "outline"> = {
  Success: "default",
  Failed: "destructive",
  Attempt: "secondary",
};

const loginStatusIconMap: Record<UserLoginLog['status'], React.ElementType> = {
    Success: CheckCircle,
    Failed: XCircle,
    Attempt: AlertTriangle,
};

export function UserProfileSheet({
  isOpen,
  onOpenChange,
  user,
  onUpdateStatus,
}: UserProfileSheetProps) {
  if (!user) {
    return null;
  }

  const formatDate = (dateString: string | null | undefined, includeTime = true) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), includeTime ? "PPpp" : "PP");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const currentStatusVariant = statusVariantMap[user.status];
  const StatusIcon = user.status === "Active" ? UserCheck : user.status === "Suspended" ? UserX : AlertTriangle;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-[95vw] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-4 mb-2">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={user.profileImageUrl || `https://placehold.co/128x128.png?text=${user.name.charAt(0)}`} alt={user.name} data-ai-hint="profile avatar"/>
              <AvatarFallback className="text-2xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-2xl font-semibold">{user.name}</SheetTitle>
              <SheetDescription>User ID: {user.id}</SheetDescription>
              <div className="flex items-center gap-2 mt-1">
                <StatusIcon className={`h-4 w-4 ${user.status === 'Active' ? 'text-green-500' : user.status === 'Suspended' ? 'text-red-500' : 'text-yellow-500'}`} />
                <Badge variant={currentStatusVariant} className={user.status === 'Active' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
                  {user.status}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-grow">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Contact & Account Details</h3>
              <Separator className="mb-3"/>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground"/> {user.email}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/> {user.phone || "N/A"}</p>
                <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground"/> Joined: {formatDate(user.joinDate, false)}</p>
                <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground"/> Last Login: {formatDate(user.lastLogin)}</p>
                <div className="flex items-center gap-2">
                  {user.emailVerified ? <ShieldCheck className="h-4 w-4 text-green-500"/> : <ShieldAlert className="h-4 w-4 text-yellow-500"/>}
                  <span>Email Verified: {user.emailVerified ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Recent Login Activity</h3>
              <Separator className="mb-3"/>
              {user.loginLogs && user.loginLogs.length > 0 ? (
                <div className="overflow-x-auto max-h-60 border rounded-md">
                  <Table className="min-w-full">
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="whitespace-nowrap text-xs py-2">Timestamp</TableHead>
                        <TableHead className="whitespace-nowrap text-xs py-2">IP Address</TableHead>
                        <TableHead className="text-xs py-2">Status</TableHead>
                        <TableHead className="whitespace-nowrap text-xs py-2">User Agent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.loginLogs.slice(0, 10).map((log) => { // Show up to 10 recent logs
                        const LogStatusIcon = loginStatusIconMap[log.status];
                        return (
                          <TableRow key={log.id}>
                            <TableCell className="text-xs whitespace-nowrap py-1.5">{formatDate(log.timestamp)}</TableCell>
                            <TableCell className="text-xs py-1.5">{log.ipAddress}</TableCell>
                            <TableCell className="py-1.5">
                              <Badge 
                                  variant={loginStatusVariantMap[log.status]}
                                  className={`text-xs ${log.status === 'Success' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                              >
                                <LogStatusIcon className="mr-1 h-3 w-3" />
                                {log.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs truncate max-w-[150px] sm:max-w-[200px] py-1.5" title={log.userAgent || undefined}>
                              {log.userAgent || 'N/A'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent login activity recorded.</p>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <SheetFooter className="p-6 pt-4 border-t mt-auto flex flex-col sm:flex-row sm:justify-between gap-2">
           <SheetClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">Close</Button>
          </SheetClose>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {user.status === "Active" && (
                <Button variant="destructive" onClick={() => onUpdateStatus(user.id, "Suspended")} className="w-full sm:w-auto">
                    <UserX className="mr-2 h-4 w-4" /> Suspend User
                </Button>
            )}
            {user.status === "Suspended" && (
                 <Button onClick={() => onUpdateStatus(user.id, "Active")} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                    <UserCheck className="mr-2 h-4 w-4" /> Activate User
                </Button>
            )}
            {user.status === "PendingVerification" && (
                 <Button onClick={() => onUpdateStatus(user.id, "Active")} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                    <UserCheck className="mr-2 h-4 w-4" /> Manually Verify & Activate
                </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
