import { Area } from "@/core/model/area";
import { Client } from "@/core/model/client";
import { Service } from "@/core/model/service";
import { FaMapMarkerAlt, FaShip, FaClock } from "react-icons/fa";
import { BiArea } from "react-icons/bi";
import { MdHomeRepairService } from "react-icons/md";
import { BsBuildingsFill } from "react-icons/bs";

interface BasicInfoFormProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  areas: Area[];
  services: Service[];
  clients: Client[];
}

export default function BasicInfoForm({
  formData,
  setFormData,
  errors,
  areas,
  services,
  clients
}: BasicInfoFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-2">
      {/* Sección: Ubicación */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800  flex items-center">
          <FaMapMarkerAlt className="mr-2 text-blue-600" />
          Ubicación y Buque
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
         
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="id_area"
                value={formData.id_area}
                onChange={handleChange}
                className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 appearance-none"
              >
                <option value="">Seleccione un área</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
              <BiArea className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              {errors.id_area && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center">
                  <span className="mr-1.5">•</span>
                  {errors.id_area}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zona <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"  
                name="zone"
                value={formData.zone}
                onChange={handleChange}
                placeholder="Ingrese número de zona"
                className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
              />
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
              Buque <span className="text-red-500">*</span>
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
            {errors.motorShip && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center">
                <span className="mr-1.5">•</span>
                {errors.motorShip}
              </p>
            )}
          </div>

          
        </div>
      </div>

      {/* Sección: Programación */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaClock className="mr-2 text-blue-600" />
          Programación
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateStart"
              value={formData.dateStart}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
            />
            {errors.dateStart && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center">
                <span className="mr-1.5">•</span>
                {errors.dateStart}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora Inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="timeStart"
              value={formData.timeStart}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
            />
            {errors.timeStart && (
              <p className="mt-1.5 text-sm text-red-500 flex items-center">
                <span className="mr-1.5">•</span>
                {errors.timeStart}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Fecha Fin <span className="text-xs text-gray-400">(Opcional)</span>
            </label>
            <input
              type="date"
              name="dateEnd"
              value={formData.dateEnd}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Hora Fin <span className="text-xs text-gray-400">(Opcional)</span>
            </label>
            <input
              type="time"
              name="timeEnd"
              value={formData.timeEnd}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Sección: Detalles de la Operación */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 ">
          Detalles de la Operación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servicio <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="id_task"
                value={formData.id_task}
                onChange={handleChange}
                className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 appearance-none"
              >
                <option value="">Seleccione un servicio</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
              <MdHomeRepairService className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              {errors.id_task && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center">
                  <span className="mr-1.5">•</span>
                  {errors.id_task}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="id_client"
                value={formData.id_client}
                onChange={handleChange}
                className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 appearance-none"
              >
                <option value="">Seleccione un cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
              <BsBuildingsFill className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              {errors.id_client && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center">
                  <span className="mr-1.5">•</span>
                  {errors.id_client}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}