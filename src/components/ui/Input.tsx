"use client";
import React, { forwardRef, useEffect, useState } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightIcon, className = "", placeholder, value, ...props }, ref) => {
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
      if (typeof navigator === "undefined") return;
      const ua = navigator.userAgent || navigator.vendor || "";
      const iOS = /iP(hone|od|ad)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      setIsIOS(iOS);
    }, []);

    const inputClasses = `
      w-full px-4 py-3 text-gray-900 bg-[#FFE4CC] border border-gray-400 rounded-lg
      focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
      transition-all duration-200
      min-h-[48px] h-[48px] text-base
      ${error ? "border-red-500 focus:ring-red-500" : ""}
      ${icon ? "pl-12" : "pl-4"}
      ${rightIcon ? "pr-12" : "pr-4"}
      ${className}
      ${isIOS ? " ios-hide-placeholder" : ""}
    `;

    const placeholderLeftClass = icon ? "left-12" : "left-4";

    // value puede ser '' o undefined; convertimos a string para la condición
    const hasValue = String(value ?? "").length > 0;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={props.name} // ⚡ necesario en iOS
            autoComplete={props.type === "password" ? "current-password" : props.type === "email" ? "email" : "on"}
            placeholder={placeholder} // siempre presente
            value={value}
            {...props}
            className={inputClasses}
            style={{
              position: "relative",
              // ⚡ quitamos zIndex alto, dejamos que el span se vea encima
              ...props.style,
            }}
          />

          {/* Overlay placeholder solo en iOS */}
          {isIOS && !hasValue && placeholder && (
            <span
              aria-hidden="true"
              className={`absolute ${placeholderLeftClass} top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none select-none`}
              style={{
                zIndex: 20, // ⚡ por encima del input
                fontSize: "16px",
                color: "#9ca3af",
              }}
            >
              {placeholder}
            </span>
          )}

          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;