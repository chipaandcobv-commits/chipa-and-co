import type { Metadata } from "next";
import { Geist, Geist_Mono, Urbanist, Dela_Gothic_One, Dancing_Script } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import NextAuthSessionProvider from "@/components/SessionProvider";
import { DataCacheProvider } from "@/contexts/DataCacheContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const urbanist = Urbanist({
  variable: "--urbanist",
  subsets: ["latin"],
});

const delaGothicOne = Dela_Gothic_One({
  variable: "--dela-gothic-one",
  subsets: ["latin"],
  weight: "400",
});

const dancingScript = Dancing_Script({
  variable: "--dancing-script",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Chipa&Co",
  description: "Sistema de fidelización de Chipa&Co - Gana puntos y canjea premios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${urbanist.variable} ${delaGothicOne.variable} ${dancingScript.variable} antialiased`}
      >
        <NextAuthSessionProvider>
          <AuthProvider>
            <DataCacheProvider>
              <ConditionalNavbar />
              {children}
            </DataCacheProvider>
          </AuthProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
