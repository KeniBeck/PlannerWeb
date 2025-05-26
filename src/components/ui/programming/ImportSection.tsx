import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AiOutlineUpload, AiOutlineDelete, AiOutlineSave, AiOutlineInfoCircle } from "react-icons/ai";
import { FaRegFileExcel } from "react-icons/fa";
import { StatusSuccessAlert } from "@/components/dialog/AlertsLogin";
import { excelDateToJSDate } from "@/lib/utils/formatDate";
import { Programming } from "@/core/model/programming";
import Swal from "sweetalert2";

// Estructura para la vista previa de datos
interface ContainerProgramItem {
  solicitudServicio: string;
  servicio: string;
  fechaInicio: string;
  ubicacion: string;
  cliente: string;
}

interface ImportSectionProps {
  setIsLoading: (loading: boolean) => void;
  createBulkProgramming: (data: Omit<Programming, "id">[]) => Promise<boolean>;
  onImportSuccess: () => void;
}

export function ImportSection({ 
  setIsLoading, 
  createBulkProgramming,
  onImportSuccess
}: ImportSectionProps) {
  // Estados locales
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ContainerProgramItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejar la carga del archivo Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploadedFile(file);
    parseExcelFile(file);
  };

  // Analizar el archivo Excel
  const parseExcelFile = async (file: File) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0]; // Tomar primera hoja
          const sheet = workbook.Sheets[sheetName];

          // Configurar opciones para parsear fechas correctamente
          const options = {
            header: 1,
            dateNF: 'dd/mm/yyyy h:mm'
          };

          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(sheet, options);

          // Identificar encabezados
          const headers = jsonData[0] as string[];
          const headerMap: Record<string, number> = {};

          headers.forEach((header, index) => {
            if (!header) return;

            const normalizedHeader = header?.toString().toLowerCase().trim()
              .replace(/\s+de\s+/g, '')
              .replace(/\s+/g, '')
              .replace(/[áéíóúüñ]/g, (match) => {
                const replacements: Record<string, string> = {
                  'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ñ': 'n'
                };
                return replacements[match] || match;
              });

            headerMap[normalizedHeader] = index;
          });

          // Mapear encabezados esperados a posibles variaciones
          const headerMappings: Record<string, string[]> = {
            'solicitudservicio': ['solicitudservicio', 'solicituddeservicio', 'solicitud'],
            'servicio': ['servicio', 'tiposervicio'],
            'fechainicio': ['fechainicio', 'fechadeinicio', 'fecha'],
            'ubicacion': ['ubicacion', 'ubicacionid'],
            'contenedor': ['contenedor', 'numerocontenedor'],
            'tamanotipo': ['tamanotipo', 'tamano', 'tipo'],
            'cliente': ['cliente', 'nombrecliente']
          };

          // Verificar encabezados esperados
          const mappedHeaders: Record<string, number> = {};
          for (const [expectedHeader, variations] of Object.entries(headerMappings)) {
            for (const variation of variations) {
              if (headerMap[variation] !== undefined) {
                mappedHeaders[expectedHeader] = headerMap[variation];
                break;
              }
            }
          }

          // Procesar filas de datos (excluyendo encabezados)
          const allItems: ContainerProgramItem[] = [];

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (!row.length || row.every(cell => !cell)) continue; // Saltar filas vacías

            // Formatear fecha si es número (fecha de Excel)
            let fechaInicio = '';
            const fechaValue = row[mappedHeaders['fechainicio']];

            if (fechaValue) {
              if (typeof fechaValue === 'number') {
                const date = excelDateToJSDate(fechaValue);
                fechaInicio = format(date, 'dd/MM/yyyy HH:mm', { locale: es });
              } else {
                fechaInicio = fechaValue.toString();
              }
            }
            
            // Mapear datos a la estructura simplificada
            const item: ContainerProgramItem = {
              solicitudServicio: row[mappedHeaders['solicitudservicio']]?.toString() || '',
              servicio: row[mappedHeaders['servicio']]?.toString() || '',
              fechaInicio: fechaInicio,
              ubicacion: row[mappedHeaders['ubicacion']]?.toString() || '',
              cliente: row[mappedHeaders['cliente']]?.toString() || ''
            };

            allItems.push(item);
          }

          // Filtrar para obtener solo el primer registro de cada grupo único
          const uniqueGroups = new Map<string, ContainerProgramItem>();

          allItems.forEach(item => {
            // Crear una clave única basada en los campos de agrupación
            const groupKey = `${item.servicio}|${item.fechaInicio}|${item.ubicacion}|${item.cliente}`;

            // Solo agregar el primer elemento de cada grupo
            if (!uniqueGroups.has(groupKey)) {
              uniqueGroups.set(groupKey, item);
            }
          });

          // Convertir el mapa de vuelta a un array de elementos únicos
          const uniqueItems = Array.from(uniqueGroups.values());

          // Ordenar por fecha y hora para mejor visualización
          uniqueItems.sort((a, b) => {
            // Primero comparamos por fecha/hora
            const dateA = a.fechaInicio;
            const dateB = b.fechaInicio;
            if (dateA !== dateB) return dateA.localeCompare(dateB);

            // Si las fechas son iguales, comparamos por servicio
            return a.servicio.localeCompare(b.servicio);
          });

          setParsedData(uniqueItems);

        } catch (err) {
          console.error("Error al procesar archivo:", err);
          StatusSuccessAlert("Error", "No se pudo procesar el archivo Excel. Verifica el formato.");
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Error al leer el archivo:", err);
      setIsLoading(false);
      StatusSuccessAlert("Error", "No se pudo leer el archivo.");
    }
  };

  // Función para guardar los datos procesados
  const handleSaveData = async () => {
    if (parsedData.length === 0) {
      StatusSuccessAlert("Error", "No hay datos para guardar.");
      return;
    }

    try {
      // Confirmación antes de guardar
      const { isConfirmed } = await Swal.fire({
        title: 'Confirmar importación',
        text: `¿Deseas importar ${parsedData.length} registros de programación?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, importar',
        cancelButtonText: 'Cancelar'
      });

      if (!isConfirmed) return;

      // Convertir a formato de programación
      const programmingData: Omit<Programming, "id">[] = parsedData.map(item => {
        // Extraer fecha y hora (si están juntos)
        let dateStart = "";
        let timeStart = "";
        
        if (item.fechaInicio.includes(" ")) {
          const parts = item.fechaInicio.split(" ");
          dateStart = parts[0];
          timeStart = parts[1] || "00:00";
        } else {
          dateStart = item.fechaInicio;
          timeStart = "00:00";
        }

        return {
          service_request: item.solicitudServicio,
          service: item.servicio,
          dateStart: dateStart,
          timeStart: timeStart,
          ubication: item.ubicacion,
          client: item.cliente,
        };
      });

      // Llamar a la función del contexto para guardar en lote
      const success = await createBulkProgramming(programmingData);
      
      if (success) {
        // Limpiar datos después de guardar exitosamente
        setParsedData([]);
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        // Notificar al componente padre que la importación fue exitosa
        onImportSuccess();
      }
    } catch (error) {
      console.error("Error al guardar datos:", error);
      StatusSuccessAlert("Error", "No se pudieron guardar los datos.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel de carga */}
        <div className="md:col-span-2 bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaRegFileExcel className="text-green-600 mr-2" />
            Cargar Archivo Excel
          </h3>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Seleccione un archivo Excel con la programación de servicios. Asegúrese de que contenga las columnas requeridas.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 
                  rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white
                  hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <AiOutlineUpload className="mr-2 h-5 w-5 text-blue-500" />
                Seleccionar archivo
              </label>
              
              {parsedData.length > 0 && (
                <button
                  onClick={handleSaveData}
                  className="flex items-center justify-center px-4 py-2 border border-transparent 
                    rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 
                    hover:bg-blue-700 transition-colors"
                >
                  <AiOutlineSave className="mr-2 h-5 w-5" />
                  Guardar programación
                </button>
              )}
              
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept=".xlsx, .xls"
                className="sr-only"
                onChange={handleFileUpload}
                ref={fileInputRef}
              />
            </div>
            
            {uploadedFile && (
              <div className="mt-2 flex items-center p-3 bg-blue-50 rounded-md border border-blue-100">
                <FaRegFileExcel className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-800 flex-1 truncate">
                  {uploadedFile.name}
                </span>
                <button
                  type="button"
                  className="ml-auto text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
                  onClick={() => {
                    setUploadedFile(null);
                    setParsedData([]);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <AiOutlineDelete className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Panel de instrucciones */}
        <div className="bg-blue-50 p-6 border border-blue-100 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AiOutlineInfoCircle className="text-blue-600 mr-2" />
            Instrucciones
          </h3>
          
          <div className="space-y-3 text-sm">
            <p>El archivo Excel debe contener las siguientes columnas:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Solicitud de servicio (obligatorio)</li>
              <li>Servicio (obligatorio)</li>
              <li>Fecha inicio (obligatorio)</li>
              <li>Ubicación (obligatorio)</li>
              <li>Cliente (obligatorio)</li>
            </ul>
            <div className="bg-white p-3 rounded-md border border-blue-100 mt-4">
              <p className="font-medium text-xs text-blue-800 mb-1">Nota:</p>
              <p className="text-xs text-gray-600">
                Las fechas pueden estar en formato DD/MM/YYYY o como fechas Excel. 
                Si incluye hora, sepárela con un espacio después de la fecha.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vista previa de datos */}
      {parsedData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <span>Vista previa de datos</span>
              <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {parsedData.length} registros
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitud</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-xs">
                {parsedData.map((item, index) => {
                  // Separar fecha y hora si están en el mismo campo
                  const dateParts = item.fechaInicio.split(" ");
                  const date = dateParts[0] || "N/A";
                  const time = dateParts[1] || "";
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-gray-700 font-medium">{index + 1}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">{item.solicitudServicio}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">{item.servicio}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">{date}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">{time}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">{item.ubicacion}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500">{item.cliente}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}