
import { AiLogAnalysisClient } from "./AiLogAnalysisClient";

export default function AiLogsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Third Party Usage Log Analysis</h1>
      <p className="text-muted-foreground">
        Monitor and analyze third party tool usage patterns, issues, and optimization areas.
      </p>
      <AiLogAnalysisClient />
    </div>
  );
}

