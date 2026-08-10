import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getRiders() {
  const { data, error } = await supabase.from('riders').select('*')
  if (error) {
    console.error('Error fetching riders:', error.message)
  } else {
    console.log('Riders in DB:', data)
  }
}

getRiders()
