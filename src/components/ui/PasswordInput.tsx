import React, { forwardRef, useState, useCallback } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons/Icons";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showToggle?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, showToggle = true, className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    // Detectar iOS
    React.useEffect(() => {
      setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    }, []);

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      if (isIOS && props.type === "password") {
        const input = e.target;
        const val = input.value;
        
        // Fix específico para iOS Safari
        input.value = '';
        setTimeout(() => {
          input.value = val;
          input.setSelectionRange(val.length, val.length);
        }, 0);
      }
      
      // Llamar al onFocus original si existe
      if (props.onFocus) {
        props.onFocus(e);
      }
    }, [isIOS, props]);

    const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
      if (isIOS) {
        const input = e.target as HTMLInputElement;
        if (document.activeElement !== input) {
          input.focus();
        }
      }
      
      // Llamar al onInput original si existe
      if (props.onInput) {
        props.onInput(e);
      }
    }, [isIOS, props]);

    const inputClasses = `
      w-full px-4 py-3 text-gray-900 bg-[#FFE4CC] border border-gray-400 rounded-lg
      focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
      transition-all duration-200
      min-h-[48px] h-[48px] text-base
      ${error ? "border-red-500 focus:ring-red-500" : ""}
      ${showToggle ? "pr-12" : "pr-4"}
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
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            autoComplete={props.autoComplete || "current-password"}
            placeholder={props.placeholder}
            value={props.value}
            onChange={props.onChange}
            onFocus={handleFocus}
            onInput={handleInput}
            className={inputClasses}
            style={{
              fontSize: '16px',
              minHeight: '48px',
              ...props.style,
            }}
            {...props}
          />

          {showToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              style={{ minHeight: '20px', minWidth: '20px' }}
            >
              {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
