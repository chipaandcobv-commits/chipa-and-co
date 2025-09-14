import { useCallback } from 'react';

/**
 * Hook para manejar el bug específico de iOS Safari con inputs de contraseña
 * donde no se puede escribir cuando el campo está oculto (type="password")
 */
export const useIOSPasswordFix = () => {
  const handlePasswordFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    const val = input.value;
    
    // Solo aplicar el fix en iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;
    
    // Forzar re-render del input para iOS Safari
    input.value = '';
    setTimeout(() => {
      input.value = val;
      // Asegurar que el cursor esté al final
      input.setSelectionRange(val.length, val.length);
    }, 0);
  }, []);

  const handlePasswordInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (!isIOS) return;
    
    // Asegurar que el input mantenga el foco en iOS
    if (document.activeElement !== input) {
      input.focus();
    }
  }, []);

  return {
    handlePasswordFocus,
    handlePasswordInput,
  };
};
