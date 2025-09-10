"use client";

import { useState, useEffect } from 'react';
import { GiftCardIcon } from './icons/Icons';

interface PointsWarningBannerProps {
  shouldShow: boolean;
  message: string;
  userPoints: number;
  pointsLimit: number;
  onDismiss?: () => void;
}

export default function PointsWarningBanner({
  shouldShow,
  message,
  userPoints,
  pointsLimit,
  onDismiss
}: PointsWarningBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (shouldShow && !isDismissed) {
      // Pequeño delay para que aparezca suavemente
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [shouldShow, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    onDismiss?.();
  };

  if (!shouldShow || isDismissed || !isVisible) {
    return null;
  }

  const percentage = Math.round((userPoints / pointsLimit) * 100);

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 transition-all duration-500 transform ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className="bg-gradient-to-r from-[#F59E0B] to-[#F15A25] rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icono */}
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <GiftCardIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">
                  💡 ¡Aprovecha tus puntos!
                </h3>
                <button
                  onClick={handleDismiss}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Cerrar advertencia"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-sm text-white/90 leading-relaxed mb-3">
                {message}
              </p>
              
              {/* Barra de progreso */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-white/80 mb-1">
                  <span>Puntos acumulados</span>
                  <span>{percentage}% del límite</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-white/80">
                <span>{userPoints.toLocaleString('es-AR')} / {pointsLimit.toLocaleString('es-AR')} puntos</span>
                <span className="bg-white/20 px-2 py-1 rounded-full">
                  ¡Canjea premios!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
