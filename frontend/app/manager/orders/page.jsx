"use client";

import { useState, useEffect } from "react";
import { getActiveOrders, updateOrderStatus } from "@/src/service/manager.service";
import { Button } from "@/src/components/ui/Button";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export default function ActiveOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await getActiveOrders();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch active orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Listen for socket updates
    const handleUpdate = () => {
      fetchOrders();
    };

    window.addEventListener("socketUpdate", handleUpdate);
    return () => {
      window.removeEventListener("socketUpdate", handleUpdate);
    };
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      if (newStatus === "ACCEPTED") {
        setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: "ACCEPTED" } : o));
      } else {
        // COMPLETED or CANCELLED, remove from active orders
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      }
    } catch (error) {
      console.error("Failed to update order status", error);
    }
  };

  if (loading && orders.length === 0) {
    return <div className="animate-pulse text-crema-100/50 font-mono text-sm">Loading active orders&hellip;</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-crema-50">Active orders</h1>
        <p className="text-crema-100/50 mt-1 text-sm">Review and fire incoming tickets.</p>
      </div>

      {orders.length === 0 ? (
        <div className="border border-dashed border-crema-50/15 rounded-xl p-12 text-center">
          <Clock className="w-10 h-10 text-crema-50/20 mx-auto mb-4" />
          <h3 className="text-base font-medium text-crema-50">No active orders</h3>
          <p className="text-crema-100/40 mt-1 text-sm">Waiting for customers to place orders&hellip;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order._id} className="ticket-edge pt-3 bg-crema-50 text-espresso-900 rounded-b-xl shadow-lg flex flex-col font-mono">
              <div className="px-4 pb-3 flex justify-between items-baseline border-b border-dashed border-espresso-900/20">
                <div>
                  <span className="text-[10px] font-sans font-semibold text-espresso-900/45 uppercase tracking-widest flex items-center gap-2">
                    Order #{order.orderNumber || order._id.slice(-4)}
                    {order.status === "ACCEPTED" && <span className="bg-leaf-500/20 text-leaf-700 px-1.5 py-0.5 rounded-sm">Preparing</span>}
                  </span>
                  <div className="text-lg font-semibold">Table {order.tableId?.tableNumber}</div>
                  {(order.customerName || order.customerPhone) && (
                    <div className="text-xs text-espresso-900/60 mt-0.5 font-sans">
                      {order.customerName} {order.customerPhone && `• ${order.customerPhone}`}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-sans font-semibold text-espresso-900/45 uppercase tracking-widest">Total</span>
                  <div className="text-lg font-semibold text-primary-600">&#8377;{order.totalAmount}</div>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <ul className="divide-y divide-espresso-900/10 flex-1 px-4 py-1 text-sm">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="py-2 flex justify-between">
                      <span>{item.quantity}&times; {item.menuItem?.name || "Unknown item"}</span>
                      <span className="text-espresso-900/50">&#8377;{item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>

                {order.customerNotes && (
                  <div className="px-4 py-3 bg-primary-500/10 text-primary-700 text-xs font-sans border-t border-dashed border-espresso-900/20">
                    <span className="font-semibold">Note:</span> {order.customerNotes}
                  </div>
                )}

                <div className="p-3 border-t border-dashed border-espresso-900/20 mt-auto font-sans">
                  {order.status === "PENDING" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="danger"
                        className="w-full gap-2"
                        onClick={() => handleUpdateStatus(order._id, "CANCELLED")}
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </Button>
                      <Button
                        className="w-full gap-2 bg-leaf-600 hover:bg-leaf-500 text-crema-50"
                        onClick={() => handleUpdateStatus(order._id, "ACCEPTED")}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Accept
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full gap-2 bg-primary-600 hover:bg-primary-500 text-crema-50"
                      onClick={() => handleUpdateStatus(order._id, "COMPLETED")}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Complete Order
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
