import { useWorkers } from "@/contexts/WorkerContext";
import { useOperations } from "@/contexts/OperationContext";
import { useAreas } from "@/contexts/AreasContext";
import { useClients } from "@/contexts/ClientsContext";
import { WorkerStatus } from "@/core/model/worker";
import { DashboardHeader } from "@/components/ui/dashboard/DashboardHeader";
import { StatsCard } from "@/components/ui/dashboard/StatsCard";
import { OperationStatusChart } from "@/components/ui/dashboard/OperationStatusChart";
import { WorkerStatusChart } from "@/components/ui/dashboard/WorkerStatusChart";
import { RecentOperationsTable } from "@/components/ui/dashboard/RecentOperationsTable";
import { HiMiniClipboardDocumentList } from "react-icons/hi2";
import { FiTrendingUp } from "react-icons/fi";
import { AiOutlineTeam, AiOutlineClockCircle } from "react-icons/ai";
import { PiMapPinSimpleAreaBold } from "react-icons/pi";
import { BsBuildingsFill } from "react-icons/bs";

export default function DashboardHome() {
  const { workers } = useWorkers();
  const {
    operations,
    totalItems,
    totalInProgress,
    totalCanceled,
    totalPending,
    totalCompleted,
  } = useOperations();
  const { areas } = useAreas();
  const { clients } = useClients();

  const totalOperationsOfDay =
    totalCanceled + totalPending + totalCompleted + totalInProgress;

  const totalWorkerDeactivated = workers.filter(
    (w) => w.status === WorkerStatus.DEACTIVATED
  ).length;


  // Calculate key metrics
  const availableWorkers = workers.filter(
    (w) => w.status === WorkerStatus.AVAILABLE
  ).length;
  const assignedWorkers = workers.filter(
    (w) => w.status === WorkerStatus.ASSIGNED
  ).length;
  const incapacitatedWorkers = workers.filter(
    (w) => w.status === WorkerStatus.INCAPACITATED
  ).length;

  // Get recent operations (last 5)
  const recentOperations = [...operations]
    .sort(
      (a, b) =>
        new Date(b.dateStart || 0).getTime() -
        new Date(a.dateStart || 0).getTime()
    )
    .slice(0, 5);

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <DashboardHeader />

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Trabajadores"
          count={workers.length - totalWorkerDeactivated}
          subtitle="disponibles"
          subtitleValue={availableWorkers}
          icon={<AiOutlineTeam />}
          iconSubtitle={<FiTrendingUp />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          borderColor="border-blue-500"
          to="/dashboard/workers"
        />

        <StatsCard
          title="Operaciones"
          count={totalOperationsOfDay}
          subtitle="en curso"
          subtitleValue={totalInProgress}
          icon={<HiMiniClipboardDocumentList />}
          iconSubtitle={<AiOutlineClockCircle />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          borderColor="border-purple-500"
          to="/dashboard/operations"
        />

        <StatsCard
          title="Áreas"
          count={areas.length}
          subtitle="trabajadores asignados"
          subtitleValue={assignedWorkers}
          icon={<PiMapPinSimpleAreaBold />}
          iconSubtitle={<AiOutlineTeam />}
          iconBgColor="bg-teal-100"
          iconColor="text-teal-600"
          borderColor="border-teal-500"
          to="/dashboard/areas"
        />

        <StatsCard
          title="Clientes"
          count={clients.length}
          subtitle="activos"
          subtitleValue={clients.length}
          icon={<BsBuildingsFill />}
          iconSubtitle={<FiTrendingUp />}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          borderColor="border-amber-500"
          to="/dashboard/clients"
        />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operation Status Chart */}
        <OperationStatusChart
          totalPending={totalPending}
          totalInProgress={totalInProgress}
          totalCompleted={totalCompleted}
        />

        {/* Worker Status Chart */}
        <WorkerStatusChart
          availableWorkers={availableWorkers}
          assignedWorkers={assignedWorkers}
          incapacitatedWorkers={incapacitatedWorkers}
          totalWorkers={workers.length}
        />
      </div>

      {/* Recent Operations */}
      <RecentOperationsTable operations={recentOperations} />
    </div>
  );
}
