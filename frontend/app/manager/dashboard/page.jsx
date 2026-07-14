"use client";

import { useState, useEffect } from "react";
import { getDashboardAnalytics } from "@/src/service/manager.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import { Banknote, ShoppingBag, Users } from "lucide-react";

export default function ManagerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("today");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchAnalytics();
  }, [filter]); // Re-fetch when filter changes

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getDashboardAnalytics(filter, customRange.start, customRange.end);
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomApply = () => {
    if (customRange.start && customRange.end) {
      fetchAnalytics();
    }
  };

  const selectClass = "bg-espresso-900 border border-crema-50/15 text-crema-50 rounded-md text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500";

  if (loading && !analytics) {
    return <div className="animate-pulse text-crema-100/50 font-mono text-sm">Loading dashboard&hellip;</div>;
  }

  if (!analytics) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-medium">Failed to load analytics data.</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-crema-50">Dashboard</h1>
          <p className="text-crema-100/50 mt-1 text-sm">Here's what's happening in your cafe.</p>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={selectClass}
          >
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="3months">Last 3 months</option>
            <option value="6months">Last 6 months</option>
            <option value="year">This year</option>
            <option value="all">All time</option>
            <option value="custom">Custom range</option>
          </select>

          {filter === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                className={selectClass}
              />
              <span className="text-crema-100/40 text-sm">to</span>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                className={selectClass}
              />
              <button
                onClick={handleCustomApply}
                className="bg-primary-600 text-crema-50 px-3 py-2 rounded-md text-sm font-semibold hover:bg-primary-700"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="bg-primary-500/10 p-3 rounded-full">
              <Banknote className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-espresso-900/50">Total revenue</p>
              <h3 className="text-2xl font-mono font-semibold text-espresso-900">&#8377;{analytics.totalRevenue}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="bg-leaf-500/10 p-3 rounded-full">
              <ShoppingBag className="w-5 h-5 text-leaf-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-espresso-900/50">Total orders</p>
              <h3 className="text-2xl font-mono font-semibold text-espresso-900">{analytics.totalOrders}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="bg-cherry-500/10 p-3 rounded-full">
              <Users className="w-5 h-5 text-cherry-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-espresso-900/50">Occupied tables</p>
              <h3 className="text-2xl font-mono font-semibold text-espresso-900">{analytics.occupiedTables}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Most popular items</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.mostOrderedItems?.length > 0 ? (
              <ul className="divide-y divide-espresso-900/10">
                {analytics.mostOrderedItems.map((item) => (
                  <li key={item._id} className="py-3 flex justify-between items-center">
                    <span className="text-espresso-900 font-medium text-sm">{item.menuItem?.name || "Unknown"}</span>
                    <span className="bg-primary-500/10 text-primary-700 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold">
                      {item.count}&times; ordered
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-espresso-900/40 text-sm">No data available yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
