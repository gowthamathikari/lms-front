import { getAuthCookieDomain } from "./cookie-domain"
import { createBrowserClient } from '@supabase/ssr'



export function createClient() {
  const cookieDomain = getAuthCookieDomain(typeof window === "undefined" ? undefined : window.location.hostname, process.env.NEXT_PUBLIC_PLATFORM_DOMAIN)

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookieOptions: cookieDomain
        ? { domain: cookieDomain, path: '/' }
        : undefined,
    }
  )
}
