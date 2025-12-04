// ============================================
// CLIENT-SIDE SUPABASE UTILITY
// ============================================
// This file creates a Supabase client for use in React components (browser)
// Use this when you need to interact with Supabase from client-side code

// Import the Supabase client creator function
import { createBrowserClient } from "@supabase/ssr";

// Import our database types (we'll create this file later)
import type { Database } from "@/types/database";

// ============================================
// WHY do we create a function instead of exporting the client directly?
// ============================================
// Because in React, components can re-render many times.
// If we created the client at the module level, it might get recreated unnecessarily.
// This function ensures we create the client once and reuse it.

/**
 * Creates a Supabase client for client-side operations
 *
 * @returns A configured Supabase client for browser use
 *
 * WHEN TO USE THIS:
 * - In React components (useState, useEffect, event handlers)
 * - For real-time subscriptions
 * - For client-side data fetching
 * - For user interactions (like clicking a button to create a task)
 *
 * EXAMPLE:
 * ```tsx
 * 'use client' // This marks it as a client component
 *
 * import { createClient } from '@/lib/supabase/client'
 *
 * export default function MyComponent() {
 *   const supabase = createClient()
 *
 *   const fetchTasks = async () => {
 *     const { data, error } = await supabase
 *       .from('tasks')
 *       .select('*')
 *   }
 * }
 * ```
 */
export function createClient() {
  // Get environment variables
  // These are the URL and key you added to .env.local
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Validate that environment variables exist
  // The ! above tells TypeScript "I promise this exists"
  // But let's actually check to help with debugging
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
    );
  }

  // Create and return the Supabase client
  // createBrowserClient is from @supabase/ssr - it handles:
  // - Cookie management in the browser
  // - Automatic token refresh
  // - Session persistence across page reloads
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// ============================================
// KEY CONCEPTS TO UNDERSTAND:
// ============================================
//
// 1. ENVIRONMENT VARIABLES:
//    - process.env.NEXT_PUBLIC_SUPABASE_URL reads from .env.local
//    - NEXT_PUBLIC_ prefix makes it available in the browser
//    - Without this prefix, it would only work on the server
//
// 2. TYPE SAFETY:
//    - <Database> is a TypeScript generic
//    - It tells Supabase what your database schema looks like
//    - This gives you autocomplete and type checking!
//
// 3. ANON KEY:
//    - This is a "public" key - it's safe to expose in browser code
//    - It has limited permissions (controlled by RLS policies)
//    - Users can only access data allowed by your RLS policies
//
// 4. SINGLETON PATTERN:
//    - We export a function, not the client itself
//    - This lets us control when/how the client is created
//    - Prevents memory leaks and unnecessary recreations





