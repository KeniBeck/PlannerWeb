import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MdRestaurantMenu, MdClose } from "react-icons/md";
import { FaRegBuilding, FaMapMarkedAlt, FaUserAlt, FaShip, FaBusinessTime, FaCalendarAlt } from "react-icons/fa";
import { Feeding } from "@/services/feedingService";

interface ViewFeedingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeding: Feeding | null;
}

export function ViewFeedingDialog({
  open,
  onOpenChange,
  feeding
}: ViewFeedingDialogProps) {
  if (!open || !feeding) return null;

  const typeColors = {
    "Desayuno": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Almuerzo": "bg-blue-100 text-blue-800 border-blue-200",
    "Cena": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Media noche": "bg-purple-100 text-purple-800 border-purple-200",
    "default": "bg-gray-100 text-gray-800 border-gray-200"
  };

  const typeColor = typeColors[feeding.type as keyof typeof typeColors] || typeColors.default;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg overflow-hidden transform transition-all">
        {/* Encabezado */}
        <div className="bg-amber-600 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <MdRestaurantMenu className="w-6 h-6 mr-2" />
            <h3 className="text-lg font-medium">Detalles de Alimentación</h3>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-white hover:text-amber-100 transition-colors duration-200"
          >
            <MdClose className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeColor}`}>
              {feeding.type}
            </span>
            <span className="ml-2 text-gray-500">
              {feeding.createdAt
                ? format(new Date(feeding.createdAt), "dd/MM/yyyy - HH:mm", { locale: es })
                : "Fecha no disponible"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información del Trabajador */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                <FaUserAlt className="mr-2 text-amber-600" />
                Información del Trabajador
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500 text-sm">Nombre:</span>
                  <p className="font-medium">{feeding.workerName || "No disponible"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">ID:</span>
                  <p className="font-medium">{feeding.workerId || "No disponible"}</p>
                </div>
              </div>
            </div>

            {/* Información de la Operación */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                <FaBusinessTime className="mr-2 text-amber-600" />
                Información de la Operación
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500 text-sm">ID Operación:</span>
                  <p className="font-medium">{feeding.operationId || "No disponible"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Hora Inicio:</span>
                  <p className="font-medium">{feeding.operationDetails?.timeStart || "No disponible"}</p>
                </div>
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                <FaRegBuilding className="mr-2 text-amber-600" />
                Información del Cliente
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500 text-sm">Cliente:</span>
                  <p className="font-medium">{feeding.operationDetails?.client?.name || "No disponible"}</p>
                </div>
              </div>
            </div>

            {/* Información del Área y Embarcación */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                <FaMapMarkedAlt className="mr-2 text-amber-600" />
                Área y Embarcación
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500 text-sm">Área:</span>
                  <p className="font-medium">{feeding.operationDetails?.jobArea?.name || "No disponible"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Embarcación:</span>
                  <p className="font-medium">{feeding.operationDetails?.motorShip || "No disponible"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pie del diálogo */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 font-medium transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}