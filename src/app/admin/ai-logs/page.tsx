
import { ThirdPartyLogDashboardClient } from "./ThirdPartyLogDashboardClient";

export default function ThirdPartyLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold font-headline">Third Party Usage Logs Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and analyze usage patterns, costs, and events for integrated third-party services.
          </p>
        </div>
      </div>
      <ThirdPartyLogDashboardClient />
    </div>
  );
}
