import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env.local file
const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Raw NEXT_PUBLIC_SUPABASE_URL:", rawSupabaseUrl);
console.log("Raw NEXT_PUBLIC_SUPABASE_ANON_KEY:", rawSupabaseAnonKey);

const supabaseUrl = rawSupabaseUrl ? rawSupabaseUrl.trim() : undefined;
const supabaseAnonKey = rawSupabaseAnonKey ? rawSupabaseAnonKey.trim() : undefined;

if (!supabaseUrl || supabaseUrl.length === 0) {
  throw new Error("Missing or empty environment variable NEXT_PUBLIC_SUPABASE_URL. Please check your .env.local file and ensure it's loaded correctly.");
}
if (!supabaseAnonKey || supabaseAnonKey.length === 0) {
  throw new Error("Missing or empty environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY. Please check your .env.local file and ensure it's loaded correctly.");
}

// Validate the URL structure more explicitly before passing to createClient
try {
  new URL(supabaseUrl);
} catch (e) {
  throw new Error(`Invalid Supabase URL format: "${supabaseUrl}". Please ensure it is a valid URL (e.g., https://<project_ref>.supabase.co). Error: ${e instanceof Error ? e.message : String(e)}`);
}


// Create a single supabase client for interacting with your database
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase client initialized with URL:", supabaseUrl ? supabaseUrl.substring(0, 20) + "..." : "URL_IS_UNDEFINED_OR_EMPTY");
