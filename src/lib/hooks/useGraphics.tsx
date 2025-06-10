import { useOperations } from "@/contexts/OperationContext";
import { useWorkers } from "@/contexts/WorkerContext";
import { WorkerStatus } from "@/core/model/worker";
import { operationService } from "@/services/operationService";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";

export const useGraphics = () => {
    // Estados para la vista
    const [selectedDate, setSelectedDate] = useState<string>(
        format(new Date(), "yyyy-MM-dd")
    );
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [filteredOperations, setFilteredOperations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Iniciar con loading true
    const [showFullPageLoader, setShowFullPageLoader] = useState(true); // Estado para el loader completo

    // Obtener datos del contexto
    const { refreshOperations } = useOperations();
    const { workers, isLoading: workersLoading } = useWorkers();
     const [workerDistribution, setWorkerDistribution] = useState<any>({
        date: "",
        workers: [],
        distribution: []
    });


    // Funcion para cargar la distribuccion de trabajadores
    const loadWorkersDistribution = async (date: string) => {
        try {
            const data = await operationService.getWorkersDistribution(date);
            setWorkerDistribution(data);
            console.log("Distribución de trabajadores cargada:", data);
        } catch (error) {
            console.error("Error al cargar la distribución de trabajadores:", error);
            setWorkerDistribution({
                date: "",
                workers: [],
                distribution: []
            });
        }
    }


    // Función para cargar operaciones filtradas
    const loadFilteredOperations = async () => {
        try {
            setIsLoading(true);

            // Activar loader completo si no está activo ya
            if (!showFullPageLoader) {
                setShowFullPageLoader(true);
            }

            const filters: any = {
                dateStart: selectedDate,
            };

            // Solo agregar status si no es "all"
            if (statusFilter !== "all") {
                filters.status = statusFilter;
            }

            // Llamada a la API con paginación y filtros
            const result = await operationService.getPaginatedOperations(
                1,
                100,
                { ...filters, activatePaginated: false }
            );

            // Añadir pequeño retraso para mostrar la animación
            setTimeout(() => {
                setFilteredOperations(result.items || []);
                setIsLoading(false);
                setShowFullPageLoader(false);
            }, 800);

        } catch (error) {
            console.error("Error al cargar operaciones filtradas:", error);
            setFilteredOperations([]);
            setIsLoading(false);
            setShowFullPageLoader(false);
        }
    };

    // Cargar operaciones cuando cambian los filtros
    useEffect(() => {
        loadFilteredOperations();
        loadWorkersDistribution(selectedDate);
    }, [selectedDate, statusFilter]);


     // Datos para el gráfico de distribución por hora
    const hourlyDistributionChartData = useMemo(() => {
        if (!workerDistribution.distribution || workerDistribution.distribution.length === 0) {
            return {
                labels: [],
                datasets: [
                    {
                        label: "Trabajadores por hora",
                        data: [],
                        backgroundColor: "rgba(99, 102, 241, 0.7)",
                        borderColor: "rgba(99, 102, 241, 1)",
                        borderWidth: 1,
                    },
                ],
            };
        }


        return {
            labels: workerDistribution.distribution.map((slot: any) => slot.hour),
            datasets: [
                {
                    label: "Trabajadores por hora",
                    data: workerDistribution.distribution.map((slot: any) => slot.workerIds.length),
                    backgroundColor: "rgba(99, 102, 241, 0.7)",
                    borderColor: "rgba(99, 102, 241, 1)",
                    borderWidth: 1,
                },
            ],
            // Metadatos para el tooltip personalizado
            workerDetails: workerDistribution.distribution.map((slot: any) => {
                return {
                    hour: slot.hour,
                    workers: slot.workerIds.map((id: number) => {
                        const worker = workerDistribution.workers.find((w: any) => w.id === id);
                        return worker ? worker : { id, name: "Desconocido", dni: "N/A" };
                    })
                };
            })
        };
    }, [workerDistribution]);

    // Preparar datos para gráficos
    const areaChartData = useMemo(() => {
        const areaCounts: Record<string, number> = {};

        // Contar operaciones por área
        filteredOperations.forEach((op) => {
            const areaName = op.jobArea?.name || "Sin área";
            areaCounts[areaName] = (areaCounts[areaName] || 0) + 1;
        });

        return {
            labels: Object.keys(areaCounts),
            datasets: [
                {
                    label: "Operaciones por Área",
                    data: Object.values(areaCounts),
                    backgroundColor: [
                        "rgba(54, 162, 235, 0.7)",
                        "rgba(75, 192, 192, 0.7)",
                        "rgba(153, 102, 255, 0.7)",
                        "rgba(255, 159, 64, 0.7)",
                        "rgba(255, 99, 132, 0.7)",
                        "rgba(255, 206, 86, 0.7)",
                    ],
                    borderColor: [
                        "rgba(54, 162, 235, 1)",
                        "rgba(75, 192, 192, 1)",
                        "rgba(153, 102, 255, 1)",
                        "rgba(255, 159, 64, 1)",
                        "rgba(255, 99, 132, 1)",
                        "rgba(255, 206, 86, 1)",
                    ],
                    borderWidth: 1,
                },
            ],
        };
    }, [filteredOperations]);

    // Verificar si hay buques reales en las operaciones filtradas
    const hasRealShips = useMemo(() => {
        return filteredOperations.some(
            (op) => op.motorShip && op.motorShip.trim() !== ""
        );
    }, [filteredOperations]);

    const shipChartData = useMemo(() => {
        const shipCounts: Record<string, number> = {};

        // Contar operaciones por buque, excluyendo "Sin buque"
        filteredOperations.forEach((op) => {
            // Solo incluir buques con valor
            if (op.motorShip && op.motorShip.trim() !== "") {
                shipCounts[op.motorShip] = (shipCounts[op.motorShip] || 0) + 1;
            }
        });

        return {
            labels: Object.keys(shipCounts),
            datasets: [
                {
                    label: "Operaciones por Buque",
                    data: Object.values(shipCounts),
                    backgroundColor: [
                        "rgba(75, 192, 192, 0.7)",
                        "rgba(153, 102, 255, 0.7)",
                        "rgba(255, 159, 64, 0.7)",
                        "rgba(255, 99, 132, 0.7)",
                        "rgba(54, 162, 235, 0.7)",
                        "rgba(255, 206, 86, 0.7)",
                    ],
                    borderColor: [
                        "rgba(75, 192, 192, 1)",
                        "rgba(153, 102, 255, 1)",
                        "rgba(255, 159, 64, 1)",
                        "rgba(255, 99, 132, 1)",
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 206, 86, 1)",
                    ],
                    borderWidth: 1,
                },
            ],
        };
    }, [filteredOperations]);

    // Calcular el total real de buques (excluyendo "Sin buque")
    const actualShipCount = useMemo(() => {
        const uniqueShips = new Set<string>();
        filteredOperations.forEach((op) => {
            if (op.motorShip && op.motorShip.trim() !== "") {
                uniqueShips.add(op.motorShip);
            }
        });
        return uniqueShips.size;
    }, [filteredOperations]);

    const zoneChartData = useMemo(() => {
        const zoneCounts: Record<string, number> = {};

        // Contar operaciones por zona
        filteredOperations.forEach((op) => {
            const zone = op.zone || "Sin zona";
            zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
        });

        return {
            labels: Object.keys(zoneCounts),
            datasets: [
                {
                    label: "Operaciones por Zona",
                    data: Object.values(zoneCounts),
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.7)",
                        "rgba(54, 162, 235, 0.7)",
                        "rgba(255, 206, 86, 0.7)",
                        "rgba(75, 192, 192, 0.7)",
                        "rgba(153, 102, 255, 0.7)",
                        "rgba(255, 159, 64, 0.7)",
                    ],
                    borderColor: [
                        "rgba(255, 99, 132, 1)",
                        "rgba(54, 162, 235, 1)",
                        "rgba(255, 206, 86, 1)",
                        "rgba(75, 192, 192, 1)",
                        "rgba(153, 102, 255, 1)",
                        "rgba(255, 159, 64, 1)",
                    ],
                    borderWidth: 1,
                },
            ],
        };
    }, [filteredOperations]);

    const servicesTrendChartData = useMemo(() => {
        const serviceWorkerCounts: Record<string, number> = {};

        // Contar trabajadores por servicio en operaciones de hoy
        filteredOperations.forEach((op) => {
            const serviceName = op.task?.name || "Sin servicio";
            const workerCount = op.workers?.length || 0;
            const workersInGroups =
                op.workerGroups?.reduce(
                    (acc: any, group: any) => acc + (group.workers?.length || 0),
                    0
                ) || 0;

            serviceWorkerCounts[serviceName] =
                (serviceWorkerCounts[serviceName] || 0) + workerCount + workersInGroups;
        });

        return {
            labels: Object.keys(serviceWorkerCounts).map((l) => l.toUpperCase()),
            datasets: [
                {
                    label: "Trabajadores por Servicio",
                    data: Object.values(serviceWorkerCounts),
                    backgroundColor: "rgba(54, 162, 235, 0.7)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                },
            ],
        };
    }, [filteredOperations]);

    // Datos para el gráfico de estado de trabajadores
    const workerStatusChartData = useMemo(() => {
        const statusCounts: Record<string, number> = {
            [WorkerStatus.AVAILABLE]: 0,
            [WorkerStatus.ASSIGNED]: 0,
            [WorkerStatus.UNAVAILABLE]: 0,
        };

        // Contar trabajadores por estado
        workers.forEach((worker) => {
            const status = worker.status || WorkerStatus.AVAILABLE;
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        return {
            labels: Object.keys(statusCounts).map(status => {
                switch (status) {
                    case WorkerStatus.AVAILABLE: return "Disponibles";
                    case WorkerStatus.ASSIGNED: return "Asignados";
                    case WorkerStatus.UNAVAILABLE: return "No disponibles";
                    default: return status;
                }
            }),
            datasets: [
                {
                    label: "Estado de Trabajadores",
                    data: Object.values(statusCounts),
                    backgroundColor: [
                        "rgba(54, 162, 235, 0.7)",
                        "rgba(75, 192, 192, 0.7)",
                        "rgba(255, 99, 132, 0.7)",
                    ],
                    borderColor: [
                        "rgba(54, 162, 235, 1)",
                        "rgba(75, 192, 192, 1)",
                        "rgba(255, 99, 132, 1)",
                    ],
                    borderWidth: 1,
                },
            ],
        };
    }, [workers]);

    // Formatear fechas para mostrar
    const formatDisplayDate = (dateString: string) => {
        if (!dateString) return "";
        try {
            const [year, month, day] = dateString.split("-");
            return `${day}/${month}/${year}`;
        } catch (e) {
            return dateString;
        }
    };

    return {
        showFullPageLoader,
        loadFilteredOperations,
        isLoading,
        workersLoading,
        selectedDate,
        setSelectedDate,
        statusFilter,
        setStatusFilter,
        formatDisplayDate,
        filteredOperations,
        areaChartData,
        shipChartData,
        zoneChartData,
        servicesTrendChartData,
        workerStatusChartData,
        hasRealShips,
        actualShipCount,
        workers,
        hourlyDistributionChartData
    };
}