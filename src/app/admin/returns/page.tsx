
import { ReturnsClient } from "./ReturnsClient";

export default function ReturnsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold font-headline">Return Management</h1>
          <p className="text-muted-foreground">
            Manage and process all customer return requests.
          </p>
        </div>
      </div>
      <ReturnsClient />
    </div>
  );
}
