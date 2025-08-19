import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth";
import RankingManagement from "./RankingManagement";

export const dynamic = "force-dynamic";

export default async function AdminRankingPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return <RankingManagement />;
}
