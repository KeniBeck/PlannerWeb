import { AiOutlineDownload, AiOutlinePlusCircle, AiOutlineReload } from "react-icons/ai";
import * as XLSX from 'xlsx';
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
}

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
  currentView
}: SectionHeaderProps) {
  
  // Función para exportar a Excel
  const handleExportToExcel = () => {
    if (!exportData || exportData.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    try {
      let dataToExport = exportData;
      
      // Si hay configuración de columnas, formateamos los datos
      if (exportColumns && exportColumns.length > 0) {
        dataToExport = exportData.map(item => {
          const formattedItem: Record<string, any> = {};
          
          exportColumns.forEach(column => {
            // Si hay una función personalizada para obtener el valor
            if (column.value) {
              formattedItem[column.header] = column.value(item);
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
              
              formattedItem[column.header] = value;
            } 
            // Para campos simples
            else {
              formattedItem[column.header] = item[column.field] || '';
            }
          });
          
          return formattedItem;
        });
      }
      
      // Preparamos la hoja de Excel
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      
      // Si hay encabezados personalizados y no tenemos datos, aseguramos que aparezcan las cabeceras
      if (exportColumns && exportColumns.length > 0 && dataToExport.length === 0) {
        const headers: Record<string, string> = {};
        exportColumns.forEach((col, index) => {
          // Convertimos el índice de columna a letra de Excel (A, B, C...)
          const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
          headers[cellRef] = col.header;
        });
        
        worksheet['!ref'] = 'A1:' + XLSX.utils.encode_cell({ r: 0, c: exportColumns.length - 1 });
        worksheet['!data'] = [exportColumns.map(col => col.header)];
      }
      
      // Crear un libro
      const workbook = XLSX.utils.book_new();
      
      // Nombre de la hoja según el tipo de datos o vista actual
      const sheetName = currentView ? currentView.charAt(0).toUpperCase() + currentView.slice(1) : 'Datos';
      
      // Añadir la hoja al libro
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      // Generar el archivo
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Convertir a Blob
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      
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
    <header className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-md">
      <div>
        <h1 className="text-3xl font-bold">
          {title}
        </h1>
        <p className="text-blue-100 mt-1 font-light">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          title="Exportar datos"
          className="p-2 rounded-lg bg-blue-500 bg-opacity-30 hover:bg-opacity-50 text-white transition-all shadow-sm"
          onClick={handleExportToExcel}
          disabled={!exportData || exportData.length === 0}
        >
          <AiOutlineDownload className="h-5 w-5" />
        </button>

        <button
          title="Actualizar datos"
          className="p-2 rounded-lg bg-blue-500 bg-opacity-30 hover:bg-opacity-50 text-white transition-all shadow-sm"
          onClick={() => refreshData()}
          disabled={loading}
        >
          <AiOutlineReload className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
        </button>

        <button
          className="bg-white text-blue-700 border-none hover:bg-blue-50 shadow-sm ml-2 rounded-md flex gap-1 items-center p-2 transition-all"
          onClick={handleAddArea}
        >
          <AiOutlinePlusCircle className="mr-2" /> {btnAddText}
        </button>
      </div>
    </header>
  )
}