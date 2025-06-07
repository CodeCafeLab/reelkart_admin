
import { AppLayoutClient } from '@/components/layout/AppLayoutClient';
import type { Metadata } from 'next';
// AppSettingsProvider import removed, it will be provided by the non-localized admin layout if that's the primary entry.

// import { getTranslator } from 'next-intl/server'; // If you need to translate metadata

// export async function generateMetadata({params: {locale}}): Promise<Metadata> {
//   const t = await getTranslator(locale, 'NavItems'); // Assuming you have a namespace for this
//   return {
//     title: t('adminPanelTitle') || 'ReelKart Admin Panel', // Example
//     description: 'Manage ReelKart operations.',
//   };
// }

export const metadata: Metadata = {
    title: 'ReelKart Admin Panel', // Ensured consistency
    description: 'Manage ReelKart operations.',
};


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // AppSettingsProvider removed from here. If localized admin pages need it independently,
  // and are not nested under the non-localized admin layout, it might need to be re-added.
  // However, given the current error, the non-localized path is the active one requiring the provider.
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
