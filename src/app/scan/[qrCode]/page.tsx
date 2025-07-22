import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth";
import QRScanPage from "./QRScanPage";

// Forzar renderizado dinámico
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ qrCode: string }>;
}

export default async function ScanPage({ params }: Props) {
  const currentUser = await getCurrentUser();
  const { qrCode } = await params;

  if (!currentUser) {
    redirect("/login");
  }

  return <QRScanPage qrCode={qrCode} />;
}
