import { useState, useEffect, KeyboardEvent } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { CgSpinner } from "react-icons/cg";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  loading?: boolean;
}

export const SearchFilter = ({
  value,
  onChange,
  placeholder = "Buscar...",
  className = "",
  onKeyDown,
  loading = false,
}: SearchFilterProps) => {
  // Estado local para el término de búsqueda
  const [localValue, setLocalValue] = useState(value);

  // Actualizar el estado local cuando cambie el prop
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Manejar cambios en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  // Manejar evento de tecla
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onChange(localValue);
    }
    // Llamar al onKeyDown personalizado si existe
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // Manejar clic en botón de búsqueda
  const handleSearchClick = () => {
    onChange(localValue);
  };

  return (
    <div className={`relative ${className}`}>
      <AiOutlineSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="p-2 pl-10 w-full border border-blue-200 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        value={localValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
      />
    </div>
  );
};