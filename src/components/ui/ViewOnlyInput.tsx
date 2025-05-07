import { FC } from "react";

interface ViewOnlyInputProps {
  id: string;
  label: string;
  value: string;
  className?: string;
  placeholder?: string;
  labelClassName?: string;
  valueClassName?: string;
}

/**
 * Componente para mostrar información en formato de etiqueta/valor sin opción de edición
 */
export const ViewOnlyInput: FC<ViewOnlyInputProps> = ({
  id,
  label,
  value,
  className = "",
  placeholder = "Sin valor",
  labelClassName = "",
  valueClassName = "",
}) => {
  return (
    <div className="flex flex-col space-y-1.5">
      <label 
        htmlFor={id} 
        className={`text-sm font-medium text-gray-700 ${labelClassName}`}
      >
        {label} 
      </label>
      
      <div 
        className={`
          flex items-center w-full px-3 py-2 
          rounded-md border border-gray-200 bg-gray-50
          transition-all duration-200 ease-in-out
          ${className}
        `}
      >
        <div className="w-full truncate">
          {value ? (
            <span className={`text-gray-800 ${valueClassName}`}>{value}</span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewOnlyInput;