"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { UserIcon, LogoutIcon, HomeIcon, GiftCardIcon, EyeIcon, EyeOffIcon } from "@/components/icons/Icons";

export default function ProfilePage() {
  const { user, loading, logout, refetch } = useAuth();
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

  if (loading) {
    return (
      <div className="min-h-svh w-full bg-[#F7EFE7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26D1F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
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

  // Actualizar datos del perfil cuando el usuario cambie
  if (user && (profileData.name !== user.name || profileData.email !== user.email)) {
    setProfileData({
      name: user.name,
      email: user.email,
    });
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setIsEditing(false);
        refetch();
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: "error", text: data.error });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
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

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: "error", text: data.error });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
      setTimeout(() => setMessage(null), 5000);
    }
  };

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
          <div className="flex items-center gap-3 mb-6">
            <UserIcon className="w-8 h-8 text-[#F26D1F]" />
            <h1 className="text-[24px] font-extrabold text-[#F26D1F]">Mi Perfil</h1>
          </div>
        </div>

        {/* Información del usuario */}
        <section className="px-4">
          <div className="bg-[#F2E2D6] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-600 font-semibold text-xl">
                <span>👤</span>
              </div>
              <div className="flex-1">
                <h2 className="text-[20px] font-bold text-gray-800">{user.name}</h2>
                <p className="text-[14px] text-gray-600">{user.email}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-[#F26D1F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                {isEditing ? "Cancelar" : "Editar"}
              </button>
            </div>

            {/* Formulario de edición */}
            {isEditing && (
              <form onSubmit={handleUpdateProfile} className="mb-6 p-4 bg-white rounded-xl">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26D1F] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26D1F] focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#F26D1F] text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-[15px] font-medium text-gray-700">DNI:</span>
                <span className="text-[15px] font-semibold text-gray-800">{user.dni}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-[15px] font-medium text-gray-700">Puntos actuales:</span>
                <span className="text-[15px] font-bold text-[#F26D1F]">
                  {user.puntos.toLocaleString("es-AR")}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <span className="text-[15px] font-medium text-gray-700">Miembro desde:</span>
                <span className="text-[15px] font-semibold text-gray-800">
                  {new Date(user.createdAt).toLocaleDateString("es-AR")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Cambio de contraseña */}
        <section className="px-4 mt-6">
          <div className="bg-[#F2E2D6] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-gray-800">Cambiar Contraseña</h3>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                {isChangingPassword ? "Cancelar" : "Cambiar"}
              </button>
            </div>

            {isChangingPassword && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26D1F] focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26D1F] focus:border-transparent"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26D1F] focus:border-transparent"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#F26D1F] text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Cambiar Contraseña
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Botón de cerrar sesión */}
        <section className="px-4 mt-6">
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-3"
          >
            <LogoutIcon className="w-5 h-5" />
            Cerrar Sesión
          </button>
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
            className="flex flex-col items-center p-2 rounded-lg transition-colors text-gray-600 hover:text-[#F26D1F]"
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Inicio</span>
          </button>
          <button 
            onClick={() => window.location.href = "/cliente/profile"}
            className="flex flex-col items-center p-2 rounded-lg transition-colors text-[#F26D1F] bg-orange-50"
          >
            <UserIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
