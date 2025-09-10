import { useState, useEffect } from 'react';

interface PointsWarningState {
  shouldShowWarning: boolean;
  warningMessage: string;
  pointsLimit: number;
  warningThreshold: number;
  loading: boolean;
}

export function usePointsWarning(userPoints: number) {
  const [state, setState] = useState<PointsWarningState>({
    shouldShowWarning: false,
    warningMessage: '',
    pointsLimit: 10000,
    warningThreshold: 5000,
    loading: true,
  });

  useEffect(() => {
    const fetchPointsLimit = async () => {
      try {
        const response = await fetch('/api/config/points-limit');
        const data = await response.json();
        
        if (data.success) {
          const pointsLimit = data.pointsLimit;
          const warningThreshold = Math.round(pointsLimit * 0.5);
          const shouldShowWarning = userPoints >= warningThreshold;
          
          let warningMessage = '';
          if (shouldShowWarning) {
            const percentage = Math.round((userPoints / pointsLimit) * 100);
            warningMessage = `¡Tienes ${userPoints.toLocaleString('es-AR')} puntos! Te recomendamos canjear algunos premios.`;
          }

          setState({
            shouldShowWarning,
            warningMessage,
            pointsLimit,
            warningThreshold,
            loading: false,
          });
        } else {
          // Fallback a valores por defecto
          setState({
            shouldShowWarning: userPoints >= 5000,
            warningMessage: userPoints >= 5000 ? `¡Tienes ${userPoints.toLocaleString('es-AR')} puntos! Te recomendamos canjear algunos premios.` : '',
            pointsLimit: 10000,
            warningThreshold: 5000,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error fetching points limit:', error);
        // Fallback a valores por defecto
        setState({
          shouldShowWarning: userPoints >= 5000,
          warningMessage: userPoints >= 5000 ? `¡Tienes ${userPoints.toLocaleString('es-AR')} puntos! Te recomendamos canjear algunos premios.` : '',
          pointsLimit: 10000,
          warningThreshold: 5000,
          loading: false,
        });
      }
    };

    fetchPointsLimit();
  }, [userPoints]);

  return state;
}
