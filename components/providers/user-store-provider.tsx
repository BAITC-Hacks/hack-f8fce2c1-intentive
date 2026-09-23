"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import { createUserStore, type UserStore } from "@/stores/user-store";
import type { CareerDataset } from "@/core/domain/schemas";
import { createDevelopmentSelector, createRecommendationSelector } from "@/stores/selectors";

const UserStoreContext = createContext<ReturnType<typeof createUserStore> | null>(null);

export function UserStoreProvider({ children, dataset }: { children: ReactNode; dataset: CareerDataset }) {
  const [store] = useState(() => createUserStore(dataset));
  return <UserStoreContext.Provider value={store}>{children}</UserStoreContext.Provider>;
}

export function useDevelopment() {
  const [selector] = useState(createDevelopmentSelector);
  return useUserStore(selector);
}

export function useRecommendations() {
  const [selector] = useState(createRecommendationSelector);
  return useUserStore(selector);
}

export function useUserStore<T>(selector: (state: UserStore) => T): T {
  const store = useContext(UserStoreContext);
  if (!store) throw new Error("useUserStore requires UserStoreProvider");
  return useStore(store, selector);
}
