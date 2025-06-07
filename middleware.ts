
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n'; // Use path alias

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,

  // Used when no locale matches
  defaultLocale: defaultLocale,

  // If true, the locale prefix is always present in the URL (e.g., /en/about).
  // If false, the default locale does not have a prefix (e.g., /about for defaultLocale, /es/about for Spanish).
  localePrefix: 'as-needed', // or 'always' or 'never'
});

export const config = {
  // Match only internationalized pathnames
  // Skip all paths that should not be internationalized. This example skips paths
  // containing a word character (e.g. /api/, /_next/, /images/, etc.) before the matched path.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
