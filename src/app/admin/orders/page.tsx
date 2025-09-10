import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "../../../lib/admin";
import OrdersManagement from "./OrdersManagement";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/admin");
  }

  return <OrdersManagement />;
}
