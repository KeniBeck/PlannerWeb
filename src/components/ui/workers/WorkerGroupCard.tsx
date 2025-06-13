import { RiCalendarScheduleFill } from "react-icons/ri";
import { FaCheck, FaTasks, FaUsers } from "react-icons/fa"; // Añadir este import

// Tipos
interface Worker {
  id: number;
  name: string;
}

interface Schedule {
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: string | null;
  timeEnd: string | null;
  id_task?: string | null;
  task?: string | null;
}

interface WorkerGroup {
  groupId: string | number | null;
  schedule: Schedule;
  workers: Worker[];
}

interface WorkerGroupCardProps {
  group: WorkerGroup;
  index: number;
  onCompleteWorker?: (worker: Worker) => void;
  showCompleteButtons?: boolean;
}

// Función para generar colores dinámicos basados en el nombre
const getColorForName = (name: string) => {
  const colors = [
    "from-blue-500 to-blue-600",
    "from-indigo-500 to-indigo-600",
    "from-purple-500 to-purple-600",
    "from-pink-500 to-pink-600",
    "from-red-500 to-red-600",
    "from-orange-500 to-orange-600",
    "from-amber-500 to-amber-600",
    "from-yellow-500 to-yellow-600",
    "from-lime-500 to-lime-600",
    "from-green-500 to-green-600",
    "from-teal-500 to-teal-600",
    "from-cyan-500 to-cyan-600",
  ];

  // Usar la suma de los códigos ASCII de las letras del nombre para elegir un color
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
};

export const WorkerGroupCard = ({
  group,
  index,
  onCompleteWorker,
  showCompleteButtons = false,
}: WorkerGroupCardProps) => {
  // Verificar si es un grupo sin programación
  const hasNoSchedule =
    !group.groupId ||
    (group.schedule.dateStart === null &&
      group.schedule.dateEnd === null &&
      group.schedule.timeStart === null &&
      group.schedule.timeEnd === null);

  // Colores para los grupos
  const bgColors = [
    "from-blue-50 to-blue-100",
    "from-green-50 to-green-100",
    "from-amber-50 to-amber-100",
    "from-purple-50 to-purple-100",
  ];
  const borderColors = [
    "border-blue-200",
    "border-green-200",
    "border-amber-200",
    "border-purple-200",
  ];

  // Si no tiene programación, usar un estilo diferente (más neutral)
  const bgGradient = hasNoSchedule
    ? "from-gray-50 to-gray-100"
    : bgColors[index % bgColors.length];

  const borderColor = hasNoSchedule
    ? "border-gray-200"
    : borderColors[index % borderColors.length];

  return (
    <div
      className={`mb-6 rounded-xl shadow-sm border ${borderColor} bg-gradient-to-br ${bgGradient} overflow-hidden transition-all duration-300 hover:shadow-md`}
    >
      {/* Encabezado con fechas (solo se muestra si tiene programación) */}
      {!hasNoSchedule && (
        <div className="px-5 py-3 border-b border-gray-200 bg-white/60 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-blue-100">
                <RiCalendarScheduleFill className="text-blue-600 text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Inicio
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {group.schedule?.dateStart || "No definida"}{" "}
                  <span className="font-bold">
                    {group.schedule?.timeStart || ""}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-red-100">
                <RiCalendarScheduleFill className="text-red-600 text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Fin
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {group.schedule?.dateEnd || "No definida"}{" "}
                  <span className="font-bold">
                    {group.schedule?.timeEnd || ""}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Título para grupos sin programación */}
      {hasNoSchedule && (
        <div className="px-5 py-3 border-b border-gray-200 bg-white/60">
          <h5 className="text-sm font-medium text-gray-500 flex items-center">
            <span className="flex items-center justify-center bg-gray-200 text-gray-500 p-1 rounded-full mr-2 w-5 h-5">
              <RiCalendarScheduleFill className="text-xs" />
            </span>
            Trabajadores sin programación asignada
          </h5>
        </div>
      )}

      {/* Lista de trabajadores */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {group.workers.map((worker) => {
            // Obtener color dinámico basado en el nombre
            const avatarColor = getColorForName(worker.name);
            // Obtener iniciales (hasta 2 caracteres)
            const nameParts = worker.name
              .split(" ")
              .filter((part) => part.length > 0);
            const initials =
              nameParts.length >= 2
                ? `${nameParts[0][0]}${nameParts[1][0]}`
                : worker.name.substring(0, 2);

            return (
              <div
                key={worker.id}
                className="flex items-center p-3 border border-gray-200 rounded-lg bg-white/80 hover:bg-white transition-all duration-200 hover:shadow-sm transform hover:-translate-y-1"
              >
                <div
                  className={`h-10 w-10 rounded-full bg-gradient-to-br ${avatarColor} text-white flex items-center justify-center mr-3 shadow-sm`}
                >
                  {initials.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 ">
                    {worker.name}
                  </p>
                  <p className="text-xs text-gray-500">ID: {worker.id}</p>
                </div>

                {/* Botón para completar trabajador individualmente */}
                {showCompleteButtons && onCompleteWorker && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompleteWorker(worker);
                    }}
                    className="ml-2 p-1.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-full transition-colors"
                    title="Completar trabajador individual"
                  >
                    <FaCheck className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 text-right space-x-2 flex flex-row justify-end">
          <div className="flex items-center text-xs text-white px-3 py-1.5 bg-blue-500 rounded-full">
            <FaTasks className="w-3 h-3 mr-1.5" />
            {group.schedule?.task || "Sin tarea asignada"}
          </div>

          {/* 🆕 Cajita del contador mejorada */}
          <div className="flex items-center text-xs text-gray-600 px-3 py-1.5 bg-gray-200 rounded-full">
            <FaUsers className="w-3 h-3 mr-1.5" />
            {group.workers.length} trabajador
            {group.workers.length !== 1 ? "es" : ""} asignado
            {group.workers.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
};
