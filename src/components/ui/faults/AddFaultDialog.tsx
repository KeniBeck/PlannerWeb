import { useState, useEffect } from "react";
import { FaultType } from "@/core/model/fault";
import { Worker } from "@/core/model/worker";
import { BsExclamationCircle } from "react-icons/bs";
import { MdWarning } from "react-icons/md";
import { AiOutlineClose } from "react-icons/ai";

interface AddFaultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (faultData: any) => void;
  workers: Worker[];
}

export function AddFaultDialog({
  open,
  onOpenChange,
  onSave,
  workers
}: AddFaultDialogProps) {
  // Estado para el formulario
  const [formData, setFormData] = useState({
    workerId: "",
    type: "",
    description: "",
  });

  // Estado para validación
  const [errors, setErrors] = useState({
    workerId: "",
    type: "",
    description: "",
  });

  // Filtro para buscar trabajadores
  const [searchTerm, setSearchTerm] = useState("");

  // Resetear el formulario cuando se abre/cierra el diálogo
  useEffect(() => {
    if (open) {
      setFormData({
        workerId: "",
        type: "",
        description: "",
      });
      setErrors({
        workerId: "",
        type: "",
        description: "",
      });
      setSearchTerm("");
    }
  }, [open]);

  // Trabajadores filtrados según término de búsqueda
  const filteredWorkers = workers.filter(worker => 
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.dni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {
      workerId: "",
      type: "",
      description: "",
    };

    let isValid = true;

    if (!formData.workerId) {
      newErrors.workerId = "Seleccione un trabajador";
      isValid = false;
    }

    if (!formData.type) {
      newErrors.type = "Seleccione un tipo de falta";
      isValid = false;
    }

    if (!formData.description) {
      newErrors.description = "La descripción es requerida";
      isValid = false;
    } else if (formData.description.length < 10) {
      newErrors.description = "La descripción debe tener al menos 10 caracteres";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const selectedWorker = workers.find(w => w.id.toString() === formData.workerId);

    if (!selectedWorker) {
      setErrors(prev => ({ ...prev, workerId: "Trabajador no válido" }));
      return;
    }

    // Preparar datos para enviar
    const faultData = {
      type: formData.type,
      description: formData.description,
      id_worker: parseInt(formData.workerId),
    };

    onSave(faultData);
  };

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Registrar Nueva Falta</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <AiOutlineClose size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo: Trabajador */}
          <div>
            <label htmlFor="workerId" className="block text-sm font-medium text-gray-700 mb-1">
              Trabajador <span className="text-red-500">*</span>
            </label>
            
            {/* Buscador de trabajadores */}
            <div className="mb-2">
              <input 
                type="text"
                placeholder="Buscar por nombre o DNI"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Lista de trabajadores */}
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
              {filteredWorkers.length > 0 ? (
                filteredWorkers.map((worker) => (
                  <label
                    key={worker.id}
                    className={`flex items-center p-2 cursor-pointer hover:bg-gray-50 ${
                      formData.workerId === worker.id.toString() ? "bg-blue-50" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="workerId"
                      value={worker.id}
                      checked={formData.workerId === worker.id.toString()}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mr-2"
                    />
                    <div>
                      <p className="font-medium">{worker.name}</p>
                      <p className="text-xs text-gray-500">DNI: {worker.dni}</p>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-center py-3 text-gray-500">
                  {searchTerm ? "No se encontraron trabajadores" : "No hay trabajadores disponibles"}
                </p>
              )}
            </div>
            {errors.workerId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <BsExclamationCircle className="mr-1" /> {errors.workerId}
              </p>
            )}
          </div>

          {/* Campo: Tipo de falta */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de falta <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar tipo</option>
              <option value={FaultType.INASSISTANCE}>{getFaultTypeLabel(FaultType.INASSISTANCE)}</option>
              <option value={FaultType.IRRESPECTFUL}>{getFaultTypeLabel(FaultType.IRRESPECTFUL)}</option>
              <option value={FaultType.ABANDONMENT}>{getFaultTypeLabel(FaultType.ABANDONMENT)}</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <BsExclamationCircle className="mr-1" /> {errors.type}
              </p>
            )}
          </div>

          {/* Campo: Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describa la falta..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <BsExclamationCircle className="mr-1" /> {errors.description}
              </p>
            )}
          </div>

          {/* Nota legal */}
          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Registrar Falta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}