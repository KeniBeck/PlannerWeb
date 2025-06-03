import { ReactNode, useState } from "react";
import { DateFilter } from "../custom/filter/DateFilterProps";

interface FloatingInputSimpleProps {
  id: string;
  label?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  placeholder?: string;
  minDate?: string;
}

export function FloatingInputSimple({
  id,
  label = "",
  type = "text",
  value,
  onChange,
  error,
  required = false,
  className = "",
  icon,
  iconPosition = "left",
  placeholder = "",
  minDate,
}: FloatingInputSimpleProps) {
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = value.length > 0;
  const hasIcon = !!icon;

  if (type === "date") {
    return (
      <div className="flex flex-col">
        <DateFilter
          label={`${label}${required ? " *" : ""}`}
          value={value}
          onChange={onChange}
          minDate={minDate}
          className={className}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  // Para type="time", siempre mostrar el label arriba
  if (type === "time") {
    return (
      <div className="flex flex-col">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label} {required && <span className="text-red-400">*</span>}
          </label>
        )}
        
        <div className="relative">
          {/* Icono a la izquierda */}
          {hasIcon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10">
              {icon}
            </div>
          )}

          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              block w-full text-sm text-gray-900 bg-white
              rounded-lg border border-gray-300 appearance-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              transition-all duration-200 ease-in-out
              ${hasIcon ? "px-10 py-3" : "px-3 py-3"}
              ${error ? "border-red-300" : "border-gray-300"}
              ${className}
            `}
          />

          {/* Icono a la derecha */}
          {hasIcon && iconPosition === "right" && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10">
              {icon}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  // Para otros tipos (text, email, etc.), usar label flotante
  return (
    <div className="flex flex-col">
      <div className="relative">
        {/* Icono a la izquierda */}
        {hasIcon && iconPosition === "left" && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10">
            {icon}
          </div>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ""}
          className={`
            block w-full text-sm text-gray-900 bg-transparent 
            rounded-lg border border-gray-300 appearance-none
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200 ease-in-out
            ${hasIcon ? "px-10 py-3" : "px-3 py-3"}
            ${error ? "border-red-300" : "border-gray-300"}
            ${className}
          `}
        />

        {/* Icono a la derecha */}
        {hasIcon && iconPosition === "right" && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10">
            {icon}
          </div>
        )}

        <label
          htmlFor={id}
          className={`
            absolute text-sm duration-300 transform pointer-events-none origin-[0]
            ${
              isFocused || hasValue
                ? `-translate-y-5 top-2 ${
                    hasIcon ? "left-9" : "left-2"
                  } bg-white scale-75 z-10 px-1 ${
                    required ? "text-red-400" : "text-blue-600"
                  }`
                : `top-3 ${hasIcon ? "left-10" : "left-3"} text-gray-500`
            }
          `}
        >
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}