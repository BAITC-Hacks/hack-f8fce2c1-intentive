"use client";
import { selectProfile } from "@/stores/selectors";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/components/providers/user-store-provider";
import { isHrEmployee } from "@/lib/employees";

export function HrRouteGuard({ children }: { children: ReactNode }) {
  const profile = useUserStore(selectProfile);
  const isHr = isHrEmployee(profile);
  const router = useRouter();

  useEffect(() => {
    if (!isHr) router.replace("/");
  }, [isHr, router]);

  return isHr ? children : null;
}
