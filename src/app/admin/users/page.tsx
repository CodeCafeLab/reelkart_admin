
import { UsersManagementClient } from "./UsersManagementClient";

export default function UsersManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold font-headline">App Users Management</h1>
          <p className="text-muted-foreground">
            View and manage regular application users.
          </p>
        </div>
      </div>
      <UsersManagementClient />
    </div>
  );
}
