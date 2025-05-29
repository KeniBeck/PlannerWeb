import { useState, useEffect } from "react";
import { X, Calendar, Clock, User, MapPin, FileText, Briefcase } from "lucide-react";
import { Programming } from "@/core/model/programming";
import { FloatingInputSimple } from "@/components/ui/FloatingInputSimple";

interface CreateProgrammingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Programming, "id">) => Promise<boolean>;
  isLoading: boolean;
}

export function CreateProgrammingModal({
  open,
  onClose,
  onSubmit,
  isLoading
}: CreateProgrammingModalProps) {
  const [formData, setFormData] = useState<Omit<Programming, "id">>({
    service_request: "",
    service: "",
    dateStart: "",
    timeStart: "",
    ubication: "",
    client: "",
    status: "UNASSIGNED"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      const today = new Date();
      const todayFormatted = today.toISOString().split('T')[0];
      
      setFormData({
        service_request: "",
        service: "",
        dateStart: todayFormatted,
        timeStart: "",
        ubication: "",
        client: "",
        status: "UNASSIGNED"
      });
      setErrors({});
    }
  }, [open]);

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.service.trim()) {
      newErrors.service = "El servicio es requerido";
    }

    if (!formData.dateStart) {
      newErrors.dateStart = "La fecha es requerida";
    }

    if (!formData.timeStart) {
      newErrors.timeStart = "La hora es requerida";
    }

    if (!formData.client.trim()) {
      newErrors.client = "El cliente es requerido";
    }

    if (!formData.ubication.trim()) {
      newErrors.ubication = "La ubicación es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      onClose();
    }
  };

  // Opciones de estado
  const statusOptions = [
    { value: "UNASSIGNED", label: "Incompleto" },
    { value: "ASSIGNED", label: "Asignado" },
    { value: "COMPLETED", label: "Completado" },
    { value: "CANCELED", label: "Cancelado" }
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Nueva Programación
            </h3>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Solicitud de Servicio */}
            <FloatingInputSimple
              id="service_request"
              label="Solicitud de Servicio"
              value={formData.service_request}
              onChange={(value) => handleChange("service_request", value)}
              icon={<FileText className="h-4 w-4" />}
              error={errors.service_request}
              placeholder="Opcional - Número de solicitud"
              required
            />

            {/* Servicio */}
            <FloatingInputSimple
              id="service"
              label="Servicio"
              value={formData.service}
              onChange={(value) => handleChange("service", value)}
              icon={<Briefcase className="h-4 w-4" />}
              error={errors.service}
              required
              placeholder="Tipo de servicio a realizar"
            />

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-4">
              <FloatingInputSimple
                id="dateStart"
                label="Fecha"
                type="date"
                value={formData.dateStart}
                onChange={(value) => handleChange("dateStart", value)}
                icon={<Calendar className="h-4 w-4" />}
                error={errors.dateStart}
                required
                minDate={new Date().toISOString().split('T')[0]}
              />

              <FloatingInputSimple
                id="timeStart"
                type="time"
                value={formData.timeStart}
                onChange={(value) => handleChange("timeStart", value)}
                icon={<Clock className="h-4 w-4" />}
                error={errors.timeStart}
                required
              />
            </div>

            {/* Cliente */}
            <FloatingInputSimple
              id="client"
              label="Cliente"
              value={formData.client}
              onChange={(value) => handleChange("client", value)}
              icon={<User className="h-4 w-4" />}
              error={errors.client}
              required
              placeholder="Nombre del cliente"
            />

            {/* Ubicación */}
            <FloatingInputSimple
              id="ubication"
              label="Ubicación"
              value={formData.ubication}
              onChange={(value) => handleChange("ubication", value)}
              icon={<MapPin className="h-4 w-4" />}
              error={errors.ubication}
              required
              placeholder="Dirección o ubicación del servicio"
            />

            {/* Estado */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  "Crear Programación"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}