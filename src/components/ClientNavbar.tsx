"use client";

import { useCallback, memo, useMemo, useState, useLayoutEffect, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GiftCardIcon, HomeIcon, UserIcon } from "./icons/Icons";

const ClientNavbar = memo(() => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [lastValidPosition, setLastValidPosition] = useState("home");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rastrear la última posición válida
  useLayoutEffect(() => {
    console.log(`🔄 Pathname changed to: ${pathname}`);
    if (pathname === "/cliente") {
      console.log(`📍 Setting position to: home (exact match)`);
      setLastValidPosition("home");
    } else if (pathname.startsWith("/cliente/rewards")) {
      console.log(`📍 Setting position to: rewards`);
      setLastValidPosition("rewards");
    } else if (pathname.startsWith("/cliente/profile")) {
      console.log(`📍 Setting position to: profile`);
      setLastValidPosition("profile");
    } else if (pathname.startsWith("/cliente")) {
      console.log(`📍 Setting position to: home (fallback)`);
      setLastValidPosition("home");
    }
  }, [pathname]);

  const isActive = useCallback(
    (path: string) => {
      // Lógica más precisa para evitar conflictos
      if (path === "/cliente") {
        return pathname === "/cliente";
      }
      if (path === "/cliente/rewards") {
        return pathname.startsWith("/cliente/rewards");
      }
      if (path === "/cliente/profile") {
        return pathname.startsWith("/cliente/profile");
      }
      return false;
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
    return "home";
  };

  const activeItem = getActiveItem();

  const getPositionInPixels = useCallback((percentage: string) => {
    const containerWidth = 380;
    const percentageValue = parseFloat(percentage.replace('%', ''));
    const absolutePosition = (containerWidth * percentageValue / 100);
    return absolutePosition;
  }, []);

  const getSVGPosition = useCallback((circlePosition: number) => {
    return circlePosition - 55; // Centrado con el círculo
  }, []);

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

  const currentPosition = useMemo(() => {
    // Usar lastValidPosition para consistencia
    let position;
    if (lastValidPosition === "rewards") {
      position = positions.rewards;
    } else if (lastValidPosition === "profile") {
      position = positions.profile;
    } else {
      position = positions.home;
    }

    return position;
  }, [lastValidPosition, positions, pathname]);

  // Posición base compartida para círculo y hueco
  const sharedPosition = useMemo(() => {
    console.log(`🎯 SharedPosition - Pathname: ${pathname}, LastValid: ${lastValidPosition}, Circle: ${currentPosition.circle}, Mounted: ${mounted}`);
    return currentPosition.circle;
  }, [currentPosition.circle, pathname, lastValidPosition, mounted]);


  // Configuración de transición compartida para sincronizar todas las animaciones
  const sharedTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    duration: 0.6
  };

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
  if (!mounted) {
    return (
      <div className="client-navbar-floating fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="relative w-[380px] h-[50px]">
          {/* Círculo estático */}
          <div
            className="navbar-circle absolute -top-7 w-14 h-14 bg-peach-200 rounded-full flex items-center justify-center shadow-md z-20"
            style={{
              left: `${currentPosition.circle}px`,
              transform: "translateX(-50%)"
            }}
          >
            {activeItem === "rewards" && <GiftCardIcon className="w-6 h-6 text-[#F15A25]" />}
            {activeItem === "home" && <HomeIcon className="w-6 h-6 text-[#F15A25]" />}
            {activeItem === "profile" && <UserIcon className="w-6 h-6 text-[#F15A25]" />}
          </div>

          {/* Línea estática */}
          <div
            className="navbar-line absolute top-11 w-16 h-1 bg-black rounded-full z-10"
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
                      transform: `translate(${currentPosition.circle - 55}px, -30px)`
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
    <div className="client-navbar-floating fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="relative w-[380px] h-[50px]">
        {/* Círculo flotante animado */}
        <motion.div
          className="navbar-circle absolute -top-7 w-14 h-14 bg-peach-200 rounded-full flex items-center justify-center shadow-md z-20"
          layoutId="navbar-circle"
          initial={false}
          animate={mounted ? {
            x: sharedPosition - 218  // Centrar respecto al contenedor de 380px
          } : false}
          transition={sharedTransition}
          style={{
            left: "50%",
            transform: "translateX(-50%)"
          }}
        >
          <div className="navbar-icon">
            {activeItem === "rewards" && <GiftCardIcon className="w-6 h-6 text-[#F15A25]" />}
            {activeItem === "home" && <HomeIcon className="w-6 h-6 text-[#F15A25]" />}
            {activeItem === "profile" && <UserIcon className="w-6 h-6 text-[#F15A25]" />}
          </div>
        </motion.div>

        {/* Línea negra que se desplaza con la barra */}
        <motion.div
          className="navbar-line absolute top-11 w-16 h-1 bg-black rounded-full z-10"
          layoutId="navbar-line"
          initial={false}
          animate={mounted ? {
            x: sharedPosition - 218  // Centrar respecto al contenedor de 380px
          } : false}
          transition={sharedTransition}
          style={{
            left: "50%",
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
              <mask id={`bar-mask-${pathname.replace('/', '-')}`}>
                <rect width="380" height="50" fill="white" rx="25" />

                <motion.path
                  d="M110 30C85 30 85.5 70 55 70C24.5 70 25 30 0 30C0 10 35 0 55 0C75 0 110 13 110 30Z"
                  fill="black"
                  initial={false}
                  animate={mounted ? { 
                    x: sharedPosition - 55, 
                    y: -30 
                  } : false}
                  transition={sharedTransition}
                />

              </mask>
            </defs>
            <rect
              width="380"
              height="50"
              rx="25"
              fill="#fbe3cf"
              mask={`url(#bar-mask-${pathname.replace('/', '-')})`}
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
  );
});

ClientNavbar.displayName = "ClientNavbar";

export default ClientNavbar;
