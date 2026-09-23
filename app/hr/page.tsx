import { AppShell } from "@/components/app-shell";
import { HrRouteGuard } from "@/components/hr-route-guard";
import { HRWorkspace } from "@/features/hr/hr-workspace";

export default function HrPage() {
  return (
    <HrRouteGuard>
      <AppShell><HRWorkspace /></AppShell>
    </HrRouteGuard>
  );
}
