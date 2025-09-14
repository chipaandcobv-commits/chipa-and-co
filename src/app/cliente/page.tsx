"use client";

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useCachedRewards } from "@/lib/hooks/useCachedRewards";
import { useClaimReward } from "@/lib/hooks/useClaimReward";
import { usePointsWarning } from "@/lib/hooks/usePointsWarning";
import { useRealTimePoints } from "@/lib/hooks/useRealTimePoints";
import { GiftCardIcon } from "@/components/icons/Icons";
import RewardConfirmationModal from "@/components/RewardConfirmationModal";
import PointsWarningBanner from "@/components/PointsWarningBanner";
import { CldImage } from "next-cloudinary";

export default function ClientePage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const { user, loading: userLoading, refetch: refetchUser } = useAuth();
  const { rewards, loading: rewardsLoading, refetch: refetchRewards } = useCachedRewards();
  const { claimReward, loading: claiming } = useClaimReward();
  
  // Mantener los puntos actualizados en tiempo real
  useRealTimePoints();

  // Memoizar el nombre del usuario
  const userName = useMemo(() => user?.name?.split(" ")[0] || "", [user?.name]);
  
  // Memoizar los puntos del usuario
  const userPoints = useMemo(() => (user?.puntos || 0), [user?.puntos]);
  
  // Hook para la advertencia de puntos
  const pointsWarning = usePointsWarning(userPoints);

  const handleRewardClick = useCallback((reward: any) => {
    setSelectedReward(reward);
    setShowConfirmationModal(true);
  }, []);

  const handleConfirmClaim = useCallback(async () => {
    if (!selectedReward) return;
    
    claimReward({
      rewardId: selectedReward.id,
      onSuccess: (data) => {
        setMessage({ type: "success", text: data.message });
        setShowConfirmationModal(false);
        setSelectedReward(null);
        setTimeout(() => setMessage(null), 5000);
      },
      onError: (error) => {
        setMessage({ type: "error", text: error });
        setTimeout(() => setMessage(null), 5000);
      },
    });
  }, [selectedReward, claimReward, refetchUser, refetchRewards]);

  const handleCloseModal = useCallback(() => {
    setShowConfirmationModal(false);
    setSelectedReward(null);
  }, []);

  // Memoizar el mensaje de notificación
  const notificationMessage = useMemo(() => {
    if (!message) return null;
    
    return (
      <div className={`absolute top-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
        message.type === "success" 
          ? "bg-green-500 text-white" 
          : "bg-red-500 text-white"
      }`}>
        <p className="text-center font-medium">{message.text}</p>
      </div>
    );
  }, [message]);

  // Función para determinar si mostrar "pts" basándose en la longitud del número
  const getPointsDisplay = (points: number) => {
    const pointsStr = points.toLocaleString("es-AR");
    // Si el número tiene más de 4 dígitos, omitir "pts"
    if (pointsStr.length > 4) {
      return pointsStr;
    }
    return `${pointsStr} pts`;
  };

  // Memoizar la sección de premios
  const rewardsSection = useMemo(() => (
    <div className="grid grid-cols-2 gap-4">
      {rewards.map((reward) => (
        <div key={reward.id} className="">
          <div 
            className="relative h-40 w-full rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white cursor-pointer hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow overflow-hidden"
            onClick={() => handleRewardClick(reward)}
          >
            {/* Imagen del premio */}
            {reward.imageUrl ? (
              reward.imageUrl.startsWith('data:') ? (
                <img
                  src={reward.imageUrl}
                  alt={reward.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={() => {
                    console.error('Error loading reward image:', reward.imageUrl);
                  }}
                />
              ) : (
                <CldImage
                  src={reward.imageUrl}
                  alt={reward.name}
                  width={400}
                  height={300}
                  className="h-full w-full object-cover"
                  crop="fill"
                  gravity="auto"
                  loading="lazy"
                  onError={() => {
                    console.error('Error loading reward image:', reward.imageUrl);
                  }}
                />
              )
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <GiftCardIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Sin imagen</p>
                </div>
              </div>
            )}

            {/* Badge de puntos centrado abajo */}
            <div className="absolute left-0 bottom-0 w-full flex justify-center pb-3">
              <span className="inline-flex items-center justify-center rounded-full bg-[#F15A25] px-3 py-1 text-[14px] text-white shadow w-[80%] font-dela-gothic whitespace-nowrap overflow-hidden">
                {getPointsDisplay(reward.pointsCost)}
              </span>
            </div>

            {/* Overlay de carga */}
            {claiming && (
              <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <p className="mt-2 text-center text-[16px] font-semibold text-neutral-800">
            {reward.name}
          </p>
        </div>
      ))}
    </div>
  ), [rewards, claiming, handleRewardClick]);

  // Mostrar loading mientras se cargan los datos
  if (userLoading || rewardsLoading) {
    return (
      <div className="min-h-svh w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
        <div className="mx-auto max-w-[480px] min-h-svh relative pb-28">
          <div className="flex items-center justify-center min-h-[calc(100vh-7rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A25] mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje apropiado si no hay usuario después de cargar
  if (!user && !userLoading) {
    return (
      <div className="min-h-svh w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
        <div className="mx-auto max-w-[480px] min-h-svh relative pb-28">
          <div className="flex items-center justify-center min-h-[calc(100vh-7rem)]">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Sesión no encontrada</h2>
                <p className="text-gray-600 mb-4">Por favor, inicia sesión para acceder a tu cuenta</p>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-[#F15A25] text-white px-6 py-2 rounded-lg hover:bg-[#FF6B35] transition-colors"
                >
                  Ir a Iniciar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No renderizar nada si aún está cargando o si faltan propiedades del usuario
  if (!user || typeof user.puntos === 'undefined') {
    return (
      <div className="min-h-svh w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
        <div className="mx-auto max-w-[480px] min-h-svh relative pb-28">
          <div className="flex items-center justify-center min-h-[calc(100vh-7rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A25] mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando información del usuario...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
      {/* FRAME - viewport centrado como móvil */}
      <div className="mx-auto max-w-[480px] min-h-svh relative pb-28">
        {/* Banner de advertencia de puntos */}
        <PointsWarningBanner
          shouldShow={pointsWarning.shouldShowWarning}
          message={pointsWarning.warningMessage}
          userPoints={userPoints}
          pointsLimit={pointsWarning.pointsLimit}
        />
        
        {/* Mensaje de notificación */}
        {notificationMessage}
        
        {/* Header de bienvenida */}
        <div className="pt-4">
          <div className="ml-4 rounded-l-full rounded-r-none bg-[#FCE6D5] py-3 pr-2 pl-4 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-600 text-sm">
              <span>👤</span>
            </div>
            <div className="leading-tight">
              <p className="text-[14px] font-medium text-neutral-800">
                Bienvenido, {userName}!
              </p>
            </div>
          </div>
        </div>

        <p className="text-[13px] text-gray-600 px-4 mt-2">
          Disfrutá canjeando tus puntos por premios!
        </p>

        {/* Mis puntos */}
        <section className="px-4 mt-4">
          <h2 className="text-[24px] font-extrabold text-[#F15A25] font-weight-800 line-height-140%">
            Mis Puntos
          </h2>

          <div className="relative mt-2 rounded-3xl bg-[#F15A25] text-white shadow-[0_10px_20px_rgba(242,109,31,0.35)]">
            <div className="flex items-center justify-between p-5">
              <div>
                <div className="flex items-end gap-2 leading-none">
                  <span className="text-4xl font-dela-gothic tracking-tight text-[#FFF5E8]">
                    {userPoints.toLocaleString("es-AR")}
                  </span>
                </div>
                <div className="text-[#FFF5E8] font-dela-gothic text-[20px] font-normal leading-[140%] tracking-[-0.4px] mt-1">
                  puntos
                </div>
              </div>

              {/* Icono tipo gift-card al costado derecho */}
              <div className="relative">
                <div className="absolute -right-2 -top-2 h-14 w-20 rounded-xl" />
                <div className="relative flex items-center gap-2 pr-1">
                  <GiftCardIcon className="h-17 w-17 opacity-95" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Premios */}
        <section className="px-4 mt-4">
          <h3 className="text-[22px] font-extrabold text-[#F15A25] mb-2">
            Premios
          </h3>
          {rewardsSection}
        </section>

        {/* Modal de confirmación */}
        <RewardConfirmationModal
          reward={selectedReward}
          isOpen={showConfirmationModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmClaim}
          loading={claiming}
          userPoints={userPoints}
        />
      </div>
    </div>
  );
}
