"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { PlusCircle, Ban, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/Button";
import { getAllManagers, toggleBlockManager, getPlatformAnalytics } from "@/src/service/superadmin.service";

export default function SuperAdminDashboard() {
  const [managers, setManagers] = useState([]);
  const [stats, setStats] = useState({ totalCafes: 0, totalRevenue: 0, totalOrdersProcessed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagers();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getPlatformAnalytics();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    }
  };

  const fetchManagers = async () => {
    try {
      const data = await getAllManagers();
      if (data.success) {
        setManagers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch managers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (managerId, currentStatus) => {
    const action = currentStatus ? "unblock" : "block";
    if (!window.confirm(`Are you sure you want to ${action} this manager?`)) return;

    try {
      const data = await toggleBlockManager(managerId);
      if (data.success) {
        setManagers((prev) => prev.map((m) => m._id === managerId ? { ...m, isBlocked: data.data.isBlocked } : m));
      }
    } catch (error) {
      alert("Failed to change block status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-crema-50">Platform overview</h1>
          <p className="text-crema-100/50 mt-1 text-sm">Every cafe instance, in one place.</p>
        </div>
        <Link href="/superadmin/create">
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Create manager
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-espresso-900/50 font-sans">Total revenue</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-mono font-semibold text-primary-600">&#8377;{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-espresso-900/40 mt-1">Across all registered cafes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-espresso-900/50 font-sans">Total cafes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-mono font-semibold text-espresso-900">{stats.totalCafes}</div>
            <p className="text-xs text-espresso-900/40 mt-1">Active instances</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-espresso-900/50 font-sans">Orders processed</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-mono font-semibold text-espresso-900">{stats.totalOrdersProcessed}</div>
            <p className="text-xs text-espresso-900/40 mt-1">Successful transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered cafes &amp; managers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="animate-pulse text-espresso-900/40 py-8 text-center font-mono text-sm">Loading managers&hellip;</div>
          ) : managers.length === 0 ? (
            <div className="text-espresso-900/40 py-8 text-center text-sm">No managers registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-espresso-900/45 uppercase tracking-widest bg-espresso-900/5">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Cafe details</th>
                    <th className="px-6 py-3 font-semibold">Manager details</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-espresso-900/8">
                  {managers.map((manager) => (
                    <tr key={manager._id} className="hover:bg-espresso-900/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-espresso-900">{manager.hotelId?.name || "N/A"}</div>
                        <div className="text-xs text-espresso-900/40 font-mono">{manager.hotelId?.phone || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-espresso-900">{manager.username}</div>
                        <div className="text-xs text-espresso-900/40">{manager.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {manager.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-cherry-500/10 text-cherry-600">
                            BLOCKED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-leaf-500/10 text-leaf-600">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant={manager.isBlocked ? "secondary" : "danger"}
                          className="h-8 text-xs gap-1"
                          onClick={() => handleToggleBlock(manager._id, manager.isBlocked)}
                        >
                          {manager.isBlocked ? (
                            <><CheckCircle className="w-3 h-3"/> Unblock</>
                          ) : (
                            <><Ban className="w-3 h-3"/> Block</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
