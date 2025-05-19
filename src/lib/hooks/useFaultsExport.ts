import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { faultService } from "@/services/faultService";
import { useState } from "react";
import { Fault, FaultType } from "@/core/model/fault";

export const useFaultsExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  // Función para obtener etiqueta de tipo de falta
  const getFaultTypeLabel = (type: string): string => {
    switch (type) {
      case FaultType.INASSISTANCE:
        return "Inasistencia";
      case FaultType.IRRESPECTFUL:
        return "Irrespeto";
      case FaultType.ABANDONMENT:
        return "Abandono";
      default:
        return type || "Desconocido";
    }
  };

  // Función principal para exportar
  const exportFaults = async (filters: any, searchTerm?: string) => {
    try {
      setIsExporting(true);
      console.log("[FaultsExport] Iniciando exportación con filtros:", filters);

      // Obtener todas las faltas con los filtros actuales sin paginación

      const exportFilters = {
        ...filters,
        activatePaginated: false,
      };
      const response = await faultService.getPaginatedFaults(
        1,
        1000,
        exportFilters
      );

      // Verificar estructura de respuesta y extraer datos
      if (!response || (!response.items && !Array.isArray(response))) {
        console.error(
          "[FaultsExport] Formato de respuesta inválido:",
          response
        );
        return;
      }

      // Extraer los items dependiendo del formato de respuesta
      let faults: Fault[] = [];
      if (response.items && Array.isArray(response.items)) {
        faults = response.items;
      } else if (Array.isArray(response)) {
        faults = response;
      }

      console.log(
        `[FaultsExport] Se obtuvieron ${faults.length} registros para exportar`
      );

      // Aplicar filtro de búsqueda local si existe
      if (searchTerm) {
        faults = faults.filter(
          (fault: Fault) =>
            fault.worker?.name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            fault.worker?.dni
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            fault.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            fault.type?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Crear un nuevo libro de trabajo Excel
      const workbook = new Workbook();
      workbook.creator = "PlannerWeb";
      workbook.created = new Date();

      // Crear la hoja para el reporte
      const worksheet = workbook.addWorksheet("registro-faltas", {
        pageSetup: { fitToPage: true, fitToHeight: 5, fitToWidth: 7 },
      });

      // Definir encabezados
      const headers = [
        "ID",
        "Documento",
        "Trabajador",
        "Estado Trabajador",
        "Tipo de Falta",
        "Descripción",
        "Fecha",
        "Registrado por",
      ];

      // Aplicar formato a la hoja
      configureWorksheet(worksheet, headers);

      // Llenar datos
      populateFaultsReport(worksheet, faults);

      // Ajustar ancho de columnas automáticamente
      autoAdjustColumns(worksheet);

      // Guardar el archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `registro_faltas_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      saveAs(blob, fileName);

      console.log("[FaultsExport] Exportación completada con éxito");
    } catch (error) {
      console.error("[FaultsExport] Error al exportar faltas:", error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  // Función para configurar formato de la hoja de Excel
  const configureWorksheet = (worksheet: any, headers: string[]) => {
    // Añadir fila de encabezados
    worksheet.addRow(headers);

    // Aplicar estilo a los encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;

    headerRow.eachCell((cell: any) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4472C4" },
      };

      cell.font = {
        bold: true,
        color: { argb: "FFFFFF" },
        size: 12,
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  };

  // Función para llenar los datos en la hoja
  const populateFaultsReport = (worksheet: any, faults: Fault[]) => {
    let rowIsEven = false;

    faults.forEach((fault: Fault) => {
      rowIsEven = !rowIsEven;

      const rowData = [
        fault.id,
        fault.worker?.dni || "N/A",
        fault.worker?.name || "N/A",
        fault.worker?.status || "N/A",
        getFaultTypeLabel(fault.type),
        fault.description || "",
        fault.createAt
          ? format(new Date(fault.createAt), "dd/MM/yyyy", { locale: es })
          : "N/A",
        fault.user?.username || "N/A",
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
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "F2F7FF" },
        };
      });
    }

    row.eachCell((cell: any) => {
      cell.border = {
        top: { style: "thin", color: { argb: "E0E0E0" } },
        left: { style: "thin", color: { argb: "E0E0E0" } },
        bottom: { style: "thin", color: { argb: "E0E0E0" } },
        right: { style: "thin", color: { argb: "E0E0E0" } },
      };
      cell.alignment = { vertical: "middle" };
    });
  };

  // Función para ajustar automáticamente el ancho de las columnas
  const autoAdjustColumns = (worksheet: any) => {
    worksheet.columns.forEach((column: any) => {
      if (!column || typeof column.eachCell !== "function") return;
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
    exportFaults,
    isExporting,
  };
};
