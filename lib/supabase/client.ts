import { createBrowserClient } from "@supabase/ssr"

let _supabaseBrowser: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowser() {
  if (_supabaseBrowser) return _supabaseBrowser
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  _supabaseBrowser = createBrowserClient(supabaseUrl, supabaseKey)
  return _supabaseBrowser
}
