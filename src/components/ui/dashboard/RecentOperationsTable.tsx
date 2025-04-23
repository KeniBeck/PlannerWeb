import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Operation, OperationStatus } from "@/core/model/operation";

interface RecentOperationsTableProps {
  operations: Operation[];
}

export const RecentOperationsTable = ({ operations }: RecentOperationsTableProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-gray-800">
          Operaciones Recientes
        </h3>
        <Link
          to="/dashboard/operations"
          className="text-blue-600 text-sm hover:underline"
        >
          Ver todas
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Área
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Cliente
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Fecha
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {operations.map((operation) => (
              <tr key={operation.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {operation.jobArea?.name || "Sin área"}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {operation.client?.name || "Sin cliente"}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {operation.dateStart
                      ? format(new Date(operation.dateStart), "dd/MM/yyyy", {
                          locale: es,
                        })
                      : "Sin fecha"}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      operation.status === OperationStatus.PENDING
                        ? "bg-blue-100 text-blue-800"
                        : operation.status === OperationStatus.INPROGRESS
                        ? "bg-orange-100 text-orange-800"
                        : operation.status === OperationStatus.COMPLETED
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
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
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No hay operaciones recientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};