import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Reward {
  id: string;
  name: string;
  description?: string;
  pointsCost: number;
  imageUrl?: string;
}

interface RewardConfirmationModalProps {
  reward: Reward | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  userPoints: number;
}

export default function RewardConfirmationModal({
  reward,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  userPoints,
}: RewardConfirmationModalProps) {
  if (!isOpen || !reward) return null;

  const canAfford = userPoints >= reward.pointsCost;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#F7EFE7] rounded-2xl max-w-xs w-full max-h-[80vh] overflow-y-auto border border-[#FCE6D5] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-[#FCE6D5]">
          <h3 className="text-base font-bold text-[#F15A25]">Confirmar Canje</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-[#F15A25] transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Image */}
          <div className="relative h-32 w-full rounded-xl bg-[#F4E7DB] mb-3 overflow-hidden">
            {reward.imageUrl ? (
              <img
                src={reward.imageUrl}
                alt={reward.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-400 text-4xl">🎁</div>
              </div>
            )}
          </div>

          {/* Reward Info */}
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-gray-800">{reward.name}</h4>
            
            {reward.description && (
              <p className="text-gray-600 text-xs">{reward.description}</p>
            )}

            {/* Points Info */}
            <div className="bg-[#FCE6D5] rounded-lg p-2 border border-[#F15A25]/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Costo:</span>
                <span className="text-lg font-bold text-orange-600">
                  {reward.pointsCost.toLocaleString("es-AR")} pts
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-medium text-gray-700">Tus puntos:</span>
                <span className={`text-sm font-medium ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                  {userPoints.toLocaleString("es-AR")} pts
                </span>
              </div>
            </div>

            {/* Warning about 24 hours */}
            <div className="bg-[#FCE6D5] rounded-lg p-2 border border-[#F15A25]/30">
              <div className="flex items-start gap-2">
                <div className="text-[#F15A25] text-sm">⚠️</div>
                <div>
                  <p className="text-xs font-medium text-[#F15A25]">
                    Tienes 24 horas para reclamar
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Después de 24 horas, el premio pasará a estado &quot;vencido&quot;.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-3 border-t border-[#FCE6D5] space-y-2">
          {!canAfford && (
            <div className="bg-red-50 rounded-lg p-2 border border-red-200">
              <p className="text-xs text-red-700 text-center">
                No tienes suficientes puntos para canjear este premio
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-3 py-2 text-gray-600 bg-[#F4E7DB] rounded-lg text-sm font-medium hover:bg-[#FCE6D5] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || !canAfford}
              className="flex-1 px-3 py-2 bg-[#F15A25] text-white rounded-lg text-sm font-medium hover:bg-[#F15A25]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  <span className="text-xs">Canjeando...</span>
                </div>
              ) : (
                "Confirmar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
