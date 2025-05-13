import { Link } from "react-router-dom";
import { Operation, OperationStatus } from "@/core/model/operation";
import { formatDate } from "@/lib/utils/formatDate";

interface RecentOperationsTableProps {
  operations: Operation[];
}

export const RecentOperationsTable = ({ operations }: RecentOperationsTableProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-xl text-gray-800">
            Operaciones Recientes
          </h3>
          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {operations.length}
          </span>
        </div>
        <Link
          to="/dashboard/operations"
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
                Área
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {operations.map((operation) => (
              <tr 
                key={operation.id}
                className="hover:bg-gray-50/50 transition-colors duration-150 ease-in-out"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                      {operation.jobArea?.name?.charAt(0) || "?"}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {operation.jobArea?.name || "Sin área"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {operation.client?.name || "Sin cliente"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">
                    {operation.dateStart
                      ? formatDate(operation.dateStart)
                      : "Sin fecha"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${
                      operation.status === OperationStatus.PENDING
                        ? "bg-blue-50 text-blue-700 ring-blue-600/10 ring-1"
                        : operation.status === OperationStatus.INPROGRESS
                        ? "bg-orange-50 text-orange-700 ring-orange-600/10 ring-1"
                        : operation.status === OperationStatus.COMPLETED
                        ? "bg-green-50 text-green-700 ring-green-600/10 ring-1"
                        : "bg-red-50 text-red-700 ring-red-600/10 ring-1"
                    }
                  `}
                  >
                    {operation.status === OperationStatus.PENDING
                      ? "Pendiente"
                      : operation.status === OperationStatus.INPROGRESS
                      ? "En curso"
                      : operation.status === OperationStatus.COMPLETED
                      ? "Completada"
                      : "Cancelada"}
                  </span>
                </td>
              </tr>
            ))}

            {operations.length === 0 && (
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
                    <p className="text-sm font-medium">No hay operaciones recientes</p>
                    <p className="text-xs text-gray-400 mt-1">Las operaciones aparecerán aquí</p>
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