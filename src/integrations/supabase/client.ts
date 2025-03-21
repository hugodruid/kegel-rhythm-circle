
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://epympqjrtwqtzmnggsim.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVweW1wcWpydHdxdHptbmdnc2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMjQ3MDksImV4cCI6MjA1NDYwMDcwOX0.j9BPR3AoHV5FOYtBsZuglI6TrbQUum0DyUPBe9Kz7KY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  }
});
