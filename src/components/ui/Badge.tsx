interface BadgeProps {
  text: string;
  color?: "blue" | "green" | "red" | "yellow" | "gray";
}

export function Badge({ text, color = "blue" }: BadgeProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    red: "bg-red-100 text-red-800 border-red-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200",
  };
  
  return (
    <span className={`px-2.5 py-1 text-xs rounded-full border ${colorClasses[color]} inline-flex items-center`}>
      {text}
    </span>
  );
}