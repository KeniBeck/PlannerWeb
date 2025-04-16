import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { format, parse, addMonths, subMonths, getDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO, isAfter } from "date-fns";
import { es } from "date-fns/locale";

interface DateFilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  className?: string;
}

export const DateFilter = ({ 
  label, 
  value, 
  onChange, 
  minDate,
  className = "" 
}: DateFilterProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convertir las fechas string a objetos Date
  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : null;
  const minDateTime = minDate ? parse(minDate, 'yyyy-MM-dd', new Date()) : null;

  // Función para formatear la fecha para mostrar al usuario
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(parse(dateString, 'yyyy-MM-dd', new Date()), 'dd MMMM yyyy', { locale: es });
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
    // Verificar si es después de la fecha mínima
    if (minDateTime && isAfter(minDateTime, day)) {
      return;
    }
    
    onChange(format(day, 'yyyy-MM-dd'));
    setIsCalendarOpen(false);
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
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Nombres de los días de la semana
  const weekDays = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        className={`
          relative flex items-center border rounded-lg
          ${isCalendarOpen ? 'border-blue-500 ring-2 ring-blue-200 bg-white' : 'border-blue-200 bg-blue-50'}
          transition-all duration-200 cursor-pointer
        `}
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
      >
        <div className="absolute left-3">
          <FiCalendar className={`h-5 w-5 ${isCalendarOpen ? 'text-blue-600' : 'text-blue-500'}`} />
        </div>
        
        <div className="pl-10 pr-3 py-3 w-full">
          <span className={value ? 'text-gray-800 font-medium' : 'text-gray-500'}>
            {value ? formatDisplayDate(value) : label}
          </span>
        </div>
      </div>

      {/* Calendario personalizado */}
      {isCalendarOpen && (
        <div 
          ref={calendarRef}
          className="absolute z-50 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
        >
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
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
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
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isDayToday = isToday(day);
              const isDisabled = minDateTime && isAfter(minDateTime, day);
              const dayFormatted = format(day, 'd');
              
              return (
                <div 
                  key={day.toString()}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDisabled) {
                      handleDateClick(day);
                    }
                  }}
                  className={`
                    h-9 flex items-center justify-center rounded-full text-sm cursor-pointer transition-colors
                    ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                    ${isDayToday && !isSelected ? 'border border-blue-400 font-bold' : ''}
                    ${!isSelected && !isDisabled ? 'hover:bg-blue-100' : ''}
                    ${isDisabled ? 'text-gray-300 cursor-not-allowed' : ''}
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
                onChange('');
                setIsCalendarOpen(false);
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              Borrar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDateClick(new Date());
              }}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Hoy
            </button>
          </div>
        </div>
      )}

      {/* Input oculto para manejo de datos */}
      <input 
        type="hidden"
        value={value}
        aria-label={label}
      />
    </div>
  );
};