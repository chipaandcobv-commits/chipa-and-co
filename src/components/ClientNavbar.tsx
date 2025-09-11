"use client";

import { useCallback, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GiftCardIcon, HomeIcon, UserIcon } from "./icons/Icons";

const ClientNavbar = memo(() => {
  const pathname = usePathname();
  const router = useRouter();

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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      {/* Círculo flotante animado */}
      <motion.div
        className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-peach-200 rounded-full flex items-center justify-center shadow-md z-20"
        animate={{
          left:
            activeItem === "rewards"
              ? "18%"
              : activeItem === "home"
              ? "48%"
              : "82%",
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
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
      </motion.div>

      {/* Barra fija - sin deformación */}
      <div className="relative w-[380px] h-[50px] bg-peach-200 rounded-full flex justify-between items-center px-16 shadow-lg">
        {/* SVG con máscara que corta el rectángulo */}
        <motion.div
          className="absolute -top-7 left-1/2 -translate-x-1/2"
          animate={{
            left:
              activeItem === "rewards"
                ? "18%"
                : activeItem === "home"
                ? "48%"
                : "82%",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          <svg 
            width="110" 
            height="70" 
            viewBox="0 0 110 70" 
            fill="none"
          >
            <defs>
              <mask id="ellipse-cut">
                <rect width="110" height="70" fill="black"/>
                <path 
                  d="M110 30C85 30 85.5 70 55 70C24.5 70 25 30 0 30C0 10 35 0 55 0C75 0 110 13 110 30Z" 
                  fill="white"
                />
              </mask>
            </defs>
            <rect 
              width="110" 
              height="70" 
              fill="#f7efe7" 
              mask="url(#ellipse-cut)"
            />
          </svg>
        </motion.div>

        {/* Línea negra que se mueve con el círculo */}
        <motion.div
          className="absolute top-10 left-1/2 -translate-x-1/2 w-16 h-1 bg-black rounded-full"
          animate={{
            left:
              activeItem === "rewards"
                ? "18%"
                : activeItem === "home"
                ? "48%"
                : "82%",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        />

        {/* Botones de navegación - mostrar todos los iconos pero con opacidad diferente */}
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleButtonClick(item.path)}
            className="z-20"
          >
            <div className={`transition-all duration-300 ${
              activeItem !== item.id 
                ? "text-gray-600 opacity-100" 
                : "text-gray-600 opacity-0"
            }`}>
              {item.icon}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

ClientNavbar.displayName = "ClientNavbar";

export default ClientNavbar;