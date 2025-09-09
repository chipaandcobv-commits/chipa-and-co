import type { Metadata } from "next";
import { Geist, Geist_Mono, Urbanist, Dela_Gothic_One } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import ConditionalNavbar from "@/components/ConditionalNavbar";
import NextAuthSessionProvider from "@/components/SessionProvider";

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

export const metadata: Metadata = {
  title: "Chipa&Co - Sistema de Fidelización",
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
        className={`${geistSans.variable} ${geistMono.variable} ${urbanist.variable} ${delaGothicOne.variable} antialiased`}
      >
        <NextAuthSessionProvider>
          <AuthProvider>
            <ConditionalNavbar />
            {children}
          </AuthProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
