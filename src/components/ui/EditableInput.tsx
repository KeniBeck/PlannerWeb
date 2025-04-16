import { useState, useEffect, useRef } from "react";
import { FaEdit, FaCheck, FaTimes } from "react-icons/fa";

interface EditableInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  type?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export function EditableInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  type = "text",
  className = "",
  disabled = false,
  placeholder = "Sin valor",
  maxLength,
  minLength,
  pattern,
}: EditableInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Actualiza el valor interno cuando cambia el prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Auto-foco cuando se activa el modo edición
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (pattern && !new RegExp(pattern).test(inputValue)) {
      return; // No guarda si no cumple el patrón
    }
    
    if (minLength && inputValue.length < minLength) {
      return; // No guarda si no cumple longitud mínima
    }
    
    onChange(inputValue);
    setIsEditing(false);
    onBlur?.();
  };

  const handleCancel = () => {
    setInputValue(value);
    setIsEditing(false);
  };

  // Renderiza modo edición o modo vista
  return (
    <div className="flex flex-col space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {isEditing ? (
        // Modo edición
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            id={id}
            type={type}
            value={inputValue}
            onChange={(e) => onChange(e.target.value)}
            maxLength={maxLength}
            className={`
              w-full px-3 py-2 rounded-md border-2 border-blue-400 
              shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300
              text-gray-900 transition-all duration-200
              ${className}
            `}
            placeholder={placeholder}
          />
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={handleSave}
              className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
              title="Guardar"
            >
              <FaCheck size={14} />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              title="Cancelar"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>
      ) : (
        // Modo vista
        <div 
          className={`
            group relative flex items-center w-full px-3 py-2 
            rounded-md border border-gray-200 ${disabled ? "bg-gray-50" : "bg-white"}
            ${error ? "border-red-300" : "hover:border-blue-400"} 
            transition-all duration-200 ease-in-out
            ${className}
          `}
        >
          <div className="w-full truncate">
            {value ? (
              <span className="text-gray-800">{value}</span>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          
          {!disabled && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="absolute right-2 p-1 rounded text-blue-500 
                opacity-0 group-hover:opacity-100 transition-opacity"
              title="Editar"
            >
              <FaEdit size={16} />
            </button>
          )}
        </div>
      )}
      
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default EditableInput;