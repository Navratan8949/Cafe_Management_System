"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in
        router.replace("/login");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Logged in but wrong role
        if (user.role === "SUPERADMIN") router.replace("/superadmin");
        else if (user.role === "MANAGER") router.replace("/manager/dashboard");
        else router.replace("/login");
      }
    }
  }, [user, loading, router, allowedRoles, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="text-primary-600 animate-pulse font-semibold">Loading...</div>
      </div>
    );
  }

  // If user exists and has an allowed role (or no role restrictions)
  if (user && (!allowedRoles || allowedRoles.includes(user.role))) {
    return <>{children}</>;
  }

  // Fallback while redirecting
  return null;
}
