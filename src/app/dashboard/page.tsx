import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import DashboardClient from "./DashboardClient";

// Forzar renderizado dinámico para evitar warnings de cookies
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardClient />;
}
