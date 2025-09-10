import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "../../lib/admin";
import AdminDashboard from "./AdminDashboard";

// Forzar renderizado dinámico
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/admin");
  }

  return <AdminDashboard />;
}
