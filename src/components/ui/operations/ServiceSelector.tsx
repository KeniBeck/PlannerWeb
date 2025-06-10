import { useState, useRef, useEffect } from "react";
import { HiOutlineSearch, HiChevronDown, HiCheck } from "react-icons/hi";
import { Service } from "@/core/model/service";

interface ServiceSelectorProps {
  services: Service[];
  value: number | null;
  onChange: (serviceId: number | null) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  value,
  onChange,
  placeholder = "Seleccionar servicio",
  required = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredServices, setFilteredServices] = useState<Service[]>(services);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filtrar servicios basado en el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredServices(services);
    } else {
      const filtered = services.filter((service) => {
        if (service?.name) {
          return service.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
      setFilteredServices(filtered);
    }
  }, [searchTerm, services]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Obtener el servicio seleccionado
  const selectedService = services.find((service) => service.id === value);

  // Manejar selección de servicio
  const handleServiceSelect = (serviceId: number | null) => {
    onChange(serviceId);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Abrir dropdown y enfocar el input de búsqueda
  const handleDropdownOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Button/Trigger */}
      <button
        type="button"
        onClick={handleDropdownOpen}
        className={`w-full px-3 py-2 text-sm text-left bg-gray-50 border border-gray-300 rounded-lg 
          focus:border-blue-500 focus:ring focus:ring-blue-200 transition
          flex items-center justify-between hover:bg-gray-100
          ${!selectedService ? "text-gray-500" : "text-gray-900"}
        `}
      >
        <span className="truncate">
          {selectedService ? selectedService.name : placeholder}
          {required && !selectedService && <span className="text-red-500 ml-1">*</span>}
        </span>
        <HiChevronDown 
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* Search Header */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar servicios..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md 
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto">
            {/* Opción para limpiar selección */}
            {!required && (
              <button
                type="button"
                onClick={() => handleServiceSelect(null)}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center justify-between
                  ${!selectedService ? "bg-blue-50 text-blue-600" : "text-gray-700"}
                `}
              >
                <span className="italic">Sin seleccionar</span>
                {!selectedService && <HiCheck className="h-4 w-4 text-blue-600" />}
              </button>
            )}

            {/* Lista de servicios filtrados */}
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceSelect(service.id)}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 
                    flex items-center justify-between transition-colors
                    ${selectedService?.id === service.id ? "bg-blue-50 text-blue-600" : "text-gray-700"}
                  `}
                >
                  <span className="truncate">{service.name}</span>
                  {selectedService?.id === service.id && (
                    <HiCheck className="h-4 w-4 text-blue-600 flex-shrink-0 ml-2" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                {searchTerm 
                  ? `No se encontraron servicios para "${searchTerm}"`
                  : "No hay servicios disponibles"
                }
              </div>
            )}
          </div>

          {/* Footer con información adicional si hay muchos resultados */}
          {filteredServices.length > 0 && searchTerm && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
              {filteredServices.length} servicio{filteredServices.length !== 1 ? 's' : ''} encontrado{filteredServices.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
};