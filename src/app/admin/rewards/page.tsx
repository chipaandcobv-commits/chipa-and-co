import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "../../../lib/admin";
import RewardsManagement from "./RewardsManagement";

export const dynamic = "force-dynamic";

export default async function AdminRewardsPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/admin");
  }

  return <RewardsManagement />;
}
