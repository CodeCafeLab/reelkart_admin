
"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from '@/lib/next-intl-navigation-proxy'; // Changed import

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
import { cn } from "@/lib/utils";

interface AppLayoutClientProps {
  children: React.ReactNode;
}

export function AppLayoutClient({ children }: AppLayoutClientProps) {
  const pathname = usePathname(); 
  const t = useTranslations();

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      const translatedLabel = t(item.labelKey);

      const isActive = item.href === '/admin/dashboard'
        ? pathname === item.href
        : pathname.startsWith(item.href);

      return (
        <SidebarMenuItem key={item.labelKey}>
          <Link href={item.href} passHref legacyBehavior> 
            <SidebarMenuButton
              isActive={isActive}
              tooltip={{ children: translatedLabel, className: "bg-primary text-primary-foreground" }}
            >
              <item.icon />
              <span>{translatedLabel}</span>
            </SidebarMenuButton>
          </Link>
          {item.subItems && (
            <SidebarMenuSub>
              {item.subItems.map((subItem) => {
                const translatedSubLabel = t(subItem.labelKey);
                return (
                  <SidebarMenuSubItem key={subItem.labelKey}>
                    <Link href={subItem.href} passHref legacyBehavior> 
                      <SidebarMenuSubButton isActive={pathname === subItem.href}>
                        <subItem.icon />
                        <span>{translatedSubLabel}</span>
                      </SidebarMenuSubButton>
                    </Link>
                  </SidebarMenuSubItem>
                );
              })}
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
          <div className="hidden group-data-[collapsible=icon]:block">
            <Logo className="h-6 w-6 text-sidebar-foreground" />
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
