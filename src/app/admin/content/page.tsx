import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, ThumbsUp, ThumbsDown, Flag, Video, FileText } from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const contentItems = [
  { id: "vid001", type: "Video", title: "Amazing Product Demo", uploader: "SellerStore A", date: "2024-07-18", status: "Pending" },
  { id: "dsc001", type: "Description", title: "Handcrafted Leather Wallet", uploader: "ArtisanGoods", date: "2024-07-17", status: "Approved" },
  { id: "vid002", type: "Video", title: "Unboxing New Gadget", uploader: "TechGuru", date: "2024-07-16", status: "Rejected", reason: "Copyright Claim" },
  { id: "dsc002", type: "Description", title: "Organic Green Tea", uploader: "HealthyLiving", date: "2024-07-19", status: "Pending" },
  { id: "vid003", type: "Video", title: "DIY Home Decor Ideas", uploader: "CreativeHome", date: "2024-07-15", status: "Approved" },
];

type ContentStatus = "Pending" | "Approved" | "Rejected";

const statusVariant: Record<ContentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline",
  Approved: "default",
  Rejected: "destructive",
};

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Content Moderation</h1>
      <p className="text-muted-foreground">Review and moderate user-generated content.</p>

      <Tabs defaultValue="videos">
        <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="descriptions">Descriptions</TabsTrigger>
        </TabsList>
        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Video Moderation Queue</CardTitle>
              <CardDescription>Review videos uploaded by sellers.</CardDescription>
            </CardHeader>
            <CardContent>
              <VideoContentTable items={contentItems.filter(item => item.type === "Video")} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="descriptions">
          <Card>
            <CardHeader>
              <CardTitle>Description Moderation Queue</CardTitle>
              <CardDescription>Review product descriptions submitted by sellers.</CardDescription>
            </CardHeader>
            <CardContent>
              <ContentTable items={contentItems.filter(item => item.type === "Description")} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


function VideoContentTable({ items }: { items: typeof contentItems }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Thumbnail</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Uploader</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <Image 
                src={`https://placehold.co/100x75.png`} 
                alt={item.title} 
                width={100} 
                height={75} 
                className="rounded-md object-cover"
                data-ai-hint="video thumbnail" 
              />
            </TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.uploader}</TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[item.status as ContentStatus]}>
                {item.status}
              </Badge>
              {item.status === "Rejected" && item.reason && (
                <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
              )}
            </TableCell>
            <TableCell className="text-right">
              <ContentActions item={item} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


function ContentTable({ items }: { items: typeof contentItems }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Uploader</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              {item.type === "Video" ? <Video className="h-4 w-4 text-muted-foreground inline mr-1" /> : <FileText className="h-4 w-4 text-muted-foreground inline mr-1" />}
              {item.type}
            </TableCell>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell>{item.uploader}</TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[item.status as ContentStatus]}>
                {item.status}
              </Badge>
              {item.status === "Rejected" && item.reason && (
                <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
              )}
            </TableCell>
            <TableCell className="text-right">
             <ContentActions item={item} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function ContentActions({ item }: { item: typeof contentItems[0] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Eye className="mr-2 h-4 w-4" /> View Content
        </DropdownMenuItem>
        {item.status === "Pending" && (
          <>
            <DropdownMenuItem className="text-green-600 focus:text-green-700 focus:bg-green-50">
              <ThumbsUp className="mr-2 h-4 w-4" /> Approve
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-50">
              <ThumbsDown className="mr-2 h-4 w-4" /> Reject
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem>
          <Flag className="mr-2 h-4 w-4" /> Flag Content
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
