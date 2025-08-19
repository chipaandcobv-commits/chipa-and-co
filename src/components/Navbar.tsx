"use client";
import Link from "next/link";
import Button from "./ui/Button";
import { UserIcon, DashboardIcon, LogoutIcon } from "./icons/Icons";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";
import { Gift } from "lucide-react";

export default function AuthHeader() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              App Fidelización
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              <>
                <span className="text-sm text-gray-700">Hola, {user.name}</span>
                
                   <div className="flex  items-center space-x-2">

                    {
                      user.role === "ADMIN" && (
                        <>

                          <Link href="/admin">
                            <Button variant="primary" size="sm">
                              <DashboardIcon className="h-4 w-4" />
                              Panel Admin
                            </Button>
                          </Link>
                        
                          <Link href="/admin/users">
                            <Button variant="outline" size="sm">
                              👥 Usuarios
                            </Button>
                          </Link>
                          <Link href="/admin/orders">
                            <Button variant="outline" size="sm">
                              📋 Órdenes
                            </Button>
                          </Link>
                          <Link href="/admin/products">
                            <Button variant="outline" size="sm">
                              📦 Productos
                            </Button>
                          </Link>
                          <Link href="/admin/ranking">
                            <Button variant="outline" size="sm">
                              🏆 Ranking
                            </Button>
                          </Link>
                          <Link href="/admin/validate">
                            <Button variant="outline" size="sm">
                              ✅ Validar
                            </Button>
                          </Link>
                          <Link href="/admin/config">
                            <Button variant="outline" size="sm">
                              ⚙️ Config
                            </Button>
                          </Link>
                        </>
                      )
                    }

                   <Link href={` ${user.role === "ADMIN" ? "/admin/rewards" : "/rewards"}` }  >
                     <Button variant="outline" size="sm">
                     <Gift className={` ${user.role === "ADMIN" ? "text-blue-500" : user.role === "USER" ? "text-red-500" : "text-gray-500"}`} /> Premios
                     </Button>
                   </Link>

                   {
                    user.role === "USER" && (
                      <div>
                        <Link href="/history">
                          <Button variant="outline" size="sm">
                            📋 Mis Premios
                          </Button>
                        </Link>
                      </div>
                    )
                   }
                 </div>
                

                {/* Logout button for all users */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <LogoutIcon className="h-4 w-4 mr-1" />
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
