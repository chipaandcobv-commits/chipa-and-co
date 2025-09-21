"use client";

import { useCallback, memo, useMemo, useState, useLayoutEffect, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GiftCardIcon, HomeIcon, UserIcon } from "./icons/Icons";

const ClientNavbar = memo(() => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [lastValidPosition, setLastValidPosition] = useState("home");
  const [animationKey, setAnimationKey] = useState(0);

  // Cambio 1: Usar useRef para prevPosition para evitar re-renders
  const prevPositionRef = useRef(133);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Posiciones fijas simples para el navbar
  const getPosition = useCallback((item: string) => {
    switch (item) {
      case "rewards":
        return 0;
      case "home":
        return 133;
      case "profile":
        return 266;
      default:
        return 133;
    }
  }, []);

  // Rastrear la última posición válida
  useLayoutEffect(() => {
    let newPosition = "home";
    if (pathname === "/cliente") {
      newPosition = "home";
    } else if (pathname.startsWith("/cliente/rewards")) {
      newPosition = "rewards";
    } else if (pathname.startsWith("/cliente/profile")) {
      newPosition = "profile";
    } else if (pathname.startsWith("/cliente")) {
      newPosition = "home";
    }

    // Cambio 2: Solo actualizar si realmente cambió la posición
    if (newPosition !== lastValidPosition) {
      prevPositionRef.current = getPosition(lastValidPosition);
      setLastValidPosition(newPosition);
      setAnimationKey((prev) => prev + 1);
    }
  }, [pathname, getPosition, lastValidPosition]);

  const isActive = useCallback(
    (path: string) => {
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

  const currentPosition = useMemo(() => {
    return getPosition(lastValidPosition);
  }, [lastValidPosition, getPosition]);

  // Configuración de transición
  const sharedTransition = {
    type: "spring" as const,
    stiffness: 400,
    damping: 35,
    duration: 0.5,
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

  return (
    <motion.div
      className="client-navbar-floating fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="relative w-[380px] h-[50px]">
       {/* Círculo flotante - Cambio 3: Usar key único para forzar re-animación */}
        <motion.div
          key={`circle-${animationKey}`}
          className="navbar-circle absolute -top-7 w-14 h-14 bg-peach-200 rounded-full flex items-center justify-center shadow-md z-20"
          initial={{x: prevPositionRef.current - 163, y: 0}}
          animate={{ x: currentPosition - 163, y: 0 }}
          transition={sharedTransition}
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            willChange: "transform",
          }}
        >
          <div className="navbar-icon">
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
        </motion.div>

        {/* Línea negra - Cambio 4: Usar key único para forzar re-animación */}
        <motion.div
          key={`line-${animationKey}`}
          className="navbar-line absolute top-11 w-16 h-1 bg-black rounded-full z-10"
          initial={{x: prevPositionRef.current - 163, y: 0}}
          animate={{ x: currentPosition - 165, y: 0 }}
          transition={sharedTransition}
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            willChange: "transform",
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
              {/* Cambio 5: Usar animationKey en lugar de pathname para el ID */}
              <mask id={`bar-mask-${animationKey}`}>
                <rect width="380" height="50" fill="white" rx="25" />

                <motion.g
                  key={`mask-${animationKey}`}
                  initial={{ x: prevPositionRef.current, y: -30 }}
                  animate={{ x: currentPosition, y: -30 }}
                  transition={sharedTransition}
                >
                  <path
                    d="M110 30C85 30 85.5 70 55 70C24.5 70 25 30 0 30C0 10 35 0 55 0C75 0 110 13 110 30Z"
                    fill="black"
                  />
                </motion.g>
              </mask>
            </defs>
            <rect
              width="380"
              height="50"
              rx="25"
              fill="#fbe3cf"
              mask={`url(#bar-mask-${animationKey})`}
            />
          </svg>

          {/* Botones */}
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
    </motion.div>
  );
});

ClientNavbar.displayName = "ClientNavbar";

export default ClientNavbar;