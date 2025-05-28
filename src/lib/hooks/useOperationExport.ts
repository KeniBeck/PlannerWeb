import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { operationService } from '@/services/operationService';
import { Worker } from '@/core/model/worker';
import { useState } from 'react';

export const useOperationExport = (workers: Worker[] = []) => {

    const [isExporting, setIsExporting] = useState(false);
  // Función para obtener etiqueta de estado desde el módulo existente
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "Pendiente";
      case "INPROGRESS": return "En Curso";
      case "COMPLETED": return "Finalizado";
      case "CANCELED": return "Cancelado";
      default: return status || "Desconocido";
    }
  };

  const getWorkerDni = (idWorker: number) => {
    const worker = workers?.find((w) => w.id === idWorker);
    return worker ? worker.dni : "Sin DNI";
  };

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

  // Función principal para exportar
  const exportOperationsByWorker = async (filters: any, searchTerm?: string) => {
    try {
        setIsExporting(true);
      // Obtener todas las operaciones con los filtros actuales sin paginación
      const response = await operationService.getPaginatedOperations(
        1, 10000, {...filters, activatePaginated: false}
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
      
      // Crear la hoja para el reporte por trabajador
      const worksheetWorkers = workbook.addWorksheet('reporte-trabajador', {
        pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 }
      });
      
      // Definir encabezados
      const headersWorkers = [
        'ID Operación', 'Estado', 'Área', 'Cliente',
        'Supervisores', 'Fecha Inicio', 'Hora Inicio', 'Fecha Fin', 'Hora Fin', 'Horas Trabajadas', 
        'Embarcación',  'Turno', 'DNI Trabajador', 'Nombre Trabajador'
      ];
      
      // Aplicar formato a la hoja de reporte por trabajador
      configureWorksheet(worksheetWorkers, headersWorkers);
      populateWorkerReport(worksheetWorkers, operations);
      
      // Crear la hoja para el reporte general
      const worksheetGeneral = workbook.addWorksheet('reporte-general', {
        pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 }
      });
      
      // Definir encabezados para el reporte general
      const headersGeneral = [
        'ID Operación', 'Estado', 'Área', 'Cliente',
        'Supervisores', 'Fecha Inicio', 'Hora Inicio', 'Fecha Fin', 'Hora Fin', 'Horas Trabajadas', 
        'Embarcación',  'Total Trabajadores', 'Turnos'
      ];
      
      // Aplicar formato a la hoja de reporte general
      configureWorksheet(worksheetGeneral, headersGeneral);
      populateGeneralReport(worksheetGeneral, operations);
      
      // Ajustar ancho de columnas automáticamente para ambas hojas
      autoAdjustColumns(worksheetWorkers);
      autoAdjustColumns(worksheetGeneral);
      
      // Guardar el archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `operaciones_trabajadores_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      
    } catch (error) {
      console.error('Error al exportar operaciones por trabajador:', error);
      throw error;
    }finally{
        setIsExporting(false);
    }
  };

  // Función para configurar formato de hojas de Excel
  const configureWorksheet = (worksheet: any, headers: string[]) => {
    // Añadir fila de encabezados
    worksheet.addRow(headers);
    
    // Aplicar estilo a los encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    
    headerRow.eachCell((cell: any) => {
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
  };

  // Función para popular la hoja de reporte por trabajador
  const populateWorkerReport = (worksheet: any, operations: any[]) => {
    let currentOperationId: any = null;
    let rowIsEven = false;
    
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
                rowIsEven = !rowIsEven;
              }
              
              addWorkerRow(worksheet, operation, worker, groupIndex, rowIsEven);
              workerAdded = true;
            });
          }
        });
      }
      
      // Si no hay trabajadores, añadir una fila para la operación
      if (!workerAdded) {
        if (currentOperationId !== operation.id) {
          currentOperationId = operation.id;
          rowIsEven = !rowIsEven;
        }
        
        addEmptyWorkerRow(worksheet, operation, rowIsEven);
      }
    });
  };

  // Función para añadir fila de trabajador
  const addWorkerRow = (worksheet: any, operation: any, worker: any, groupIndex: number, rowIsEven: boolean) => {
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
      operation.inCharge?.map((sup: any) => sup.name).join(', ') || 'Sin supervisor',
      operation.dateStart ? format(new Date(operation.dateStart), "dd/MM/yyyy", { locale: es }) : 'N/A',
      operation.timeStrat || 'N/A',
      operation.dateEnd ? format(new Date(operation.dateEnd), "dd/MM/yyyy", { locale: es }) : 'N/A',
      operation.timeEnd || 'N/A',
      hoursWorked || 'N/A',
      operation.motorShip || 'N/A',
      `Turno ${groupIndex + 1}`,
      getWorkerDni(worker.id),
      worker.name
    ];
    
    const row = worksheet.addRow(rowData);
    applyRowStyles(row, rowIsEven);
  };

  // Función para añadir fila sin trabajadores
  const addEmptyWorkerRow = (worksheet: any, operation: any, rowIsEven: boolean) => {
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
      operation.inCharge?.map((sup: any) => sup.name).join(', ') || 'Sin supervisor',
      operation.dateStart ? format(new Date(operation.dateStart), "dd/MM/yyyy", { locale: es }) : 'N/A',
      operation.timeStrat || 'N/A',
      operation.dateEnd ? format(new Date(operation.dateEnd), "dd/MM/yyyy", { locale: es }) : 'N/A',
      operation.timeEnd || 'N/A',
      hoursWorked, 
      operation.motorShip || 'N/A',
      '',
      '',
      'Sin trabajadores'
    ];
    
    const row = worksheet.addRow(rowData);
    applyRowStyles(row, rowIsEven);
  };

  // Función para popular la hoja de reporte general
  const populateGeneralReport = (worksheet: any, operations: any[]) => {
    let rowIsEven = false;
    
    operations.forEach((operation: any) => {
      rowIsEven = !rowIsEven;
      
      // Calcular total de trabajadores y grupos
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
        operation.inCharge?.map((sup: any) => sup.name).join(', ') || 'Sin supervisor',
        operation.dateStart ? format(new Date(operation.dateStart), "dd/MM/yyyy", { locale: es }) : 'N/A',
        operation.timeStrat || 'N/A',
        operation.dateEnd ? format(new Date(operation.dateEnd), "dd/MM/yyyy", { locale: es }) : 'N/A',
        operation.timeEnd || 'N/A',
        hoursWorked || 'N/A',
        operation.motorShip || 'N/A',
        totalWorkers,
        totalGroups
      ];
      
      const row = worksheet.addRow(rowData);
      applyRowStyles(row, rowIsEven);
    });
  };

  // Función para aplicar estilos a las filas
  const applyRowStyles = (row: any, isEven: boolean) => {
    if (isEven) {
      row.eachCell((cell: any) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F2F7FF' }
        };
      });
    }
    
    row.eachCell((cell: any) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'E0E0E0' } },
        left: { style: 'thin', color: { argb: 'E0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'E0E0E0' } },
        right: { style: 'thin', color: { argb: 'E0E0E0' } }
      };
      cell.alignment = { vertical: 'middle' };
    });
  };

  // Función para ajustar automáticamente el ancho de las columnas
  const autoAdjustColumns = (worksheet: any) => {
    worksheet.columns.forEach((column: any) => {
      if (!column || typeof column.eachCell !== 'function') return;
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const columnLength = cell.value ? String(cell.value).length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(maxLength + 4, 30);
    });
  };

  return {
    exportOperationsByWorker,
    isExporting
  };
};