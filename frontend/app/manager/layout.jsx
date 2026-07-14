"use client";

import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { useAuth } from "@/src/context/AuthContext";
import {
  LogOut,
  LayoutDashboard,
  UtensilsCrossed,
  Store,
  Clock,
  History,
  Settings,
  Coffee,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { useSocket } from "@/src/hooks/useSocket";

export default function ManagerLayout({ children }) {
  const { logout, user } = useAuth();
  const pathname = usePathname();

  // Initialize Socket connection
  useSocket();

  const navLinks = [
    { name: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
    { name: "Active orders", href: "/manager/orders", icon: Clock },
    { name: "History", href: "/manager/history", icon: History },
    { name: "Menu", href: "/manager/menu", icon: UtensilsCrossed },
    { name: "Tables", href: "/manager/tables", icon: Store },
    { name: "Settings", href: "/manager/settings", icon: Settings },
  ];

  return (
    <ProtectedRoute allowedRoles={["MANAGER"]}>
      <Toaster toastOptions={{ style: { background: "#2C2116", color: "#FBF6EC", fontFamily: "var(--font-body)" } }} />
      <div className="min-h-screen bg-espresso-950 text-crema-50 flex flex-col md:flex-row font-sans">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-espresso-900 flex flex-col sticky top-0 md:h-screen z-10 border-b md:border-b-0 md:border-r border-crema-50/10">
          <div className="h-16 flex items-center px-6 gap-0 border-b border-crema-50/10">
            {/* <Coffee className="w-5 h-5 text-primary-400" /> */}
            <img src="/images/logo.png" alt="Coffee" className="w-10 h-10" />
            <span className="text-base font-display font-semibold text-crema-50">Roast&amp;Ticket</span>
          </div>
          <nav className="flex-1 py-4 flex flex-row overflow-x-auto md:flex-col gap-1 px-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center whitespace-nowrap px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive
                    ? "bg-primary-500/15 text-primary-400"
                    : "text-crema-100/60 hover:bg-crema-50/5 hover:text-crema-50"
                    }`}
                >
                  <Icon className={`w-4 h-4 mr-3 ${isActive ? "text-primary-400" : "text-crema-100/40"}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-crema-50/10 hidden md:block">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary-500/15 flex items-center justify-center text-primary-400 font-mono font-semibold text-sm">
                {user?.username?.charAt(0).toUpperCase() || "M"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-crema-50 truncate">{user?.username}</p>
                <p className="text-xs text-crema-100/40 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-cherry-500 hover:bg-cherry-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-0 overflow-auto bg-espresso-950">
          <div className="p-4 sm:p-6 lg:p-8 flex-1">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
