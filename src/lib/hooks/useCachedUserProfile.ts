import { useDataCache } from '@/contexts/DataCacheContext';

export function useCachedUserProfile() {
  const { data, refetch, isDataStale } = useDataCache();

  const refreshProfile = () => refetch('userProfile');

  return {
    user: data.userProfile,
    loading: data.loading.userProfile,
    error: null, // El contexto maneja los errores internamente
    refetch: refreshProfile,
  };
}
