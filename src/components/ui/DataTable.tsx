import { useState, useMemo, ReactNode, useEffect } from "react";
import { BsChevronUp, BsChevronDown, BsThreeDotsVertical } from "react-icons/bs";
import Pagination from "./Pagination";

// Definición de columnas
export interface TableColumn<T> {
  header: string;           // Texto del encabezado
  accessor: keyof T | string; // Propiedad del objeto o path con notación de punto
  cell?: (item: T) => ReactNode; // Renderizado personalizado de celda
  sortable?: boolean;       // Si la columna permite ordenamiento
  className?: string;       // Clases CSS adicionales para la celda
}

// Configuración de ordenamiento
export type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

// Definición de acciones para el menú desplegable
export interface TableAction<T> {
  label: string;           // Etiqueta de la acción
  icon?: ReactNode;        // Icono opcional
  onClick: (item: T) => void; // Función a ejecutar al hacer clic
  className?: string;      // Clases CSS adicionales
}

// Props del componente
export interface DataTableProps<T> {
  data: T[];                       // Datos a mostrar
  columns: TableColumn<T>[];       // Configuración de columnas
  actions?: TableAction<T>[];      // Acciones disponibles en el menú desplegable
  itemsPerPage?: number;           // Elementos por página
  itemsPerPageOptions?: number[];  // Opciones para elementos por página
  itemName?: string;               // Nombre de los items (para la paginación)
  isLoading?: boolean;             // Estado de carga
  emptyMessage?: string;           // Mensaje cuando no hay datos
  emptyIcon?: ReactNode;           // Icono cuando no hay datos
  initialSort?: SortConfig;        // Configuración inicial de ordenamiento
  className?: string;              // Clases CSS adicionales para la tabla
  
  // Props para paginación externa
  externalPagination?: boolean;    // Indica si la paginación es manejada externamente
  currentPage?: number;            // Página actual (para paginación externa)
  totalItems?: number;             // Total de elementos (para paginación externa)
  totalPages?: number;             // Total de páginas (para paginación externa)
  onPageChange?: (page: number) => void;           // Función para cambiar de página
  onItemsPerPageChange?: (itemsPerPage: number) => void; // Función para cambiar items por página
}

// Función para acceder a propiedades anidadas usando notación de punto
const getNestedValue = (obj: any, path: string) => {
  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value === null || value === undefined) return '';
    value = value[key];
  }

  return value;
};

// Función para comparar valores y ordenar
const compareValues = (a: any, b: any, key: string) => {
  // Obtener los valores considerando propiedades anidadas
  const valueA = typeof key === 'string' && key.includes('.') 
    ? getNestedValue(a, key) 
    : a[key];
  
  const valueB = typeof key === 'string' && key.includes('.')
    ? getNestedValue(b, key)
    : b[key];

  // Normalizar valores para comparación
  const normalizedA = valueA === null || valueA === undefined ? '' : valueA;
  const normalizedB = valueB === null || valueB === undefined ? '' : valueB;

  // Comparar según el tipo de dato
  if (typeof normalizedA === 'string' && typeof normalizedB === 'string') {
    return normalizedA.localeCompare(normalizedB);
  }

  if (normalizedA < normalizedB) return -1;
  if (normalizedA > normalizedB) return 1;
  return 0;
};

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  actions,
  itemsPerPage = 10,
  itemsPerPageOptions = [10, 20, 30, 50],
  itemName = "elementos",
  isLoading = false,
  emptyMessage = "No se encontraron elementos",
  emptyIcon,
  initialSort,
  className = "",
  // Props para paginación externa
  externalPagination = false,
  currentPage: externalCurrentPage,
  totalItems: externalTotalItems,
  totalPages: externalTotalPages,
  onPageChange,
  onItemsPerPageChange
}: DataTableProps<T>) {
  // Estados
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    initialSort || { key: '', direction: 'asc' }
  );
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<number | string | null>(null);
  const [itemsPerPageState, setItemsPerPageState] = useState(itemsPerPage);

  // Valores finales para la interfaz
  const currentPage = externalPagination ? (externalCurrentPage || 1) : internalCurrentPage;
  const effectiveTotalItems = externalPagination ? (externalTotalItems || data.length) : data.length;
  
  // Calcular total de páginas si no se proporciona externamente
  const totalPages = externalPagination 
    ? (externalTotalPages || Math.ceil(effectiveTotalItems / itemsPerPageState))
    : Math.ceil(data.length / itemsPerPageState);

  // Sincronizar itemsPerPage interno con el prop
  useEffect(() => {
    setItemsPerPageState(itemsPerPage);
  }, [itemsPerPage]);

  // Ordenamiento
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Aplicar ordenamiento a los datos
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    const sortableData = [...data];
    sortableData.sort((a, b) => {
      const comparison = compareValues(a, b, sortConfig.key);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    
    return sortableData;
  }, [data, sortConfig]);

  // Determinar qué elementos mostrar (paginación interna o externa)
  const currentItems = useMemo(() => {
    if (externalPagination) {
      return sortedData; // En paginación externa, mostramos todos los datos recibidos
    } else {
      // En paginación interna, calculamos el slice
      const indexOfLastItem = internalCurrentPage * itemsPerPageState;
      const indexOfFirstItem = indexOfLastItem - itemsPerPageState;
      return sortedData.slice(indexOfFirstItem, indexOfLastItem);
    }
  }, [sortedData, externalPagination, internalCurrentPage, itemsPerPageState]);

  // Manejadores de paginación
  const handlePageChange = (page: number) => {
    if (externalPagination && onPageChange) {
      onPageChange(page);
    } else {
      setInternalCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = Number(e.target.value);
    
    if (externalPagination && onItemsPerPageChange) {
      onItemsPerPageChange(newValue);
    } else {
      setItemsPerPageState(newValue);
      setInternalCurrentPage(1); // Volver a la primera página
    }
  };

  // Manejo del menú desplegable
  const toggleDropdown = (id: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleClickOutside = () => {
    setActiveDropdown(null);
  };

  // Componente de encabezado ordenable
  const SortableHeader = ({ label, accessor }: { label: string, accessor: string }) => {
    const isSortable = columns.find(col => col.accessor === accessor)?.sortable !== false;
    if (!isSortable) {
      return <th className="py-3 px-4 text-left text-sm font-medium text-blue-700">{label}</th>;
    }

    const isSorted = sortConfig.key === accessor;
    const sortDirection = isSorted ? sortConfig.direction : undefined;

    return (
      <th
        className="py-3 px-4 text-left text-sm font-medium text-blue-700 cursor-pointer select-none"
        onClick={() => requestSort(accessor as string)}
      >
        <div className="flex items-center gap-2">
          {label}
          <span className="text-blue-500">
            {isSorted && sortDirection === 'asc' && <BsChevronUp size={14} />}
            {isSorted && sortDirection === 'desc' && <BsChevronDown size={14} />}
            {!isSorted && (
              <span className="text-gray-300">
                <BsChevronDown size={14} />
              </span>
            )}
          </span>
        </div>
      </th>
    );
  };

  // Renderizado del contenido de las celdas
  const renderCell = (item: T, column: TableColumn<T>) => {
    // Si hay una función personalizada para renderizar la celda
    if (column.cell) {
      return column.cell(item);
    }

    // Para campos anidados usando notación de punto
    if (typeof column.accessor === 'string' && column.accessor.includes('.')) {
      return getNestedValue(item, column.accessor) || '';
    }

    // Para campos simples
    return item[column.accessor as keyof T] || '';
  };

  // Renderizado condicional para estado de carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full" onClick={handleClickOutside}>
      <div className="flex justify-between items-center">
        {/* Selector de elementos por página */}
        <div className="flex items-center space-x-2 ml-2">
          <select
            value={itemsPerPageState}
            onChange={handleItemsPerPageChange}
            className="py-1 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        
        {/* Componente de paginación */}
        <Pagination
          currentPage={currentPage}
          totalItems={effectiveTotalItems}
          itemsPerPage={itemsPerPageState}
          paginate={handlePageChange}
          itemName={itemName}
        />
      </div>
      
      <table className={`w-full border-collapse ${className}`}>
        <thead>
          <tr className="bg-blue-50 border-b border-blue-100">
            {columns.map((column, index) => (
              <SortableHeader 
                key={index} 
                label={column.header} 
                accessor={column.accessor as string} 
              />
            ))}
            {actions && actions.length > 0 && (
              <th className="py-3 px-4 text-right text-sm font-medium text-blue-700">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
              >
                {columns.map((column, index) => (
                  <td 
                    key={index} 
                    className={`py-3 px-4 text-sm text-gray-800 ${column.className || ''}`}
                  >
                    {renderCell(item, column)}
                  </td>
                ))}
                
                {actions && actions.length > 0 && (
                  <td className="py-3 px-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={(e) => toggleDropdown(item.id, e)}
                        className="p-1.5 rounded-md hover:bg-gray-100 focus:outline-none"
                      >
                        <BsThreeDotsVertical className="h-4 w-4 text-gray-500" />
                      </button>
                      
                      {activeDropdown === item.id && (
                        <div 
                          className="fixed mt-1 py-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-100"
                          style={{
                            position: 'absolute',
                            right: '0',
                            top: '100%',
                          }}
                        >
                          <div className="px-2">
                            {actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  action.onClick(item);
                                  setActiveDropdown(null);
                                }}
                                className={`w-full flex items-center px-3 py-2 text-sm hover:bg-blue-50 rounded-md transition-colors ${action.className || ''}`}
                              >
                                {action.icon && <span className="mr-2">{action.icon}</span>}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (actions && actions.length > 0 ? 1 : 0)} className="py-6 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center">
                  {emptyIcon || (
                    <svg className="h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                    </svg>
                  )}
                  <p>{emptyMessage}</p>
                  <p className="text-sm text-gray-400 mt-1">Intenta con otros criterios de búsqueda</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}