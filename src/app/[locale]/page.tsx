import { redirect } from 'next/navigation';

// The [locale] segment is handled by middleware.
// This page now effectively acts as the root for each locale.
export default function LocaleRootPage() {
  redirect('login'); // Redirects to /<locale>/login
  return null; 
}
