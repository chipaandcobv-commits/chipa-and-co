import { useDataCache } from '@/contexts/DataCacheContext';

export function useCachedPointsLimit() {
  const { data, refetch, isDataStale } = useDataCache();

  const refreshPointsLimit = () => refetch('pointsLimit');

  return {
    pointsLimit: data.pointsLimit,
    loading: data.loading.pointsLimit,
    error: null, // El contexto maneja los errores internamente
    refetch: refreshPointsLimit,
  };
}
