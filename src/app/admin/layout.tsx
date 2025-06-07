
import { AppLayoutClient } from '@/components/layout/AppLayoutClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ReelKart Admin Panel',
    description: 'Manage ReelKart operations.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
