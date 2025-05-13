import { AiOutlineDownload, AiOutlinePlusCircle, AiOutlineReload } from "react-icons/ai";
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

// Tipo para la configuración de columnas
export interface ExcelColumn {
  header: string;        // Nombre de la columna en Excel
  field: string;         // Nombre del campo en el objeto de datos
  // Para campos anidados usando notación de punto (ej: "worker.name")
  // O función para transformar el valor
  value?: (item: any) => any;  
}

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  btnAddText: string;
  handleAddArea: () => void;
  refreshData: () => Promise<void>;
  loading: boolean;
  exportData?: any[];
  exportFileName?: string;
  // Configuración para el formato de exportación
  exportColumns?: ExcelColumn[];
  // Para saber qué tipo de datos se está exportando (en caso de vistas alternantes)
  currentView?: string;
  showAddButton?: boolean;
  showDownloadButton?: boolean;
  customExportFunction?: () => void; 
}

const COLORS = {
  darkBlue: "#155dfc", // Azul oscuro
  limeGreen: "#A5C739", // Verde limón claro
  skyBlue: "#0099ff"   // Azul cielo
};

export default function SectionHeader({
  title,
  subtitle,
  btnAddText,
  handleAddArea,
  refreshData,
  loading,
  exportData = [],
  exportFileName = 'datos_exportados',
  exportColumns,
  currentView,
  showAddButton = true,
  showDownloadButton = true,
  customExportFunction
}: SectionHeaderProps) {
  
  // Función para exportar a Excel usando ExcelJS
  const handleExportToExcel = async () => {
    if (!exportData || exportData.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    try {
      // Crear un nuevo libro de trabajo
      const workbook = new Workbook();
      workbook.creator = 'PlannerWeb';
      workbook.created = new Date();
      
      // Nombre de la hoja según el tipo de datos
      const sheetName = currentView ? currentView.charAt(0).toUpperCase() + currentView.slice(1) : 'Datos';
      const worksheet = workbook.addWorksheet(sheetName, {
        pageSetup: {
          fitToPage: true,
          fitToHeight: 5,
          fitToWidth: 7
        }
      });

      // Preparar encabezados desde la configuración de columnas
      const headers = exportColumns?.map(col => col.header) || 
        (exportData.length > 0 ? Object.keys(exportData[0]) : []);
      
      // Añadir fila de encabezados
      worksheet.addRow(headers);
      
      // Aplicar estilo a los encabezados (primera fila)
      const headerRow = worksheet.getRow(1);
      headerRow.height = 28; // Altura de la fila de encabezados
      
      // Aplicar estilo a cada celda de encabezado
      headerRow.eachCell((cell, colNumber) => {
        // Estilo de fondo para encabezados
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4472C4' } // Azul corporativo
        };
        
        // Estilo de fuente para encabezados
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFF' }, // Texto blanco
          size: 12
        };
        
        // Alineación
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true
        };
        
        // Bordes
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      // Transformar datos según la configuración de columnas
      let rowsToAdd: any[] = [];
      
      if (exportColumns && exportColumns.length > 0) {
        // Si tenemos configuración específica de columnas
        rowsToAdd = exportData.map(item => {
          return exportColumns.map(column => {
            // Si hay una función personalizada para obtener el valor
            if (column.value) {
              return column.value(item);
            } 
            // Para campos anidados (usando notación de punto)
            else if (column.field.includes('.')) {
              const fieldParts = column.field.split('.');
              let value = item;
              
              // Navegamos por el objeto para obtener el valor anidado
              for (const part of fieldParts) {
                if (value && typeof value === 'object' && part in value) {
                  value = value[part];
                } else {
                  value = '';
                  break;
                }
              }
              
              return value;
            } 
            // Para campos simples
            else {
              return item[column.field] !== undefined ? item[column.field] : '';
            }
          });
        });
      } else {
        // Sin configuración específica, usar los datos tal cual
        rowsToAdd = exportData.map(item => Object.values(item));
      }
      
      // Añadir filas de datos
      rowsToAdd.forEach((rowData, index) => {
        const row = worksheet.addRow(rowData);
        
        // Aplicar estilo a filas alternas para mejor legibilidad
        if (index % 2 === 1) {
          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F2F7FF' } // Fondo azul muy claro para filas alternas
            };
          });
        }
        
        // Aplicar bordes a todas las celdas
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'E0E0E0' } },
            left: { style: 'thin', color: { argb: 'E0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'E0E0E0' } },
            right: { style: 'thin', color: { argb: 'E0E0E0' } }
          };
          
          // Alineación vertical centrada
          cell.alignment = {
            vertical: 'middle'
          };
        });
      });
      
      // Ajustar ancho de columnas automáticamente
      worksheet.columns.forEach(column => {
        if (!column || typeof column.eachCell !== 'function') return;
        if (column.width) return;
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? String(cell.value).length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 4, 30); // Máximo 30 de ancho
      });
      
      // Generar el archivo Excel
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Convertir a Blob y descargar
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Nombre del archivo con la fecha actual
      const fileName = `${exportFileName || currentView || 'datos'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Descargar el archivo
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Ocurrió un error al exportar los datos.');
    }
  };

  return (
    <header 
      className="relative rounded-t-md overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${COLORS.darkBlue} 0%, #1047c9 100%)`,
        minHeight: "90px"
      }}
    >
      {/* Elementos decorativos */}
      <div className="absolute inset-0 z-0">
        {/* SVG de ondas */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ height: "60px" }}
        >
          <path
            fill="rgba(255, 255, 255, 0.08)"
            fillOpacity="1"
            d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
        
        {/* Círculos decorativos */}
        <div className="absolute top-2 right-10 w-12 h-12 rounded-full bg-white opacity-5"></div>
        <div className="absolute bottom-5 right-40 w-8 h-8 rounded-full bg-white opacity-5"></div>
      </div>

      {/* Contenido principal */}
      <div className="flex justify-between items-center p-5 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {title}
          </h1>
          <p className="text-blue-100 mt-1 font-light">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {showDownloadButton && (
            <button
              title="Exportar datos"
              className="p-2 rounded-lg bg-blue-500 bg-opacity-30 hover:bg-blue-500/60 text-white transition-all shadow-sm cursor-pointer"
              onClick={customExportFunction ||handleExportToExcel}
              disabled={!exportData || exportData.length === 0}
            >
              <AiOutlineDownload className="h-5 w-5" />
            </button>
          )}

          <button
            title="Actualizar datos"
            className="p-2 rounded-lg bg-blue-500 bg-opacity-30 hover:bg-blue-500/60 text-white transition-all shadow-sm cursor-pointer"
            onClick={() => refreshData()}
            disabled={loading}
          >
            <AiOutlineReload className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {showAddButton && (
            <button
              className="bg-white text-blue-700 border-none hover:bg-blue-50 shadow-sm ml-2 rounded-md flex gap-1 items-center p-2 transition-all cursor-pointer"
              onClick={handleAddArea}
            >
              <AiOutlinePlusCircle className="mr-2" /> {btnAddText}
            </button>
          )}
        </div>
      </div>
      
      {/* Barra decorativa en la parte inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-50"></div>
    </header>
  );
}