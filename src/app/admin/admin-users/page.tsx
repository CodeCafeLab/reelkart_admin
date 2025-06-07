
import { AdminUsersClient } from "./AdminUsersClient";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline">Admin User & Role Management</h1>
          <p className="text-muted-foreground">
            Manage admin panel users, their roles, and access permissions.
          </p>
        </div>
      </div>
      <AdminUsersClient />
    </div>
  );
}
