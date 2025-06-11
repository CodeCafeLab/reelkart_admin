
import { NotificationsClient } from "./NotificationsClient";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold font-headline">Notifications Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and track notifications sent to users and sellers.
          </p>
        </div>
      </div>
      <NotificationsClient />
    </div>
  );
}
