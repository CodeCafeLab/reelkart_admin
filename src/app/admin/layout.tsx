
import { AppLayoutClient } from '@/components/layout/AppLayoutClient';
import type { Metadata } from 'next';
import { AppSettingsProvider } from '@/contexts/AppSettingsContext';

export const metadata: Metadata = {
    title: 'ReelKart Admin Panel',
    description: 'Manage ReelKart operations.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppSettingsProvider>
      <AppLayoutClient>{children}</AppLayoutClient>
    </AppSettingsProvider>
  );
}
