
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Cog, Puzzle, Truck, Share2, AlertTriangle, Save, Settings as SettingsIcon, ShieldCheck, ListChecks } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useToast } from "@/hooks/use-toast";
import type { SellerRole } from "@/types/seller-package";
import { SELLER_ROLES } from "@/types/seller-package";
import { Separator } from "@/components/ui/separator";


export default function SettingsPage() {
  const { settings: appSettings, setSettings: setAppSettings } = useAppSettings();
  const { toast } = useToast();

  // General Settings
  const [platformName, setPlatformName] = React.useState("ReelKart Admin");
  const [logoUrl, setLogoUrl] = React.useState("");
  const [autoApproveSellers, setAutoApproveSellers] = React.useState(false);
  
  // KYC Settings
  const [autoApproveKYCGlobal, setAutoApproveKYCGlobal] = React.useState(false); 
  const initialSellerKycSettings = SELLER_ROLES.reduce((acc, role) => {
    acc[role] = true; // Default to true, meaning auto-approve if global is on
    return acc;
  }, {} as Record<SellerRole, boolean>);
  const [kycSettingsBySellerType, setKycSettingsBySellerType] = useState<Record<SellerRole, boolean>>(initialSellerKycSettings);

  const [currencyCode, setCurrencyCode] = React.useState(appSettings.currencyCode);
  const [currencySymbol, setCurrencySymbol] = React.useState(appSettings.currencySymbol);
  
  // Commissions Settings
  const [defaultCommission, setDefaultCommission] = React.useState("15");
  
  // Integrations Settings
  const [openaiApiKey, setOpenaiApiKey] = React.useState("");
  const [runwayMlApiKey, setRunwayMlApiKey] = React.useState("");
  const [smsApiKey, setSmsApiKey] = React.useState("");
  const [smsSenderId, setSmsSenderId] = React.useState("");

  // Delivery Settings
  const [defaultDeliveryPartner, setDefaultDeliveryPartner] = React.useState("");
  const [deliveryPartnerApiKey, setDeliveryPartnerApiKey] = React.useState("");

  // Social Links Settings
  const [facebookUrl, setFacebookUrl] = React.useState("");
  const [instagramUrl, setInstagramUrl] = React.useState("");
  const [twitterUrl, setTwitterUrl] = React.useState("");
  const [youtubeUrl, setYoutubeUrl] = React.useState("");
  
  // Maintenance Settings
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);

  React.useEffect(() => {
    setCurrencyCode(appSettings.currencyCode);
    setCurrencySymbol(appSettings.currencySymbol);
  }, [appSettings]);

  const handleSellerTypeKycChange = (role: SellerRole, checked: boolean) => {
    setKycSettingsBySellerType(prev => ({ ...prev, [role]: checked }));
  };

  const handleSaveSettings = (category: string) => {
    let settingsToSave: any = {};
    let toastMessage = `${category} settings saved!`;

    if (category === "General") {
      settingsToSave = { 
        platformName, 
        logoUrl, 
        autoApproveSellers, 
        autoApproveKYCGlobal, 
        kycSettingsBySellerType: autoApproveKYCGlobal ? kycSettingsBySellerType : "Global KYC Auto-Approval is OFF",
        currencyCode, 
        currencySymbol 
      };
      setAppSettings({ currencyCode, currencySymbol });
      toastMessage = "General settings (including currency & KYC approvals) saved!";
    } else if (category === "Commissions") {
      settingsToSave = { defaultCommission };
    } else if (category === "Integrations") {
      settingsToSave = { openaiApiKey, runwayMlApiKey, smsApiKey, smsSenderId };
    } else if (category === "Delivery") {
      settingsToSave = { defaultDeliveryPartner, deliveryPartnerApiKey };
    } else if (category === "Social Links") {
      settingsToSave = { facebookUrl, instagramUrl, twitterUrl, youtubeUrl };
    } else if (category === "Maintenance") {
      settingsToSave = { maintenanceMode };
    }
    
    console.log(`Saving settings for ${category}:`, settingsToSave);
    toast({
        title: "Settings Updated (Local)",
        description: `${toastMessage} (Data logged to console, not persisted.)`,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline flex items-center"><SettingsIcon className="mr-3 h-8 w-8"/>Platform Settings</h1>
      <p className="text-muted-foreground">
        Manage various configurations for your admin panel and platform.
      </p>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex items-center justify-start w-full overflow-x-auto">
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
              <CardDescription>Basic platform, currency, and approval configurations.</CardDescription>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency-code">Default Currency Code (e.g., INR, USD)</Label>
                  <Input id="currency-code" value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())} placeholder="INR" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency-symbol">Currency Display Symbol (e.g., ₹, $)</Label>
                  <Input id="currency-symbol" value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} placeholder="₹" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="auto-approve-sellers" className="font-medium">Automatic Seller Approval</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve new seller registrations.</p>
                </div>
                <Switch id="auto-approve-sellers" checked={autoApproveSellers} onCheckedChange={setAutoApproveSellers} />
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-md font-medium mb-3 text-foreground flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary"/>KYC Approval Settings</h4>
                <div className="flex items-center justify-between rounded-lg border p-4 mb-4">
                  <div>
                    <Label htmlFor="auto-approve-kyc-global" className="font-medium">Enable Global Automatic KYC Approval</Label>
                    <p className="text-sm text-muted-foreground">Master switch to enable/disable auto KYC approval for all types.</p>
                  </div>
                  <Switch id="auto-approve-kyc-global" checked={autoApproveKYCGlobal} onCheckedChange={setAutoApproveKYCGlobal} />
                </div>

                {autoApproveKYCGlobal && (
                  <Card className="bg-muted/30 p-4">
                    <CardHeader className="p-0 pb-3">
                      <CardTitle className="text-base flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Customize by Seller Type</CardTitle>
                      <CardDescription className="text-sm">
                        Fine-tune automatic KYC approval for specific seller roles. These settings apply only if global auto-approval is enabled.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-3">
                      {SELLER_ROLES.map((role) => (
                        <div key={role} className="flex items-center justify-between rounded-md border bg-background p-3 shadow-sm">
                          <Label htmlFor={`kyc-type-${role}`} className="text-sm font-normal">
                            {role.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <Switch
                            id={`kyc-type-${role}`}
                            checked={kycSettingsBySellerType[role] ?? true} // Default to true if undefined
                            onCheckedChange={(checked) => handleSellerTypeKycChange(role, checked)}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
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
                <Input id="sms-sender-id" value={smsSenderId} onChange={(e) => setSmsSenderId(e.target.value)} placeholder="e.g., REELKART" />
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

