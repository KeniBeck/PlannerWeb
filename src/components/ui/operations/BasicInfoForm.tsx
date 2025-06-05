import { Area } from "@/core/model/area";
import { Client } from "@/core/model/client";
import { Service } from "@/core/model/service";
import { FaShip } from "react-icons/fa";
import { DateFilter } from "@/components/custom/filter/DateFilterProps";
import { useProgramming } from "@/contexts/ProgrammingContext";
import { useEffect, useState } from "react";
import { getCurrentColombianDateISO } from "@/lib/utils/formatDate";

interface BasicInfoFormProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  areas: Area[];
  services: Service[];
  clients: Client[];
  isEditMode?: boolean;
  isDateStartLocked?: boolean;
  isDateEndLocked?: boolean;
  isTimeStartLocked?: boolean;
  isTimeEndLocked?: boolean;
}

export default function BasicInfoForm({
  formData,
  setFormData,
  errors,
  areas,
  services,
  clients,
  isEditMode = false,
  isDateStartLocked = false,
  isDateEndLocked = false,
  isTimeStartLocked = false,
  isTimeEndLocked = false,
}: BasicInfoFormProps) {
  const { programming, refreshProgramming } = useProgramming();
  const [isLoadingProgramming, setIsLoadingProgramming] = useState(false);

  useEffect(() => {
    const loadProgrammingData = async () => {
      try {
        setIsLoadingProgramming(true);
        console.log("📋 BasicInfoForm - Cargando programaciones...");

        // Cargar todas las programaciones sin filtros específicos
        await refreshProgramming("", "", "UNASSIGNED");

        console.log("✅ BasicInfoForm - Programaciones cargadas exitosamente");
      } catch (error) {
        console.error(
          "❌ BasicInfoForm - Error al cargar programaciones:",
          error
        );
      } finally {
        setIsLoadingProgramming(false);
      }
    };

    // Solo cargar si programming está vacío
    if (programming.length === 0) {
      loadProgrammingData();
    }
  }, []);

  // 🆕 Modificación simple: incluir hoy y mañana
  const todayISO = getCurrentColombianDateISO();
  const tomorrow = new Date(todayISO);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString().split('T')[0];

  const programmingDataToday = programming.filter((p) => {
    if (!p.dateStart) return false;
    const progDate = p.dateStart.split("T")[0];
    return progDate === todayISO || progDate === tomorrowISO;
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // Obtener nombres de entidades para mostrar en modo edición
  const getAreaName = () => {
    const area = areas.find((a) => a.id.toString() === formData.id_area);
    return area ? area.name : "";
  };

  const getServiceName = () => {
    const service = services.find((s) => s.id.toString() === formData.id_task);
    return service ? service.name : "";
  };

  const getClientName = () => {
    const client = clients.find((c) => c.id.toString() === formData.id_client);
    return client ? client.name : "";
  };

  const getProgrammingName = () => {
    const prog = programming.find(
      (p) => p.id && p.id.toString() === formData.id_clientProgramming
    );
    if (!prog) return "No seleccionada";
    return `${prog.service} - ${prog.client}`;
  };

  return (
    <div className="space-y-2">
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
          Información de la Operación
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zona
              {isEditMode && (
                <span className="ml-1 text-xs text-amber-600">
                  (No editable)
                </span>
              )}
            </label>
            <div className="relative">
              {isEditMode ? (
                <div className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-800">
                  {formData.zone}
                </div>
              ) : (
                <input
                  type="number"
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  placeholder="Ingrese número de zona"
                  className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
                />
              )}
            </div>
            {errors.zone && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center">
                <span className="mr-1.5">•</span>
                {errors.zone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buque
            </label>
            <div className="relative">
              <input
                type="text"
                name="motorShip"
                value={formData.motorShip}
                onChange={handleChange}
                placeholder="Nombre del buque"
                className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
              />
              <FaShip className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente <span className="text-red-500">*</span>
              {isEditMode && (
                <span className="ml-1 text-xs text-amber-600">
                  (No editable)
                </span>
              )}
            </label>
            {isEditMode ? (
              <div className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-800">
                {getClientName()}
              </div>
            ) : (
              <select
                name="id_client"
                value={formData.id_client}
                onChange={handleChange}
                className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            )}
            {errors.id_client && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center">
                <span className="mr-1.5">•</span>
                {errors.id_client}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
          Área y Servicio
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área <span className="text-red-500">*</span>
              {isEditMode && (
                <span className="ml-1 text-xs text-amber-600">
                  (No editable)
                </span>
              )}
            </label>
            {isEditMode ? (
              <div className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-800">
                {getAreaName()}
              </div>
            ) : (
              <select
                name="id_area"
                value={formData.id_area}
                onChange={handleChange}
                className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
              >
                <option value="">Seleccionar área</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            )}
            {errors.id_area && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center">
                <span className="mr-1.5">•</span>
                {errors.id_area}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Programación de Cliente (Hoy y Mañana)
              {isEditMode && (
                <span className="ml-1 text-xs text-amber-600">
                  (No editable)
                </span>
              )}
            </label>
            {isEditMode ? (
              <div className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-800">
                {getProgrammingName()}
              </div>
            ) : (
              <select
                name="id_clientProgramming"
                value={formData.id_clientProgramming || ""}
                onChange={handleChange}
                className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
              >
                <option value="">Seleccionar programación</option>
                {/* 🆕 Usar el filtro actualizado */}
                {programmingDataToday.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.service} - {prog.client} - {prog.dateStart.split("T")[0]}{" "}
                  </option>
                ))}
              </select>
            )}
            {errors.id_clientProgramming && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center">
                <span className="mr-1.5">•</span>
                {errors.id_clientProgramming}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
          Fechas y Horas
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de Inicio <span className="text-red-500">*</span>
              {isDateStartLocked && (
                <span className="ml-1 text-xs text-amber-600 italic">
                  (Tomada del grupo más temprano)
                </span>
              )}
            </label>
            <DateFilter
              value={formData.dateStart || ""}
              onChange={(date) =>
                !isDateStartLocked &&
                setFormData({ ...formData, dateStart: date })
              }
              className=""
              label="Seleccione fecha"
            />
            {errors.dateStart && (
              <p className="mt-1 text-sm text-red-600">{errors.dateStart}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hora de Inicio <span className="text-red-500">*</span>
              {isTimeStartLocked && (
                <span className="ml-1 text-xs text-amber-600 italic">
                  (Tomada del grupo más temprano)
                </span>
              )}
            </label>
            <input
              type="time"
              value={formData.timeStrat}
              onChange={(e) =>
                !isTimeStartLocked &&
                setFormData({ ...formData, timeStrat: e.target.value })
              }
              disabled={isTimeStartLocked}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                ${
                  isTimeStartLocked
                    ? "bg-gray-100 cursor-not-allowed opacity-90"
                    : "bg-white"
                }`}
            />
            {errors.timeStart && (
              <p className="mt-1 text-sm text-red-600">{errors.timeStart}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de Finalización
              {isDateEndLocked && (
                <span className="ml-1 text-xs text-amber-600 italic">
                  (Tomada del grupo más tardío)
                </span>
              )}
            </label>
            <DateFilter
              value={formData.dateEnd || ""}
              onChange={(date) =>
                !isDateEndLocked && setFormData({ ...formData, dateEnd: date })
              }
              className=""
              label="Seleccione fecha"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hora de Finalización
              {isTimeEndLocked && (
                <span className="ml-1 text-xs text-amber-600 italic">
                  (Tomada del grupo más tardío)
                </span>
              )}
            </label>
            <input
              type="time"
              value={formData.timeEnd || ""}
              onChange={(e) =>
                !isTimeEndLocked &&
                setFormData({ ...formData, timeEnd: e.target.value || null })
              }
              disabled={isTimeEndLocked}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                ${
                  isTimeEndLocked
                    ? "bg-gray-100 cursor-not-allowed opacity-90"
                    : "bg-white"
                }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}