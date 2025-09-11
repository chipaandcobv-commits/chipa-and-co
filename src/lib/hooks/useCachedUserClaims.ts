import { useDataCache } from '@/contexts/DataCacheContext';

export function useCachedUserClaims() {
  const { data, refetch, isDataStale } = useDataCache();

  const refreshClaims = () => refetch('userClaims');

  return {
    claims: data.userClaims,
    loading: data.loading.userClaims,
    error: null, // El contexto maneja los errores internamente
    refetch: refreshClaims,
  };
}
