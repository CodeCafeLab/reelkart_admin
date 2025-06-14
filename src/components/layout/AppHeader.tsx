
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { SidebarTrigger } from "@/components/ui/sidebar"; // Import SidebarTrigger
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Bell, Settings, UserCircle, Palette, Sun, Moon, Search, X, Info, AlertTriangle, ShoppingCart, MessageSquare } from "lucide-react";
import { useTheme, type Theme } from "@/contexts/ThemeContext";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  icon: React.ElementType;
  iconColor?: string;
  title: string;
  time: string;
  read?: boolean;
}

const mockNotifications: NotificationItem[] = [
  { id: "n1", icon: ShoppingCart, title: "New order #ORD7891 received", time: "5m ago", iconColor: "text-blue-500" },
  { id: "n2", icon: MessageSquare, title: "Message from SellerX: Stock inquiry", time: "1h ago", read: true },
  { id: "n3", icon: AlertTriangle, title: "Payment failed for order #ORD7880", time: "3h ago", iconColor: "text-red-500" },
  { id: "n4", icon: Info, title: "System update scheduled for 2 AM", time: "1d ago", read: true, iconColor: "text-green-500" },
];

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Black & White", icon: Moon },
  ];

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      console.log("Performing search for:", searchQuery);
      // Actual search functionality would be implemented here
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 sm:gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
      {/* Desktop Sidebar Toggle Button */}
      <div className="hidden md:flex items-center">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        {/* Can add breadcrumbs or page title here */}
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="relative flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={toggleSearch}
            aria-expanded={isSearchOpen}
            aria-label={isSearchOpen ? "Close search bar" : "Open search bar"}
          >
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>
          <div
            className={cn(
              "flex items-center transition-all duration-300 ease-in-out",
              isSearchOpen ? "w-40 sm:w-56 ml-2 opacity-100" : "w-0 ml-0 opacity-0 pointer-events-none"
            )}
          >
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search..."
              className={cn(
                "h-9 rounded-full bg-muted/50 focus-visible:ring-primary text-sm",
                isSearchOpen ? "px-3 py-1 border-border" : "p-0 border-none"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit();
                }
                if (e.key === 'Escape') {
                  toggleSearch();
                }
              }}
              aria-hidden={!isSearchOpen}
              tabIndex={isSearchOpen ? 0 : -1}
            />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Palette className="h-5 w-5" />
              <span className="sr-only">Select Theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
              {themeOptions.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value} className="cursor-pointer">
                  <option.icon className="mr-2 h-4 w-4" />
                  <span>{option.label}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              {mockNotifications.filter(n => !n.read).length > 0 && (
                 <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {mockNotifications.filter(n => !n.read).length}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {mockNotifications.length === 0 ? (
              <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
            ) : (
              mockNotifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className={cn("flex items-start gap-3 p-3", !notification.read && "bg-accent/10")}>
                  <notification.icon className={cn("h-5 w-5 mt-0.5 shrink-0", notification.iconColor || "text-muted-foreground")} />
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                  {!notification.read && <span className="h-2 w-2 rounded-full bg-primary self-center"></span>}
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm text-primary hover:!text-primary cursor-pointer">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/100x100.png" alt="Admin" data-ai-hint="user avatar"/>
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings"> 
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
               <Link href="/admin/profile"> 
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">Logout</Link> 
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
