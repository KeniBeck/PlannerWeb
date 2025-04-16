import { FaultType } from "@/core/model/fault";
import { BsExclamationCircleFill, BsDoorOpenFill } from "react-icons/bs";
import { MdOutlineMoodBad } from "react-icons/md";

interface FaultTypeBadgeProps {
    type: FaultType;
}

export function FaultTypeBadge({ type }: FaultTypeBadgeProps) {
    // Configuraciones para cada tipo de falta con colores más diferenciados
    // y añadiendo iconos para mejor distinción visual
    const typeConfig = {
        [FaultType.INASSISTANCE]: {
            label: "Inasistencia",
            className: "bg-red-100 text-red-800 border-red-200",
            icon: <BsExclamationCircleFill className="mr-1.5" size={12} />
        },
        [FaultType.IRRESPECTFUL]: {
            label: "Irrespeto",
            className: "bg-purple-100 text-purple-800 border-purple-200",
            icon: <MdOutlineMoodBad className="mr-1.5" size={12} />
        },
        [FaultType.ABANDONMENT]: {
            label: "Abandono",
            className: "bg-amber-100 text-amber-800 border-amber-200",
            icon: <BsDoorOpenFill className="mr-1.5" size={12} />
        },
    };

    // Si el tipo no está en la configuración, usar el de "OTHER" como fallback
    const config = typeConfig[type];

    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${config.className}`}>
            {config.icon}
            {config.label}
        </span>
    );
}