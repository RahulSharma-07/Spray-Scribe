"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

interface UserCreditsContextType {
  credits: number;
  plan: string;
  role: string;
  setCredits: (credits: number) => void;
  setPlan: (plan: string) => void;
  refresh: () => void;
}

const UserCreditsContext = createContext<UserCreditsContextType>({
  credits: 0,
  plan: "FREE",
  role: "USER",
  setCredits: () => {},
  setPlan: () => {},
  refresh: () => {},
});

export function UserCreditsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number>((session?.user as any)?.credits ?? 0);
  const [plan, setPlan] = useState<string>((session?.user as any)?.plan ?? "FREE");
  const [role, setRole] = useState<string>((session?.user as any)?.role ?? "USER");
  const hasFetched = useRef(false);

  const refresh = useCallback(() => {
    fetch("/api/user/credits")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) {
          setCredits(data.credits);
          setPlan(data.plan);
          setRole(data.role);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch once when user session is available — single request for entire dashboard
  useEffect(() => {
    if (session?.user && !hasFetched.current) {
      hasFetched.current = true;
      refresh();
    }
  }, [!!session?.user, refresh]);

  return (
    <UserCreditsContext.Provider value={{ credits, plan, role, setCredits, setPlan, refresh }}>
      {children}
    </UserCreditsContext.Provider>
  );
}

export function useUserCredits() {
  return useContext(UserCreditsContext);
}
