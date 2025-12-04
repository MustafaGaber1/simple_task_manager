// ============================================
// LOGIN PAGE
// ============================================
// This is the page users visit to log into their account
// URL: /login

import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import AuthPageLayout from "@/components/auth/AuthPageLayout";

export const metadata: Metadata = {
  title: "Log In - Task Manager",
  description: "Log in to your Task Manager account",
};

export default function LoginPage() {
  return (
    <AuthPageLayout gradientColors="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100">
      <LoginForm />
    </AuthPageLayout>
  );
}

// ============================================
// KEY CONCEPTS:
// ============================================
//
// 1. SERVER COMPONENTS (default in Next.js 15):
//    - This component runs on the server
//    - Generates HTML before sending to browser
//    - Faster initial page load
//    - Can't use useState, useEffect, event handlers
//    - Can wrap Client Components (like LoginForm)
//
// 2. FILE-BASED ROUTING:
//    - app/login/page.tsx → /login URL
//    - app/signup/page.tsx → /signup URL
//    - app/page.tsx → / (home)
//    - Next.js automatically creates routes from file structure
//
// 3. LAYOUT PATTERNS:
//    - min-h-screen: Full viewport height
//    - flex items-center justify-center: Center content
//    - gradient background for visual appeal
//    - white card with shadow for the form
//
// 4. COMPONENT COMPOSITION:
//    - Server Component (LoginPage) wraps Client Component (LoginForm)
//    - Separation of concerns: page structure vs interactive logic
//    - Reusable components
//
// 5. STYLING WITH TAILWIND:
//    - Utility classes for quick styling
//    - Responsive design built-in (px-4 for mobile padding)
//    - No separate CSS files needed
