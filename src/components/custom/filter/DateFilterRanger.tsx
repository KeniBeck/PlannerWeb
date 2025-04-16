import { useRef, useState, useEffect } from "react";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import {
  format,
  parse,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isAfter,
  isBefore,
  addDays,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const DateRangeFilter = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label = "Rango de fechas",
  className = "",
}: DateRangeFilterProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectionMode, setSelectionMode] = useState<"start" | "end" | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Referencia para almacenar valores previos y prevenir bucles
  const prevStartDateRef = useRef(startDate);
  const isInitialMount = useRef(true);

  // Convertir las fechas string a objetos Date
  const selectedStartDate = startDate ? parse(startDate, "yyyy-MM-dd", new Date()) : null;
  const selectedEndDate = endDate ? parse(endDate, "yyyy-MM-dd", new Date()) : null;

  // Función para formatear la fecha para mostrar al usuario
  const formatDisplayDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return format(parse(dateString, "yyyy-MM-dd", new Date()), "dd/MM/yyyy", {
        locale: es,
      });
    } catch (e) {
      return dateString;
    }
  };

  // Obtener días del mes actual
  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  // Obtener día de la semana (0-6) del primer día del mes
  const getFirstDayOfMonth = () => {
    return getDay(startOfMonth(currentMonth));
  };

  // Manejar selección de fecha
  const handleDateClick = (day: Date) => {
    // Formatear fecha seleccionada
    const formattedDate = format(day, "yyyy-MM-dd");

    if (!selectionMode || selectionMode === "start") {
      // Si estamos seleccionando la fecha de inicio o no hay modo
      onStartDateChange(formattedDate);
      
      // Si también hay una fecha final y la nueva fecha inicial es posterior a la final,
      // resetear la fecha final
      if (selectedEndDate && isAfter(day, selectedEndDate)) {
        onEndDateChange("");
      }
      
      // Cambiar al modo de selección final
      setSelectionMode("end");
    } else {
      // Si estamos seleccionando la fecha final
      // Asegurar que la fecha final es igual o posterior a la inicial
      if (selectedStartDate && isBefore(day, selectedStartDate)) {
        // Si el usuario selecciona una fecha anterior a la inicial en modo "end",
        // consideramos que quiere invertir el rango
        onEndDateChange(startDate);
        onStartDateChange(formattedDate);
      } else {
        onEndDateChange(formattedDate);
      }
      
      // Restablecer el modo después de seleccionar la fecha final
      setSelectionMode(null);
      setIsCalendarOpen(false);
    }
  };

  // Ir al mes anterior
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Ir al mes siguiente
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Cerrar el calendario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isCalendarOpen &&
        calendarRef.current &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
        setSelectionMode(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Si hay una fecha inicial seleccionada, ajustar el mes actual
  // Este es el efecto que está causando el problema
  useEffect(() => {
    // No ajustar el mes en el montaje inicial
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevStartDateRef.current = startDate;
      return;
    }
    
    // Solo actualizar si la fecha cambió y el calendario está cerrado
    // o si es la primera vez que se establece una fecha
    const startDateChanged = startDate !== prevStartDateRef.current;
    
    if (startDateChanged && !isCalendarOpen && selectedStartDate) {
      setCurrentMonth(selectedStartDate);
      prevStartDateRef.current = startDate;
    }
  }, [startDate, selectedStartDate, isCalendarOpen]);

  // Nombres de los días de la semana
  const weekDays = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

  // Mostrar el texto del rango en el input
  const getDisplayText = () => {
    if (!startDate && !endDate) return label;
    
    if (startDate && !endDate) {
      return `Desde ${formatDisplayDate(startDate)}`;
    }
    
    if (!startDate && endDate) {
      return `Hasta ${formatDisplayDate(endDate)}`;
    }
    
    return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
  };

  // Establecer texto guía según modo de selección
  const getSelectionModeText = () => {
    if (selectionMode === "start") return "Selecciona fecha inicial";
    if (selectionMode === "end") return "Selecciona fecha final";
    return "";
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className={`
          relative flex items-center border rounded-lg
          ${isCalendarOpen ? "border-blue-500 ring-2 ring-blue-200 bg-white" : "border-blue-200 bg-blue-50"}
          transition-all duration-200 cursor-pointer
        `}
        onClick={() => {
          setIsCalendarOpen(!isCalendarOpen);
          setSelectionMode(!startDate ? "start" : "end");
        }}
      >
        <div className="absolute left-3">
          <FiCalendar
            className={`h-5 w-5 ${isCalendarOpen ? "text-blue-600" : "text-blue-500"}`}
          />
        </div>

        <div className="pl-10 pr-3 py-3 w-full flex justify-between items-center">
          <span
            className={
              startDate || endDate ? "text-gray-800 font-medium" : "text-gray-500"
            }
          >
            {getDisplayText()}
          </span>
          
          {/* Botón para borrar las fechas si hay alguna seleccionada */}
          {(startDate || endDate) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartDateChange("");
                onEndDateChange("");
                setSelectionMode("start");
              }}
              className="ml-2 text-gray-400 hover:text-red-500"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Calendario personalizado */}
      {isCalendarOpen && (
        <div
          ref={calendarRef}
          className="absolute z-50 mt-1 w-[320px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
        >
          {/* Resto del código se mantiene igual... */}
          {/* Modo de selección actual */}
          {selectionMode && (
            <div className="bg-blue-50 text-blue-700 text-center text-sm font-medium py-1 border-b border-blue-100">
              {getSelectionModeText()}
            </div>
          )}
          
          {/* Encabezado del calendario */}
          <div className="flex items-center justify-between bg-blue-500 text-white p-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevMonth();
              }}
              className="p-1 rounded-full hover:bg-blue-600 transition-colors"
            >
              <FiChevronLeft size={20} />
            </button>

            <h3 className="font-medium">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h3>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextMonth();
              }}
              className="p-1 rounded-full hover:bg-blue-600 transition-colors"
            >
              <FiChevronRight size={20} />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 p-2 bg-gray-50 border-b border-gray-200">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="text-center text-sm font-medium text-gray-600 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {/* Espacios vacíos hasta el primer día del mes */}
            {Array.from({ length: getFirstDayOfMonth() }).map((_, index) => (
              <div key={`empty-${index}`} className="h-9"></div>
            ))}

            {/* Días del mes */}
            {getDaysInMonth().map((day) => {
              const isSelectedStart = selectedStartDate && isSameDay(day, selectedStartDate);
              const isSelectedEnd = selectedEndDate && isSameDay(day, selectedEndDate);
              const isInRange = selectedStartDate && selectedEndDate && 
                isAfter(day, selectedStartDate) && 
                isBefore(day, selectedEndDate);
              const isDayToday = isToday(day);
              const dayFormatted = format(day, "d");

              return (
                <div
                  key={day.toString()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDateClick(day);
                  }}
                  className={`
                    h-9 flex items-center justify-center rounded-md text-sm cursor-pointer transition-colors
                    ${isSelectedStart ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                    ${isSelectedEnd ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                    ${isInRange ? "bg-blue-100 hover:bg-blue-200" : ""}
                    ${isDayToday && !isSelectedStart && !isSelectedEnd && !isInRange ? "border border-blue-400 font-bold" : ""}
                    ${!isSelectedStart && !isSelectedEnd && !isInRange ? "hover:bg-blue-100" : ""}
                  `}
                >
                  {dayFormatted}
                </div>
              );
            })}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between p-2 border-t border-gray-200 bg-gray-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStartDateChange("");
                onEndDateChange("");
                setSelectionMode("start");
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              Borrar
            </button>
            <div className="space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const today = new Date();
                  const formattedToday = format(today, "yyyy-MM-dd");
                  if (selectionMode === "start" || !selectionMode) {
                    onStartDateChange(formattedToday);
                    setSelectionMode("end");
                  } else {
                    onEndDateChange(formattedToday);
                    setIsCalendarOpen(false);
                    setSelectionMode(null);
                  }
                }}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Hoy
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const today = new Date();
                  const tomorrow = addDays(today, 1);
                  
                  onStartDateChange(format(today, "yyyy-MM-dd"));
                  onEndDateChange(format(tomorrow, "yyyy-MM-dd"));
                  setIsCalendarOpen(false);
                  setSelectionMode(null);
                }}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                24h
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inputs ocultos para manejo de datos */}
      <input type="hidden" value={startDate} />
      <input type="hidden" value={endDate} />
    </div>
  );
};