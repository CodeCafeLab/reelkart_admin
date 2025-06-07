
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'hi'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  let messages;
  try {
    // This path is relative to the `src` directory, assuming i18n.ts is in src/
    // and messages are in src/messages/
    messages = (await import(`./messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`[i18n.ts] Failed to load messages for locale "${locale}":`, error);
    // It's important to trigger a notFound() if messages can't be loaded.
    notFound();
  }

  return {
    messages
  };
});
