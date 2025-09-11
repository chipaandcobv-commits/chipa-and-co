import { useDataCache } from '@/contexts/DataCacheContext';

export function useCachedRewards() {
  const { data, refetch, isDataStale } = useDataCache();

  const refreshRewards = () => refetch('rewards');

  return {
    rewards: data.rewards,
    loading: data.loading.rewards,
    error: null, // El contexto maneja los errores internamente
    refetch: refreshRewards,
  };
}
