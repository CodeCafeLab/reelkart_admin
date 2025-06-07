
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Cog, Puzzle, Truck, Share2, AlertTriangle, Save } from "lucide-react";
import React from "react";

export default function SettingsPage() {
  // Mock states for settings - in a real app, these would come from a backend/context
  const [platformName, setPlatformName] = React.useState("ReelView Admin");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [autoApproveSellers, setAutoApproveSellers] = React.useState(false);
  const [defaultCommission, setDefaultCommission] = React.useState("15");
  
  const [openaiApiKey, setOpenaiApiKey] = React.useState("");
  const [runwayMlApiKey, setRunwayMlApiKey] = React.useState("");
  const [smsApiKey, setSmsApiKey] = React.useState("");
  const [smsSenderId, setSmsSenderId] = React.useState("");

  const [defaultDeliveryPartner, setDefaultDeliveryPartner] = React.useState("");
  const [deliveryPartnerApiKey, setDeliveryPartnerApiKey] = React.useState("");

  const [facebookUrl, setFacebookUrl] = React.useState("");
  const [instagramUrl, setInstagramUrl] = React.useState("");
  const [twitterUrl, setTwitterUrl] = React.useState("");
  const [youtubeUrl, setYoutubeUrl] = React.useState("");
  
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);

  const handleSaveSettings = (category: string) => {
    // Placeholder save function
    console.log(`Saving settings for ${category}:`, {
      ...(category === "General" && { platformName, logoUrl, autoApproveSellers }),
      ...(category === "Commissions" && { defaultCommission }),
      ...(category === "Integrations" && { openaiApiKey, runwayMlApiKey, smsApiKey, smsSenderId }),
      ...(category === "Delivery" && { defaultDeliveryPartner, deliveryPartnerApiKey }),
      ...(category === "Social Links" && { facebookUrl, instagramUrl, twitterUrl, youtubeUrl }),
      ...(category === "Maintenance" && { maintenanceMode }),
    });
    // Here you would typically make an API call to save the settings
    alert(`${category} settings saved (mock)! Check console for values.`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Platform Settings</h1>
      <p className="text-muted-foreground">
        Manage various configurations for your admin panel and platform.
      </p>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="general"><Cog className="mr-2 h-4 w-4 sm:hidden md:inline-block" />General</TabsTrigger>
          <TabsTrigger value="commissions"><DollarSign className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Commissions</TabsTrigger>
          <TabsTrigger value="integrations"><Puzzle className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Integrations</TabsTrigger>
          <TabsTrigger value="delivery"><Truck className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Delivery</TabsTrigger>
          <TabsTrigger value="social"><Share2 className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Social Links</TabsTrigger>
          <TabsTrigger value="maintenance"><AlertTriangle className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configurations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} placeholder="Your Platform Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo-url">Platform Logo URL</Label>
                <Input id="logo-url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="auto-approve-sellers" className="font-medium">Automatic Seller Approval</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve new seller registrations.</p>
                </div>
                <Switch id="auto-approve-sellers" checked={autoApproveSellers} onCheckedChange={setAutoApproveSellers} />
              </div>
              <Button onClick={() => handleSaveSettings("General")}><Save className="mr-2 h-4 w-4" />Save General Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Commission Settings</CardTitle>
              <CardDescription>Manage default commission rates for sellers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="default-commission">Default Seller Commission (%)</Label>
                <Input id="default-commission" type="number" value={defaultCommission} onChange={(e) => setDefaultCommission(e.target.value)} placeholder="e.g., 15" />
              </div>
              <Button onClick={() => handleSaveSettings("Commissions")}><Save className="mr-2 h-4 w-4" />Save Commission Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
              <CardDescription>Connect with external services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                <Input id="openai-api-key" type="password" value={openaiApiKey} onChange={(e) => setOpenaiApiKey(e.target.value)} placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxx" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="runwayml-api-key">RunwayML API Key</Label>
                <Input id="runwayml-api-key" type="password" value={runwayMlApiKey} onChange={(e) => setRunwayMlApiKey(e.target.value)} placeholder="RunwayML API Key" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sms-api-key">SMS Provider API Key</Label>
                <Input id="sms-api-key" type="password" value={smsApiKey} onChange={(e) => setSmsApiKey(e.target.value)} placeholder="SMS Provider API Key" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sms-sender-id">SMS Provider Sender ID</Label>
                <Input id="sms-sender-id" value={smsSenderId} onChange={(e) => setSmsSenderId(e.target.value)} placeholder="e.g., REELVW" />
              </div>
              <Button onClick={() => handleSaveSettings("Integrations")}><Save className="mr-2 h-4 w-4" />Save Integration Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Partner Configuration</CardTitle>
              <CardDescription>Set up your preferred delivery services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="delivery-partner">Default Delivery Partner</Label>
                <Select value={defaultDeliveryPartner} onValueChange={setDefaultDeliveryPartner}>
                  <SelectTrigger id="delivery-partner">
                    <SelectValue placeholder="Select a partner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delhivery">Delhivery</SelectItem>
                    <SelectItem value="shiprocket">Shiprocket</SelectItem>
                    <SelectItem value="bluedart">BlueDart</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-partner-apikey">Delivery Partner API Key</Label>
                <Input id="delivery-partner-apikey" type="password" value={deliveryPartnerApiKey} onChange={(e) => setDeliveryPartnerApiKey(e.target.value)} placeholder="API Key for selected partner" />
              </div>
              <Button onClick={() => handleSaveSettings("Delivery")}><Save className="mr-2 h-4 w-4" />Save Delivery Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Manage your platform's social media links.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="facebook-url">Facebook URL</Label>
                <Input id="facebook-url" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/yourpage" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram-url">Instagram URL</Label>
                <Input id="instagram-url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/yourprofile" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter-url">X (Twitter) URL</Label>
                <Input id="twitter-url" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://x.com/yourhandle" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <Input id="youtube-url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/yourchannel" />
              </div>
              <Button onClick={() => handleSaveSettings("Social Links")}><Save className="mr-2 h-4 w-4" />Save Social Links</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>Control platform access during maintenance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="maintenance-mode" className="font-medium">Enable Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, users will see a maintenance page. Admins can still access the panel.
                  </p>
                </div>
                <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
              <Button onClick={() => handleSaveSettings("Maintenance")}><Save className="mr-2 h-4 w-4" />Save Maintenance Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
