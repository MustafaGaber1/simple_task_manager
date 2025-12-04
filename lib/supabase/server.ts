// ============================================
// SERVER-SIDE SUPABASE UTILITY
// ============================================
// This file creates a Supabase client for use in Server Components and API Routes
// Use this when you need to interact with Supabase from server-side code

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// ============================================
// WHY is the server version more complex?
// ============================================
// On the server, we need to:
// 1. Read cookies to get the user's session
// 2. Update cookies when the session changes (token refresh)
// 3. Handle this in a way that works with Next.js's server architecture

/**
 * Creates a Supabase client for server-side operations
 *
 * @returns A configured Supabase client for server use
 *
 * WHEN TO USE THIS:
 * - In Server Components (default in Next.js App Router)
 * - In API Routes (app/api/*)
 * - In Server Actions
 * - When you need to fetch data before rendering a page
 *
 * EXAMPLE IN SERVER COMPONENT:
 * ```tsx
 * // No 'use client' directive = Server Component
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function TasksPage() {
 *   const supabase = await createClient()
 *   const { data: tasks } = await supabase.from('tasks').select('*')
 *
 *   return <div>{tasks.map(task => ...)}</div>
 * }
 * ```
 *
 * EXAMPLE IN API ROUTE:
 * ```tsx
 * import { createClient } from '@/lib/supabase/server'
 *
 * export async function GET() {
 *   const supabase = await createClient()
 *   const { data } = await supabase.from('tasks').select('*')
 *   return Response.json(data)
 * }
 * ```
 */
export async function createClient() {
  // Get the cookies from the incoming request
  // In Next.js 15, cookies() is an async function
  const cookieStore = await cookies();

  // Create the Supabase client with cookie handling
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ============================================
        // COOKIE HANDLERS
        // ============================================
        // These functions tell Supabase how to read and write cookies
        // Cookies store the user's authentication session

        /**
         * GET: Read a cookie value
         * Called when Supabase needs to check if user is logged in
         */
        getAll() {
          return cookieStore.getAll();
        },

        /**
         * SET: Write a cookie value
         * Called when:
         * - User logs in (store session)
         * - Session is refreshed (update token)
         * - User logs out (clear session)
         */
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // This can fail in Server Components during initial render
            // It's safe to ignore because the cookies will be set on the next request
            // This is a known Next.js limitation with Server Components
          }
        },
      },
    }
  );
}

// ============================================
// KEY CONCEPTS TO UNDERSTAND:
// ============================================
//
// 1. COOKIES vs LOCAL STORAGE:
//    - Cookies: Sent with every request, accessible on server
//    - Local Storage: Only in browser, not sent to server
//    - We use cookies because server needs to know who's logged in
//
// 2. SERVER COMPONENTS:
//    - Default in Next.js App Router
//    - Run on the server, not in the browser
//    - Can directly access databases (faster, more secure)
//    - Can't use React hooks like useState, useEffect
//
// 3. ASYNC/AWAIT:
//    - cookies() is async in Next.js 15
//    - We must await it to get the cookie store
//    - This is why createClient is also async
//
// 4. ERROR HANDLING:
//    - The try/catch in setAll handles a Next.js edge case
//    - During Server Component render, we can't set cookies
//    - But we can read them, which is usually what we need
//
// 5. AUTHENTICATION FLOW:
//    - User logs in → Session stored in cookie
//    - Next request → Server reads cookie → Knows who user is
//    - Token expires → Supabase auto-refreshes → Updates cookie
//
// ============================================
// CLIENT vs SERVER: WHEN TO USE WHICH?
// ============================================
//
// USE CLIENT (lib/supabase/client.ts) when:
// ✓ In a 'use client' component
// ✓ Handling user interactions (button clicks, form submits)
// ✓ Real-time subscriptions
// ✓ Client-side state management
//
// USE SERVER (lib/supabase/server.ts) when:
// ✓ In Server Components (no 'use client')
// ✓ In API routes (app/api/*)
// ✓ Fetching data before page render
// ✓ Operations that need to be secure/hidden from client
//
// EXAMPLE - When to use each:
//
// Server Component (fetch data):
//   const supabase = await createClient() // SERVER
//   const { data } = await supabase.from('tasks').select('*')
//
// Client Component (user clicks button):
//   'use client'
//   const supabase = createClient() // CLIENT
//   const handleClick = () => supabase.from('tasks').insert({...})






