import { createClient } from "@supabase/supabase-js";

// Add the following declaration to fix the ImportMeta error
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_KEY: string;
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const supabaseURL = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY as string;

export const supabase = createClient(supabaseURL, supabaseAnonKey);
