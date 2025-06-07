
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Bell, Settings, UserCircle, Palette, Sun, Moon, Paintbrush } from "lucide-react";
import Link from "next/link";
import { useTheme, type Theme } from "@/contexts/ThemeContext";
import React from "react";

export function AppHeader() {
  const { theme, setTheme } = useTheme();

  const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Black & White", icon: Moon },
    { value: "custom-purple", label: "Deep Purple", icon: Paintbrush },
    { value: "blue-gradient", label: "Blue Gradient", icon: Palette },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        {/* Can add breadcrumbs or page title here */}
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Palette className="h-5 w-5" />
              <span className="sr-only">Change Theme</span>
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

        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/100x100.png" alt="Admin" data-ai-hint="user avatar" />
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
               <Link href="/admin/profile"> {/* Assuming a profile page might exist */}
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
