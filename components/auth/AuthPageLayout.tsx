// ============================================
// AUTH PAGE LAYOUT - Client Component Wrapper
// ============================================
// Beautiful split-screen layout for authentication pages

"use client";

import ThemeToggle from "@/components/layout/ThemeToggle";
import { CheckSquare } from "lucide-react";

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

export default function AuthPageLayout({
  children,
}: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen flex transition-colors relative">
      {/* Theme toggle button */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl">
              <CheckSquare className="w-16 h-16 text-blue-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white">Task Manager</h1>
          <p className="text-xl text-gray-300 max-w-md">
            Organize your life, boost your productivity, and achieve your goals
            with ease.
          </p>
          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-sm text-gray-400">Active Users</div>
            </div>
            <div className="w-px h-12 bg-gray-600" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-sm text-gray-400">Tasks Completed</div>
            </div>
            <div className="w-px h-12 bg-gray-600" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">99%</div>
              <div className="text-sm text-gray-400">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
