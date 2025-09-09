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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== "ALL") params.append("role", roleFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "USER" | "ADMIN"
  ) => {
    try {
      setUpdatingUserId(userId);
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Actualizar usuario en la lista
          setUsers((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, role: newRole } : user
            )
          );
        }
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
    </div>
  );
}
