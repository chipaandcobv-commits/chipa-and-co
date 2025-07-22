import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import RankingPage from "./RankingPage";

export const dynamic = "force-dynamic";

export default async function UserRankingPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return <RankingPage />;
}
