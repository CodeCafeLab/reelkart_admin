
import { RevenueReportClient } from "./RevenueReportClient";

export default function RevenueReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold font-headline">Revenue Report</h1>
          <p className="text-muted-foreground">
            Track subscription revenue, view purchased packages, and analyze financial performance.
          </p>
        </div>
      </div>
      <RevenueReportClient />
    </div>
  );
}
