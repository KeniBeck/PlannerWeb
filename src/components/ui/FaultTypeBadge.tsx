import { FaultType } from "@/core/model/fault";

interface FaultTypeBadgeProps {
    type: FaultType;
}

export function FaultTypeBadge({ type }: FaultTypeBadgeProps) {
    const typeConfig = {
        [FaultType.INASSISTANCE]: {
            label: "Inasistencia",
            variant: "outline" as const,
            className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        },
        [FaultType.IRRESPECTFUL]: {
            label: "Irrespeto",
            variant: "outline" as const,
            className: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
        },
        [FaultType.ABANDONMENT]: {
            label: "Abandono",
            variant: "outline" as const,
            className: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
        },
    };

    const config = typeConfig[type];

    return (
        <div className={config.className}>
            {config.label}
        </div>
    );
}