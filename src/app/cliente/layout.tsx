import type { Metadata } from "next";

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
    <div className="cliente-layout">
      {children}
    </div>
  );
}
