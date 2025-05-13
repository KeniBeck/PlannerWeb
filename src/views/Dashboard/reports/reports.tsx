import { useState, useMemo } from "react";
import { format } from "date-fns";
import { useOperations } from "@/contexts/OperationContext";
import { useWorkers } from "@/contexts/WorkerContext";
import SectionHeader from "@/components/ui/SectionHeader";
import { FiFilter } from "react-icons/fi";
import { BsCalendar } from "react-icons/bs";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { WorkerStatus } from "@/core/model/worker";
import { OperationStatus } from "@/core/model/operation";
import { DateFilter } from "@/components/custom/filter/DateFilterProps";
import { StatusFilter } from "@/components/custom/filter/StatusFilterProps";
import { FaShip } from "react-icons/fa";
import ChartCard from "@/components/custom/charts/ChartCard";

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Opciones para estados de operación
const statusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: OperationStatus.PENDING, label: "Pendientes" },
  { value: OperationStatus.INPROGRESS, label: "En curso" },
  { value: OperationStatus.COMPLETED, label: "Finalizadas" },
  { value: OperationStatus.CANCELED, label: "Canceladas" },
];

export default function Reports() {
  // Estados para la vista
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Obtener datos del contexto
  const {
    operations,
    refreshOperations,
    isLoading: operationsLoading,
  } = useOperations();
  const { workers, isLoading: workersLoading } = useWorkers();

  // Obtener las operaciones para la fecha seleccionada
  const todayOperations = useMemo(() => {
    const todaysDate = selectedDate;
    return operations.filter((op) => {
      // Usar directamente la fecha sin crear un nuevo Date
      const opDate = op.dateStart ? op.dateStart.split("T")[0] : null;
      const matchesDate = opDate === todaysDate;

      // Verificar el estado
      const matchesStatus =
        statusFilter === "all" || op.status === statusFilter;

      return matchesDate && matchesStatus;
    });
  }, [operations, selectedDate, statusFilter]);

  // Preparar datos para gráficos
  const areaChartData = useMemo(() => {
    const areaCounts: Record<string, number> = {};

    // Contar operaciones por área
    todayOperations.forEach((op) => {
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
  }, [todayOperations]);

  // Verificar si hay buques reales en las operaciones de hoy
  const hasRealShips = useMemo(() => {
    return todayOperations.some(
      (op) => op.motorShip && op.motorShip.trim() !== ""
    );
  }, [todayOperations]);

  const shipChartData = useMemo(() => {
    const shipCounts: Record<string, number> = {};

    // Contar operaciones por buque, excluyendo "Sin buque"
    todayOperations.forEach((op) => {
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
  }, [todayOperations]);

  // Calcular el total real de buques (excluyendo "Sin buque")
  const actualShipCount = useMemo(() => {
    const uniqueShips = new Set<string>();
    todayOperations.forEach((op) => {
      if (op.motorShip && op.motorShip.trim() !== "") {
        uniqueShips.add(op.motorShip);
      }
    });
    return uniqueShips.size;
  }, [todayOperations]);

  const zoneChartData = useMemo(() => {
    const zoneCounts: Record<string, number> = {};

    // Contar operaciones por zona
    todayOperations.forEach((op) => {
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
  }, [todayOperations]);

  const workerStatusChartData = useMemo(() => {
    const counts = {
      disponibles: 0,
      asignados: 0,
      incapacitados: 0,
      retirados: 0,
      deshabilitados: 0,
    };

    // Contar trabajadores por estado
    workers.forEach((worker) => {
      switch (worker.status) {
        case WorkerStatus.AVAILABLE:
          counts.disponibles += 1;
          break;
        case WorkerStatus.ASSIGNED:
          counts.asignados += 1;
          break;
        case WorkerStatus.INCAPACITATED:
          counts.incapacitados += 1;
          break;
        case WorkerStatus.DEACTIVATED:
          counts.retirados += 1;
          break;
        case WorkerStatus.UNAVAILABLE:
          counts.deshabilitados += 1;
          break;
      }
    });

    return {
      labels: [
        "Disponibles",
        "Asignados",
        "Incapacitados",
        "Retirados",
        "Deshabilitados",
      ],
      datasets: [
        {
          label: "Estado de Trabajadores",
          data: [
            counts.disponibles,
            counts.asignados,
            counts.incapacitados,
            counts.retirados,
            counts.deshabilitados,
          ],
          backgroundColor: [
            "rgba(75, 192, 192, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(153, 102, 255, 0.7)",
            "rgba(255, 99, 132, 0.7)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 99, 132, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [workers]);

  const servicesTrendChartData = useMemo(() => {
    const serviceWorkerCounts: Record<string, number> = {};

    // Contar trabajadores por servicio en operaciones de hoy
    todayOperations.forEach((op) => {
      const serviceName = op.task?.name || "Sin servicio";
      // Asumimos que hay un campo para contar o listar trabajadores en la operación
      const workerCount = op.workers?.length || 0;
      const workersInGroups =
        op.workerGroups?.reduce(
          (acc, group) => acc + (group.workers?.length || 0),
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
  }, [todayOperations]);

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="rounded-xl shadow-md">
        <SectionHeader
          title="Reportes"
          subtitle="Visualización de estadísticas y reportes de operaciones"
          btnAddText=""
          handleAddArea={() => {}}
          refreshData={() => Promise.resolve(refreshOperations())}
          loading={operationsLoading || workersLoading}
          exportData={[]}
          exportFileName="reporte"
          exportColumns={[]}
          currentView="reports"
          showAddButton={false}
          showDownloadButton={false}
        />

        <div className="flex items-center justify-between p-3 bg-white border-b border-gray-100">
          <div className="flex gap-4 items-center">
            <div className="relative flex items-center">
              <BsCalendar className="absolute left-3 text-gray-400" />
              <DateFilter
                className=""
                value={selectedDate}
                onChange={(e) => setSelectedDate(e)}
                label="Seleccionar fecha"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-3">
                <FiFilter className="h-5 w-5 text-blue-500" />
              </div>
              <StatusFilter
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                className=""
              />
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg
                  className="h-5 w-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <span className="text-gray-600">
              Mostrando datos para:{" "}
              <span className="font-medium">
                {formatDisplayDate(selectedDate)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Contenido según el modo de vista */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gráfica de distribución por áreas */}
        <ChartCard
          title="Distribución por Áreas"
          total={{
            value: Object.values(areaChartData.datasets[0].data).reduce(
              (a, b) => a + b,
              0
            ),
            label: "operaciones",
          }}
          icon={
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          iconBgColor="bg-blue-50"
          iconColor="text-blue-500"
          titleGradient={{ from: "#2563eb", to: "#1e40af" }}
          chartType="bar"
          chartData={areaChartData}
          isEmpty={todayOperations.length === 0}
          emptyMessage="No hay operaciones para mostrar"
        />

        {/* Gráfica de distribución por buque */}
        <ChartCard
          title="Distribución por Buque"
          {...(actualShipCount > 0
            ? { total: { value: actualShipCount, label: "buques" } }
            : {})}
          icon={
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
          iconBgColor="bg-teal-50"
          iconColor="text-teal-500"
          titleGradient={{ from: "rgb(13, 148, 136)", to: "rgb(6, 95, 70)" }}
          chartType="bar"
          chartData={shipChartData}
          isEmpty={todayOperations.length === 0 || !hasRealShips}
          emptyIcon={
            todayOperations.length === 0 ? (
              <svg
                className="w-12 h-12 text-gray-300 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            ) : (
              <FaShip className="w-16 h-16 text-gray-300 mb-4" />
            )
          }
          emptyMessage={
            todayOperations.length === 0
              ? "No hay operaciones para mostrar"
              : "Operaciones sin buques asignados"
          }
          emptySubMessage={
            todayOperations.length === 0
              ? ""
              : "No hay datos de buques para visualizar"
          }
        />

        {/* Gráfica de distribución por zonas */}
        <ChartCard
          title="Distribución por Zonas"
          total={{
            value: Object.values(zoneChartData.datasets[0].data).reduce(
              (a, b) => a + b,
              0
            ),
            label: "zonas",
          }}
          icon={
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          }
          iconBgColor="bg-purple-50"
          iconColor="text-purple-500"
          titleGradient={{ from: "#9333ea", to: "#7e22ce" }}
          chartType="pie"
          chartData={zoneChartData}
          isEmpty={todayOperations.length === 0}
          emptyMessage="No hay operaciones para mostrar"
        />
        {/* Gráfica de estado de trabajadores */}
        <ChartCard
          title="Estado de Trabajadores"
          total={{
            value: Object.values(workerStatusChartData.datasets[0].data).reduce(
              (a, b) => a + b,
              0
            ),
            label: "trabajadores",
          }}
          icon={
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-500"
          titleGradient={{ from: "#4f46e5", to: "#4338ca" }}
          chartType="pie"
          chartData={workerStatusChartData}
          isEmpty={workers.length === 0}
          emptyMessage="No hay trabajadores para mostrar"
        />
        {/* Gráfica de tendencias de servicios */}
        <ChartCard
          title="Tendencias de Servicios"
          total={{
            value: Object.values(
              servicesTrendChartData.datasets[0].data
            ).reduce((a, b) => a + b, 0),
            label: "trabajadores asignados",
          }}
          icon={
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
          iconBgColor="bg-rose-50"
          iconColor="text-rose-500"
          titleGradient={{ from: "#e11d48", to: "#be123c" }}
          chartType="bar"
          chartData={servicesTrendChartData}
          isEmpty={todayOperations.length === 0}
          emptyMessage="No hay operaciones para mostrar"
          className="md:col-span-2"
        />
      </div>
    </div>
  );
}