
"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Edit3, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

// Mock data for admin profile
const adminProfileData = {
  name: "Alex Johnson",
  email: "alex.johnson@reelview.com",
  role: "SuperAdmin",
  joinDate: "2023-01-15",
  avatarUrl: "https://placehold.co/200x200.png?text=AJ",
};

// Same hardcoded password as login for mock verification
const HARDCODED_CURRENT_PASSWORD = "password123";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters long."),
  confirmPassword: z.string().min(1, "Please confirm your new password."),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New password and confirm password do not match.",
  path: ["confirmPassword"],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ProfilePage() {
  const [lastLogin, setLastLogin] = useState<string>("Loading...");
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);

  useEffect(() => {
    setLastLogin(new Date().toLocaleString());
  }, []);

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = async (data: ChangePasswordFormValues) => {
    setIsPasswordChanging(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    if (data.currentPassword !== HARDCODED_CURRENT_PASSWORD) {
      passwordForm.setError("currentPassword", {
        type: "manual",
        message: "Incorrect current password. Please try again.",
      });
      toast({
        title: "Password Change Failed",
        description: "Incorrect current password.",
        variant: "destructive",
      });
    } else {
      // In a real app, you'd send this to your backend to securely change the password.
      console.log("Mock Password Change Data:", { newPassword: data.newPassword });
      toast({
        title: "Password Changed (Mock)",
        description: "Your password has been successfully updated (simulated).",
      });
      passwordForm.reset();
    }
    setIsPasswordChanging(false);
  };

  return (
    <div className="space-y-8"> {/* Increased spacing between cards */}
      <h1 className="text-3xl font-bold font-headline">Admin Profile</h1>
      
      <Card className="overflow-hidden">
        <div className="bg-muted/30 p-6 md:p-8">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
              <AvatarImage src={adminProfileData.avatarUrl} alt={adminProfileData.name} data-ai-hint="profile picture" />
              <AvatarFallback className="text-4xl">{adminProfileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold font-headline">{adminProfileData.name}</h2>
              <p className="text-muted-foreground">{adminProfileData.email}</p>
              <p className="text-sm text-primary font-medium">{adminProfileData.role}</p>
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
                <Input id="profile-name" defaultValue={adminProfileData.name} readOnly className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="profile-email">Email Address</Label>
                <Input id="profile-email" type="email" defaultValue={adminProfileData.email} readOnly className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="profile-role">Role</Label>
                <Input id="profile-role" defaultValue={adminProfileData.role} readOnly className="mt-1"/>
              </div>
              <div>
                <Label htmlFor="profile-join-date">Member Since</Label>
                <Input id="profile-join-date" defaultValue={adminProfileData.joinDate} readOnly className="mt-1"/>
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
                <p><span className="font-medium text-muted-foreground">Last Login:</span> {lastLogin}</p>
                <p><span className="font-medium text-muted-foreground">Recent Actions:</span> Viewed Dashboard, Approved 2 KYCs.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your login password. Ensure it's strong and unique.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter your current password"
                          {...field}
                          disabled={isPasswordChanging}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
                          aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                          disabled={isPasswordChanging}
                        >
                          {showCurrentPassword ? <EyeOff /> : <Eye />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password (min. 8 characters)"
                          {...field}
                          disabled={isPasswordChanging}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
                          aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                          disabled={isPasswordChanging}
                        >
                          {showNewPassword ? <EyeOff /> : <Eye />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                       <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter new password"
                          {...field}
                          disabled={isPasswordChanging}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
                          aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                          disabled={isPasswordChanging}
                        >
                          {showConfirmPassword ? <EyeOff /> : <Eye />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full sm:w-auto" disabled={isPasswordChanging}>
                {isPasswordChanging ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
