"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { UserIcon } from "../../../components/icons/Icons";


interface User {
  id: string;
  name: string;
  email: string;
  dni: string;
  role: "USER" | "ADMIN";
  puntos: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    rewardClaims: number;
  };
}

export default function UsersManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "ADMIN">("ALL");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [resettingPasswordUserId, setResettingPasswordUserId] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState<{
    userId: string;
    userName: string;
    userEmail: string;
    newPassword: string;
  } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (roleFilter !== "ALL") params.append("role", roleFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "USER" | "ADMIN") => {
    setUpdatingUserId(userId);
    
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const handleResetPassword = async (userId: string) => {
    setResettingPasswordUserId(userId);
    
    try {
      const response = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResetPasswordData({
          userId: data.data.userId,
          userName: data.data.userName,
          userEmail: data.data.userEmail,
          newPassword: data.data.newPassword,
        });
        setShowPasswordModal(true);
      } else {
        alert(`Error: ${data.error || "Error al resetear contraseña"}`);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Error al resetear contraseña");
    } finally {
      setResettingPasswordUserId(null);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setResetPasswordData(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F7EFE7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F15A25] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.dni || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen w-full bg-[#F7EFE7] text-gray-900 font-urbanist">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 mb-6 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="Buscar usuarios"
                placeholder="Nombre, email o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="relative rounded-2xl bg-[#F4E7DB] shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white overflow-hidden hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-shadow">
          <div className="px-6 py-4 border-b border-white">
            <h2 className="text-lg font-semibold text-[#F15A25]">
              Lista de Usuarios ({filteredUsers.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-[#F15A25] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white">
                <thead className="bg-[#FCE6D5]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                      DNI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                      Puntos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                      Órdenes / Premios
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                      Fecha de Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-800 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#F4E7DB] divide-y divide-white">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#FCE6D5]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-[#F15A25] rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.dni || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === "ADMIN"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#F15A25] font-semibold">
                        {user.puntos} pts
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="text-xs">
                          <div>{user._count.orders} órdenes</div>
                          <div>{user._count.rewardClaims} premios</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Button
                          onClick={() => handleResetPassword(user.id)}
                          disabled={resettingPasswordUserId === user.id}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs"
                        >
                          {resettingPasswordUserId === user.id ? "Reseteando..." : "Resetear Contraseña"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && !loading && (
                <div className="p-8 text-center">
                  <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron usuarios</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal para mostrar nueva contraseña */}
      {showPasswordModal && resetPasswordData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#F4E7DB] rounded-2xl shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-white p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-[#F15A25] mb-2">
                🔑 Contraseña Reseteada
              </h3>
              <p className="text-sm text-gray-600">
                La contraseña ha sido reseteada exitosamente
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#FCE6D5] rounded-lg p-4">
                <label className="block text-sm font-medium text-[#F15A25] mb-1">Usuario:</label>
                <p className="text-sm text-gray-900 font-medium">{resetPasswordData.userName}</p>
              </div>
              
              <div className="bg-[#FCE6D5] rounded-lg p-4">
                <label className="block text-sm font-medium text-[#F15A25] mb-1">Email:</label>
                <p className="text-sm text-gray-900">{resetPasswordData.userEmail}</p>
              </div>
              
              <div className="bg-[#FCE6D5] rounded-lg p-4">
                <label className="block text-sm font-medium text-[#F15A25] mb-2">Nueva Contraseña:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={resetPasswordData.newPassword}
                    readOnly
                    className="flex-1 px-3 py-2 border border-[#F15A25] rounded-lg bg-white text-sm font-mono text-[#F15A25] font-semibold"
                  />
                  <Button
                    onClick={() => navigator.clipboard.writeText(resetPasswordData.newPassword)}
                    className="bg-[#F15A25] hover:bg-[#E55A1A] text-white px-3 py-2 text-xs rounded-lg transition-colors"
                  >
                    📋 Copiar
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button
                onClick={closePasswordModal}
                className="bg-[#F15A25] hover:bg-[#E55A1A] text-white px-6 py-2 rounded-lg transition-colors"
              >
                ✅ Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
