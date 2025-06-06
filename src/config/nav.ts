import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, ShieldCheck, Film, Truck, BrainCircuit, FilePieChart, Settings, LogOut } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  isChained?: boolean;
  subItems?: NavItem[];
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'KYC Management', href: '/admin/kyc', icon: ShieldCheck },
  { label: 'Seller Onboarding', href: '/admin/sellers', icon: Users },
  { label: 'Content Moderation', href: '/admin/content', icon: Film },
  { label: 'Order Logistics', href: '/admin/logistics', icon: Truck },
  { label: 'AI Usage Logs', href: '/admin/ai-logs', icon: BrainCircuit },
  { label: 'Reports & Issues', href: '/admin/reports', icon: FilePieChart },
];

export const bottomNavItems: NavItem[] = [
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Logout', href: '/login', icon: LogOut }, // Should be an action, but href for now
];
