
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oclxfzeqlkdkguxoggvv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jbHhmemVxbGtka2d1eG9nZ3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MTgwNTIsImV4cCI6MjA3MjI5NDA1Mn0.freCiKF-W-SaiTOMByqHFq9z13Ww6ZPRK51aKKeyrYI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);