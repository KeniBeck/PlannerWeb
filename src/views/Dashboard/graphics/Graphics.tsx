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
  ChartOptions,
} from "chart.js";
import { OperationStatus } from "@/core/model/operation";
import { DateFilter } from "@/components/custom/filter/DateFilterProps";
import { StatusFilter } from "@/components/custom/filter/StatusFilterProps";
import { FaClock, FaShip } from "react-icons/fa";
import ChartCard from "@/components/custom/charts/ChartCard";
import { ShipLoader } from "@/components/dialog/Loading";
import { useGraphics } from "@/lib/hooks/useGraphics";

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

export default function Graphics() {
    const { showFullPageLoader, loadFilteredOperations, isLoading, workersLoading, selectedDate, setSelectedDate, statusFilter, setStatusFilter, formatDisplayDate, filteredOperations, areaChartData, shipChartData, zoneChartData, servicesTrendChartData, workerStatusChartData, hasRealShips, actualShipCount, workers, hourlyDistributionChartData } = useGraphics();

     const hourlyChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    title: function(tooltipItems: any) {
                        return `Franja: ${tooltipItems[0].label}`;
                    },
                    label: function(context: any) {
                        const dataIndex = context.dataIndex;
                        const workerCount = context.parsed.y || 0;
                        
                        if (workerCount === 0) {
                            return 'No hay trabajadores en esta franja';
                        }
                        
                        return `Total de trabajadores: ${workerCount}`;
                    },
                    afterLabel: function(context: any) {
                        const dataIndex = context.dataIndex;
                        const workerDetails = hourlyDistributionChartData.workerDetails?.[dataIndex];
                        
                        if (!workerDetails || !workerDetails.workers || workerDetails.workers.length === 0) {
                            return '';
                        }
                        
                        return workerDetails.workers.map((worker: any, index: number) => 
                            `${index + 1}. ${worker.name} - DNI: ${worker.dni}`
                        );
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Cantidad de trabajadores'
                },
                ticks: {
                    stepSize: 1,
                    callback: function(value: number) {
                        return value === 0 ? '0' : value.toString();
                    }
                }

            },
            x: {
            grid: {
                display: false 
            },
            ticks: {
                maxRotation: 0, 
                autoSkip: true 
            }
        },
        }
    };


  return (
    <>
      {/* Loader de página completa */}
      {showFullPageLoader && <ShipLoader />}
      
      <div className="container mx-auto py-6 space-y-6">
        <div className="rounded-xl shadow-md">
          <SectionHeader
            title="Reportes"
            subtitle="Visualización de estadísticas y reportes de operaciones"
            btnAddText=""
            handleAddArea={() => {}}
            refreshData={loadFilteredOperations}
            loading={isLoading || workersLoading}
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
            isEmpty={filteredOperations.length === 0}
            emptyMessage="No hay operaciones para mostrar"
            height={300}
            isLoading={isLoading}
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
            isEmpty={filteredOperations.length === 0 || !hasRealShips}
            emptyIcon={
              filteredOperations.length === 0 ? (
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
              filteredOperations.length === 0
                ? "No hay operaciones para mostrar"
                : "Operaciones sin buques asignados"
            }
            emptySubMessage={
              filteredOperations.length === 0
                ? ""
                : "No hay datos de buques para visualizar"
            }
            height={300}
            isLoading={isLoading}
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
            isEmpty={filteredOperations.length === 0}
            emptyMessage="No hay operaciones para mostrar"
            height={300}
            isLoading={isLoading}
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
            height={300}
            isLoading={isLoading}
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
            isEmpty={filteredOperations.length === 0}
            emptyMessage="No hay operaciones para mostrar"
            className="md:col-span-2"
            height={300}
            isLoading={isLoading}
          />

          {/* Nueva gráfica de distribución de trabajadores por hora */}
          <ChartCard
            title="Distribución de Trabajadores por Hora"
            total={{
              value: hourlyDistributionChartData.datasets?.[0]?.data?.reduce(
                (a: number, b: number) => a + b,
                0
              ) || 0,
              label: "asignaciones",
            }}
            icon={<FaClock className="w-full h-full" />}
            iconBgColor="bg-indigo-50"
            iconColor="text-indigo-500"
            titleGradient={{ from: "#6366f1", to: "#4f46e5" }}
            chartType="line"
            chartData={hourlyDistributionChartData}
            chartOptions={hourlyChartOptions as ChartOptions<"line">}
            isEmpty={!hourlyDistributionChartData.labels || hourlyDistributionChartData.labels.length === 0}
            emptyMessage="No hay datos de distribución por hora"
            className="md:col-span-2"
            height={300}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
}