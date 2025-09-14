import { useAuth } from '@/lib/auth';
import { useDataCache } from '@/contexts/DataCacheContext';
import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook personalizado para manejar los puntos del usuario
 * Sincroniza datos entre AuthContext y DataCacheContext
 */
export function useUserPoints() {
  const { user, refetch: refetchAuth } = useAuth();
  const { data, forceRefreshUserData, isDataStale } = useDataCache();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Función para forzar actualización de puntos con debounce
  const refreshPoints = useCallback(async () => {
    // Evitar múltiples refreshes simultáneos
    if (isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;

    try {
      // Limpiar timeout anterior si existe
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      // Debounce: esperar 1 segundo antes de hacer la petición
      await new Promise(resolve => {
        refreshTimeoutRef.current = setTimeout(resolve, 1000);
      });

      // Actualizar solo el contexto de autenticación (evitar duplicar peticiones)
      await refetchAuth();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [refetchAuth]);

  // Verificar si los datos del usuario están desactualizados (solo una vez al montar)
  const isUserDataStale = isDataStale('userProfile');

  // Sincronizar datos al montar el componente y cuando los datos estén desactualizados
  useEffect(() => {
    // Siempre refrescar al montar para obtener datos frescos de la base de datos
    if (!isRefreshingRef.current) {
      refreshPoints();
    }
  }, []); // Solo ejecutar una vez al montar

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Obtener puntos del usuario con fallback
  const userPoints = user?.puntos ?? data.userProfile?.puntos ?? 0;
  const userHistoricPoints = user?.puntosHistoricos ?? data.userProfile?.puntosHistoricos ?? 0;

  return {
    userPoints,
    userHistoricPoints,
    refreshPoints,
    isUserDataStale,
    loading: !user && !data.userProfile
  };
}
