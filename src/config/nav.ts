
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, ShieldCheck, Film, Truck, BrainCircuit, FilePieChart, Settings, LogOut, UserCircle, UserCog, Package } from 'lucide-react';

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
  { label: 'Sellers Management', href: '/admin/sellers', icon: Users },
  { label: 'Content Management', href: '/admin/content', icon: Film },
  { label: 'Orders Management', href: '/admin/logistics', icon: Truck },
  { label: 'Package Management', href: '/admin/packages', icon: Package },
  { label: 'Third Party Usage Logs', href: '/admin/ai-logs', icon: BrainCircuit },
  { label: 'Reports & Issues', href: '/admin/reports', icon: FilePieChart },
];

export const bottomNavItems: NavItem[] = [
  { label: 'Admin Users', href: '/admin/admin-users', icon: UserCog },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Profile', href: '/admin/profile', icon: UserCircle },
  { label: 'Logout', href: '/login', icon: LogOut },
];

