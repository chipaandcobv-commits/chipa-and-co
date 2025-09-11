"use client";

import { useEffect, useState } from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

export default function ClientOnly({ children, fallback = null, delay = 0 }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // Delay adicional para asegurar que la hidratación esté completa
    const timer = setTimeout(() => {
      setIsReady(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!hasMounted || !isReady) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
