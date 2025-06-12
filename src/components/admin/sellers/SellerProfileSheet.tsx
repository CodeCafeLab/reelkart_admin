
"use client";

import NextImage from "next/image"; // Renamed to avoid conflict with local Image
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Package, BarChart2, DollarSign, Star as StarIconLucide, AlertTriangle, Tag, FileText, Globe, Banknote, UserCheck, XCircle, UserX, CheckCircle, Edit2, Save } from "lucide-react";
import { format, parseISO } from 'date-fns';
import type { SellerRole } from "@/types/seller-package";
import type { Seller as SellerData, SellerLoginLog } from "@/app/admin/sellers/page"; // Import Seller type from page
import { StarRatingDisplay } from "@/components/ui/StarRatingDisplay";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


interface SellerProfileSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  seller: SellerData | null;
  onOpenImagePopup: (imageUrl: string) => void;
  onApprove: (sellerId: string) => void;
  onReject: (sellerId: string) => void; 
  onSuspend: (sellerId: string) => void; 
  onReactivate: (sellerId: string) => void;
  onUpdateRating: (sellerId: string, newRating: number) => void;
}

const statusVariant: Record<SellerData['status'], "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default",
  Rejected: "destructive",
};

const loginStatusVariant: Record<SellerLoginLog['status'], "default" | "secondary" | "destructive" | "outline"> = {
  Success: "default",
  Failed: "destructive",
  Attempt: "secondary",
};

const loginStatusIcon: Record<SellerLoginLog['status'], React.ElementType> = {
    Success: CheckCircle,
    Failed: XCircle,
    Attempt: AlertTriangle,
};

export function SellerProfileSheet({
  isOpen,
  onOpenChange,
  seller,
  onOpenImagePopup,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  onUpdateRating,
}: SellerProfileSheetProps) {
  const { toast } = useToast();
  const [editableRating, setEditableRating] = useState<string>("");

  useEffect(() => {
    if (seller && seller.averageRating !== null && seller.averageRating !== undefined) {
      setEditableRating(seller.averageRating.toFixed(1));
    } else if (seller) {
      setEditableRating(""); // For sellers with no rating yet or null
    }
  }, [seller]);

  if (!seller) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "PP");
    } catch (error) {
      return format(new Date(dateString), "PP");
    }
  };
  
  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "PPpp");
    } catch (error) {
      return format(new Date(dateString), "PPpp");
    }
  };

  const currentStatusVariant = statusVariant[seller.status];

  const formatSellerType = (type: SellerRole) => {
    return type.replace(/([A-Z])/g, ' $1').trim();
  };

  const getSocialIcon = (platform: SellerData['socialMediaProfiles'][0]['platform']) => {
    switch (platform) {
      case 'Instagram': return <NextImage src="/icons/instagram.svg" alt="Instagram" width={16} height={16} data-ai-hint="instagram logo"/>; 
      case 'Facebook': return <NextImage src="/icons/facebook.svg" alt="Facebook" width={16} height={16} data-ai-hint="facebook logo"/>;
      case 'Twitter': return <NextImage src="/icons/twitter.svg" alt="Twitter" width={16} height={16} data-ai-hint="twitter logo"/>;
      case 'YouTube': return <NextImage src="/icons/youtube.svg" alt="YouTube" width={16} height={16} data-ai-hint="youtube logo"/>;
      case 'LinkedIn': return <NextImage src="/icons/linkedin.svg" alt="LinkedIn" width={16} height={16} data-ai-hint="linkedin logo"/>;
      default: return <Globe className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleSaveRating = () => {
    const newRatingNum = parseFloat(editableRating);
    if (isNaN(newRatingNum) || newRatingNum < 0 || newRatingNum > 5) {
      toast({
        title: "Invalid Rating",
        description: "Please enter a number between 0.0 and 5.0.",
        variant: "destructive",
      });
      return;
    }
    onUpdateRating(seller.id, newRatingNum);
  };


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-[95vw] overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-4 mb-2">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={`https://placehold.co/128x128.png?text=${seller.businessName.charAt(0)}`} alt={seller.businessName} data-ai-hint="company logo" />
              <AvatarFallback className="text-2xl">{seller.businessName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-2xl font-semibold">{seller.businessName}</SheetTitle>
              <SheetDescription>
                Contact Person: {seller.name}
              </SheetDescription>
              <p className="text-sm text-muted-foreground">Seller ID: {seller.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Status:</span>
                <Badge
                    variant={currentStatusVariant}
                    className={seller.status === 'Approved' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                >
                    {seller.status}
                </Badge>
            </div>
            <div className="flex items-center gap-1">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline">{formatSellerType(seller.sellerType)}</Badge>
            </div>
             <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Joined:</span>
                <span>{formatDate(seller.joinedDate)}</span>
            </div>
            <div className="flex items-center gap-1">
                <StarIconLucide className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Rating:</span>
                <StarRatingDisplay rating={seller.averageRating} starSize="h-3.5 w-3.5" />
            </div>
          </div>
           {seller.status === "Rejected" && seller.rejectionReason && (
             <div className="mt-2 flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-medium">Reason for Rejection/Suspension:</p>
                    <p>{seller.rejectionReason}</p>
                </div>
             </div>
           )}
        </SheetHeader>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Contact Information</h3>
            <Separator className="mb-3"/>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground"/> {seller.email || "N/A"}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/> {seller.phone || "N/A"}</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground"/> 123 Business Rd, Seller City, India (mock)</p>
            </div>
          </div>

          {seller.socialMediaProfiles && seller.socialMediaProfiles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Social Media Profiles</h3>
              <Separator className="mb-3"/>
              <div className="space-y-2 text-sm">
                {seller.socialMediaProfiles.map((profile, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {getSocialIcon(profile.platform)}
                    <a href={profile.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                      {profile.link}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {seller.bankAccountDetails && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Bank Account Details</h3>
              <Separator className="mb-3"/>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm bg-muted/50 p-3 rounded-md border">
                <p><span className="font-medium text-muted-foreground">Holder:</span> {seller.bankAccountDetails.accountHolderName}</p>
                <p><span className="font-medium text-muted-foreground">Account No:</span> {seller.bankAccountDetails.accountNumber}</p>
                <p><span className="font-medium text-muted-foreground">IFSC:</span> {seller.bankAccountDetails.ifscCode}</p>
                <p><span className="font-medium text-muted-foreground">Bank:</span> {seller.bankAccountDetails.bankName}</p>
                {seller.bankAccountDetails.branchName && <p><span className="font-medium text-muted-foreground">Branch:</span> {seller.bankAccountDetails.branchName}</p>}
              </div>
            </div>
          )}

          {seller.verificationDocuments && seller.verificationDocuments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Verification Documents</h3>
              <Separator className="mb-3"/>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {seller.verificationDocuments.map((doc, index) => (
                  <div key={index} className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <FileText className="w-4 h-4"/>
                      {doc.name}
                    </p>
                    <div
                      className="relative aspect-[16/10] w-full rounded-md overflow-hidden border border-muted cursor-pointer hover:opacity-80 transition-opacity bg-muted/30"
                      onClick={() => onOpenImagePopup(doc.url)}
                    >
                      <NextImage
                        src={doc.url}
                        alt={doc.name}
                        layout="fill"
                        objectFit="contain" 
                        className="rounded-md p-1"
                        data-ai-hint={doc.aiHint}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Manage Rating</h3>
            <Separator className="mb-3"/>
            <div className="space-y-3 p-3 border rounded-md bg-muted/30">
              <div className="flex items-center gap-2">
                <Label htmlFor="seller-rating-input" className="text-sm font-medium">Current Rating:</Label>
                <StarRatingDisplay rating={seller.averageRating} />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <Label htmlFor="seller-rating-input" className="text-xs text-muted-foreground">New Rating (0.0 - 5.0)</Label>
                  <Input
                    id="seller-rating-input"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={editableRating}
                    onChange={(e) => setEditableRating(e.target.value)}
                    className="h-9"
                  />
                </div>
                <Button onClick={handleSaveRating} size="sm" className="h-9">
                  <Save className="mr-2 h-4 w-4" /> Update Rating
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Recent Login Activity</h3>
            <Separator className="mb-3"/>
            {seller.loginLogs && seller.loginLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Timestamp</TableHead>
                      <TableHead className="whitespace-nowrap">IP Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="whitespace-nowrap">User Agent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seller.loginLogs.slice(0, 5).map((log) => {
                      const StatusIcon = loginStatusIcon[log.status];
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs whitespace-nowrap">{formatDateTime(log.timestamp)}</TableCell>
                          <TableCell className="text-xs">{log.ipAddress}</TableCell>
                          <TableCell>
                            <Badge 
                                variant={loginStatusVariant[log.status]}
                                className={log.status === 'Success' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}
                            >
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs truncate max-w-[150px] sm:max-w-[200px]" title={log.userAgent || undefined}>
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

        <SheetFooter className="p-6 pt-4 mt-6 border-t flex flex-col sm:flex-row sm:justify-between gap-2">
           <SheetClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">Close</Button>
          </SheetClose>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {seller.status === "Pending" && (
                <>
                <Button onClick={() => onApprove(seller.id)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                    <UserCheck className="mr-2 h-4 w-4" /> Approve Application
                </Button>
                <Button variant="destructive" onClick={() => onReject(seller.id)} className="w-full sm:w-auto">
                    <XCircle className="mr-2 h-4 w-4" /> Decline Application
                </Button>
                </>
            )}
            {seller.status === "Approved" && (
                <Button variant="destructive" onClick={() => onSuspend(seller.id)} className="w-full sm:w-auto">
                    <UserX className="mr-2 h-4 w-4" /> Suspend Seller Role
                </Button>
            )}
            {seller.status === "Rejected" && (
                 <Button onClick={() => onReactivate(seller.id)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                    <UserCheck className="mr-2 h-4 w-4" /> Re-Approve Application
                </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

