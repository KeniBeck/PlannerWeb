import { useState, useMemo } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { OperationList } from "@/components/ui/operations/OperationList";
import { useOperations } from "@/contexts/OperationContext";
import { Operation as OperationModel } from "@/core/model/operation";
import { FilterBar } from "@/components/custom/filter/FilterBarProps";
import { useAreas } from "@/contexts/AreasContext";
import { useUsers } from "@/contexts/UsersContext";
import { getOperationExportColumns } from "./OperationExportColumns";
import { AddOperationDialog } from "@/components/ui/operations/AddOperationDialog";
import { ViewOperationDialog } from "@/components/ui/operations/ViewOperationDialog";
import { useServices } from "@/contexts/ServicesContext";
import { useClients } from "@/contexts/ClientsContext";
import { useWorkers } from "@/contexts/WorkerContext";
import { operationService } from "@/services/operationService";
import Swal from "sweetalert2";
import { useOperationFilters } from "@/lib/hooks/useOperationFilters";
import { formatOperationForEdit } from "@/lib/utils/operationHelpers";
import { ActiveFilters } from "@/components/custom/filter/ActiveFilter";
import { DeactivateItemAlert } from "@/components/dialog/CommonAlertActive";
import { OperationCreateData } from "@/services/interfaces/operationDTO";
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Operation() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<
    OperationModel | undefined
  >(undefined);
  const [operationToActivate, setOperationToActivate] =
    useState<OperationModel | null>(null);
  const [viewOperation, setViewOperation] = useState<OperationModel | null>(
    null
  );
  // Contextos
  const { areas, refreshData } = useAreas();
  const { services } = useServices();
  const { clients } = useClients();
  const { workers } = useWorkers();
  const { users } = useUsers();
  const {
    operations,
    isLoading,
    refreshOperations,
    filters,
    setFilters,
    setPage,
    updateOperation,
  } = useOperations();

  // Extraer lógica de filtros a un hook personalizado
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
    areaFilter,
    setAreaFilter,
    supervisorFilter,
    setSupervisorFilter,
    clearAllFilters,
    hasActiveFilters,
  } = useOperationFilters({ setFilters, setPage, filters });

  // Filtrar supervisores y coordinadores
  const supervisorsAndCoordinators = useMemo(() => {
    if (!users) return [];
    return users
      .filter(
        (user) =>
          user.occupation === "SUPERVISOR" || user.occupation === "COORDINADOR"
      )
      .map((user) => ({ id: user.id, name: user.name }));
  }, [users]);

  // Opciones para los filtros
  const supervisorOptions = useMemo(
    () => [
      { value: "all", label: "Todos los supervisores" },
      ...supervisorsAndCoordinators.map((supervisor) => ({
        value: supervisor.id.toString(),
        label: supervisor.name,
      })),
    ],
    [supervisorsAndCoordinators]
  );

  const statusOptions = [
    { value: "all", label: "Todos los estados" },
    { value: "PENDING", label: "Pendientes" },
    { value: "INPROGRESS", label: "En curso" },
    { value: "COMPLETED", label: "Finalizadas" },
    { value: "CANCELED", label: "Canceladas" },
  ];

  const areaOptions = useMemo(
    () => [
      { value: "all", label: "Todas las áreas" },
      ...(areas?.map((area) => ({
        value: area.id.toString(),
        label: area.name,
      })) || []),
    ],
    [areas]
  );

  // Filtrado adicional para búsqueda por término
  const filteredOperations = useMemo(() => {
    return operations.filter((operation) => {
      return (
        !searchTerm ||
        operation.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.jobArea?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        operation.client?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        operation.motorShip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.id?.toString().includes(searchTerm)
      );
    });
  }, [operations, searchTerm]);

  // Funciones auxiliares para los filtros
  const getAreaName = (areaId: string): string => {
    const area = areas?.find((a) => a.id.toString() === areaId);
    return area?.name || "Área desconocida";
  };

  const getSupervisorName = (supervisorId: string): string => {
    const supervisor = supervisorsAndCoordinators.find(
      (s) => s.id.toString() === supervisorId
    );
    return supervisor?.name || "Supervisor desconocido";
  };

  // Manejadores para acciones de operaciones
  const handleEditOperation = (operation: any) => {
    const formattedOperation = formatOperationForEdit(operation);
    setSelectedOperation(formattedOperation);
    setIsAddOpen(true);
  };

  const handleViewOperation = (operation: OperationModel) => {
    setViewOperation(operation);
    setIsViewOpen(true);
  };

  const handleDeleteOperation = (operation: OperationModel) => {
    setOperationToActivate(operation);
  };

  const handleSave = async (data: any, isEdit: boolean) => {
    try {
      // Formatear los datos antes de enviar
      const formattedData = {
        ...data,
        id: isEdit ? data.id : undefined,
        zone: parseInt(data.zone),
        id_client: parseInt(data.id_client),
        id_area: parseInt(data.id_area),
        id_task: parseInt(data.id_task),
        dateStart: data.dateStart,
        timeStart: data.timeStart || data.timeStrat,
        dateEnd: data.dateEnd || null,
        timeEnd: data.timeEnd || null,
        status: data.status || "PENDING",
        workerGroups: data.workerGroups || [],
        inChargedIds: data.inChargedIds || [],
        removedWorkerIds: data.removedWorkerIds || [],
        removedWorkerGroupIds: data.removedWorkerGroupIds || [],
      };

      if (isEdit) {
        await updateOperation(
          data.id,
          formattedData as OperationCreateData
        );
      } else {
        await operationService.createOperation(formattedData);
        Swal.fire({
          title: "Operación creada",
          text: "La operación ha sido creada correctamente.",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#3085d6",
        });
      }

      await refreshOperations();
      setIsAddOpen(false);
      setSelectedOperation(undefined);
    } catch (error) {
      console.error("Error al guardar la operación:", error);
      Swal.fire({
        title: "Error",
        text: isEdit
          ? "Error al actualizar la operación. Inténtelo de nuevo."
          : "Error al crear la operación. Inténtelo de nuevo.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const refreshDataLocal = () => {
    console.log("Refrescar datos de operaciones");
    refreshOperations();
    refreshData();
  };

  const ConfirmToActive = async () => {
    if (!operationToActivate) return;
    await operationService
      .deleteOperation(operationToActivate.id)
      refreshDataLocal();
  }

  // Columnas para exportación a Excel
  const exportColumns = getOperationExportColumns();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "INPROGRESS":
        return "En Curso";
      case "COMPLETED":
        return "Finalizado";
      case "CANCELED":
        return "Cancelado";
      default:
        return status || "Desconocido";
    }
  }

  const getWorkerDni = (idWorker: number) => {
    const worker = workers?.find((w) => w.id === idWorker);
    return worker ? worker.dni : "Sin DNI";
  }
  const calculateHoursWorked = (dateStart?: string | Date, timeStart?: string, dateEnd?: string | Date, timeEnd?: string): string => {
    if (!dateStart || !timeStart || !dateEnd || !timeEnd) {
      return "N/A";
    }
  
    try {
      // Crear objetos Date para inicio y fin
      let startDateObj = new Date(dateStart);
      let endDateObj = new Date(dateEnd);
  
      // Extraer componentes de fecha
      const startYear = startDateObj.getFullYear();
      const startMonth = startDateObj.getMonth();
      const startDay = startDateObj.getDate();
      
      const endYear = endDateObj.getFullYear();
      const endMonth = endDateObj.getMonth();
      const endDay = endDateObj.getDate();
  
      // Parsear horas y minutos
      let startHours = 0, startMinutes = 0;
      let endHours = 0, endMinutes = 0;
  
      if (timeStart) {
        const parts = timeStart.split(':');
        startHours = parseInt(parts[0], 10);
        startMinutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;
      }
  
      if (timeEnd) {
        const parts = timeEnd.split(':');
        endHours = parseInt(parts[0], 10);
        endMinutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;
      }
  
      // Crear fechas completas con hora
      const startDateTime = new Date(startYear, startMonth, startDay, startHours, startMinutes);
      const endDateTime = new Date(endYear, endMonth, endDay, endHours, endMinutes);
  
      // Verificar fechas válidas
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        return "N/A";
      }
      
      // Calcular diferencia en milisegundos
      const diffMs = endDateTime.getTime() - startDateTime.getTime();
      
      // Si la fecha fin es menor que inicio
      if (diffMs < 0) {
        return "0";
      }
      
      // Convertir a horas decimales
      const diffHours = diffMs / (1000 * 60 * 60);
      
      // Formatear a 2 decimales
      return diffHours.toFixed(2);
    } catch (error) {
      console.error("Error calculando horas trabajadas:", error);
      return "N/A";
    }
  };
  
  
  const exportOperationsByWorker = async () => {
    try {
      // Obtener todas las operaciones con los filtros actuales
      const response = await operationService.getPaginatedOperations(
        1, 10000, filters
      );
      let operations = response.items;
      
      // Aplicar filtro de búsqueda si existe
      if (searchTerm) {
        operations = operations.filter((op: any) => 
          op.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          op.jobArea?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          op.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          op.motorShip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          op.id?.toString().includes(searchTerm)
        );
      }
      
      // Crear un nuevo libro de trabajo
      const workbook = new Workbook();
      workbook.creator = 'PlannerWeb';
      workbook.created = new Date();
      
      const worksheetWorkers = workbook.addWorksheet('reporte-trabajador', {
        pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 }
      });
      
      // Definir encabezados
      const headersWorkers = [
        'ID Operación', 'Estado', 'Área', 'Cliente',
        'Supervisores', 'Fecha Inicio', 'Hora Inicio', 'Fecha Fin', 'Hora Fin', 'Horas Trabajadas', 
        'Embarcación', 'Tarea', 'Turno', 'DNI Trabajador', 'Nombre Trabajador'
      ];
      
      // Añadir fila de encabezados
      worksheetWorkers.addRow(headersWorkers);
      
      // Aplicar estilo a los encabezados (exactamente igual que en SectionHeader)
      const headerRow = worksheetWorkers.getRow(1);
      headerRow.height = 28;
      
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4472C4' }
        };
        
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFF' },
          size: 12
        };
        
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true
        };
        
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Variable para seguir la operación actual (para colorear por operación)
      let currentOperationId: any = null;
      let rowIsEven = false;
      
      // Para cada operación expandir los trabajadores
      operations.forEach((operation: any) => {
        let workerAdded = false;
        
        // Si la operación tiene grupos de trabajadores
        if (operation.workerGroups && operation.workerGroups.length > 0) {
          // Para cada grupo
          operation.workerGroups.forEach((group: any, groupIndex: number) => {
            if (group.workers && group.workers.length > 0) {
              // Para cada trabajador en el grupo
              group.workers.forEach((worker: any) => {
                // Si cambiamos de operación, alternar el color
                if (currentOperationId !== operation.id) {
                  currentOperationId = operation.id;
                  rowIsEven = !rowIsEven; // Alterna entre true/false
                }
                
                // Datos para la fila
                interface Worker {
                  dni:  string;
                  name: string;
                }

                interface Supervisor {
                  name: string;
                }

                interface JobArea {
                  name?: string;
                }

                interface Client {
                  name?: string;
                }

                interface Task {
                  name?: string;
                }

                interface Operation {
                  id: number | string;
                  status: string;
                  jobArea?: JobArea;
                  client?: Client;
                  inCharge?: Supervisor[];
                  dateStart?: string | Date;
                  timeStrat?: string;
                  timeEnd?: string;
                  dateEnd?: string | Date;
                  motorShip?: string;
                  task?: Task;
                }

                const hoursWorked = calculateHoursWorked(
                  operation.dateStart,
                  operation.timeStrat,
                  operation.dateEnd,
                  operation.timeEnd
                );

                const rowData: (string | number)[] = [
                  operation.id,
                  getStatusLabel(operation.status),
                  operation.jobArea?.name || 'Sin área',
                  operation.client?.name || 'Sin cliente',
                  operation.inCharge?.map((sup: Supervisor) => sup.name).join(', ') || 'Sin supervisor',
                  operation.dateStart ? format(new Date(operation.dateStart), "dd/MM/yyyy", { locale: es }) : 'N/A',
                  operation.timeStrat || 'N/A',
                  operation.dateEnd ? format(new Date(operation.dateEnd), "dd/MM/yyyy", { locale: es }) : 'N/A',
                  operation.timeEnd || 'N/A',
                  hoursWorked || 'N/A',
                  operation.motorShip || 'N/A',
                  operation.task?.name?.toUpperCase() || 'Sin tarea',
                  `Turno ${groupIndex + 1}`,
                  getWorkerDni(worker.id),
                  worker.name
                ];
                
                // Añadir la fila
                const row = worksheetWorkers.addRow(rowData);
                
                // Aplicar estilo a filas (por operación)
                if (rowIsEven) {
                  row.eachCell((cell) => {
                    cell.fill = {
                      type: 'pattern',
                      pattern: 'solid',
                      fgColor: { argb: 'F2F7FF' }
                    };
                  });
                }
                
                // Bordes para todas las celdas
                row.eachCell((cell) => {
                  cell.border = {
                    top: { style: 'thin', color: { argb: 'E0E0E0' } },
                    left: { style: 'thin', color: { argb: 'E0E0E0' } },
                    bottom: { style: 'thin', color: { argb: 'E0E0E0' } },
                    right: { style: 'thin', color: { argb: 'E0E0E0' } }
                  };
                  cell.alignment = { vertical: 'middle' };
                });
                
                workerAdded = true;
              });
            }
          });
        }
        
        // Si no hay trabajadores, añadir una fila para la operación
        if (!workerAdded) {
          // Si cambiamos de operación, alternar el color
          if (currentOperationId !== operation.id) {
            currentOperationId = operation.id;
            rowIsEven = !rowIsEven;
          }
          
            interface Supervisor {
            name: string;
            }

            interface JobArea {
            name?: string;
            }

            interface Client {
            name?: string;
            }

            interface Task {
            name?: string;
            }

            interface Operation {
            id: number | string;
            status: string;
            jobArea?: JobArea;
            client?: Client;
            inCharge?: Supervisor[];
            dateStart?: string | Date;
            timeStrat?: string;
            timeEnd?: string;
            dateEnd?: string | Date;
            motorShip?: string;
            task?: Task;
            }

            const hoursWorkedNoWorker = calculateHoursWorked(
              operation.dateStart,
              operation.timeStrat,
              operation.dateEnd,
              operation.timeEnd
            );
            
            const rowData: (string | number)[] = [
              operation.id,
              getStatusLabel(operation.status),
              operation.jobArea?.name || 'Sin área',
              operation.client?.name || 'Sin cliente',
              operation.inCharge?.map((sup: Supervisor) => sup.name).join(', ') || 'Sin supervisor',
              operation.dateStart ? format(new Date(operation.dateStart), "dd/MM/yyyy", { locale: es }) : 'N/A',
              operation.timeStrat || 'N/A',
              operation.dateEnd ? format(new Date(operation.dateEnd), "dd/MM/yyyy", { locale: es }) : 'N/A',
              operation.timeEnd || 'N/A',
              hoursWorkedNoWorker, // AÑADIDO: Columna de horas trabajadas
              operation.motorShip || 'N/A',
              operation.task?.name?.toUpperCase() || 'Sin tarea',
              '',
              '',
              'Sin trabajadores'
            ];
          
          const row = worksheetWorkers.addRow(rowData);
          
          if (rowIsEven) {
            row.eachCell((cell) => {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'F2F7FF' }
              };
            });
          }
          
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'E0E0E0' } },
              left: { style: 'thin', color: { argb: 'E0E0E0' } },
              bottom: { style: 'thin', color: { argb: 'E0E0E0' } },
              right: { style: 'thin', color: { argb: 'E0E0E0' } }
            };
            cell.alignment = { vertical: 'middle' };
          });
        }
      });

      const worksheetGeneral = workbook.addWorksheet('reporte-general', {
        pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 }
      });
      
      // Definir encabezados para la hoja de reporte general
      const headersGeneral = [
        'ID Operación', 
        'Estado', 
        'Área', 
        'Cliente',
        'Supervisores', 
        'Fecha Inicio', 
        'Hora Inicio', 
        'Fecha Fin', 
        'Hora Fin', 
        'Horas Trabajadas', 
        'Embarcación', 
        'Tarea',
        'Total Trabajadores',
        'Turnos'
      ];
      
      // Añadir fila de encabezados
      worksheetGeneral.addRow(headersGeneral);
      
      // Aplicar estilo a los encabezados
      const headerRowGeneral = worksheetGeneral.getRow(1);
      headerRowGeneral.height = 28;
      
      headerRowGeneral.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4472C4' }
        };
        
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFF' },
          size: 12
        };
        
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true
        };
        
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
  
      // Resetear para la segunda hoja
      rowIsEven = false;
      
      // Para cada operación, añadir una única fila en el reporte general
      operations.forEach((operation: any, index: number) => {
        // Alternar color de fondo para cada fila
        rowIsEven = !rowIsEven;
        
        // Calcular total de trabajadores en la operación
        let totalWorkers = 0;
        let totalGroups = 0;
        
        if (operation.workerGroups && operation.workerGroups.length > 0) {
          totalGroups = operation.workerGroups.length;
          operation.workerGroups.forEach((group: any) => {
            if (group.workers && group.workers.length > 0) {
              totalWorkers += group.workers.length;
            }
          });
        }
        
        // Calcular horas trabajadas
        const hoursWorked = calculateHoursWorked(
          operation.dateStart,
          operation.timeStrat,
          operation.dateEnd,
          operation.timeEnd
        );
        
        // Datos para la fila
        interface Supervisor {
          name: string;
        }
        
        const rowData: (string | number)[] = [
          operation.id,
          getStatusLabel(operation.status),
          operation.jobArea?.name || 'Sin área',
          operation.client?.name || 'Sin cliente',
          operation.inCharge?.map((sup: Supervisor) => sup.name).join(', ') || 'Sin supervisor',
          operation.dateStart ? format(new Date(operation.dateStart), "dd/MM/yyyy", { locale: es }) : 'N/A',
          operation.timeStrat || 'N/A',
          operation.dateEnd ? format(new Date(operation.dateEnd), "dd/MM/yyyy", { locale: es }) : 'N/A',
          operation.timeEnd || 'N/A',
          hoursWorked || 'N/A',
          operation.motorShip || 'N/A',
          operation.task?.name?.toUpperCase() || 'Sin tarea',
          totalWorkers, // Total de trabajadores
          totalGroups  // Número de turnos/grupos
        ];
        
        // Añadir la fila
        const row = worksheetGeneral.addRow(rowData);
        
        // Aplicar estilo a filas alternadas
        if (rowIsEven) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F2F7FF' }
            };
          });
        }
        
        // Bordes para todas las celdas
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'E0E0E0' } },
            left: { style: 'thin', color: { argb: 'E0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'E0E0E0' } },
            right: { style: 'thin', color: { argb: 'E0E0E0' } }
          };
          cell.alignment = { vertical: 'middle' };
        });
      });
      
      // Ajustar ancho de columnas automáticamente
      worksheetGeneral.columns.forEach(column => {
        if (!column || typeof column.eachCell !== 'function') return;
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? String(cell.value).length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 4, 30);
      });
      
      // Ajustar ancho de columnas automáticamente
      worksheetWorkers.columns.forEach(column => {
        if (!column || typeof column.eachCell !== 'function') return;
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? String(cell.value).length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 4, 30);
      });
      
      // Guardar el archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `operaciones_trabajadores_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      
    } catch (error) {
      console.error('Error al exportar operaciones por trabajador:', error);
      alert('Ocurrió un error al exportar los datos.');
    }
  };


  return (
    <>
    <div className="container mx-auto py-6 space-y-6">
      <div className="rounded-xl shadow-md">
        <SectionHeader
          title="Operaciones"
          subtitle="Gestión de operaciones, agrega, edita o elimina operaciones"
          btnAddText="Agregar Operación"
          handleAddArea={() => setIsAddOpen(true)}
          refreshData={() => Promise.resolve(refreshDataLocal())}
          loading={isLoading}
          exportData={filteredOperations}
          exportFileName="operaciones"
          exportColumns={exportColumns}
          currentView="operations"
          customExportFunction={exportOperationsByWorker}
        />

        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          startDateFilter={startDateFilter}
          setStartDateFilter={setStartDateFilter}
          endDateFilter={endDateFilter}
          setEndDateFilter={setEndDateFilter}
          areaFilter={areaFilter}
          setAreaFilter={setAreaFilter}
          areaOptions={areaOptions}
          statusOptions={statusOptions}
          supervisorFilter={supervisorFilter}
          setSupervisorFilter={setSupervisorFilter}
          supervisorOptions={supervisorOptions}
          clearAllFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
          useDateRangeFilter={true}
        />
      </div>

      {/* Tabla de operaciones */}
      <div className="shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="bg-white">
          <OperationList
            filteredOperations={filteredOperations}
            searchTerm={searchTerm}
            onView={handleViewOperation}
            onEdit={handleEditOperation}
            onDelete={handleDeleteOperation}
          />
        </div>
      </div>

      {/* Indicador de filtros activos */}
      <ActiveFilters
        hasActiveFilters={hasActiveFilters}
        statusFilter={statusFilter}
        areaFilter={areaFilter}
        supervisorFilter={supervisorFilter}
        startDateFilter={startDateFilter}
        endDateFilter={endDateFilter}
        clearAllFilters={clearAllFilters}
        setStatusFilter={setStatusFilter}
        setAreaFilter={setAreaFilter}
        setSupervisorFilter={setSupervisorFilter}
        setStartDateFilter={setStartDateFilter}
        setEndDateFilter={setEndDateFilter}
        getAreaName={getAreaName}
        getSupervisorName={getSupervisorName}
      />

      {/* Diálogo para agregar/editar operación */}
      {isAddOpen && (
        <AddOperationDialog
          open={isAddOpen}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedOperation(undefined);
            }
            setIsAddOpen(open);
          }}
          operation={selectedOperation}
          areas={areas || []}
          services={services || []}
          clients={clients || []}
          availableWorkers={workers || []}
          supervisors={
            users?.filter(
              (u) =>
                u.occupation === "SUPERVISOR" || u.occupation === "COORDINADOR"
            ) || []
          }
          onSave={handleSave}
        />
      )}

      <ViewOperationDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        operation={viewOperation}
      />
    </div>

      <DeactivateItemAlert
      open={!!operationToActivate}
      onOpenChange={() => setOperationToActivate(null)}
      onConfirm={ConfirmToActive}
      itemName="operación"
      isLoading={isLoading}
      />
    </>
  );
}
