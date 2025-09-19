import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

interface ScrollPosition {
  [key: string]: number;
}

// Almacenar posiciones de scroll en sessionStorage
const getStoredPositions = (): ScrollPosition => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = sessionStorage.getItem('viewportScrollPositions');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const setStoredPosition = (path: string, position: number) => {
  if (typeof window === 'undefined') return;
  try {
    const positions = getStoredPositions();
    positions[path] = position;
    sessionStorage.setItem('viewportScrollPositions', JSON.stringify(positions));
  } catch {
    // Ignorar errores de sessionStorage
  }
};

export const useViewportScrollPersistence = () => {
  const pathname = usePathname();

  // Restaurar posición de scroll al montar - usar delay más largo en producción
  useEffect(() => {
    const positions = getStoredPositions();
    const savedPosition = positions[pathname];

    if (savedPosition !== undefined) {
      // Delay más largo en producción para permitir que las animaciones se completen
      const isProduction = process.env.NODE_ENV === 'production';
      const delay = isProduction ? 300 : 100;
      
      setTimeout(() => {
        window.scrollTo(0, savedPosition);
        
        // Usar requestAnimationFrame para asegurar que se aplique
        requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition);
        });
      }, delay);
    }
  }, [pathname]);

  // Guardar posición de scroll al cambiar
  useEffect(() => {
    const handleScroll = () => {
      setStoredPosition(pathname, window.scrollY);
    };

    // Throttle del scroll para mejor rendimiento
    let timeoutId: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  // Función para hacer scroll hacia arriba
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Función para hacer scroll a una posición específica
  const scrollToPosition = (position: number) => {
    window.scrollTo({
      top: position,
      behavior: 'smooth'
    });
  };

  return {
    scrollToTop,
    scrollToPosition
  };
};
