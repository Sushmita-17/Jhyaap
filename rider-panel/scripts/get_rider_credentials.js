import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getRiders() {
  const { data, error } = await supabase.from('rider_credentials').select('*')
  if (error) {
    console.error('Error fetching rider_credentials:', error.message)
  } else {
    console.log('Rider Credentials in DB:', data)
  }
}

getRiders()
