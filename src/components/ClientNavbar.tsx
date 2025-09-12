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
  const [isMounted, setIsMounted] = useState(false);
  const [previousPosition, setPreviousPosition] = useState<{circle: number, svg: number} | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    
    // Delay fijo para evitar problemas de SSR
    const delay = 200;
    
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, delay);
    
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

  // Función para calcular posiciones en píxeles de forma consistente
  const getPositionInPixels = useCallback((percentage: string) => {
    const containerWidth = 380; // Ancho del contenedor
    const percentageValue = parseFloat(percentage.replace('%', ''));
    // Calcular la posición absoluta desde el borde izquierdo del contenedor
    const absolutePosition = (containerWidth * percentageValue / 100);
    return absolutePosition;
  }, []);

  // Función para obtener la posición del SVG basada en la posición del círculo
  const getSVGPosition = useCallback((circlePosition: number) => {
    // El SVG debe estar centrado con respecto al círculo
    // El path tiene un ancho aproximado de 110px, así que centramos restando 55px
    return circlePosition - 55;
  }, []);

  // Posiciones calculadas de forma consistente
  const positions = useMemo(() => {
    const rewardsPos = getPositionInPixels("18%");
    const homePos = getPositionInPixels("48%");
    const profilePos = getPositionInPixels("82%");

    return {
      rewards: {
        circle: rewardsPos,
        svg: getSVGPosition(rewardsPos)
      },
      home: {
        circle: homePos,
        svg: getSVGPosition(homePos)
      },
      profile: {
        circle: profilePos,
        svg: getSVGPosition(profilePos)
      }
    };
  }, [getPositionInPixels, getSVGPosition]);

  // Posición actual basada en la página activa
  const currentPosition = useMemo(() => {
    if (isActive("/cliente/rewards")) return positions.rewards;
    if (isActive("/cliente/profile")) return positions.profile;
    return positions.home;
  }, [isActive, positions]);

  // Inicializar posición anterior inmediatamente
  useEffect(() => {
    if (previousPosition === null) {
      setPreviousPosition(currentPosition);
    }
  }, [currentPosition, previousPosition]);

  // Actualizar posición anterior cuando cambie la posición actual (solo después de la primera vez)
  useEffect(() => {
    if (previousPosition !== null && previousPosition !== currentPosition) {
      // Actualizar la posición anterior después de que termine la animación
      const animationDuration = 800;
      const timer = setTimeout(() => {
        setPreviousPosition(currentPosition);
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [currentPosition, previousPosition]);


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
      <div className="client-navbar-floating fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="relative w-[380px] h-[50px]">
          {/* Círculo estático */}
          <div
            className="absolute -top-7 w-14 h-14 bg-peach-200 rounded-full flex items-center justify-center shadow-md z-20"
            style={{ 
              left: `${currentPosition.circle}px`,
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
              left: `${currentPosition.circle}px`,
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
                      transform: `translate(${currentPosition.svg}px, -30px)` 
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
      <div className="client-navbar-floating fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="relative w-[380px] h-[50px]">
          <div
            className="absolute -top-7 w-14 h-14 bg-peach-200 rounded-full flex items-center justify-center shadow-md z-20"
            style={{ 
              left: `${currentPosition.circle}px`,
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
      <div className="client-navbar-floating fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="relative w-[380px] h-[50px]">
          {/* Círculo flotante animado */}
              <motion.div
                  className="navbar-circle absolute -top-7 w-14 h-14 bg-peach-200 rounded-full flex items-center justify-center shadow-md z-20"
                  initial={{ 
                    left: `${currentPosition.circle}px`
                  }}
                  animate={{ 
                    left: `${currentPosition.circle}px`
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30 
                  }}
                  style={{ 
                    transform: "translateX(-50%)"
                  }}
                >
                  <div className="navbar-icon">
                    {activeItem === "rewards" && (
                      <GiftCardIcon className="w-6 h-6 text-[#F15A25] navbar-icon-enter" />
                    )}
                    {activeItem === "home" && (
                      <HomeIcon className="w-6 h-6 text-[#F15A25] navbar-icon-enter" />
                    )}
                    {activeItem === "profile" && (
                      <UserIcon className="w-6 h-6 text-[#F15A25] navbar-icon-enter" />
                    )}
                  </div>
                </motion.div>

              {/* Línea negra que se desplaza con la barra */}
              <motion.div
                  className="navbar-line absolute top-11 w-16 h-1 bg-black rounded-full z-10"
                  initial={{ 
                    left: `${currentPosition.circle}px`
                  }}
                  animate={{ 
                    left: `${currentPosition.circle}px`
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30 
                  }}
                  style={{ 
                    transform: "translateX(-50%)"
                  }}
                />

          {/* Barra con corte dinámico */}
          <div className="relative w-full h-full rounded-full shadow-lg overflow-hidden">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 380 50"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <mask id={`bar-mask-${animationKey}`}>
                  {/* Rectángulo base visible */}
                  <rect width="380" height="50" fill="white" rx="25" />

                  {/* Path del agujero, movido dinámicamente */}
                  <motion.path
                    d="M110 30C85 30 85.5 70 55 70C24.5 70 25 30 0 30C0 10 35 0 55 0C75 0 110 13 110 30Z"
                    fill="black"
                    initial={{
                      x: currentPosition.circle - 55,
                      y: -30
                    }}
                    animate={{
                      x: currentPosition.circle - 55,
                      y: -30
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 30 
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
                mask={`url(#bar-mask-${animationKey})`}
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