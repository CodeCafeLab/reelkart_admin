import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, ShieldCheck, Film, Truck, BrainCircuit, FilePieChart, Settings, LogOut, UserCircle } from 'lucide-react';

// NavItem labels are now keys for translation
export interface NavItem {
  labelKey: string; // Changed from 'label' to 'labelKey'
  href: string;
  icon: LucideIcon;
  isChained?: boolean;
  subItems?: NavItem[];
}

export const navItems: NavItem[] = [
  { labelKey: 'NavItems.dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { labelKey: 'NavItems.kycManagement', href: '/admin/kyc', icon: ShieldCheck },
  { labelKey: 'NavItems.sellerOnboarding', href: '/admin/sellers', icon: Users },
  { labelKey: 'NavItems.contentModeration', href: '/admin/content', icon: Film },
  { labelKey: 'NavItems.orderLogistics', href: '/admin/logistics', icon: Truck },
  { labelKey: 'NavItems.aiUsageLogs', href: '/admin/ai-logs', icon: BrainCircuit },
  { labelKey: 'NavItems.reportsIssues', href: '/admin/reports', icon: FilePieChart },
];

export const bottomNavItems: NavItem[] = [
  { labelKey: 'NavItems.settings', href: '/admin/settings', icon: Settings },
  // Profile nav item can be added here if needed, or kept in user dropdown
  // { labelKey: 'NavItems.profile', href: '/admin/profile', icon: UserCircle }, 
  { labelKey: 'NavItems.logout', href: '/login', icon: LogOut },
];
