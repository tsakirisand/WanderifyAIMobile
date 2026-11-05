import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, reload, User } from "firebase/auth";
import { auth, firebaseConfigured } from "../lib/firebase";

type AuthState = { user: User | null; loading: boolean; configured: boolean; refreshUser: () => Promise<void> };
const AuthContext = createContext<AuthState>({ user: null, loading: true, configured: false, refreshUser: async () => undefined });

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshUser = useCallback(async () => {
    if (!auth?.currentUser) return;
    await reload(auth.currentUser);
    setUser(auth.currentUser);
  }, []);
  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    return onAuthStateChanged(auth, (nextUser) => { setUser(nextUser); setLoading(false); });
  }, []);
  const value = useMemo(() => ({ user, loading, configured: firebaseConfigured, refreshUser }), [user, loading, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
