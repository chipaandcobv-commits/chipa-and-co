import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "../../../lib/admin";
import ConfigManagement from "./ConfigManagement";

export const dynamic = "force-dynamic";

export default async function AdminConfigPage() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return <ConfigManagement />;
}
