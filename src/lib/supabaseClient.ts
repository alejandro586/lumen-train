import { createClient } from '@supabase/supabase-js'

// 🔐 Obtén estos valores desde tu panel de Supabase
const supabaseUrl = 'https://ssfdevkudyrtfwugxckf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZmRldmt1ZHlydGZ3dWd4Y2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDEzNzYsImV4cCI6MjA3NjA3NzM3Nn0.oTQINzaHsIaDocaZwbSheXDz-TehoP0oR7JdvVWyeZg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
