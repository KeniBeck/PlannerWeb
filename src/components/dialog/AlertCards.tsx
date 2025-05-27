import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { AiOutlineClose } from 'react-icons/ai';
import { MdWarning, MdInfo, MdError, MdCheckCircle } from 'react-icons/md';
import './style/AlertCard.css'; 
import { useNotificationSound } from '@/lib/hooks/useNotificationsSound';

const AlertCards: React.FC = () => {
  const { alerts, removeNotification } = useNotifications();
  useNotificationSound(alerts);

  // Si no hay alertas, no mostrar nada
  if (!alerts || alerts.length === 0) {
    return null;
  }

  // Función para obtener el icono según el tipo
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <MdError className="text-red-500" size={20} />;
      case 'warning':
        return <MdWarning className="text-orange-500" size={20} />;
      case 'success':
        return <MdCheckCircle className="text-green-500" size={20} />;
      case 'info':
      default:
        return <MdInfo className="text-blue-500" size={20} />;
    }
  };

  // Función para obtener los colores del borde según el tipo
  const getBorderColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  // Función para obtener la prioridad visual y animación
  const getPriorityClass = (priority: number = 0) => {
    if (priority >= 10) return 'ring-2 ring-red-400 shadow-lg animate-pulse-soft-urgent';
    if (priority >= 5) return 'ring-1 ring-orange-300 shadow-md animate-pulse-soft-medium';
    return 'shadow-sm animate-pulse-soft-low';
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {alerts
        .sort((a, b) => (b.priority || 0) - (a.priority || 0)) // Ordenar por prioridad
        .map((alert) => (
          <div
            key={alert.id}
            className={`
              relative p-4 rounded-lg border-l-4 transition-all duration-300 ease-in-out
              transform hover:scale-105 hover:shadow-xl hover:animate-none
              ${getBorderColor(alert.type)}
              ${getPriorityClass(alert.priority)}
              animate-slide-in-right
            `}
            style={{
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            {/* Botón de cerrar */}
            <button
              onClick={() => removeNotification(alert.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors z-10"
              title="Cerrar alerta"
            >
              <AiOutlineClose size={14} className="text-gray-500" />
            </button>

            {/* Contenido de la alerta */}
            <div className="flex items-start space-x-3 pr-6">
              {/* Icono con palpitación suave */}
              <div className="flex-shrink-0 mt-0.5">
                <div className={`${alert.priority && alert.priority >= 8 ? 'animate-pulse-icon' : ''}`}>
                  {getAlertIcon(alert.type)}
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                {/* Título */}
                <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                  {alert.title}
                </h4>

                {/* Mensaje */}
                <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                  {alert.message}
                </p>

                {/* Hora y prioridad */}
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{alert.time}</span>
                  {alert.priority && alert.priority >= 8 && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium animate-pulse-badge">
                      Urgente
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Indicador de prioridad lateral con palpitación */}
            {alert.priority && alert.priority >= 10 && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-lg animate-pulse-border"></div>
            )}
          </div>
        ))}

      {/* Indicador de cantidad si hay muchas alertas */}
      {alerts.length > 3 && (
        <div className="text-center">
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
            +{alerts.length - 3} alertas más
          </span>
        </div>
      )}
    </div>
  );
};

export default AlertCards;