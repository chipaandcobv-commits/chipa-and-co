"use client";

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/components/AuthContext";
import { useRewards } from "@/lib/hooks/useRewards";
import { useClaimReward } from "@/lib/hooks/useClaimReward";
import { GiftCardIcon } from "@/components/icons/Icons";
import RewardConfirmationModal from "@/components/RewardConfirmationModal";
import BottomNavigation from "@/components/BottomNavigation";

export default function ClientePage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const { user, loading: userLoading, refetch: refetchUser } = useAuth();
  const { rewards, loading: rewardsLoading, refetch: refetchRewards } = useRewards();
  const { claimReward, loading: claiming } = useClaimReward();

  // Memoizar el nombre del usuario
  const userName = useMemo(() => user?.name?.split(" ")[0] || "", [user?.name]);
  
  // Memoizar los puntos del usuario
  const userPoints = useMemo(() => (user?.puntos || 0), [user?.puntos]);

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
        refetchUser();
        refetchRewards();
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

  // Memoizar la sección de premios
  const rewardsSection = useMemo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {rewards.map((reward) => (
        <div key={reward.id} className="">
          <div 
            className="relative h-40 w-full rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white cursor-pointer hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow overflow-hidden"
            onClick={() => handleRewardClick(reward)}
          >
            {/* Imagen del premio */}
            {reward.imageUrl ? (
              <img
                src={reward.imageUrl}
                alt={reward.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400">
                Sin imagen
              </div>
            )}

            {/* Badge de puntos centrado abajo */}
            <div className="absolute left-0 bottom-0 w-full flex justify-center pb-3">
              <span className="inline-flex items-center justify-center rounded-full bg-[#F15A25] px-6 py-1 text-[15px] text-white shadow w-[80%] font-dela-gothic">
                {reward.pointsCost.toLocaleString("es-AR")} pts
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
          <BottomNavigation />
        </div>
      </div>
    );
  }

  // Mostrar error si no hay usuario después de cargar
  if (!user && !userLoading) {
    return (
      <div className="min-h-svh w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
        <div className="mx-auto max-w-[480px] min-h-svh relative pb-28">
          <div className="flex items-center justify-center min-h-[calc(100vh-7rem)]">
            <div className="text-center">
              <p className="text-gray-600">No se pudo cargar la información del usuario</p>
            </div>
          </div>
          <BottomNavigation />
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
          <BottomNavigation />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
      {/* FRAME - viewport centrado como móvil */}
      <div className="mx-auto max-w-[480px] min-h-svh relative pb-28">
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

        {/* Bottom Navigation */}
        <BottomNavigation />

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
