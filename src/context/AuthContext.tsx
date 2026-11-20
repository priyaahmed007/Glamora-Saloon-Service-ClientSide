"use client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { signOut, useSession } from "@/lib/auth-client";
import { api, ApiError, clearTokenCache } from "@/lib/api";
import type { Me } from "@/lib/types";

interface AuthValue {
  user: Me | null;
  loading: boolean;
  refresh: () => Promise<Me | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  loading: true,
  refresh: async () => null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const [me, setMe] = useState<Me | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const userId = (session as { user?: { id?: string } } | null | undefined)?.user?.id;

  const refresh = useCallback(async () => {
    try {
      const res = await api<{ user: Me }>("/users/me");
      setMe(res.user);
      return res.user;
    } catch (err) {
      if (err instanceof ApiError && err.code === "BLOCKED") {
        toast.error("Your account has been blocked. Please contact the salon.");
        clearTokenCache();
        await signOut({});
      }
      setMe(null);
      return null;
    }
  }, []);

  useEffect(() => {
    clearTokenCache();
    if (!userId) {
      setMe(null);
      setLoadedFor(null);
      return;
    }
    let cancelled = false;
    refresh().finally(() => {
      if (!cancelled) setLoadedFor(userId);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, refresh]);

  const logout = useCallback(async () => {
    clearTokenCache();
    await signOut({});
    setMe(null);
    setLoadedFor(null);
  }, []);

  const loading = isPending || (!!userId && loadedFor !== userId);

  const value = useMemo(() => ({ user: userId ? me : null, loading, refresh, logout }), [userId, me, loading, refresh, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
