import React, { useRef, useEffect } from 'react';
import { DateRangeFilter } from './DateFilterRanger';
import { addDays, format } from 'date-fns';

interface FaultDateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const FaultDateRangeFilter: React.FC<FaultDateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label = "Rango de fechas",
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Función para interceptar el botón "Hoy" en el componente original
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Buscar botones "Hoy" en el componente después de renderizarlo
    const observer = new MutationObserver(() => {
      const todayButtons = containerRef.current?.querySelectorAll('button');
      
      todayButtons?.forEach(button => {
        // Si encontramos un botón que dice "Hoy", modificar su comportamiento
        if (button.textContent?.includes('Hoy') && !button.dataset.modified) {
          // Marcar el botón como modificado para evitar múltiples listeners
          button.dataset.modified = 'true';
          
          // Reemplazar el event listener original
          button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Establecer rango desde hoy hasta pasado mañana
            const today = new Date();
            const dayAfterTomorrow = addDays(today, 2);
            
            // Formatear fechas como strings (YYYY-MM-DD)
            const formattedStart = format(today, 'yyyy-MM-dd');
            const formattedEnd = format(dayAfterTomorrow, 'yyyy-MM-dd');
            
            // Establecer ambas fechas
            onStartDateChange(formattedStart);
            onEndDateChange(formattedEnd);
          }, true); // Capture phase para interceptar antes del handler original
        }
      });
    });
    
    // Observar cambios en el contenedor
    observer.observe(containerRef.current, { 
      childList: true, 
      subtree: true 
    });
    
    return () => observer.disconnect();
  }, [onStartDateChange, onEndDateChange]);

  return (
    <div ref={containerRef} className={className}>
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        label={label}
        className="w-full"
      />
    </div>
  );
};