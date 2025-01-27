import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kjxvnikydpfutaynkghc.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqeHZuaWt5ZHBmdXRheW5rZ2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MDA4MzAsImV4cCI6MjA1MzQ3NjgzMH0.oMEPbR2WHRtaQqLi59w1k76mnGPmqlI5V5hO3K0s5Wk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
