import { AppShell } from "@/components/app-shell";
import { HrRouteGuard } from "@/components/hr-route-guard";

export default function HrPage() {
  return (
    <HrRouteGuard>
      <AppShell />
    </HrRouteGuard>
  );
}
