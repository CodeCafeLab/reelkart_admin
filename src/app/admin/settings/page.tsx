import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Settings</h1>
      <p className="text-muted-foreground">Manage your account and platform settings.</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Admin User" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="admin@reelview.com" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="2fa-enable" />
              <Label htmlFor="2fa-enable">Enable Two-Factor Authentication</Label>
            </div>
            <Button>Update Password</Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
            <CardDescription>Configure general platform settings (SuperAdmin only).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance-mode" className="font-medium">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Put the platform in maintenance mode.</p>
              </div>
              <Switch id="maintenance-mode" />
            </div>
             <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="new-seller-approval" className="font-medium">Automatic Seller Approval</Label>
                <p className="text-sm text-muted-foreground">Automatically approve new seller registrations.</p>
              </div>
              <Switch id="new-seller-approval" defaultChecked={false} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="default-commission">Default Seller Commission (%)</Label>
              <Input id="default-commission" type="number" defaultValue="15" className="max-w-xs" />
            </div>
            <Button>Save Platform Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
