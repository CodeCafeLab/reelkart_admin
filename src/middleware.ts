
import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from '@/i18n'; // Changed from './i18n'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always' 
});

export const config = {
  // Match only internationalized pathnames
  // Skip middleware for Next.js assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
