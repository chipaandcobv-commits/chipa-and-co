"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CacheData {
  rewards: any[];
  userClaims: any[];
  userProfile: any;
  pointsLimit: any;
  loading: {
    rewards: boolean;
    userClaims: boolean;
    userProfile: boolean;
    pointsLimit: boolean;
  };
  lastFetch: {
    rewards: number;
    userClaims: number;
    userProfile: number;
    pointsLimit: number;
  };
}

interface DataCacheContextType {
  data: CacheData;
  refetch: (key?: keyof CacheData) => Promise<void>;
  isDataStale: (key: keyof CacheData, maxAge?: number) => boolean;
}

const DataCacheContext = createContext<DataCacheContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function DataCacheProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CacheData>({
    rewards: [],
    userClaims: [],
    userProfile: null,
    pointsLimit: null,
    loading: {
      rewards: true,
      userClaims: true,
      userProfile: true,
      pointsLimit: true,
    },
    lastFetch: {
      rewards: 0,
      userClaims: 0,
      userProfile: 0,
      pointsLimit: 0,
    },
  });

  const fetchData = async (key: keyof CacheData) => {
    try {
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, [key]: true }
      }));

      let response;
      let endpoint;

      switch (key) {
        case 'rewards':
          endpoint = '/api/rewards';
          break;
        case 'userClaims':
          endpoint = '/api/user/claims';
          break;
        case 'userProfile':
          endpoint = '/api/user/me';
          break;
        case 'pointsLimit':
          endpoint = '/api/config/points-limit';
          break;
        default:
          return;
      }

      response = await fetch(endpoint);
      const result = await response.json();

      if (result.success) {
        let dataToStore;
        switch (key) {
          case 'rewards':
            dataToStore = result.rewards;
            break;
          case 'userClaims':
            dataToStore = result.claims;
            break;
          case 'userProfile':
            dataToStore = result.user;
            break;
          case 'pointsLimit':
            dataToStore = result;
            break;
          default:
            dataToStore = result;
        }
        
        setData(prev => ({
          ...prev,
          [key]: dataToStore,
          loading: { ...prev.loading, [key]: false },
          lastFetch: { ...prev.lastFetch, [key]: Date.now() }
        }));
      } else {
        setData(prev => ({
          ...prev,
          loading: { ...prev.loading, [key]: false }
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      setData(prev => ({
        ...prev,
        loading: { ...prev.loading, [key]: false }
      }));
    }
  };

  const refetch = async (key?: keyof CacheData) => {
    if (key) {
      await fetchData(key);
    } else {
      // Refetch all data
      await Promise.all([
        fetchData('rewards'),
        fetchData('userClaims'),
        fetchData('userProfile'),
        fetchData('pointsLimit')
      ]);
    }
  };

  const isDataStale = (key: keyof CacheData, maxAge: number = CACHE_DURATION) => {
    const lastFetch = data.lastFetch[key];
    return Date.now() - lastFetch > maxAge;
  };

  // Precargar todos los datos al montar el componente
  useEffect(() => {
    refetch();
  }, []);

  return (
    <DataCacheContext.Provider value={{ data, refetch, isDataStale }}>
      {children}
    </DataCacheContext.Provider>
  );
}

export function useDataCache() {
  const context = useContext(DataCacheContext);
  if (context === undefined) {
    throw new Error('useDataCache must be used within a DataCacheProvider');
  }
  return context;
}
