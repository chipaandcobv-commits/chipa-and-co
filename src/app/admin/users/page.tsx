import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "../../../lib/admin";
import UsersManagement from "./UsersManagement";

// Forzar renderizado dinámico
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <UsersManagement />;
}
