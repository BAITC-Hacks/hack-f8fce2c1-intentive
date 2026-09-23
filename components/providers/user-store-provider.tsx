"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import { createUserStore, type UserStore } from "@/stores/user-store";
import type { Employee } from "@/lib/employees";

const UserStoreContext = createContext<ReturnType<typeof createUserStore> | null>(null);

export function UserStoreProvider({ children, employees }: { children: ReactNode; employees: Employee[] }) {
  const [store] = useState(() => createUserStore(employees));
  return <UserStoreContext.Provider value={store}>{children}</UserStoreContext.Provider>;
}

export function useUserStore<T>(selector: (state: UserStore) => T): T {
  const store = useContext(UserStoreContext);
  if (!store) throw new Error("useUserStore requires UserStoreProvider");
  return useStore(store, selector);
}
