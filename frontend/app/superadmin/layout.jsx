"use client";

import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { useAuth } from "@/src/context/AuthContext";
import { LogOut, PlusCircle, LayoutDashboard, Coffee } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SuperAdminLayout({ children }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  return (
    <ProtectedRoute allowedRoles={["SUPERADMIN"]}>
      <div className="min-h-screen bg-espresso-950 text-crema-50 flex flex-col font-sans">
        {/* Header */}
        <header className="bg-espresso-900 border-b border-crema-50/10 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-8">
                <span className="flex items-center gap-0 text-base font-display font-semibold text-crema-50">
                  <img src="./images/logo.png" alt="coffee" className="w-10 h-10" /> Superadmin
                </span>
                <nav className="hidden md:flex space-x-1">
                  <Link
                    href="/superadmin"
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === "/superadmin"
                      ? "bg-primary-500/15 text-primary-400"
                      : "text-crema-100/60 hover:bg-crema-50/5 hover:text-crema-50"
                      }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  <Link
                    href="/superadmin/create"
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === "/superadmin/create"
                      ? "bg-primary-500/15 text-primary-400"
                      : "text-crema-100/60 hover:bg-crema-50/5 hover:text-crema-50"
                      }`}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create manager
                  </Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-crema-100/40 hidden sm:inline-block font-mono">
                  {user?.email}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-cherry-500 hover:bg-cherry-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
