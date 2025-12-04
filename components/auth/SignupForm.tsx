// ============================================
// SIGNUP FORM COMPONENT
// ============================================
// This component handles new user registration

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, UserPlus, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        console.error("❌ Signup error details:", error);
        setError(`Signup failed: ${error.message}`);
        return;
      }

      console.log("✅ User account created:", data.user?.email);

      if (!data.user) {
        setError("Unexpected error: No user data returned");
        return;
      }

      console.log("✅ Step 1: User account created in auth.users");

      if (data.user.identities && data.user.identities.length === 0) {
        setError("This email is already registered. Please log in.");
        return;
      }

      console.log("⏳ Step 2: Creating profile in profiles table...");

      await new Promise((resolve) => setTimeout(resolve, 500));

      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
      } as never);

      if (profileError) {
        console.error("❌ Profile creation failed:", profileError);

        if (
          profileError.message.includes("duplicate") ||
          profileError.message.includes("unique")
        ) {
          console.log("✅ Profile already exists (this is fine!)");
        } else {
          console.warn(
            "⚠️ Profile creation had an issue, but you can still log in"
          );
        }
      } else {
        console.log("✅ Step 2: Profile created successfully!");
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pass: string): string => {
    if (pass.length === 0) return "";
    if (pass.length < 6) return "Too short (min 6 characters)";
    if (pass.length < 8) return "Weak";
    if (pass.length >= 12 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) {
      return "Strong";
    }
    return "Medium";
  };

  const passwordStrength = getPasswordStrength(password);

  if (success) {
    return (
      <Card className="w-full max-w-md border-2 border-emerald-300 dark:border-emerald-500/30">
        <CardContent className="pt-6">
          <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/15 dark:to-teal-500/15 border-2 border-emerald-300 dark:border-emerald-500/30 rounded-xl text-center shadow-lg">
            <div className="w-16 h-16 bg-emerald-500 dark:bg-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <span className="text-3xl">🎉</span>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-emerald-700 dark:text-emerald-300">
              Account Created!
            </h3>
            <p className="mb-4 text-emerald-600 dark:text-emerald-400">
              Your account has been successfully created.
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 animate-pulse">
              Redirecting to login...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-2xl border-2">
      <CardHeader className="space-y-1 pb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <UserPlus className="w-7 h-7 text-white" />
        </div>
        <CardTitle className="text-3xl text-center font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
          Create Account
        </CardTitle>
        <CardDescription className="text-center text-base">
          Join us today and start managing your tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-300 dark:border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-300 text-sm font-medium shadow-sm">
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="fullName"
              className="flex items-center gap-2 font-semibold"
            >
              <User className="w-4 h-4 text-primary" />
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
              placeholder="John Doe"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="flex items-center gap-2 font-semibold"
            >
              <Mail className="w-4 h-4 text-primary" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="you@example.com"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="flex items-center gap-2 font-semibold"
            >
              <Lock className="w-4 h-4 text-primary" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              placeholder="••••••••"
              className="h-11"
            />
            {password && (
              <p
                className={`flex items-center gap-1 text-xs font-medium ${
                  passwordStrength === "Strong"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : passwordStrength === "Medium"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                <Shield className="w-3 h-3" />
                Password strength: {passwordStrength}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || password.length < 6}
            className="w-full mt-6"
            size="lg"
          >
            <UserPlus className="w-5 h-5" />
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a
              href="/login"
              className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-semibold"
            >
              <ArrowLeft className="w-3 h-3" />
              Log in
            </a>
          </p>

          <p className="text-xs text-center text-muted-foreground/70">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
