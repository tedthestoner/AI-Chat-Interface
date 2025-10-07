import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

let _supabaseServer: ReturnType<typeof createServerClient> | null = null

export function getSupabaseServer() {
  if (_supabaseServer) return _supabaseServer

  // Use cookie-based auth storage on the server
  const cookieStore = cookies()
  _supabaseServer = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // In some RSC cases, set may be unavailable - fail silently
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch {
            // noop
          }
        },
      },
    },
  )

  return _supabaseServer
}
