// ============================================
// DASHBOARD HOME PAGE
// ============================================
// This is the main page users see after logging in

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import TaskList from "@/components/tasks/TaskList";

// ============================================
// WHY is this an async function?
// ============================================
// Server Components in Next.js can be async
// This lets us fetch data before rendering
// The page waits for data, then renders with it (no loading state needed!)

export default async function Home() {
  // ============================================
  // CHECK AUTHENTICATION
  // ============================================
  // Get the Supabase client for server-side
  const supabase = await createClient();

  // Get the currently logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user, redirect to login
  // (This is extra safety - middleware should already handle this)
  if (!user) {
    redirect("/login");
  }

  // ============================================
  // RENDER THE PAGE
  // ============================================
  return (
    <DashboardLayout userEmail={user.email || ""}>
      {/* Main task management UI */}
      <TaskList userId={user.id} />
    </DashboardLayout>
  );
}

// ============================================
// KEY CONCEPTS EXPLAINED:
// ============================================
//
// 1. SERVER COMPONENT DATA FETCHING:
//    - async function: Can use await
//    - Fetches data on the server before rendering
//    - No loading spinners needed (page waits for data)
//    - SEO-friendly (content in initial HTML)
//
// 2. AUTHENTICATION CHECK:
//    - supabase.auth.getUser(): Gets current user from cookie
//    - if (!user): Extra safety check
//    - redirect(): Server-side redirect function
//
// 3. DATABASE QUERY:
//    - .from('profiles'): Query the profiles table
//    - .select('*'): Get all columns
//    - .eq('id', user.id): WHERE id = user.id
//    - .single(): Expect exactly one row
//
// 4. OPTIONAL CHAINING:
//    - profile?.full_name: Access property safely
//    - If profile is null, returns undefined (no error)
//    - || 'User': Fallback if undefined
//
// 5. SERVER vs CLIENT COMPONENTS:
//    - This page: Server Component (default)
//    - Navbar: Client Component ('use client')
//    - Can mix both in same page!
//    - Server fetches data, passes to Client via props
//
// 6. REDIRECT vs ROUTER.PUSH:
//    - redirect(): Server-side (in Server Components)
//    - router.push(): Client-side (in Client Components)
//    - Use the right one for your context
//
// 7. PROPS PASSING:
//    - <Navbar userEmail={user.email || ''} />
//    - Pass data from Server to Client Component
//    - Props must be serializable (no functions!)
//
// ============================================
// WHY FETCH DATA HERE INSTEAD OF CLIENT?
// ============================================
//
// Benefits of Server-side data fetching:
// ✓ Faster - No round trip from browser to server
// ✓ Secure - Database credentials never sent to browser
// ✓ SEO - Content in HTML (search engines can index it)
// ✓ Less JavaScript - Smaller bundle size for browser
//
// When to use client-side instead:
// - Real-time updates (WebSockets)
// - User interactions trigger fetch
// - Need loading/error UI states
// - Optimistic UI updates
