import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!

// Client for public access
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for service role access (for admin actions)
export const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey)
