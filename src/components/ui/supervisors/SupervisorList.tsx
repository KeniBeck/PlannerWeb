import { FaUserTie, FaTasks } from "react-icons/fa";

// Tipos
interface Supervisor {
  id: number;
  name: string;
}

interface SupervisorsListProps {
  supervisors: Supervisor[];
}

export const SupervisorsList = ({ supervisors }: SupervisorsListProps) => {
  return (
    <div className="space-y-6">
      {/* Supervisores */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <FaUserTie className="mr-3 text-indigo-600" />
          <span>Supervisores Asignados</span>
        </h4>

        {supervisors && supervisors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supervisors.map((supervisor) => {
              // Generar un color basado en el nombre del supervisor
              const colorClasses = [
                "from-indigo-500 to-indigo-600",
                "from-purple-500 to-purple-600",
                "from-blue-500 to-blue-700",
                "from-violet-500 to-violet-700",
              ];

              // Usar el ID para elegir un color (para consistencia)
              const colorClass =
                colorClasses[supervisor.id % colorClasses.length];

              // Obtener iniciales del nombre
              const nameParts = supervisor.name
                .split(" ")
                .filter((part) => part.length > 0);
              const initials =
                nameParts.length >= 2
                  ? `${nameParts[0][0]}${nameParts[1][0]}`
                  : supervisor.name.substring(0, 2);

              return (
                <div
                  key={supervisor.id}
                  className="flex items-center p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 hover:shadow-md transition-all duration-300"
                >
                  <div
                    className={`h-14 w-14 rounded-full bg-gradient-to-br ${colorClass} text-white flex items-center justify-center text-lg font-bold shadow-sm mr-4`}
                  >
                    {initials.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-lg">
                      {supervisor.name}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        <FaUserTie className="mr-1 text-indigo-500" />
                        Supervisor
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ID: {supervisor.id}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
            <FaUserTie className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">
              No hay supervisores asignados
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Los supervisores asignados a esta operación aparecerán aquí
            </p>
          </div>
        )}
      </div>

      {/* Información adicional sobre responsabilidades (opcional) */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h5 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
          <FaTasks className="mr-2 text-indigo-600" />
          Responsabilidades
        </h5>
        <ul className="space-y-2 text-gray-600">
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            <span>Coordinar la ejecución de la operación</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            <span>Supervisar al personal asignado</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            <span>Reportar incidencias o novedades</span>
          </li>
          <li className="flex items-start">
            <span className="text-indigo-500 mr-2">•</span>
            <span>Asegurar el cumplimiento de los protocolos de seguridad</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
