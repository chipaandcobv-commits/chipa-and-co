"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRewards } from "@/lib/hooks/useRewards";
import { useClaimReward } from "@/lib/hooks/useClaimReward";
import { GiftCardIcon, HomeIcon, UserIcon } from "@/components/icons/Icons";

export default function ClientePage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { user, loading: userLoading, refetch: refetchUser } = useAuth();
  const { rewards, loading: rewardsLoading, refetch: refetchRewards } = useRewards();
  const { claimReward, loading: claiming } = useClaimReward();

  if (userLoading || rewardsLoading) {
    return (
      <div className="min-h-svh w-full bg-[#F7EFE7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26D1F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-svh w-full bg-[#F7EFE7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se pudo cargar la información del usuario</p>
        </div>
      </div>
    );
  }

  const handleClaimReward = async (rewardId: string) => {
    claimReward({
      rewardId,
      onSuccess: (data) => {
        setMessage({ type: "success", text: data.message });
        refetchUser();
        refetchRewards();
        setTimeout(() => setMessage(null), 5000);
      },
      onError: (error) => {
        setMessage({ type: "error", text: error });
        setTimeout(() => setMessage(null), 5000);
      },
    });
  };

  return (
    <div className="min-h-svh w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
      {/* FRAME - viewport centrado como móvil */}
      <div className="mx-auto max-w-[480px] min-h-svh relative pb-28">
        {/* Mensaje de notificación */}
        {message && (
          <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            message.type === "success" 
              ? "bg-green-500 text-white" 
              : "bg-red-500 text-white"
          }`}>
            <p className="text-center font-medium">{message.text}</p>
          </div>
        )}
        {/* Header de bienvenida */}
        <div className="pt-4">
            <div className="ml-4 rounded-l-full rounded-r-none bg-[#FCE6D5] py-3 pr-2 pl-4 shadow-sm flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-600 text-sm">
                <span>👤</span>
              </div>
              <div className="leading-tight">
                <p className="text-[14px] font-medium text-neutral-800">
                  Bienvenido, {user.name.split(" ")[0]}!
                </p>
              </div>
            </div>
          </div>



        <p className="text-[13px] text-gray-600 px-4 mt-2">
                Disfrutá canjeando tus puntos por premios!
              </p>

        {/* Mis puntos */}
        <section className="px-4 mt-4">
          <h2 className="text-[22px] font-extrabold text-[#F26D1F]">
            Mis Puntos
          </h2>

          <div className="relative mt-2 rounded-3xl bg-[#F26D1F] text-white shadow-[0_10px_20px_rgba(242,109,31,0.35)]">
            <div className="flex items-center justify-between p-5">
              <div>
                <div className="flex items-end gap-2 leading-none">
                  <span className="text-4xl font-black tracking-tight">
                    {user.puntos.toLocaleString("es-AR")}
                  </span>
                </div>
                <div className="uppercase text-white/90 tracking-wide font-semibold text-[15px] mt-1">
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
          <h3 className="text-[22px] font-extrabold text-[#F26D1F] mb-2">
            Premios
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="">
                <div 
                  className="relative h-40 w-full rounded-2xl bg-[#F4E7DB] shadow-[0_6px_14px_rgba(0,0,0,0.08)] border border-white cursor-pointer hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow"
                  onClick={() => handleClaimReward(reward.id)}
                >
                  {/* badge de puntos dentro de la tarjeta en esquina inferior izq */}
                  <div className="absolute left-3 bottom-3">
                    <span className="inline-flex items-center rounded-full bg-[#F26D1F] px-3 py-1 text-[13px] font-extrabold text-white shadow">
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
                {reward.description && (
                  <p className="mt-1 text-center text-[12px] text-neutral-600">
                    {reward.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-[#F7EFE7] border-t border-gray-200 flex justify-around items-center py-3 px-6 shadow-lg rounded-t-2xl max-w-[480px] w-full z-50">
                     <button 
             onClick={() => window.location.href = "/cliente/rewards"}
             className="flex flex-col items-center p-2 rounded-lg transition-colors text-gray-600 hover:text-[#F26D1F]"
           >
             <GiftCardIcon className="w-6 h-6" />
             <span className="text-xs mt-1">Premios</span>
           </button>
          <button 
            onClick={() => window.location.href = "/cliente"}
            className="flex flex-col items-center p-2 rounded-lg transition-colors text-[#F26D1F] bg-orange-50"
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Inicio</span>
          </button>
          <button 
            onClick={() => window.location.href = "/cliente/profile"}
            className="flex flex-col items-center p-2 rounded-lg transition-colors text-gray-600 hover:text-[#F26D1F]"
          >
            <UserIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
