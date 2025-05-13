import { Link } from "react-router-dom";
import { Operation, OperationStatus } from "@/core/model/operation";
import { formatDate } from "@/lib/utils/formatDate";
import { Fault, FaultType } from "@/core/model/fault";

interface RecentFaultTableProps {
  fault: Fault[];
}

export const RecentFaultsTable = ({ fault }: RecentFaultTableProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-xl text-gray-800">
            Faltas Recientes
          </h3>
          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {fault.length}
          </span>
        </div>
        <Link
          to="/dashboard/faults"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          Ver todas
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Trabajador
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tipo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fault.map((fault) => (
              <tr 
                key={fault.id} 
                className="hover:bg-gray-50/50 transition-colors duration-150 ease-in-out"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                      {fault.worker.name?.charAt(0) || "?"}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {fault.worker.name || "N/A"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 max-w-xs truncate">
                    {fault.description || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">
                    {fault.createAt
                      ? formatDate(fault.createAt)
                      : "Sin fecha"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      fault.type === FaultType.INASSISTANCE
                        ? "bg-red-50 text-red-700 ring-red-600/10 ring-1"
                        : fault.type === FaultType.IRRESPECTFUL
                        ? "bg-orange-50 text-orange-700 ring-orange-600/10 ring-1"
                        : fault.type === FaultType.ABANDONMENT
                        ? "bg-yellow-50 text-yellow-700 ring-yellow-600/10 ring-1"
                        : "bg-gray-50 text-gray-600 ring-gray-500/10 ring-1"
                    }
                  `}
                  >
                    {fault.type === FaultType.INASSISTANCE
                      ? "Inasistencia"
                      : fault.type === FaultType.IRRESPECTFUL
                      ? "Irrespetuoso"
                      : fault.type === FaultType.ABANDONMENT
                      ? "Abandono"
                      : "Desconocido"}
                  </span>
                </td>
              </tr>
            ))}

            {fault.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                      />
                    </svg>
                    <p className="text-sm font-medium">No hay faltas recientes</p>
                    <p className="text-xs text-gray-400 mt-1">Los registros aparecerán aquí</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};