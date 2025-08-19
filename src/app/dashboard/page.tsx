import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import DashboardClient from "./DashboardClient";
import AdminRedirect from "../../components/AdminRedirect";

// Forzar renderizado dinámico para evitar warnings de cookies
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AdminRedirect>
      <DashboardClient />
    </AdminRedirect>
  );
}
