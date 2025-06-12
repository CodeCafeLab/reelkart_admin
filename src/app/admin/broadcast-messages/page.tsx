
import { BroadcastMessagesClient } from "./BroadcastMessagesClient";

export default function BroadcastMessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold font-headline">Broadcast Messages Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and track broadcast messages sent to users and sellers.
          </p>
        </div>
      </div>
      <BroadcastMessagesClient />
    </div>
  );
}
