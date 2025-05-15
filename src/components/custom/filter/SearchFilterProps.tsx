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
  return (
    <div className={`relative ${className}`}>
      <AiOutlineSearch className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="p-2 pl-10 w-full border border-blue-200 bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {loading && (
        <div className="absolute right-3 top-3">
          <CgSpinner className="animate-spin h-5 w-5 text-blue-500" />
        </div>
      )}
    </div>
  );
};