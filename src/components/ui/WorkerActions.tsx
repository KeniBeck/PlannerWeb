import { Button } from "@/components/ui/Button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Worker, WorkerStatus } from "@/core/model/worker";
import { Edit, MoreHorizontal, Trash2, AlertTriangle, UserX, UserCheck } from "lucide-react";

interface WorkerActionsProps {
    worker: Worker;
}

export function WorkerActions({ worker }: WorkerActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                </DropdownMenuItem>

                {worker.status !== WorkerStatus.DEACTIVATED && (
                    <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                        <UserX className="h-4 w-4" />
                        <span>Retirar</span>
                    </DropdownMenuItem>
                )}

                {worker.status === WorkerStatus.DEACTIVATED && (
                    <DropdownMenuItem className="flex items-center gap-2 text-green-600">
                        <UserCheck className="h-4 w-4" />
                        <span>Reactivar</span>
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Registrar Falta</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                    <Trash2 className="h-4 w-4" />
                    <span>Eliminar</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}