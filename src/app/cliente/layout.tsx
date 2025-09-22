import type { Metadata } from "next";
import ProfileCompletionGuard from "../../components/ProfileCompletionGuard";
import ClientNavbar from "../../components/ClientNavbar";

export const metadata: Metadata = {
  title: "Chipa&Co - Cliente",
  description: "Panel del cliente - Chipa&Co",

};

export default function ClienteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProfileCompletionGuard>
      <div className="cliente-layout">
        {children}
        <ClientNavbar />
      </div>
    </ProfileCompletionGuard>
  );
}
