// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://payqrojrjuvrccalyruc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBheXFyb2pyanV2cmNjYWx5cnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NTg5MjksImV4cCI6MjA1MzIzNDkyOX0.i9dC-FVZBoGZ-HQWZmrcqFIhQDtsBaNELWvPnQ5nXjc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);