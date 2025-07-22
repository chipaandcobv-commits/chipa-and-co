import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import RewardsPage from "./RewardsPage";

export const dynamic = "force-dynamic";

export default async function UserRewardsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return <RewardsPage />;
}
