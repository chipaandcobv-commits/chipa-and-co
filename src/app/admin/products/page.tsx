import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "../../../lib/admin";
import ProductsManagement from "./ProductsManagement";

// Forzar renderizado dinámico
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <ProductsManagement />;
}
