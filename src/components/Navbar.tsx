"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Button from "./ui/Button";
import { DashboardIcon, HomeIcon } from "./icons/Icons";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  points: number;
}

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        isMobileMenuOpen &&
        !target.closest("#mobile-menu") &&
        !target.closest("#menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navigationItems = user
    ? [
        { href: "/dashboard", label: "Dashboard", icon: "📊" },
        { href: "/rewards", label: "Premios", icon: "🎁" },
        { href: "/ranking", label: "Ranking", icon: "🏆" },
        { href: "/history", label: "Historial", icon: "📝" },
      ]
    : [];

  const adminItems =
    user?.role === "ADMIN"
      ? [
          { href: "/admin", label: "Panel Admin", icon: "⚙️" },
          { href: "/admin/users", label: "Usuarios", icon: "👥" },
          { href: "/admin/products", label: "Productos", icon: "📦" },
          { href: "/admin/rewards", label: "Gestión Premios", icon: "🎯" },
        ]
      : [];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <>
      {/* Main Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-orange-100"
            : "bg-white shadow-sm border-b border-orange-100"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <HomeIcon className="w-8 h-8 text-orange-600 transition-transform duration-200 group-hover:scale-110" />
                <div className="absolute inset-0 bg-orange-200 rounded-full scale-0 group-hover:scale-125 transition-transform duration-200 opacity-20"></div>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Sistema de Fidelización
              </span>
              <span className="text-lg font-bold text-gray-900 sm:hidden">
                Fidelización
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {user && (
                <>
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-orange-50"
                    >
                      <span>{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}

                  {user.role === "ADMIN" && (
                    <div className="relative group">
                      <button className="flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-orange-50">
                        <span>⚙️</span>
                        <span className="font-medium">Admin</span>
                        <svg
                          className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Admin Dropdown */}
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                        <div className="py-2">
                          {adminItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-150"
                            >
                              <span>{item.icon}</span>
                              <span>{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* User Info & Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-orange-600 font-semibold">
                      {user.points} puntos
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="text-gray-600 border-gray-300 hover:border-orange-300 hover:text-orange-600"
                  >
                    Salir
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Registrarse</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              id="menu-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-200"
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute top-0 left-0 w-full h-0.5 bg-current transition-all duration-300 ${
                    isMobileMenuOpen
                      ? "transform rotate-45 translate-y-2.5"
                      : ""
                  }`}
                ></span>
                <span
                  className={`absolute top-2.5 left-0 w-full h-0.5 bg-current transition-all duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                ></span>
                <span
                  className={`absolute top-5 left-0 w-full h-0.5 bg-current transition-all duration-300 ${
                    isMobileMenuOpen
                      ? "transform -rotate-45 -translate-y-2.5"
                      : ""
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        {/* Mobile Sidebar */}
        <div
          id="mobile-menu"
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 mt-12">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-orange-600 font-medium">
                      {user.points} puntos
                    </p>
                    {user.role === "ADMIN" && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                        Administrador
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <HomeIcon className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                  <p className="font-semibold text-gray-900">Bienvenido</p>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-6">
              {user ? (
                <>
                  <div className="px-6 mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Navegación
                    </h3>
                    <div className="space-y-2">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-200"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {user.role === "ADMIN" && (
                    <div className="px-6 mb-6">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Administración
                      </h3>
                      <div className="space-y-2">
                        {adminItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-200"
                          >
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="px-6">
                  <div className="space-y-4">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        className="w-full justify-center"
                        variant="outline"
                      >
                        Iniciar Sesión
                      </Button>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full justify-center">
                        Registrarse
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Footer */}
            {user && (
              <div className="p-6 border-t border-gray-200">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-center text-gray-600 border-gray-300 hover:border-orange-300 hover:text-orange-600"
                >
                  Cerrar Sesión
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
