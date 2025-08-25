"use client";

import { useUserClaims } from "@/lib/hooks/useUserClaims";
import { useState } from "react";
import { GiftCardIcon, HomeIcon, UserIcon, CheckIcon, ClockIcon } from "@/components/icons/Icons";

export default function RewardsPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { claims, loading, refetch } = useUserClaims();

  if (loading) {
    return (
      <div className="min-h-svh w-full bg-[#F7EFE7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26D1F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando premios canjeados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
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

        {/* Header */}
        <div className="px-4 pt-4">
                     <div className="flex items-center gap-3 mb-4">
             <GiftCardIcon className="w-8 h-8 text-[#F26D1F]" />
             <h1 className="text-[24px] font-extrabold text-[#F26D1F]">Mis Premios Canjeados</h1>
           </div>
        </div>

        {/* Premios Canjeados */}
        <section className="px-4">
          {claims.length === 0 ? (
                         <div className="text-center py-8">
               <GiftCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
               <p className="text-gray-500 text-lg">Aún no has canjeado ningún premio</p>
               <p className="text-gray-400 text-sm mt-2">¡Ve a la página principal para ver los premios disponibles!</p>
             </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div key={claim.id} className="bg-[#F4E7DB] rounded-2xl p-4 shadow-sm border border-white">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[18px] font-bold text-neutral-800">
                      {claim.reward.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {claim.status === "PENDING" ? (
                        <div className="flex items-center gap-1 text-orange-600">
                          <ClockIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">Pendiente</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">Entregado</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Canjeado por {claim.pointsSpent.toLocaleString("es-AR")} puntos</span>
                    <span>{new Date(claim.createdAt).toLocaleDateString("es-AR")}</span>
                  </div>
                  
                  {claim.reward.description && (
                    <p className="text-sm text-gray-500 mt-2">
                      {claim.reward.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-[#F7EFE7] border-t border-gray-200 flex justify-around items-center py-3 px-6 shadow-lg rounded-t-2xl max-w-[480px] w-full z-50">
                     <button 
             onClick={() => window.location.href = "/cliente/rewards"}
             className="flex flex-col items-center p-2 rounded-lg transition-colors text-[#F26D1F] bg-orange-50"
           >
             <GiftCardIcon className="w-6 h-6" />
             <span className="text-xs mt-1">Premios</span>
           </button>
          <button 
            onClick={() => window.location.href = "/cliente"}
            className="flex flex-col items-center p-2 rounded-lg transition-colors text-gray-600 hover:text-[#F26D1F]"
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
