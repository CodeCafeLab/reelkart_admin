
"use client";

import NextImage from "next/image";
import React, { useState, useEffect } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CheckCircle, XCircle, Film, FileText, User, CalendarDays, AlertTriangle, ThumbsUp, ThumbsDown, Flag, MessageSquare, Send as SendIcon, Bot, Loader2, Clock, ChevronDown, Trash2, Tag, DollarSign, Archive, Power, Gavel } from "lucide-react";
import type { ContentItem, ContentStatus, AdminComment } from "@/types/content-moderation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { generateFakeComment, type GenerateFakeCommentInput } from '@/ai/flows/generate-fake-comment';


interface ContentDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contentItem: ContentItem | null;
  onApprove: (itemId: string) => void;
  onReject: (itemId: string) => void;
  onFlag: (itemId: string) => void;
  onViewBids: (item: ContentItem) => void;
  onToggleVisibility: (itemId: string, newVisibility: boolean) => void;
  formatWatchTime: (seconds: number | undefined) => string;
  formatCurrency: (amount: number | null | undefined) => string;
}

const statusVariant: Record<ContentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default",
  Rejected: "destructive",
};

export function ContentDetailsSheet({
  isOpen,
  onOpenChange,
  contentItem,
  onApprove,
  onReject,
  onFlag,
  onViewBids,
  onToggleVisibility,
  formatWatchTime,
  formatCurrency,
}: ContentDetailsSheetProps) {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [isAiCommenting, setIsAiCommenting] = useState(false);
  const [comments, setComments] = useState<AdminComment[]>([]);

  useEffect(() => {
    if (contentItem?.adminComments) {
      setComments(contentItem.adminComments);
    } else {
      setComments([]);
    }
  }, [contentItem]);

  if (!contentItem) {
    return null;
  }

  const currentStatusVariant = statusVariant[contentItem.status];

  const handleAddComment = () => {
    if (newComment.trim() === "") {
      toast({ title: "Cannot add empty comment", variant: "destructive" });
      return;
    }
    const newCommentObject: AdminComment = {
      id: `cmt_${Date.now()}`,
      adminName: "CurrentAdmin",
      text: newComment,
      timestamp: new Date().toISOString(),
    };
    setComments(prevComments => [...prevComments, newCommentObject]);
    toast({ title: "Comment Added (Local)", description: "Your comment has been added to this view." });
    setNewComment("");
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm("Are you sure you want to delete this comment? This is a local action.")) {
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      toast({
        title: "Comment Deleted (Local)",
        description: `Comment ${commentId} has been removed from this view.`,
        variant: "destructive"
      });
    }
  };
  
  const handleAiComment = async (sentiment: 'positive' | 'negative') => {
    if (!contentItem) return;
    setIsAiCommenting(true);

    try {
        const input: GenerateFakeCommentInput = {
            contentTitle: contentItem.title,
            contentDescription: contentItem.descriptionText || "A video about " + contentItem.title,
            sentiment: sentiment,
        };
        const result = await generateFakeComment(input);
        if (result && result.comment && result.username) {
            setNewComment(`@${result.username}: ${result.comment}`);
            toast({
                title: "AI Comment Generated",
                description: `A ${sentiment} comment has been generated and placed in the text area.`,
            });
        } else {
            throw new Error("AI did not return a valid comment.");
        }
    } catch (error) {
        console.error("Error generating AI comment:", error);
        toast({
            title: "AI Comment Failed",
            description: "Could not generate a comment. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsAiCommenting(false);
    }
  };


  const formatDateForDisplay = (dateString: string) => {
    try {
        return format(parseISO(dateString), "PPpp");
    } catch(e) {
        return dateString;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-[95vw] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b sticky top-0 bg-background z-10">
          <SheetTitle className="text-2xl font-semibold flex items-center gap-2">
            {contentItem.type === "Video" ? <Film className="h-6 w-6 text-primary" /> : <FileText className="h-6 w-6 text-primary" />}
            {contentItem.title}
          </SheetTitle>
          <SheetDescription>
            Details for content ID: <span className="font-medium text-primary">{contentItem.id}</span>
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-grow">
          <div className="p-6 space-y-6">
            {contentItem.type === "Video" && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Video Preview</h3>
                 <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-black">
                  {contentItem.videoUrl ? (
                      <video controls className="w-full h-full object-contain" poster={contentItem.thumbnailUrl} data-ai-hint="product video">
                          <source src={contentItem.videoUrl} type="video/mp4" />
                           <source src={contentItem.videoUrl} type="video/webm" />
                           <source src={contentItem.videoUrl} type="video/ogg" />
                          Your browser does not support the video tag.
                      </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <p>Video preview not available.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {contentItem.type === "Description" && contentItem.descriptionText && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Description Text</h3>
                <Card className="shadow-none border">
                  <CardContent className="p-4 text-sm bg-muted/30 rounded-md">
                    <p className="whitespace-pre-wrap">{contentItem.descriptionText}</p>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium text-foreground mb-1">Content Details</h3>
              <Separator className="mb-3"/>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Uploader</p>
                    <p className="font-medium">{contentItem.uploader} ({contentItem.uploaderType.replace(/([A-Z])/g, ' $1').trim()})</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDateForDisplay(contentItem.date)}</p>
                  </div>
                </div>
                 <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Avg. Watch Time</p>
                    <p className="font-medium">{formatWatchTime(contentItem.avgWatchTimeSeconds)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {contentItem.type === "Video" ? <Film className="h-4 w-4 text-muted-foreground" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                   <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-medium">{contentItem.type}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant={currentStatusVariant} className={contentItem.status === 'Approved' ? 'bg-green-500 hover:bg-green-600 text-white' : contentItem.status === 'Rejected' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}>
                          {contentItem.status}
                      </Badge>
                  </div>
                </div>
                {contentItem.status === "Rejected" && contentItem.reason && (
                  <div className="col-span-1 sm:col-span-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-xs text-destructive-foreground font-semibold">Rejection Reason:</p>
                    <p className="text-xs text-destructive-foreground/90">{contentItem.reason}</p>
                  </div>
                )}
                {contentItem.flagDetails && (
                  <div className="col-span-1 sm:col-span-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-md">
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Flagged: {contentItem.flagDetails.type}</p>
                    {contentItem.flagDetails.reason && <p className="text-xs text-amber-600 dark:text-amber-500">Reason: {contentItem.flagDetails.reason}</p>}
                    <p className="text-xs text-muted-foreground">Flagged At: {formatDateForDisplay(contentItem.flagDetails.flaggedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-foreground mb-1">Product Details</h3>
                <Separator className="mb-3"/>
                <Card className="bg-muted/30 border-dashed">
                    <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Category</p>
                                <p className="font-medium">{contentItem.category || "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Price</p>
                                <p className="font-medium">{contentItem.uploaderType === 'Celebrity' ? 'Auction (Bids)' : formatCurrency(contentItem.price)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Stock Quantity</p>
                                <p className="font-medium">{contentItem.stockQuantity ?? "N/A"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Power className="h-4 w-4 text-muted-foreground" />
                             <div className="flex items-center space-x-2">
                                <Switch
                                    id="visibility-toggle-sheet"
                                    checked={contentItem.isProductVisible}
                                    onCheckedChange={(checked) => onToggleVisibility(contentItem.id, checked)}
                                />
                                <Label htmlFor="visibility-toggle-sheet" className="font-medium">
                                    {contentItem.isProductVisible ? 'Visible' : 'Hidden'}
                                </Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-1 flex items-center gap-2"><MessageSquare className="h-5 w-5"/>Admin Reviews & Comments</h3>
              <Separator className="mb-3"/>
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <Card key={comment.id} className="shadow-none border">
                      <CardHeader className="p-3 pb-1 flex flex-row items-start justify-between">
                        <CardDescription className="text-xs">
                          <span className="font-semibold text-foreground">{comment.adminName}</span>
                          <span className="text-muted-foreground"> on {formatDateForDisplay(comment.timestamp)}</span>
                        </CardDescription>
                         <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteComment(comment.id)}
                            aria-label="Delete comment"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-sm">{comment.text}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No comments yet.</p>
                )}
                
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="new-comment" className="text-sm font-medium">Add New Comment (Mock)</Label>
                  <Textarea
                    id="new-comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your comment here or generate one with AI..."
                    className="min-h-[80px]"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Button onClick={handleAddComment} size="sm">
                      <SendIcon className="mr-2 h-4 w-4"/>Submit Comment
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" disabled={isAiCommenting}>
                          {isAiCommenting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                          ) : (
                            <Bot className="mr-2 h-4 w-4"/>
                          )}
                          <span>AI Comment</span>
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => handleAiComment('positive')} className="cursor-pointer">
                          <ThumbsUp className="mr-2 h-4 w-4 text-green-500" />
                          <span>Generate Positive</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleAiComment('negative')} className="cursor-pointer">
                          <ThumbsDown className="mr-2 h-4 w-4 text-red-500" />
                          <span>Generate Negative</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </ScrollArea>

        <SheetFooter className="p-6 pt-4 border-t sticky bottom-0 bg-background z-10 flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Close</Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {contentItem.uploaderType === 'Celebrity' && (
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => onViewBids(contentItem)}>
                      <Gavel className="mr-2 h-4 w-4" /> View Bids
                  </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => onFlag(contentItem.id)}
                className="w-full sm:w-auto"
                >
                <Flag className="mr-2 h-4 w-4" /> Flag Content
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => onReject(contentItem.id)}
                disabled={contentItem.status === "Rejected"}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white disabled:bg-red-600/50"
              >
                <ThumbsDown className="mr-2 h-4 w-4" /> Reject
              </Button>
              <Button 
                onClick={() => onApprove(contentItem.id)}
                disabled={contentItem.status === "Approved"}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white disabled:bg-green-600/50"
              >
                <ThumbsUp className="mr-2 h-4 w-4" /> Approve
              </Button>
            </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
