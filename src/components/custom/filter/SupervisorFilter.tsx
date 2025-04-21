import { MdOutlineSupervisorAccount } from "react-icons/md";

interface SupervisorFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
  placeholder?: string;
}

export const SupervisorFilter = ({
  value,
  onChange,
  options,
  className = "",
  placeholder = "Seleccionar supervisor",
}: SupervisorFilterProps) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-3.5">
        <MdOutlineSupervisorAccount className="h-5 w-5 text-blue-500" />
      </div>
      <select
        className="pl-10 pr-10 py-3 w-full appearance-none border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm text-gray-700 font-medium"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          backgroundImage: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
        }}
        aria-label={placeholder}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};