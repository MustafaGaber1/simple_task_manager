// ============================================
// SIGNUP PAGE
// ============================================
// This is the page where new users create their account
// URL: /signup

import type { Metadata } from "next";
import SignupForm from "@/components/auth/SignupForm";
import AuthPageLayout from "@/components/auth/AuthPageLayout";

export const metadata: Metadata = {
  title: "Sign Up - Task Manager",
  description: "Create your Task Manager account",
};

export default function SignupPage() {
  return (
    <AuthPageLayout gradientColors="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-100">
      <SignupForm />
    </AuthPageLayout>
  );
}

// ============================================
// WHY separate login and signup pages?
// ============================================
//
// 1. BETTER USER EXPERIENCE:
//    - Clear, focused purpose for each page
//    - Less confusing than a combined login/signup form
//    - Easier to track analytics (signup vs login)
//
// 2. SEO BENEFITS:
//    - Each page can have different metadata
//    - Separate URLs for different user intents
//    - Search engines can index them separately
//
// 3. DESIGN FLEXIBILITY:
//    - Can have different layouts/styles
//    - Signup might have terms & conditions
//    - Login might have "forgot password" link
//
// 4. CODE ORGANIZATION:
//    - Separate components are easier to maintain
//    - Can test each form independently
//    - Reduces complexity of each component
