import { useState, useCallback } from 'react';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { feedingService } from '@/services/feedingService';
import { Feeding } from '@/services/interfaces/feedingDTO';

export function useFeedingExport(getWorkerNameById: (id: number) => string) {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  /**
   * Función principal para exportar registros de alimentación
   * @param currentFilters Filtros actuales aplicados en la vista
   */
  const exportFeedings = useCallback(async (currentFilters: any) => {
    try {
      setIsExporting(true);
      console.log("[FeedingExport] Iniciando exportación con filtros:", currentFilters);
      
      // Construir filtros para la petición de exportación
      const exportFilters = {
        ...currentFilters,
        activatePaginated: false
      };
      
      // Realizar petición al servicio para obtener todos los registros
      const response = await feedingService.getPaginatedFeeding(1,1000,exportFilters);
      
      // Verificar estructura de respuesta y extraer datos
      if (!response) {
        console.error("[FeedingExport] No se recibió respuesta del servidor");
        return;
      }
      
      // Extraer los items dependiendo del formato de respuesta
      let feedings: Feeding[] = [];
      if (response.items && Array.isArray(response.items)) {
        feedings = response.items;
      } else if (Array.isArray(response)) {
        feedings = response;
      } else {
        console.error("[FeedingExport] Formato de respuesta inesperado:", response);
        return;
      }
      
      console.log(`[FeedingExport] Se obtuvieron ${feedings.length} registros para exportar`);
      
      // Crear un nuevo libro de trabajo Excel
      const workbook = new Workbook();
      workbook.creator = 'PlannerWeb';
      workbook.created = new Date();
      
      // Crear la hoja para el reporte
      const worksheet = workbook.addWorksheet('Alimentación', {
        pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 }
      });
      
      // Definir encabezados
      const headers = [
        'ID', 
        'Trabajador', 
        'Operación', 
        'Servicio', 
        'Cliente', 
        'Embarcación',
        'Tipo de Alimentación', 
        'Fecha', 
        'Hora Registro'
      ];
      
      // Configurar la hoja
      configureWorksheet(worksheet, headers);
      
      // Llenar datos
      populateFeedingsReport(worksheet, feedings, getWorkerNameById);
      
      // Ajustar ancho de columnas automáticamente
      autoAdjustColumns(worksheet);
      
      // Guardar el archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `registros_alimentacion_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      
      console.log("[FeedingExport] Exportación completada con éxito");
    } catch (error) {
      console.error('[FeedingExport] Error al exportar registros de alimentación:', error);
    } finally {
      setIsExporting(false);
    }
  }, [getWorkerNameById]);

  // Función para configurar formato de la hoja de Excel
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

  // Función para llenar los datos en la hoja
  const populateFeedingsReport = (worksheet: any, feedings: Feeding[], getWorkerNameById: (id: number) => string) => {
    let rowIsEven = false;
    
    feedings.forEach((feeding: Feeding) => {
      rowIsEven = !rowIsEven;
      
      // Obtener el nombre del trabajador
      const workerName = getWorkerNameById(feeding.id_worker);
      
      // Mapear tipo de alimentación a texto legible
      let feedingType = 'Desconocido';
      switch (feeding.type) {
        case 'BREAKFAST':
          feedingType = 'Desayuno';
          break;
        case 'LUNCH':
          feedingType = 'Almuerzo';
          break;
        case 'DINNER':
          feedingType = 'Cena';
          break;
        case 'MIDNIGHT':
          feedingType = 'Media noche';
          break;
        default:
          feedingType = feeding.type || 'Desconocido';
      }
      
      const rowData = [
        feeding.id,
        workerName,
        feeding.id_operation,
        feeding.operation?.task?.name || 'Sin servicio',
        feeding.operation?.client?.name || 'Sin cliente',
        feeding.operation?.motorShip || 'Sin embarcación',
        feedingType,
        feeding.dateFeeding 
          ? format(new Date(feeding.dateFeeding), 'dd/MM/yyyy', { locale: es }) 
          : 'N/A',
        feeding.createAt 
          ? format(new Date(feeding.createAt), 'HH:mm', { locale: es }) 
          : 'N/A'
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
    exportFeedings,
    isExporting
  };
}