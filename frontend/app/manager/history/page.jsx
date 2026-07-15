"use client";

import { useState, useEffect } from "react";
import { getAllOrders } from "@/src/service/manager.service";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import dayjs from "dayjs";

const selectClass = "bg-crema-50 border border-espresso-900/15 rounded-md text-sm py-2 px-3 text-espresso-900 focus:outline-none focus:ring-2 focus:ring-primary-500";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("today");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchOrders();
  }, [filter]); // Re-fetch when filter changes

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders(filter, customRange.start, customRange.end);
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomApply = () => {
    if (customRange.start && customRange.end) {
      fetchOrders();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACCEPTED": return "bg-leaf-500/10 text-leaf-600";
      case "CANCELLED": return "bg-cherry-500/10 text-cherry-600";
      default: return "bg-primary-500/10 text-primary-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-crema-50">Order history</h1>
          <p className="text-crema-100/50 mt-1 text-sm">Past orders, filtered by date.</p>
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
            <option value="6months">Last 6 months</option>
            <option value="year">This year</option>
            <option value="custom">Custom range</option>
          </select>

          {filter === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
                className={selectClass}
              />
              <span className="text-crema-100/40 text-sm">to</span>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
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

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          {loading ? (
            <div className="animate-pulse text-espresso-900/40 py-8 text-center font-mono text-sm">Loading orders&hellip;</div>
          ) : orders.length === 0 ? (
            <div className="text-espresso-900/40 py-10 text-center text-sm">
              No orders found for the selected time range.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left font-mono">
                <thead className="text-[10px] text-espresso-900/45 uppercase tracking-widest bg-espresso-900/5 font-sans">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Order &amp; date</th>
                    <th className="px-6 py-3 font-semibold">Table</th>
                    <th className="px-6 py-3 font-semibold">Items</th>
                    <th className="px-6 py-3 font-semibold">Total</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-espresso-900/8">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-espresso-900/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-espresso-900">{order._id.slice(-6)}</div>
                        <div className="text-xs text-espresso-900/40">{dayjs(order.createdAt).format("MMM D, YYYY h:mm A")}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-espresso-900">
                        <div>{order.tableId?.tableNumber || "N/A"}</div>
                        {(order.customerName || order.customerPhone) && (
                          <div className="text-[10px] text-espresso-900/50 font-normal mt-1 flex flex-col leading-tight">
                            <span>{order.customerName}</span>
                            {order.customerPhone && <span>{order.customerPhone}</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-sans">
                        <ul className="text-xs text-espresso-900/60 space-y-1">
                          {order.items.map((i, idx) => (
                            <li key={idx}>
                              {i.quantity}&times; {i.menuItem?.name || "Deleted item"}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4 font-semibold text-espresso-900">
                        &#8377;{order.totalAmount}
                      </td>
                      <td className="px-6 py-4 font-sans">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
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
