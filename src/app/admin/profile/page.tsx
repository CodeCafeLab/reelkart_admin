import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Edit3 } from "lucide-react";

export default function ProfilePage() {
  // Mock data for admin profile
  const adminProfile = {
    name: "Alex Johnson",
    email: "alex.johnson@reelview.com",
    role: "SuperAdmin",
    joinDate: "2023-01-15",
    avatarUrl: "https://placehold.co/200x200.png?text=AJ",
    lastLogin: new Date().toLocaleString(),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Admin Profile</h1>
      
      <Card className="overflow-hidden">
        <div className="bg-muted/30 p-6 md:p-8">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
              <AvatarImage src={adminProfile.avatarUrl} alt={adminProfile.name} data-ai-hint="profile picture" />
              <AvatarFallback className="text-4xl">{adminProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold font-headline">{adminProfile.name}</h2>
              <p className="text-muted-foreground">{adminProfile.email}</p>
              <p className="text-sm text-primary font-medium">{adminProfile.role}</p>
            </div>
            <Button variant="outline" size="icon" className="ml-auto hidden md:inline-flex">
              <Edit3 className="h-4 w-4" />
              <span className="sr-only">Edit Profile</span>
            </Button>
          </div>
        </div>
        
        <CardContent className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Personal Information</h3>
            <Separator className="mb-4"/>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="profile-name">Full Name</Label>
                <Input id="profile-name" defaultValue={adminProfile.name} readOnly className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="profile-email">Email Address</Label>
                <Input id="profile-email" type="email" defaultValue={adminProfile.email} readOnly className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="profile-role">Role</Label>
                <Input id="profile-role" defaultValue={adminProfile.role} readOnly className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="profile-join-date">Member Since</Label>
                <Input id="profile-join-date" defaultValue={adminProfile.joinDate} readOnly className="mt-1"/>
              </div>
            </div>
             <Button variant="outline" className="mt-4 md:hidden w-full">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Activity</h3>
            <Separator className="mb-4"/>
            <div className="space-y-2 text-sm">
                <p><span className="font-medium text-muted-foreground">Last Login:</span> {adminProfile.lastLogin}</p>
                <p><span className="font-medium text-muted-foreground">Recent Actions:</span> Viewed Dashboard, Approved 2 KYCs.</p>
            </div>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}
