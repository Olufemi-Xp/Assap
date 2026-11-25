"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getHomeRouteForRole } from "@/lib/routing";
import type { User, Session } from "@supabase/supabase-js";
import type { UserRole } from "@/types/database";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  isLoading: boolean;
  signInWithGoogle: (role?: UserRole, next?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const fetchUserRole = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (data?.role) {
        setRole(data.role as UserRole);
      } else {
        setRole("customer");
      }
    } catch {
      setRole("customer");
    }
  };

  const refreshUser = async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    setSession(currentSession);
    setUser(currentSession?.user ?? null);

    if (currentSession?.user) {
      await fetchUserRole(currentSession.user.id);
    } else {
      setRole(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    refreshUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchUserRole(newSession.user.id);
      } else {
        setRole(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (selectedRole: UserRole = "customer", next?: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const targetNext = next || getHomeRouteForRole(selectedRole);
    const callbackUrl = `${origin}/auth/callback?role=${selectedRole}&next=${encodeURIComponent(targetNext)}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    router.push("/");
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isLoading,
        signInWithGoogle,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
