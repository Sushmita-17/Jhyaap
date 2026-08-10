import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables. Running in demo mode.')
}

// Supabase client for data operations only (no auth)
export const supabase = createClient(supabaseUrl || 'https://demo.supabase.co', supabaseAnonKey || 'demo')

