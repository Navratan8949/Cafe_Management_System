"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { login as loginService, register as registerService } from "../service/auth.service";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Client-side only hydration
    const storedUser = localStorage.getItem("hms_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginService(email, password);
      if (data.success) {
        setUser(data.data.user);
        localStorage.setItem("hms_user", JSON.stringify(data.data.user));
        return { success: true, role: data.data.user.role };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Login failed" };
    }
  };

  const registerManager = async (userData) => {
    try {
      const data = await registerService(userData);
      if (data.success) {
        setUser(data.data.user);
        localStorage.setItem("hms_user", JSON.stringify(data.data.user));
        return { success: true, role: data.data.user.role };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Registration failed" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hms_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerManager }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
