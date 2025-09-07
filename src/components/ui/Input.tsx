import React, { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightIcon, className = "", placeholder, value, ...props }, ref) => {
    const inputClasses = `
      w-full px-4 py-3 text-gray-900 bg-[#FFE4CC] border border-gray-400 rounded-lg
      focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
      transition-all duration-200
      min-h-[48px] h-[48px] text-base
      ${error ? "border-red-500 focus:ring-red-500" : ""}
      ${icon ? "pl-12" : "pl-4"}
      ${rightIcon ? "pr-12" : "pr-4"}
      ${className}
    `;

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
              ...props.style,
            }}
          />


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