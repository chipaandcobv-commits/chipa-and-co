import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth-server";
import ValidateRewards from "./ValidateRewards";

export const dynamic = "force-dynamic";

export default async function AdminValidatePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  return <ValidateRewards />;
}
