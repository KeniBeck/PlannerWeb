import { format, formatDate } from "date-fns";
import { es } from "date-fns/locale";
import { MdRestaurantMenu, MdClose } from "react-icons/md";
import { FaRegBuilding, FaMapMarkedAlt, FaUserAlt, FaShip, FaBusinessTime, FaCalendarAlt } from "react-icons/fa";
import { BiTimeFive } from "react-icons/bi";

interface ViewFeedingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeding: any | null;
}

export function ViewFeedingDialog({
  open,
  onOpenChange,
  feeding
}: ViewFeedingDialogProps) {
  if (!open || !feeding) return null;

  // Mapeo de tipos a nombres legibles y colores
  const typeDisplay = {
    "BREAKFAST": "Desayuno",
    "LUNCH": "Almuerzo",
    "DINNER": "Cena",
    "SNACK": "Media noche"
  };

  const displayType = typeDisplay[feeding.type as keyof typeof typeDisplay] || feeding.type;

  const typeColors = {
    "Desayuno": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Almuerzo": "bg-blue-100 text-blue-800 border-blue-200",
    "Cena": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Media noche": "bg-purple-100 text-purple-800 border-purple-200",
    "default": "bg-gray-100 text-gray-800 border-gray-200"
  };

  const typeColor = typeColors[displayType as keyof typeof typeColors] || typeColors.default;

  // Obtener datos de operación, priorizando ciertos campos
  const operation = feeding.operation || feeding.enhancedOperation || {};
  const client = operation.client?.name || "No disponible";
  const jobArea = operation.jobArea?.name || "No disponible";
  const motorShip = operation.motorShip || "No disponible";
  const service = operation.task?.name || "No disponible";
  const operationStart = operation.dateStart || operation.timeStart || "No disponible";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 ">
      <div className="bg-white/95 backdrop-blur-md w-full max-w-md rounded-2xl shadow-2xl transform transition-all border border-white/20">
        {/* Encabezado */}
        <div className="bg-amber-600 backdrop-blur-sm text-white px-4 py-3 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center">
            <MdRestaurantMenu className="w-5 h-5 mr-2" />
            <h3 className="text-base font-medium">Detalles de Alimentación</h3>
          </div>
          <button 
            onClick={() => onOpenChange(false)} 
            className="text-white hover:text-amber-100 transition-colors duration-200 hover:scale-110 transform"
          >
            <MdClose className="w-5 h-5 cursor-pointer" />
          </button>
        </div>

        {/* Contenido optimizado */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor} backdrop-blur-sm`}>
              {displayType} 
            </span>
            <span className="text-xs text-gray-500">
              {feeding.createAt ? format(new Date(feeding.createAt), "dd/MM/yyyy - HH:mm", { locale: es }) : ""}
            </span>
          </div>

          <div className="space-y-3">
            {/* Información del Trabajador y Servicio */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-200 backdrop-blur-sm p-2.5 rounded-xl border border-gray-200/50">
                <h4 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                  <FaUserAlt className="mr-1 text-amber-600 w-3 h-3" />
                  Trabajador
                </h4>
                <p className="text-sm font-medium truncate">
                  {feeding.workerDetails?.name || feeding.worker?.name || `ID: ${feeding.id_worker}`}
                </p>
              </div>

              <div className="bg-gray-200 backdrop-blur-sm p-2.5 rounded-xl border border-gray-200/50">
                <h4 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                  <FaBusinessTime className="mr-1 text-amber-600 w-3 h-3" />
                  Servicio
                </h4>
                <p className="text-sm font-medium truncate">{service}</p>
              </div>
            </div>

            {/* Información de Área y Embarcación */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-200 backdrop-blur-sm p-2.5 rounded-xl border border-gray-200/50">
                <h4 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                  <FaMapMarkedAlt className="mr-1 text-amber-600 w-3 h-3" />
                  Área
                </h4>
                <p className="text-sm font-medium truncate">{jobArea}</p>
              </div>

              <div className="bg-gray-200 backdrop-blur-sm p-2.5 rounded-xl border border-gray-200/50">
                <h4 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                  <FaShip className="mr-1 text-amber-600 w-3 h-3" />
                  Embarcación
                </h4>
                <p className="text-sm font-medium truncate">{motorShip}</p>
              </div>
            </div>

            {/* Información de Cliente y fechas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-200 backdrop-blur-sm p-2.5 rounded-xl border border-gray-200/50">
                <h4 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                  <FaRegBuilding className="mr-1 text-amber-600 w-3 h-3" />
                  Cliente
                </h4>
                <p className="text-sm font-medium truncate">{client}</p>
              </div>

              <div className="bg-gray-200 backdrop-blur-sm p-2.5 rounded-xl border border-gray-200/50">
                <h4 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                  <BiTimeFive className="mr-1 text-amber-600 w-3 h-3" />
                  Inicio operación
                </h4>
                <p className="text-sm font-medium truncate">
                  {formatDate(operationStart, "dd/MM/yyyy", { locale: es })} {operation.timeStrat}
                </p>
              </div>
            </div>

            {/* Fecha de alimentación */}
            <div className="bg-gray-200 backdrop-blur-sm p-2.5 rounded-xl border border-gray-200/50">
              <h4 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                <FaCalendarAlt className="mr-1 text-amber-600 w-3 h-3" />
                Fecha de alimentación
              </h4>
              <p className="text-sm font-medium">
                {formatDate(feeding.createAt, "dd/MM/yyyy HH:mm", { locale: es }) || "No disponible"} 
              </p>
            </div>
          </div>
        </div>

        {/* Pie del diálogo */}
        <div className="bg-gray-50/80 backdrop-blur-sm px-4 py-3 flex justify-end rounded-b-2xl border-t border-gray-200/50">
          <button
            onClick={() => onOpenChange(false)}
            className="px-3 py-1.5 bg-gray-200/80 hover:bg-gray-300/80 backdrop-blur-sm rounded-lg text-sm text-gray-700 font-medium transition-all duration-200 hover:scale-105 transform cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}