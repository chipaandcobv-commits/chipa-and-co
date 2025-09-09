"use client";

import { useState, useCallback, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { GiftCardIcon, HomeIcon, UserIcon } from "./icons/Icons";

const ClientNavbar = memo(() => {
  const pathname = usePathname();
  const router = useRouter();
  const [rippleStates, setRippleStates] = useState<{ [key: string]: boolean }>({});

  const isActive = useCallback((path: string) => {
    if (path === "/cliente") {
      return pathname === "/cliente";
    }
    return pathname.startsWith(path);
  }, [pathname]);

  const handleButtonClick = useCallback((path: string) => {
    // Crear efecto de ripple
    setRippleStates(prev => ({ ...prev, [path]: true }));
    
    // Navegar usando Next.js router (sin recargar la página)
    setTimeout(() => {
      router.push(path);
    }, 150);
  }, [router]);

  const getRippleClass = useCallback((path: string) => {
    return rippleStates[path] ? 'ripple-active' : '';
  }, [rippleStates]);

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-[#F7EFE7] border-t border-gray-200 flex justify-around items-center py-3 px-6 shadow-lg rounded-t-2xl max-w-[480px] w-full z-50">
      <button 
        onClick={() => handleButtonClick("/cliente/rewards")}
        className={`relative flex flex-col items-center p-2 rounded-lg transition-all duration-300 overflow-hidden ${
          isActive("/cliente/rewards") 
            ? "text-[#F15A25] bg-orange-50" 
            : "text-gray-600 hover:text-[#F15A25]"
        }`}
      >
        {/* Efecto de ripple */}
        <div className={`absolute inset-0 rounded-lg bg-[#F15A25]/20 transform scale-0 transition-transform duration-300 ${getRippleClass("/cliente/rewards")}`} />
        
        <GiftCardIcon className="w-6 h-6 relative z-10" />
        <span className="text-xs mt-1 relative z-10">Premios</span>
      </button>
      
      <button 
        onClick={() => handleButtonClick("/cliente")}
        className={`relative flex flex-col items-center p-2 rounded-lg transition-all duration-300 overflow-hidden ${
          isActive("/cliente") 
            ? "text-[#F15A25] bg-orange-50" 
            : "text-gray-600 hover:text-[#F15A25]"
        }`}
      >
        {/* Efecto de ripple */}
        <div className={`absolute inset-0 rounded-lg bg-[#F15A25]/20 transform scale-0 transition-transform duration-300 ${getRippleClass("/cliente")}`} />
        
        <HomeIcon className="w-6 h-6 relative z-10" />
        <span className="text-xs mt-1 relative z-10">Inicio</span>
      </button>
      
      <button 
        onClick={() => handleButtonClick("/cliente/profile")}
        className={`relative flex flex-col items-center p-2 rounded-lg transition-all duration-300 overflow-hidden ${
          isActive("/cliente/profile") 
            ? "text-[#F15A25] bg-orange-50" 
            : "text-gray-600 hover:text-[#F15A25]"
        }`}
      >
        {/* Efecto de ripple */}
        <div className={`absolute inset-0 rounded-lg bg-[#F15A25]/20 transform scale-0 transition-transform duration-300 ${getRippleClass("/cliente/profile")}`} />
        
        <UserIcon className="w-6 h-6 relative z-10" />
        <span className="text-xs mt-1 relative z-10">Perfil</span>
      </button>

      <style jsx>{`
        .ripple-active {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
});

ClientNavbar.displayName = 'ClientNavbar';

export default ClientNavbar;
