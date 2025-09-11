"use client";

import { useCallback, memo, useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GiftCardIcon, HomeIcon, UserIcon } from "./icons/Icons";
import ClientOnly from "./ClientOnly";

const ClientNavbar = memo(() => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPosition, setCurrentPosition] = useState("48%");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Pequeño delay para asegurar que la hidratación esté completa
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Precargar todas las páginas del cliente para navegación más rápida
  useEffect(() => {
    // Hacer todas las peticiones de precarga al mismo tiempo
    Promise.all([
      router.prefetch('/cliente'),
      router.prefetch('/cliente/rewards'),
      router.prefetch('/cliente/profile')
    ]);
  }, [router]);

  const isActive = useCallback(
    (path: string) => {
      if (path === "/cliente") return pathname === "/cliente";
      return pathname.startsWith(path);
    },
    [pathname]
  );

  const handleButtonClick = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  const getActiveItem = () => {
    if (isActive("/cliente/rewards")) return "rewards";
    if (isActive("/cliente/profile")) return "profile";
    if (isActive("/cliente")) return "home";
    return "home"; // default
  };

  const activeItem = getActiveItem();

  // Actualizar posición cuando cambie la página
  useEffect(() => {
    if (isActive("/cliente/rewards")) {
      setCurrentPosition("18%");
    } else if (isActive("/cliente/profile")) {
      setCurrentPosition("82%");
    } else {
      setCurrentPosition("48%");
    }
  }, [pathname, isActive]);

  // Posición inicial basada en la página actual
  const initialPosition = useMemo(() => {
    if (isActive("/cliente/rewards")) return "18%";
    if (isActive("/cliente/profile")) return "82%";
    return "48%";
  }, [pathname]);

  // Posición del path del SVG
  const pathPosition = useMemo(() => {
    if (isActive("/cliente/rewards")) return 68.4 - 55;
    if (isActive("/cliente/profile")) return 311.6 - 55;
    return 182.4 - 55; // home por defecto
  }, [pathname]);

  // Posición inicial del path del SVG
  const initialPathPosition = useMemo(() => {
    if (isActive("/cliente/rewards")) return 68.4 - 55;
    if (isActive("/cliente/profile")) return 311.6 - 55;
    return 182.4 - 55;
  }, [pathname]);

  const navItems = [
    {
      id: "rewards",
      icon: <GiftCardIcon className="w-6 h-6" />,
      path: "/cliente/rewards",
    },
    {
      id: "home",
      icon: <HomeIcon className="w-6 h-6" />,
      path: "/cliente",
    },
    {
      id: "profile",
      icon: <UserIcon className="w-6 h-6" />,
      path: "/cliente/profile",
    },
  ];

  // Fallback estático para SSR
  if (!isMounted) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="relative w-[380px] h-[50px]">
          {/* Círculo estático */}
          <div
            className="absolute -top-7 w-14 h-14 bg-peach-200 rounded-full flex items-center justify-center shadow-md z-20"
            style={{ 
              left: initialPosition,
              transform: "translateX(-50%)" 
            }}
          >
            {activeItem === "rewards" && (
              <GiftCardIcon className="w-6 h-6 text-[#F15A25]" />
            )}
            {activeItem === "home" && (
              <HomeIcon className="w-6 h-6 text-[#F15A25]" />
            )}
            {activeItem === "profile" && (
              <UserIcon className="w-6 h-6 text-[#F15A25]" />
            )}
          </div>

          {/* Línea estática */}
          <div
            className="absolute top-11 w-16 h-1 bg-black rounded-full z-10"
            style={{ 
              left: initialPosition,
              transform: "translateX(-50%)" 
            }}
          />

          {/* Barra estática */}
          <div className="relative w-full h-full rounded-full shadow-lg overflow-hidden">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 380 50"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <mask id="bar-mask-static">
                  <rect width="380" height="50" fill="white" rx="25" />
                  <path
                    d="M110 30C85 30 85.5 70 55 70C24.5 70 25 30 0 30C0 10 35 0 55 0C75 0 110 13 110 30Z"
                    fill="black"
                    style={{ 
                      transform: `translate(${initialPathPosition}px, -30px)` 
                    }}
                  />
                </mask>
              </defs>
              <rect
                width="380"
                height="50"
                rx="25"
                fill="#fbe3cf"
                mask="url(#bar-mask-static)"
              />
            </svg>

            {/* Botones de navegación estáticos */}
            <div className="absolute inset-0 flex justify-between items-center px-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleButtonClick(item.path)}
                  className="z-20 p-4 -m-4 flex items-center justify-center min-w-[60px] min-h-[60px]"
                >
                  <div
                    className={`transition-all duration-300 ${
                      activeItem !== item.id
                        ? "text-gray-600 opacity-100"
                        : "text-[#F15A25] opacity-0"
                    }`}
                  >
                    {item.icon}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClientOnly fallback={
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="relative w-[380px] h-[50px]">
          <div
            className="absolute -top-7 w-14 h-14 bg-peach-200 rounded-full flex items-center justify-center shadow-md z-20"
            style={{ 
              left: initialPosition,
              transform: "translateX(-50%)" 
            }}
          >
            {activeItem === "rewards" && (
              <GiftCardIcon className="w-6 h-6 text-[#F15A25]" />
            )}
            {activeItem === "home" && (
              <HomeIcon className="w-6 h-6 text-[#F15A25]" />
            )}
            {activeItem === "profile" && (
              <UserIcon className="w-6 h-6 text-[#F15A25]" />
            )}
          </div>
        </div>
      </div>
    }>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="relative w-[380px] h-[50px]">
          <AnimatePresence mode="wait">
            {isLoaded && (
              <>
                {/* Círculo flotante animado */}
                <motion.div
                  className="absolute -top-7 w-14 h-14 bg-peach-200 rounded-full flex items-center justify-center shadow-md z-20"
                  initial={{ left: initialPosition, opacity: 0 }}
                  animate={{
                    left: currentPosition,
                    opacity: 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                    type: "tween",
                  }}
                  style={{ transform: "translateX(-50%)" }}
                >
                  <AnimatePresence mode="wait">
                    {activeItem === "rewards" && (
                      <motion.div
                        key="rewards"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <GiftCardIcon className="w-6 h-6 text-[#F15A25]" />
                      </motion.div>
                    )}
                    {activeItem === "home" && (
                      <motion.div
                        key="home"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <HomeIcon className="w-6 h-6 text-[#F15A25]" />
                      </motion.div>
                    )}
                    {activeItem === "profile" && (
                      <motion.div
                        key="profile"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <UserIcon className="w-6 h-6 text-[#F15A25]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Línea negra que se desplaza con la barra */}
                <motion.div
                  className="absolute top-11 w-16 h-1 bg-black rounded-full z-10"
                  initial={{ left: initialPosition, opacity: 0 }}
                  animate={{
                    left: currentPosition,
                    opacity: 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: "easeInOut",
                    type: "tween",
                  }}
                  style={{ transform: "translateX(-50%)" }}
                />
              </>
            )}
          </AnimatePresence>

          {/* Barra con corte dinámico */}
          <div className="relative w-full h-full rounded-full shadow-lg overflow-hidden">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 380 50"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <mask id="bar-mask">
                  {/* Rectángulo base visible */}
                  <rect width="380" height="50" fill="white" rx="25" />

                  {/* Path del agujero, movido dinámicamente */}
                  <motion.path
                    d="M110 30C85 30 85.5 70 55 70C24.5 70 25 30 0 30C0 10 35 0 55 0C75 0 110 13 110 30Z"
                    fill="black"
                    initial={{ x: initialPathPosition, y: -30, opacity: 0 }}
                    animate={{
                      x: pathPosition,
                      y: -30,
                      opacity: 1,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.6,
                      ease: "easeInOut",
                      type: "tween",
                    }}
                  />
                </mask>
              </defs>

              {/* Barra pintada con máscara - mismo color que el círculo */}
              <rect
                width="380"
                height="50"
                rx="25"
                fill="#fbe3cf"
                mask="url(#bar-mask)"
              />
            </svg>

            {/* Botones de navegación */}
            <div className="absolute inset-0 flex justify-between items-center px-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleButtonClick(item.path)}
                  className="z-20 p-4 -m-4 flex items-center justify-center min-w-[60px] min-h-[60px]"
                >
                  <div
                    className={`transition-all duration-300 ${
                      activeItem !== item.id
                        ? "text-gray-600 opacity-100"
                        : "text-[#F15A25] opacity-0"
                    }`}
                  >
                    {item.icon}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
});

ClientNavbar.displayName = "ClientNavbar";

export default ClientNavbar;