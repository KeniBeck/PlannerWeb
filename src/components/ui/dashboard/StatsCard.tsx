import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface StatsCardProps {
  title: string;
  count: number;
  subtitle?: string;
  subtitleValue?: string | number;
  icon: ReactNode;
  iconSubtitle?: ReactNode;
  iconBgColor: string;
  iconColor: string;
  borderColor: string;
  to: string;
}

export const StatsCard = ({
  title,
  count,
  subtitle,
  subtitleValue,
  icon,
  iconSubtitle,
  iconBgColor,
  iconColor,
  borderColor,
  to,
}: StatsCardProps) => {
  return (
    <Link
      to={to}
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 ${borderColor}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 font-medium">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{count}</h3>
          {subtitle && subtitleValue !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <span className={`${iconColor} flex items-center text-sm gap-2`}>
                {typeof subtitleValue === 'number' && subtitleValue > 0 && iconSubtitle}
                 {subtitleValue} {subtitle}
              </span>
            </div>
          )}
        </div>
        <div className={`${iconBgColor} p-3 rounded-lg`}>
          <div className={`text-2xl block ${iconColor}`}>{icon}</div>
        </div>
      </div>
    </Link>
  );
};