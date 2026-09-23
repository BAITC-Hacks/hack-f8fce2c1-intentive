"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/components/providers/user-store-provider";

export function HrRouteGuard({ children }: { children: ReactNode }) {
  const accountType = useUserStore((state) => state.accountType);
  const router = useRouter();

  useEffect(() => {
    if (accountType !== "hr") router.replace("/");
  }, [accountType, router]);

  return accountType === "hr" ? children : null;
}
