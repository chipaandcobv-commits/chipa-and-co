"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useCachedUserProfile } from "@/lib/hooks/useCachedUserProfile";
import { useUpdateProfile } from "@/lib/hooks/useUpdateProfile";
import { useChangePassword } from "@/lib/hooks/useChangePassword";
import { UserIcon, LogoutIcon, EyeIcon, EyeOffIcon } from "@/components/icons/Icons";

export default function ProfilePage() {
  const { user, loading, logout, refetch } = useAuth();
  const { user: cachedUser, loading: cachedLoading, refetch: refetchCachedUser } = useCachedUserProfile();
  const { updateProfile, loading: updatingProfile } = useUpdateProfile();
  const { changePassword, loading: changingPassword } = useChangePassword();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Estados para edición de perfil
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  
  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Estados para mostrar/ocultar contraseñas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Actualizar datos del perfil cuando el usuario cambie usando useEffect
  React.useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Memoizar el mensaje de notificación
  const notificationMessage = useMemo(() => {
    if (!message) return null;
    
    return (
      <div className={`mb-4 p-4 rounded-lg shadow-lg ${
        message.type === "success" 
          ? "bg-green-500 text-white" 
          : "bg-red-500 text-white"
      }`}>
        <p className="text-center font-medium">{message.text}</p>
      </div>
    );
  }, [message]);

  const handleUpdateProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateProfile({
      profileData,
      onSuccess: (data) => {
        setMessage({ type: "success", text: data.message });
        setIsEditing(false);
        refetch(); // Actualizar también el contexto de auth
        setTimeout(() => setMessage(null), 5000);
      },
      onError: (error) => {
        setMessage({ type: "error", text: error });
        setTimeout(() => setMessage(null), 5000);
      }
    });
  }, [profileData, refetch, updateProfile]);

  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas nuevas no coinciden" });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "La nueva contraseña debe tener al menos 6 caracteres" });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    await changePassword({
      passwordData,
      onSuccess: (data) => {
        setMessage({ type: "success", text: data.message });
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setMessage(null), 5000);
      },
      onError: (error) => {
        setMessage({ type: "error", text: error });
        setTimeout(() => setMessage(null), 5000);
      }
    });
  }, [passwordData, changePassword]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }, [logout]);

  if (loading) {
    return (
      <div className="min-h-svh w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
        <div className="mx-auto max-w-[480px] min-h-svh relative pb-28">
          <div className="flex items-center justify-center min-h-[calc(100vh-7rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A25] mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando perfil...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-svh w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
        <div className="mx-auto max-w-[480px] min-h-svh relative pb-28">
          <div className="flex items-center justify-center min-h-[calc(100vh-7rem)]">
            <div className="text-center">
              <p className="text-gray-600">No se pudo cargar la información del usuario</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
      <div className="mx-auto max-w-[480px] min-h-svh relative pb-28">
        {/* Mensaje de notificación */}
        {notificationMessage}

        {/* Header */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <UserIcon className="w-8 h-8 text-[#F15A25]" />
            <h1 className="text-[24px] font-extrabold text-[#F15A25]">Mi Perfil</h1>
          </div>
        </div>

        {/* Información del Perfil */}
        <section className="px-4">
          <div className="bg-[#F4E7DB] rounded-2xl p-6 shadow-sm border border-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-bold text-neutral-800">Información Personal</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#F15A25] text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Editar
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F15A25] focus:border-transparent"
                    required
                  />
                </div>

                {/* Email - Solo lectura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-200 text-gray-700 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">El email no puede ser modificado</p>
                </div>

                {/* DNI - Solo lectura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DNI
                  </label>
                  <input
                    type="text"
                    value={user.dni || 'No configurado'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-200 text-gray-700 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">El DNI no puede ser modificado</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#F15A25] text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Nombre:</span>
                  <p className="text-lg text-neutral-800">{user.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <p className="text-lg text-neutral-800">{user.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">DNI:</span>
                  <p className="text-lg text-neutral-800">{user.dni || 'No configurado'}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Cambio de Contraseña */}
        <section className="px-4 mt-6">
          <div className="bg-[#F4E7DB] rounded-2xl p-6 shadow-sm border border-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-bold text-neutral-800">Cambiar Contraseña</h2>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="bg-[#F15A25] text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Cambiar
                </button>
              )}
            </div>

            {isChangingPassword && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="current-password"
                      autoComplete="current-password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-14 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F15A25] focus:border-transparent transition-all duration-200 min-h-[48px] h-[48px] text-base"
                      style={{ 
                        fontSize: '16px',
                        WebkitTextSecurity: showCurrentPassword ? 'none' : 'disc'
                      } as React.CSSProperties}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      style={{ minHeight: '20px', minWidth: '20px' }}
                    >
                      {showCurrentPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="new-password"
                      autoComplete="new-password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-14 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F15A25] focus:border-transparent transition-all duration-200 min-h-[48px] h-[48px] text-base"
                      style={{ 
                        fontSize: '16px',
                        WebkitTextSecurity: showNewPassword ? 'none' : 'disc'
                      } as React.CSSProperties}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      style={{ minHeight: '20px', minWidth: '20px' }}
                    >
                      {showNewPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="confirm-password"
                      autoComplete="new-password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-14 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F15A25] focus:border-transparent transition-all duration-200 min-h-[48px] h-[48px] text-base"
                      style={{ 
                        fontSize: '16px',
                        WebkitTextSecurity: showConfirmPassword ? 'none' : 'disc'
                      } as React.CSSProperties}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      style={{ minHeight: '20px', minWidth: '20px' }}
                    >
                      {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#F15A25] text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    Cambiar Contraseña
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Botón de cerrar sesión */}
        <section className="px-4 mt-6">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-3"
          >
            <LogoutIcon className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </section>
      </div>
    </div>
  );
}
