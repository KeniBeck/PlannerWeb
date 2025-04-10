import { ReactNode, useState } from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  required?: boolean;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export function FloatingInput({
  id,
  label,
  type = "text",
  registration,
  error,
  required = false,
  className = "",
  icon,
  iconPosition = "left",
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === "password" && showPassword ? "text" : type;

  // Maneja cambios de valor para determinar si hay texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
  };
  const hasIcon = !!icon;
  const isPasswordField = type === "password";
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }
  return (
<div className="flex flex-col">
      <div className="relative">
        {/* Icono a la izquierda */}
        {hasIcon && iconPosition === "left" && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={inputType}
          className={`
          block px-8 py-3 w-full text-sm text-gray-900 bg-transparent 
          rounded-lg border border-gray-300 appearance-none
          focus:outline-none focus:ring-blue-500 focus:border-blue-500
          transition-all duration-200 ease-in-out
          ${className}
        `}
          {...registration}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(e.target.value.length > 0);
          }}
          onChange={(e) => {
            registration.onChange(e);
            handleChange(e);
          }}
        />
               {isPasswordField && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        )}
        <label
          htmlFor={id}
          className={`
          absolute text-sm duration-300 transform 
          ${
            isFocused || hasValue
              ? `-translate-y-5 top-2 left-2 bg-gray-200 scale-75 z-10 px-1 ${required ? 'text-red-400':'text-blue-600 '}`
              : "top-3 left-8 text-gray-500"
          }
          pointer-events-none origin-[0]
        `}
        >
          {label}
        </label>
   
     
    </div>
    {error && <p className=" text-xs text-red-600">{error.message}</p>}
    </div>
  );
}
