
import { ReferralClient } from "./ReferralClient";

export default function ReferralManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold font-headline">Referral Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your user and seller referral program.
          </p>
        </div>
      </div>
      <ReferralClient />
    </div>
  );
}
