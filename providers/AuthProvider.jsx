"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { getToken, setToken, clearToken } from "@/lib/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load customer on app start if token exists
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    apiRequest("/api/customer-auth/me", { token })
      .then((data) => setCustomer(data.customer))
      .catch(() => {
        clearToken();
        setCustomer(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const loginWithToken = async (token) => {
    setToken(token);
    const data = await apiRequest("/api/customer-auth/me", { token });
    setCustomer(data.customer);
  };

  const logout = async () => {
    const token = getToken();
    try {
      if (token) {
        await apiRequest("/api/customer-auth/logout", { method: "POST", token });
      }
    } catch {}
    clearToken();
    setCustomer(null);
  };

  const value = useMemo(
    () => ({ customer, setCustomer, loading, loginWithToken, logout }),
    [customer, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}