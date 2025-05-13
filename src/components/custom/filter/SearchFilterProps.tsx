import { AiOutlineSearch } from "react-icons/ai";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchFilter = ({ 
  value, 
  onChange, 
  placeholder = "Buscar...",
  className = "" 
}: SearchFilterProps) => {
  return (
    <div className={`relative ${className}`}>
      <AiOutlineSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="p-2.5 pl-10 w-full border border-blue-200 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};