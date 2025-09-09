"use client";
import Link from "next/link";
import Button from "./ui/Button";
import { UserIcon, DashboardIcon, LogoutIcon } from "./icons/Icons";
import { useAuth } from "./AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Gift, BadgeCheck, Trophy, User, ShoppingCart, Package, Settings, Menu, X, Crown } from "lucide-react";
import { useState } from "react";

export default function AuthHeader() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Función para verificar si una ruta está activa
  const isActiveRoute = (route: string) => {
    if (route === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(route);
  };

  // Configuración de navegación del admin
  const adminNavItems = [
    { href: "/admin", label: "Inicio", icon: DashboardIcon, color: "text-[#F15A25]" },
    { href: "/admin/users", label: "Usuarios", icon: User, color: "text-[#F15A25]" },
    { href: "/admin/orders", label: "Órdenes", icon: ShoppingCart, color: "text-[#F15A25]" },
    { href: "/admin/products", label: "Productos", icon: Package, color: "text-[#F15A25]" },
    { href: "/admin/rewards", label: "Premios", icon: Gift, color: "text-[#F15A25]" },
    { href: "/admin/ranking", label: "Ranking", icon: Trophy, color: "text-[#F15A25]" },
    { href: "/admin/validate", label: "Validar", icon: BadgeCheck, color: "text-[#F15A25]" },
    { href: "/admin/config", label: "Config", icon: Settings, color: "text-[#F15A25]" },
  ];

  return (
    <header className="bg-[#F7EFE7] shadow-lg border-b-2 border-[#F15A25]/20 backdrop-blur-sm">
             <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
         <div className="flex justify-between items-center h-14 sm:h-16 md:h-18 lg:h-20 gap-4 sm:gap-6 md:gap-8">
          
                     {/* Logo + título */}
           <div className="flex items-center space-x-2 md:space-x-3 group">
             <img 
               src="/Chipá&Co.png" 
               alt="Chipá & Co. Logo" 
               className="h-24 w-24 sm:h-28 sm:w-28 md:h-36 md:w-36 lg:h-36 lg:w-36 object-contain group-hover:scale-105 transition-all duration-300"
             />
           </div>

                     {/* Desktop Navigation */}
           <div className="hidden lg:flex items-center space-x-2">
             
           {/* Tablet Navigation - más compacta */}
           <div className="hidden md:flex lg:hidden items-center space-x-1">
             {loading ? (
               user?.role === "ADMIN" && (
                 <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
               )
             ) : user ? (
               <>
                 {user.role === "ADMIN" && (
                   <div className="flex items-center space-x-1 bg-[#F4E7DB] rounded-xl p-1 shadow-lg border border-white/50">
                     {adminNavItems.slice(0, 6).map((item) => {
                       const Icon = item.icon;
                       const isActive = isActiveRoute(item.href);
                       
                       return (
                         <Link key={item.href} href={item.href}>
                           <div className={`
                             relative px-2 py-2 rounded-lg transition-all duration-300 ease-out group
                             ${isActive 
                               ? 'bg-[#F15A25] text-white shadow-lg shadow-[#F15A25]/30 transform scale-105' 
                               : 'text-gray-700 hover:bg-[#FCE6D5] hover:text-[#F15A25] hover:shadow-md'
                             }
                           `}>
                             <div className="flex flex-col items-center space-y-1">
                               <Icon className={`h-4 w-4 ${isActive ? 'text-white' : item.color}`} />
                               <span className="font-medium text-xs">{item.label}</span>
                             </div>
                           </div>
                         </Link>
                       );
                     })}
                     
                     {/* Separador visual */}
                     <div className="w-px h-6 bg-[#F15A25]/20 mx-1"></div>
                     
                     {/* Logout compacto */}
                     <div
                       onClick={handleLogout}
                       className="relative px-2 py-2 rounded-lg transition-all duration-300 ease-out group cursor-pointer bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 hover:shadow-md"
                     >
                       <div className="flex flex-col items-center space-y-1">
                         <LogoutIcon className="h-4 w-4" />
                         <span className="font-medium text-xs">Salir</span>
                       </div>
                     </div>
                   </div>
                 )}
               </>
             ) : null}
           </div>
            {loading ? (
              user?.role === "ADMIN" && (
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              )
            ) : user ? (
              <>
                                                  {user.role === "ADMIN" && (
                   <div className="flex items-center space-x-2 bg-[#F4E7DB] rounded-2xl p-2 shadow-lg border border-white/50">
                     {adminNavItems.map((item) => {
                       const Icon = item.icon;
                       const isActive = isActiveRoute(item.href);
                       
                       return (
                         <Link key={item.href} href={item.href}>
                           <div className={`
                             relative px-4 py-3 rounded-xl transition-all duration-300 ease-out group
                             ${isActive 
                               ? 'bg-[#F15A25] text-white shadow-lg shadow-[#F15A25]/30 transform scale-105' 
                               : 'text-gray-700 hover:bg-[#FCE6D5] hover:text-[#F15A25] hover:shadow-md'
                             }
                           `}>
                             {/* Sin indicador de punto blanco */}
                             
                             <div className="flex items-center space-x-2">
                               <Icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
                               <span className="font-medium text-sm">{item.label}</span>
                             </div>
                             
                             {/* Efecto de hover */}
                             {!isActive && (
                               <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#F15A25]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                             )}
                           </div>
                         </Link>
                       );
                     })}
                     
                     {/* Separador visual */}
                     <div className="w-px h-8 bg-[#F15A25]/20 mx-1"></div>
                     
                     {/* Logout integrado */}
                     <div
                       onClick={handleLogout}
                       className="relative px-4 py-3 rounded-xl transition-all duration-300 ease-out group cursor-pointer bg-red hover:bg-red-50 border border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 hover:shadow-md"
                     >
                       <div className="flex items-center space-x-2">
                         <LogoutIcon className="h-5 w-5" />
                         <span className="font-medium text-sm">Salir</span>
                       </div>
                     </div>
                   </div>
                 )}

                 {/* Premios (todos los usuarios) */}
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

                     {/* Mobile menu button */}
           <div className="lg:hidden">
            <Button
              onClick={toggleMobileMenu}
              variant="outline"
              size="sm"
              className="p-3 bg-[#F15A25] text-white border-[#F15A25] hover:bg-[#F15A25]/90 hover:shadow-lg transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

                 {/* Mobile Navigation */}
         {isMobileMenuOpen && (
           <div className="lg:hidden border-t-2 border-[#F15A25]/20 bg-[#F7EFE7] shadow-xl">
            <div className="px-4 py-6 space-y-3">
              {loading ? (
                user?.role === "ADMIN" && (
                  <div className="w-20 h-8 bg-gray-200 rounded animate-pulse mx-4"></div>
                )
              ) : user ? (
                <>
                  <div className="px-4 py-3 text-sm text-gray-700 border-b-2 border-[#F15A25]/20 bg-[#F4E7DB] rounded-xl">
                    <div className="flex items-center space-x-3">
                      <img 
                        src="/Chipá&Co.png" 
                        alt="Chipá & Co. Logo" 
                        className="h-18 w-18 object-contain"
                      />
                      <div>
                        <p className="font-semibold text-[#F15A25]">Panel de Administración</p>
                        <p className="text-xs text-gray-600">Hola, {user.name}</p>
                      </div>
                    </div>
                  </div>

                  {user.role === "ADMIN" && (
                    <div className="grid grid-cols-2 gap-3">
                      {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActiveRoute(item.href);
                        
                        return (
                          <Link key={item.href} href={item.href} onClick={closeMobileMenu}>
                            <div className={`
                              relative p-4 rounded-xl transition-all duration-300 ease-out group text-center
                              ${isActive 
                                ? 'bg-[#F15A25] text-white shadow-lg shadow-[#F15A25]/30 transform scale-105' 
                                : 'bg-[#F4E7DB] text-gray-700 hover:bg-[#FCE6D5] hover:text-[#F15A25] hover:shadow-md border border-white/50'
                              }
                            `}>
                              <Icon className={`h-6 w-6 mx-auto mb-2 ${isActive ? 'text-white' : item.color}`} />
                              <span className="text-xs font-medium block">{item.label}</span>
                              
                              {/* Efecto de hover */}
                              {!isActive && (
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#F15A25]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Premios (todos los usuarios) */}
                  {user.role !== "ADMIN" && (
                    <Link href="/cliente/rewards" onClick={closeMobileMenu}>
                      <div className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#FCE6D5] rounded-xl transition-all duration-300">
                        <Gift className="h-4 w-4 inline mr-2 text-red-500" />
                        Premios
                      </div>
                    </Link>
                  )}

                  {/* Logout */}
                  <div className="border-t-2 border-[#F15A25]/20 pt-4">
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="w-full justify-center bg-[#FF2F00] hover:bg-[#e62900] border-[#FF2F00] hover:border-[#e62900] text-white transition-all duration-300 shadow-sm hover:shadow-md"


                    >
                      <LogoutIcon className="h-4 w-4 mr-2" />
                      Salir
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}