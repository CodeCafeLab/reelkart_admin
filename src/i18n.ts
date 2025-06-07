
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'hi'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}) => {
  // Log the received locale and its type immediately
  console.log(`[i18n.ts] getRequestConfig called. Received locale: "${locale}" (type: ${typeof locale})`);

  // Validate that the incoming `locale` parameter is a valid string and is one of the supported locales
  if (typeof locale !== 'string' || !locales.includes(locale)) {
    console.error(`[i18n.ts] Invalid or undefined locale: "${locale}". Calling notFound().`);
    notFound(); // This should throw a special error that Next.js handles
    // The lines below should ideally not be reached if notFound() terminates execution.
    console.warn('[i18n.ts] Execution continued after notFound() call for invalid locale. This is unexpected.');
    return {messages: {}}; // Fallback
  }

  // At this point, locale is a validated string, e.g., 'en' or 'hi'
  const validLocale = locale as 'en' | 'hi'; // Type assertion after validation
  console.log(`[i18n.ts] Validated locale: "${validLocale}". Attempting to load messages.`);

  let messages;
  // For logging purposes, construct the path as before
  const importPathForLog = `./messages/${validLocale}.json`;
  console.log(`[i18n.ts] Constructed import path for logging: "${importPathForLog}"`);

  try {
    // Dynamically import the messages for the validated locale using a direct template literal
    messages = (await import(`./messages/${validLocale}.json`)).default;
    console.log(`[i18n.ts] Successfully loaded messages for locale: "${validLocale}" from path: "./messages/${validLocale}.json"`);
  } catch (error) {
    console.error(`[i18n.ts] Failed to load messages for locale "${validLocale}" from path: "./messages/${validLocale}.json". Error:`, error);
    notFound(); // Trigger notFound if messages can't be loaded for a valid locale
    // The lines below should ideally not be reached.
    console.warn('[i18n.ts] Execution continued after notFound() call due to message loading failure. This is unexpected.');
    return {messages: {}}; // Fallback
  }

  return {
    messages
  };
});
