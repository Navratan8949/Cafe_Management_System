import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/src/context/AuthContext";
import toast from "react-hot-toast";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const useSocket = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now()); // Useful to trigger refetches

  useEffect(() => {
    // Only connect if user is a MANAGER
    if (!user || user.role !== "MANAGER" || !user.hotelId) return;

    // Request Browser Notification Permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Use the base URL (without /api/v1) for Socket.io
    const baseUrl = SOCKET_URL.replace("/api/v1", "");
    const socketInstance = io(baseUrl);

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to socket server");
      // Join the hotel's room
      socketInstance.emit("joinHotelRoom", user.hotelId);
    });

    const showBrowserNotification = (title, body) => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body });
      }
    };

    const playNotificationSound = () => {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(e => console.warn("Audio play blocked by browser:", e));
      } catch (error) {
        console.warn("Audio not supported");
      }
    };

    // Handle incoming events
    socketInstance.on("newOrder", (data) => {
      toast.success(data.message, {
        duration: 5000,
        position: "top-right",
        icon: "🍲"
      });
      showBrowserNotification("New Order Received", data.message);
      playNotificationSound();
      window.dispatchEvent(new Event("socketUpdate")); // Trigger re-render/refetch
    });

    socketInstance.on("callWaiter", (data) => {
      toast(data.message, {
        duration: 5000,
        position: "top-right",
        icon: "👨‍🍳",
        style: {
          border: '1px solid #eab308',
          padding: '16px',
          color: '#854d0e',
        },
      });
      showBrowserNotification("Waiter Called", data.message);
      playNotificationSound();
      window.dispatchEvent(new Event("socketUpdate"));
    });

    socketInstance.on("requestBill", (data) => {
      toast(data.message, {
        duration: 5000,
        position: "top-right",
        icon: "🧾",
        style: {
          border: '1px solid #3b82f6',
          padding: '16px',
          color: '#1e3a8a',
        },
      });
      showBrowserNotification("Bill Requested", data.message);
      playNotificationSound();
      window.dispatchEvent(new Event("socketUpdate"));
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user]);

  return { socket, lastUpdate };
};
