
"use client";

import * as React from "react";
import { usePathname } from 'next/navigation'; // Using next/navigation
import Link from 'next/link'; // Using next/link

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons/Logo";
import { AppHeader } from "./AppHeader";
import type { NavItem } from "@/config/nav";
import { navItems, bottomNavItems } from "@/config/nav";
import { Shield } from "lucide-react"; // Import the icon to be used when collapsed

interface AppLayoutClientProps {
  children: React.ReactNode;
}

export function AppLayoutClient({ children }: AppLayoutClientProps) {
  const pathname = usePathname(); 

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      const isActive = item.href === '/admin/dashboard'
        ? pathname === item.href
        : pathname.startsWith(item.href);

      return (
        <SidebarMenuItem key={item.label}>
          <Link href={item.href} passHref legacyBehavior> 
            <SidebarMenuButton
              isActive={isActive}
              tooltip={item.label} // Add tooltip with the item label
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
          {item.subItems && (
            <SidebarMenuSub>
              {item.subItems.map((subItem) => (
                <SidebarMenuSubItem key={subItem.label}>
                  <Link href={subItem.href} passHref legacyBehavior> 
                    <SidebarMenuSubButton 
                      isActive={pathname === subItem.href}
                      // Tooltips for sub-items might be less common or handled differently,
                      // but can be added if needed: tooltip={subItem.label}
                    >
                      <subItem.icon />
                      <span>{subItem.label}</span>
                    </SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    });
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <div className="group-data-[collapsible=icon]:hidden">
             <Logo />
          </div>
          <div className="hidden group-data-[collapsible=icon]:block text-center py-1"> {/* Adjusted padding for icon */}
            <Shield className="h-7 w-7 text-primary inline-block" /> {/* Icon for collapsed state */}
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-1 p-2">
          <SidebarMenu>{renderNavItems(navItems)}</SidebarMenu>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter className="p-2">
          <SidebarMenu>{renderNavItems(bottomNavItems)}</SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
