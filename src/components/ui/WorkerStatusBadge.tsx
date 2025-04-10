import { Badge } from "@/components/ui/badge";
import { WorkerStatus } from "@/core/model/worker";

interface WorkerStatusBadgeProps {
    status: WorkerStatus;
}

export function WorkerStatusBadge({ status }: WorkerStatusBadgeProps) {
    const statusConfig = {
        [WorkerStatus.AVAILABLE]: {
            label: "Disponible",
            variant: "outline" as const,
            className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        },
        [WorkerStatus.ASSIGNED]: {
            label: "Asignado",
            variant: "outline" as const,
            className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
        },
        [WorkerStatus.UNAVAILABLE]: {
            label: "No Disponible",
            variant: "outline" as const,
            className: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
        },
        [WorkerStatus.DEACTIVATED]: {
            label: "Retirado",
            variant: "outline" as const,
            className: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
        },
        [WorkerStatus.INCAPACITATED]: {
            label: "Incapacitado",
            variant: "outline" as const,
            className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
        },
    };

    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} className={config.className}>
            {config.label}
        </Badge>
    );
}