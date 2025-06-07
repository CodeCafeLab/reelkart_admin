
import { AppLayoutClient } from '@/components/layout/AppLayoutClient';
import type { Metadata } from 'next';
import { AppSettingsProvider } from '@/contexts/AppSettingsContext';

// import { getTranslator } from 'next-intl/server'; // If you need to translate metadata

// export async function generateMetadata({params: {locale}}): Promise<Metadata> {
//   const t = await getTranslator(locale, 'NavItems'); // Assuming you have a namespace for this
//   return {
//     title: t('adminPanelTitle') || 'ReelView Admin Panel', // Example
//     description: 'Manage ReelKart operations.',
//   };
// }

export const metadata: Metadata = {
    title: 'ReelView Admin Panel',
    description: 'Manage ReelKart operations.',
};


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (<AppSettingsProvider><AppLayoutClient>{children}</AppLayoutClient></AppSettingsProvider>);
}
