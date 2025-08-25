"use client";

import { usePathname } from "next/navigation";
import AuthHeader from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const isClienteRoute = pathname.startsWith("/cliente");

  if (isClienteRoute) {
    return null;
  }

  return <AuthHeader />;
}
