'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { User, Lock, Mail, UserCheck, Eye, EyeOff } from 'lucide-react';

interface UserData {
  name: string;
  email: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfileSettings() {
  const { user, checkAuth } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUserDataUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('¡Datos actualizados exitosamente!', 'success');
        await checkAuth(); // Actualizar el contexto de autenticación
      } else {
        showMessage(data.error || 'Error al actualizar los datos', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validaciones
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('Las contraseñas nuevas no coinciden', 'error');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('La nueva contraseña debe tener al menos 6 caracteres', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('¡Contraseña actualizada exitosamente!', 'success');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        showMessage(data.error || 'Error al actualizar la contraseña', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mensaje de estado */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg font-medium ${
            messageType === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Información del usuario */}
      <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
        <div className="flex items-center mb-6">
          <UserCheck className="h-6 w-6 text-orange-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">
            Información Personal
          </h2>
        </div>
        
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           <div className="bg-orange-50 rounded-lg p-4">
             <p className="text-sm text-orange-600 font-medium">Puntos Actuales</p>
             <p className="text-2xl font-bold text-orange-700">{user.puntos}</p>
           </div>
           <div className="bg-blue-50 rounded-lg p-4">
             <p className="text-sm text-blue-600 font-medium">Puntos Históricos</p>
             <p className="text-2xl font-bold text-blue-700">{user.puntosHistoricos}</p>
           </div>
           <div className="bg-gray-50 rounded-lg p-4">
             <p className="text-sm text-gray-600 font-medium">DNI</p>
             <p className="text-2xl font-bold text-gray-700">{user.dni}</p>
           </div>
         </div>

        <form onSubmit={handleUserDataUpdate} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          

          <Button
            type="submit"
            isLoading={loading}
            className="w-full"
            disabled={loading}
          >
            Actualizar Datos Personales
          </Button>
        </form>
      </div>

      {/* Cambio de contraseña */}
      <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
        <div className="flex items-center mb-6">
          <Lock className="h-6 w-6 text-orange-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">
            Cambiar Contraseña
          </h2>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña Actual
            </label>
                         <div className="relative">
               <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
               <Input
                 id="currentPassword"
                 type={showCurrentPassword ? 'text' : 'password'}
                 value={passwordData.currentPassword}
                 onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                 className="pl-10"
                 required
                 rightIcon={
                   <button
                     type="button"
                     onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                     className="text-gray-400 hover:text-gray-600"
                   >
                     {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                   </button>
                 }
               />
             </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
                         <div className="relative">
               <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
               <Input
                 id="newPassword"
                 type={showNewPassword ? 'text' : 'password'}
                 value={passwordData.newPassword}
                 onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                 className="pl-10"
                 required
                 minLength={6}
                 rightIcon={
                   <button
                     type="button"
                     onClick={() => setShowNewPassword(!showNewPassword)}
                     className="text-gray-400 hover:text-gray-600"
                   >
                     {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                   </button>
                 }
               />
             </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nueva Contraseña
            </label>
                         <div className="relative">
               <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
               <Input
                 id="confirmPassword"
                 type={showConfirmPassword ? 'text' : 'password'}
                 value={passwordData.confirmPassword}
                 onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                 className="pl-10"
                 required
                 minLength={6}
                 rightIcon={
                   <button
                     type="button"
                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                     className="text-gray-400 hover:text-gray-600"
                   >
                     {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                   </button>
                 }
               />
             </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full"
            disabled={loading}
          >
            Cambiar Contraseña
          </Button>
        </form>
      </div>
    </div>
  );
}
