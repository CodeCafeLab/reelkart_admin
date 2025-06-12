
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrlFromEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKeyFromEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseExport: SupabaseClient;

if (!supabaseUrlFromEnv || supabaseUrlFromEnv.trim().length === 0 || !supabaseAnonKeyFromEnv || supabaseAnonKeyFromEnv.trim().length === 0) {
  console.warn(
    'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing or empty. ' +
    'Supabase client is not properly initialized. API calls to Supabase will fail at runtime. ' +
    'Please ensure these variables are set in your .env file or environment configuration.'
  );

  // Create a non-functional proxy to avoid build errors but highlight runtime issues.
  // This proxy will throw an error if any of its methods are called.
  supabaseExport = new Proxy(
    {},
    {
      get: (target, prop) => {
        const errMessage = `Supabase client is not properly initialized due to missing/empty environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY). Cannot access property '${String(prop)}'. Ensure these are set in your .env file.`;
        console.error(errMessage);
        // For chainable methods like .from().select(), we need to return functions that also error.
        if (typeof prop === 'string' && ['from', 'rpc', 'channel', 'storage'].includes(prop)) {
            return () => {
                throw new Error(errMessage);
            };
        }
        // For functions that might be called directly, e.g., auth functions
        if (typeof prop === 'string' && prop.startsWith('get') || prop.startsWith('sign') || prop.startsWith('set')) {
             return () => {
                throw new Error(errMessage);
            };
        }
        // For other properties or direct calls
        throw new Error(errMessage);
      },
    }
  ) as SupabaseClient;
} else {
  const supabaseUrl = supabaseUrlFromEnv.trim();
  const supabaseAnonKey = supabaseAnonKeyFromEnv.trim();
  try {
    new URL(supabaseUrl); // Validate URL format
    supabaseExport = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client initialized with URL:", supabaseUrl.substring(0, Math.min(20, supabaseUrl.length)) + "...");
  } catch (e) {
    const errMessage = `Invalid Supabase URL format: "${supabaseUrl}". Supabase client not initialized. API calls to Supabase will fail. Error: ${e instanceof Error ? e.message : String(e)}`;
    console.error(errMessage);
    // Fallback to proxy on initialization error as well
    supabaseExport = new Proxy({}, {
      get: (target, prop) => {
        const proxyErrorMessage = `Supabase client failed to initialize due to an error (e.g., invalid URL: ${errMessage}). Cannot access property '${String(prop)}'.`;
        console.error(proxyErrorMessage);
         if (typeof prop === 'string' && ['from', 'rpc', 'channel', 'storage'].includes(prop)) {
            return () => { throw new Error(proxyErrorMessage); };
        }
        if (typeof prop === 'string' && prop.startsWith('get') || prop.startsWith('sign') || prop.startsWith('set')) {
             return () => { throw new Error(proxyErrorMessage); };
        }
        throw new Error(proxyErrorMessage);
      },
    }) as SupabaseClient;
  }
}

export const supabase = supabaseExport;
