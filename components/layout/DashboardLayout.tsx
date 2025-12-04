// ============================================
// DASHBOARD LAYOUT - Client Component Wrapper
// ============================================
// This wraps the dashboard content in a client component
// so that Navbar can access the ThemeProvider context

"use client";

import Navbar from "./Navbar";

interface DashboardLayoutProps {
  userEmail: string;
  children: React.ReactNode;
}

export default function DashboardLayout({
  userEmail,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* Navigation bar - now in a client component */}
      <Navbar userEmail={userEmail} />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
    </div>
  );
}

// ============================================
// WHY THIS FIXES THE ERROR:
// ============================================
//
// PROBLEM:
// - app/page.tsx is a Server Component
// - It imported Navbar directly
// - Navbar uses ThemeToggle which uses useTheme()
// - useTheme() needs ThemeProvider context
// - Context isn't available during Server Component render
//
// SOLUTION:
// - Create this Client Component wrapper
// - Move Navbar into the client boundary
// - Now Navbar renders on the client where context is available
// - Server Component (page.tsx) passes data as props
//
// KEY CONCEPT - SERVER vs CLIENT BOUNDARIES:
// - Server Components can't use React hooks or context
// - Client Components ('use client') can use hooks and context
// - Server Components can render Client Components
// - Pass data from Server → Client via props
//
// PATTERN:
// Server Component (fetch data) → Client Component (interactive UI)
