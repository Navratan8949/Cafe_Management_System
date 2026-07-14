"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { Coffee } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "SUPERADMIN") {
        router.replace("/superadmin");
      } else {
        router.replace("/manager/dashboard");
      }
    }
  }, [user, loading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.message);
      setIsLoading(false);
    }
    if (result.success) {
      if (result.role === "SUPERADMIN") {
        window.location.href = "/superadmin";
      } else {
        window.location.href = "/manager/dashboard";
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-crema-50 p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-0 mb-8">
          <div className="rounded-md">
            <img src="/images/logo.png" alt="Coffee" className="w-10 h-10" />
          </div>
          <span className="text-lg font-display font-semibold text-espresso-900">
            Omni<span className="text-primary-600">Bite</span>
          </span>
        </Link>

        <div className="bg-crema-50 border border-espresso-900/10 rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-display font-semibold text-espresso-900 text-center">Welcome back</h1>
          <p className="text-espresso-900/50 text-sm mt-1.5 text-center">Sign in to manage your cafe</p>

          <form onSubmit={handleLogin} className="space-y-4 mt-7">
            {error && (
              <div className="bg-cherry-500/10 text-cherry-600 p-3 rounded-lg text-sm border border-cherry-500/30">
                {error}
              </div>
            )}
            <Input
              label="Email address"
              type="email"
              id="email"
              placeholder="admin@cafe.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full mt-2 py-3 text-base" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-espresso-900/50 mt-6">
          New to OmniBite? <Link href="/register" className="text-primary-600 font-semibold hover:underline">Create your cafe</Link>
        </p>
      </div>
    </div>
  );
}
