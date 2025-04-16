interface FilterTagProps {
  label: string;
  value: string;
  onRemove: () => void;
}

export const FilterTag = ({ label, value, onRemove }: FilterTagProps) => {
  return (
    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
      {label}: {value}
      <button
        className="ml-2 text-xs"
        onClick={onRemove}
      >
        ×
      </button>
    </span>
  );
};