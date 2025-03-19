
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://cndqovcgkjaruxsbtaev.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZHFvdmNna2phcnV4c2J0YWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNTQ1NTgsImV4cCI6MjA1NzkzMDU1OH0.pCp8gKAnrRkh3vEY4Zn4md0dxjVmdKzHt0sJ1sH46FE";

// Create the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
