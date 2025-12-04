// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
// This file runs BEFORE every request to check if user is authenticated
// It protects routes that require login

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ============================================
// WHY does this file live at the root?
// ============================================
// Next.js looks for middleware.ts in the root directory
// It automatically runs this code before every request
// This is different from /app files which define pages

// ============================================
// MIDDLEWARE FUNCTION
// ============================================
// This function is called for EVERY request to your site
export async function middleware(request: NextRequest) {
  // Create a response object that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // ============================================
  // CREATE SUPABASE CLIENT WITH COOKIE ACCESS
  // ============================================
  // We need special handling for cookies in middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read cookies from the request
        getAll() {
          return request.cookies.getAll();
        },
        // Set cookies in the response
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // ============================================
  // GET CURRENT USER SESSION
  // ============================================
  // This checks if the user is logged in by reading the session cookie
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get the pathname (URL path) being requested
  const path = request.nextUrl.pathname;

  // ============================================
  // DEFINE PUBLIC ROUTES (don't require auth)
  // ============================================
  const publicRoutes = ["/login", "/signup"];

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  // ============================================
  // AUTHENTICATION LOGIC
  // ============================================

  // Case 1: User is NOT logged in and trying to access protected route
  if (!user && !isPublicRoute) {
    // Redirect to login page
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    // Add a query param to redirect back after login (optional enhancement)
    redirectUrl.searchParams.set("redirectedFrom", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Case 2: User IS logged in and trying to access login/signup
  if (user && (path === "/login" || path === "/signup")) {
    // Redirect to home/dashboard instead
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  // Case 3: All other cases - allow the request
  return response;
}

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================
// Tell Next.js which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// ============================================
// KEY CONCEPTS EXPLAINED:
// ============================================
//
// 1. MIDDLEWARE vs PAGE:
//    - Middleware: Runs BEFORE the page renders
//    - Page: Renders after middleware allows it
//    - Middleware is like a security checkpoint
//
// 2. EDGE RUNTIME:
//    - Middleware runs on Vercel's Edge Network
//    - Faster than traditional servers (runs closer to users)
//    - Limited Node.js APIs available
//    - That's why we use special cookie handling
//
// 3. COOKIE HANDLING:
//    - request.cookies: Read cookies from incoming request
//    - response.cookies: Set cookies in outgoing response
//    - Session cookies prove user is authenticated
//
// 4. ROUTE PROTECTION:
//    - Public routes: Anyone can access
//    - Protected routes: Require authentication
//    - Redirect unauthenticated users to login
//
// 5. USER EXPERIENCE FLOW:
//    - Not logged in + visits /tasks → Redirect to /login
//    - Logs in → Redirect to original page (/tasks)
//    - Logged in + visits /login → Redirect to /dashboard
//    - Prevents seeing login page when already logged in
//
// 6. MATCHER CONFIGURATION:
//    - Defines which URLs middleware runs on
//    - Excludes static files (images, CSS) for performance
//    - Regex pattern to match most routes
//
// 7. RESPONSE CLONING:
//    - NextResponse.next() creates a new response
//    - We modify it to add/update cookies
//    - Return modified response
//
// 8. SECURITY BENEFITS:
//    - Runs on every request (can't be bypassed)
//    - Checks authentication at the edge
//    - Protects API routes and pages
//    - Happens before any page code runs
//
// ============================================
// COMMON PATTERNS:
// ============================================
//
// Pattern 1: Check specific roles
//   if (user && !user.user_metadata.is_admin) {
//     return NextResponse.redirect('/unauthorized')
//   }
//
// Pattern 2: Rate limiting
//   Track requests per IP and block if too many
//
// Pattern 3: Geolocation
//   Redirect based on user's country
//
// Pattern 4: A/B testing
//   Randomly assign users to different versions
//
// ============================================
// DEBUGGING TIPS:
// ============================================
//
// 1. console.log() works in middleware
// 2. Check browser DevTools → Network → See redirects
// 3. Check cookies in DevTools → Application → Cookies
// 4. If middleware breaks, site won't load at all
// 5. Test with browser in incognito mode (fresh session)
