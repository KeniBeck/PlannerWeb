import { FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";

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
  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const minDateTime = minDate ? new Date(minDate + "T00:00:00") : null;

  // Nombres de meses en español
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Función para formatear la fecha para mostrar al usuario
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString + "T00:00:00");
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateString;
    }
  };

  // Obtener días del mes actual
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: Date[] = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Obtener día de la semana (0-6) del primer día del mes
  const getFirstDayOfMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return new Date(year, month, 1).getDay();
  };

  // Verificar si dos fechas son el mismo día
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Verificar si una fecha es hoy
  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  // Verificar si una fecha es posterior a otra
  const isDateAfter = (date1: Date, date2: Date) => {
    // Ignorar horas, minutos, segundos
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1 > d2;
  };

  // Formatear fecha a YYYY-MM-DD
  const formatISODate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Manejar selección de fecha
  const handleDateClick = (day: Date) => {
    // Verificar si es después de la fecha mínima
    if (minDateTime && isDateAfter(minDateTime, day)) {
      return;
    }
    
    onChange(formatISODate(day));
    setIsCalendarOpen(false);
  };

  // Ir al mes anterior
  const prevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  // Ir al mes siguiente
  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
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
              type="button"
            >
              <FiChevronLeft size={20} />
            </button>
            
            <h3 className="font-medium">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                nextMonth();
              }}
              className="p-1 rounded-full hover:bg-blue-600 transition-colors"
              type="button"
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
              const isDisabled = minDateTime && isDateAfter(minDateTime, day);
              const dayFormatted = day.getDate();
              
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
              type="button"
            >
              Borrar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDateClick(new Date());
              }}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              type="button"
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