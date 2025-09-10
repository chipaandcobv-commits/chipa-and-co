"use client";

import { useState, useRef, useEffect } from 'react';
import Button from './ui/Button';
import { EyeIcon, EyeOffIcon } from './icons/Icons';

interface SecurityKeyModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export default function SecurityKeyModal({ isOpen, onSuccess, onClose }: SecurityKeyModalProps) {
  const [securityKey, setSecurityKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Enfocar el input cuando se abre el modal
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Limpiar estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setSecurityKey('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Solo permitir números y máximo 4 dígitos
    if (/^\d*$/.test(value) && value.length <= 4) {
      setSecurityKey(value);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (securityKey.length !== 4) {
      setError('La clave debe tener exactamente 4 números');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/validate-security-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ securityKey }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || 'Clave de seguridad incorrecta');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && securityKey.length === 4) {
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#F15A25] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🔐 Clave de Seguridad
          </h2>
          <p className="text-gray-600">
            Ingresa la clave de 4 números para acceder a la configuración del sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clave de Seguridad
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showKey ? "text" : "password"}
                value={securityKey}
                onChange={handleKeyChange}
                onKeyDown={handleKeyDown}
                placeholder="••••"
                maxLength={4}
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F15A25] focus:border-transparent"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showKey ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ingresa exactamente 4 números
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#F15A25] hover:bg-[#E55A1A] text-white"
              isLoading={loading}
              disabled={securityKey.length !== 4 || loading}
            >
              {loading ? 'Validando...' : 'Acceder'}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-[#F0F9FF] rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                Información de Seguridad
              </h4>
              <p className="text-xs text-blue-700">
                Esta clave protege el acceso a la configuración crítica del sistema. 
                Solo puede ser modificada directamente desde la base de datos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
