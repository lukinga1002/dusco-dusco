import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api, getToken, setSession, clearSession, getStoredUser } from "@/lib/duscoApi";

const DuscoAuthContext = createContext(null);

export function DuscoAuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  // Refresh user from /auth/me when we have a token but no fresh user
  const refreshUser = useCallback(async () => {
    if (!getToken()) return null;
    try {
      const me = await api.me();
      setUser(me);
      setSession(getToken(), me);
      return me;
    } catch (e) {
      // token invalid
      clearSession();
      setToken(null);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (token && !user) refreshUser();
    // eslint-disable-next-line
  }, []);

  const login = useCallback(async (phone, password) => {
    const res = await api.login({ phone, password });
    setSession(res.token, res.user);
    setToken(res.token);
    setUser(res.user);
    return res;
  }, []);

  const completeOtp = useCallback(async (phone, otp) => {
    const res = await api.verifyOtp({ phone, otp });
    setSession(res.token, { id: res.userId });
    setToken(res.token);
    setUser({ id: res.userId });
    await refreshUser();
    return res;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    loading,
    login,
    completeOtp,
    logout,
    refreshUser,
    setUser,
  };

  return <DuscoAuthContext.Provider value={value}>{children}</DuscoAuthContext.Provider>;
}

export function useDuscoAuth() {
  const ctx = useContext(DuscoAuthContext);
  if (!ctx) throw new Error("useDuscoAuth must be used within DuscoAuthProvider");
  return ctx;
}