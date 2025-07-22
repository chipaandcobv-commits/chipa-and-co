import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import HistoryPage from "./HistoryPage";

export const dynamic = "force-dynamic";

export default async function UserHistoryPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return <HistoryPage />;
}
