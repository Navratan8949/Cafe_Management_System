"use client";

import { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import { getMenu, placeOrder, callWaiter, requestBill, getTableOrders } from "@/src/service/customer.service";
import { Button } from "@/src/components/ui/Button";
import { Plus, Minus, ShoppingCart, Bell, ReceiptText, X, Coffee } from "lucide-react";

export default function CustomerMenuPage({ params }) {
  // Using React.use() to unwrap params
  const unwrappedParams = use(params);
  const hotelId = unwrappedParams.hotelId;
  const searchParams = useSearchParams();
  const tableId = searchParams.get("tableId");
  const tableNumber = searchParams.get("tableNumber");

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [tableOrders, setTableOrders] = useState([]);

  useEffect(() => {
    fetchMenu();
    if (tableId) {
      fetchTableOrders();
    }
    
    // Check local storage for identity
    const savedName = localStorage.getItem("cafe_customer_name");
    const savedPhone = localStorage.getItem("cafe_customer_phone");
    if (savedName && savedPhone) {
      setCustomerName(savedName);
      setCustomerPhone(savedPhone);
    } else {
      setIsIdentityModalOpen(true);
    }
  }, [hotelId, tableId]);

  const fetchTableOrders = async () => {
    if (!tableId) return;
    try {
      const data = await getTableOrders(hotelId, tableId);
      if (data.success) {
        setTableOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch table orders", error);
    }
  };

  const fetchMenu = async () => {
    try {
      const data = await getMenu(hotelId);
      if (data.success) {
        setMenuItems(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch menu", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCart = (item, delta) => {
    setCart((prev) => {
      const current = prev[item._id] || { item, quantity: 0 };
      const newQty = current.quantity + delta;

      if (newQty <= 0) {
        const newCart = { ...prev };
        delete newCart[item._id];
        return newCart;
      }
      return { ...prev, [item._id]: { item, quantity: newQty } };
    });
  };

  const totalItems = Object.values(cart).reduce((sum, { quantity }) => sum + quantity, 0);
  const totalPrice = Object.values(cart).reduce((sum, { item, quantity }) => sum + (item.price * quantity), 0);

  const handlePlaceOrder = async () => {
    if (!tableId) {
      alert("Please scan a valid table QR code to place an order.");
      return;
    }

    setIsPlacingOrder(true);

    const items = Object.values(cart).map(({ item, quantity }) => ({
      menuItem: item._id,
      quantity,
    }));

    setOrderStatus("Getting location...");

    const submitOrder = async (lat, lng) => {
      try {
        setOrderStatus("Placing order...");
        const payload = {
          tableId,
          items,
          customerNotes: "",
          customerLat: lat,
          customerLng: lng,
          customerName,
          customerPhone
        };
        const data = await placeOrder(hotelId, payload);
        if (data.success) {
          setCart({});
          setIsCartOpen(false);
          setOrderId(data.data._id);
          setOrderStatus(`Order placed successfully.`);
          fetchTableOrders(); // Refresh the table orders immediately
        }
      } catch (error) {
        alert(error.response?.data?.message || "Failed to place order.");
        setOrderStatus("");
      } finally {
        setIsPlacingOrder(false);
      }
    };

    if (navigator.geolocation) {
      alert("Please allow location access so we can verify you are at the cafe.");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          submitOrder(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Could not get location", error);
          alert("Location access failed! Please turn on your phone's GPS and allow location permission in your browser to place an order.");
          setOrderStatus("");
          setIsPlacingOrder(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by your browser. Cannot verify location.");
      submitOrder(null, null);
    }
  };

  const handleCallWaiter = async () => {
    if (!tableId) return;
    try {
      await callWaiter(hotelId, tableId);
      alert("Waiter has been called to your table.");
    } catch (error) {
      alert("Failed to call waiter.");
    }
  };

  const handleRequestBill = async () => {
    if (!tableId) return;
    try {
      await requestBill(hotelId, tableId);
      alert("Bill requested. Please wait.");
    } catch (error) {
      alert("Failed to request bill.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-crema-50 gap-3">
        <Coffee className="w-8 h-8 text-primary-500 animate-pulse" />
        <div className="text-espresso-900/50 font-mono text-sm tracking-wide">Brewing the menu&hellip;</div>
      </div>
    );
  }

  // Group items by category
  const categorizedMenu = menuItems.reduce((acc, item) => {
    const cat = item.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-crema-50 text-espresso-900 pb-28">
      {/* Header */}
      <header className="bg-espresso-950 text-crema-50 sticky top-0 z-10">
        <div className="px-4 py-4 max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-display font-semibold leading-none">Menu</h1>
            {tableId && (
              <p className="text-xs text-crema-100/50 font-mono mt-1.5 tracking-wide">
                TABLE {tableNumber || tableId.slice(-4)}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleCallWaiter} className="p-2.5 bg-crema-50/10 rounded-full text-crema-50 active:bg-crema-50/20">
              <Bell className="w-4 h-4" />
            </button>
            <button onClick={handleRequestBill} className="p-2.5 bg-crema-50/10 rounded-full text-crema-50 active:bg-crema-50/20">
              <ReceiptText className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4">
        {orderStatus && (
          <div className="bg-leaf-500/10 border border-leaf-500/30 text-leaf-600 px-4 py-3 rounded-xl mb-4 font-medium text-center text-sm">
            {orderStatus}
          </div>
        )}

        {tableOrders.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3 px-1">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-espresso-900/50">Your Table's Orders</h2>
            </div>
            <div className="bg-crema-100 rounded-xl p-4 space-y-3 font-mono text-sm border border-espresso-900/5 shadow-sm">
              {tableOrders.map(order => (
                <div key={order._id} className="pb-3 border-b border-dashed border-espresso-900/10 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center text-xs text-espresso-900/50 mb-1.5 font-sans font-semibold">
                    <span>{order.customerName}</span>
                    <span className={`px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-wider ${
                      order.status === "COMPLETED" ? "bg-leaf-500/10 text-leaf-700" :
                      order.status === "ACCEPTED" ? "bg-primary-500/10 text-primary-700" :
                      "bg-espresso-900/5 text-espresso-900/60"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  {order.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-espresso-900">
                      <span>{i.quantity}&times; {i.menuItem?.name || "Item"}</span>
                      <span>&#8377;{i.price * i.quantity}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div className="pt-2 flex justify-between font-bold text-espresso-900 font-sans border-t border-dashed border-espresso-900/20">
                <span className="text-sm uppercase tracking-wider text-espresso-900/60">Total Bill</span>
                <span className="text-lg">&#8377;{tableOrders.reduce((sum, o) => sum + o.totalAmount, 0)}</span>
              </div>
            </div>
          </div>
        )}

        {menuItems.length === 0 ? (
          <div className="text-center text-espresso-900/40 mt-12">No menu items available.</div>
        ) : (
          Object.entries(categorizedMenu).map(([category, items]) => (
            <div key={category} className="mb-9">
              <div className="flex items-center gap-3 mb-4 px-1">
                <h2 className="text-lg font-display font-semibold text-espresso-900 whitespace-nowrap">{category}</h2>
                <div className="h-px flex-1 bg-espresso-900/10" />
              </div>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item._id} className="flex bg-crema-50 rounded-xl border border-espresso-900/10 overflow-hidden">
                    {item.image && (
                      <div className="w-24 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-semibold text-espresso-900 leading-tight line-clamp-1">{item.name}</h3>
                          <div className={`w-2.5 h-2.5 shrink-0 rounded-full mt-1.5 ${item.isVeg ? "bg-leaf-500" : "bg-cherry-500"}`} />
                        </div>
                        <p className="text-xs text-espresso-900/50 mt-1 line-clamp-1">{item.description}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-mono font-semibold text-primary-600">&#8377;{item.price}</span>
                        {cart[item._id] ? (
                          <div className="flex items-center bg-primary-500/10 rounded-lg overflow-hidden border border-primary-500/30">
                            <button onClick={() => updateCart(item, -1)} className="px-2 py-1 text-primary-700 hover:bg-primary-500/10"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="w-6 text-center text-sm font-mono font-semibold text-primary-700">{cart[item._id].quantity}</span>
                            <button onClick={() => updateCart(item, 1)} className="px-2 py-1 text-primary-700 hover:bg-primary-500/10"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => updateCart(item, 1)}
                            className="px-3.5 py-1.5 bg-espresso-950 text-crema-50 rounded-lg text-xs font-semibold tracking-wide hover:bg-espresso-900"
                          >
                            ADD
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* Floating Cart Button */}
      {totalItems > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-20">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full max-w-md bg-espresso-950 text-crema-50 rounded-xl py-3.5 px-6 shadow-xl shadow-espresso-950/30 flex justify-between items-center active:scale-[0.98] transition-transform"
          >
            <div className="flex flex-col items-start leading-tight">
              <span className="font-semibold text-sm">{totalItems} item{totalItems > 1 ? "s" : ""}</span>
              <span className="text-xs font-mono text-crema-100/60">&#8377;{totalPrice}</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-sm text-primary-400">
              View cart <ShoppingCart className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer Overlay — styled as an order ticket */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-espresso-950/70 z-30 flex flex-col justify-end">
          <div className="ticket-edge bg-crema-50 pt-4 rounded-t-2xl w-full max-w-md mx-auto max-h-[85vh] flex flex-col">
            <div className="px-5 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-display font-semibold text-espresso-900">Your order</h2>
                {tableId && <p className="text-xs text-espresso-900/40 font-mono">TABLE {tableNumber || tableId.slice(-4)}</p>}
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-espresso-900/60 rounded-full bg-espresso-900/5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3 border-t border-dashed border-espresso-900/15">
              {Object.values(cart).map(({ item, quantity }) => (
                <div key={item._id} className="flex justify-between items-center font-mono text-sm">
                  <div>
                    <span className="text-espresso-900 font-medium">{quantity}&times; {item.name}</span>
                    <p className="text-espresso-900/40 text-xs mt-0.5">&#8377;{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-espresso-900 font-semibold">&#8377;{item.price * quantity}</span>
                    <div className="flex items-center bg-espresso-900/5 rounded-md overflow-hidden">
                      <button onClick={() => updateCart(item, -1)} className="px-2 py-1.5 text-espresso-900/70 active:bg-espresso-900/10"><Minus className="w-3.5 h-3.5" /></button>
                      <button onClick={() => updateCart(item, 1)} className="px-2 py-1.5 text-espresso-900/70 active:bg-espresso-900/10"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-dashed border-espresso-900/15">
              <div className="flex justify-between mb-4 font-mono">
                <span className="font-semibold text-espresso-900/60 text-sm uppercase tracking-wide self-center">Total</span>
                <span className="font-bold text-xl text-espresso-900">&#8377;{totalPrice}</span>
              </div>
              <Button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="w-full py-3.5 text-base rounded-xl">
                {isPlacingOrder ? "Placing..." : "Place order"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Identity Modal */}
      {isIdentityModalOpen && (
        <div className="fixed inset-0 bg-espresso-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-crema-50 rounded-3xl p-7 w-full max-w-sm shadow-2xl">
            <h2 className="text-2xl font-display font-semibold mb-2 text-espresso-900">Welcome!</h2>
            <p className="text-sm text-espresso-900/60 mb-6 font-medium">Please enter your details to view the menu and place orders.</p>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-espresso-900/50 mb-2">Your Name</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full bg-crema-100/50 border border-espresso-900/10 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all text-espresso-900 font-medium"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-espresso-900/50 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={10}
                  className="w-full bg-crema-100/50 border border-espresso-900/10 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all text-espresso-900 font-medium"
                  placeholder="e.g. 9876543210"
                />
                {tempPhone.length > 0 && tempPhone.length < 10 && (
                  <p className="text-cherry-500 text-[10px] mt-1.5 font-semibold">Please enter a valid 10-digit phone number.</p>
                )}
              </div>
            </div>
            <Button
              className="w-full py-4 text-base rounded-xl shadow-lg shadow-primary-500/20"
              disabled={!tempName.trim() || tempPhone.length !== 10}
              onClick={() => {
                localStorage.setItem("cafe_customer_name", tempName.trim());
                localStorage.setItem("cafe_customer_phone", tempPhone.trim());
                setCustomerName(tempName.trim());
                setCustomerPhone(tempPhone.trim());
                setIsIdentityModalOpen(false);
              }}
            >
              Continue to Menu
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
