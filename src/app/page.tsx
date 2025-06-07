// This is a placeholder root page.
// The actual root page logic (redirect) has been moved to src/app/[locale]/page.tsx
// to support internationalized routing with next-intl.
import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n';

export default function RootPage() {
  // Redirect to the default locale's root page, which will then handle further redirection.
  redirect(`/${defaultLocale}`);
  return null; 
}
