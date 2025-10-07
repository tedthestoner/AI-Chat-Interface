import { createBrowserClient } from "@supabase/ssr"

let _supabaseBrowser: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowser() {
  if (_supabaseBrowser) return _supabaseBrowser
  _supabaseBrowser = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  return _supabaseBrowser
}
