import React, { Fragment, useRef, useEffect } from 'react';
import { BsCheckCircle, BsXCircle, BsExclamationTriangle, BsQuestionCircle, BsInfoCircle, BsX } from 'react-icons/bs';

// Tipos de alertas disponibles
export type AlertType = 'success' | 'error' | 'warning' | 'question' | 'info' | 'custom';

// Props del componente
export interface ActivateAlertProps {
  open: boolean;                        // Controla la visibilidad del diálogo
  onOpenChange: (open: boolean) => void; // Función para cambiar el estado de visibilidad
  title: string;                        // Título del diálogo
  description?: string;                 // Descripción detallada (opcional)
  type?: AlertType;                     // Tipo de alerta (determina color e icono por defecto)
  icon?: React.ReactNode;               // Icono personalizado (opcional)
  confirmText?: string;                 // Texto del botón de confirmación
  cancelText?: string;                  // Texto del botón de cancelación
  onConfirm: () => void;                // Función a ejecutar al confirmar
  onCancel?: () => void;                // Función a ejecutar al cancelar (opcional)
  isLoading?: boolean;                  // Estado de carga (opcional)
  confirmColor?: string;                // Color del botón de confirmación
  cancelColor?: string;                 // Color del botón de cancelación
  iconColor?: string;                   // Color del icono
}

const ActivateAlert: React.FC<ActivateAlertProps> = ({
  open,
  onOpenChange,
  title,
  description,
  type = 'question',
  icon,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false,
  confirmColor,
  cancelColor,
  iconColor,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar cuando se hace clic fuera del modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  // Determinar icono por defecto según el tipo de alerta
  const getDefaultIcon = () => {
    switch (type) {
      case 'success':
        return <BsCheckCircle className="h-10 w-10 text-green-500" />;
      case 'error':
        return <BsXCircle className="h-10 w-10 text-red-500" />;
      case 'warning':
        return <BsExclamationTriangle className="h-10 w-10 text-amber-500" />;
      case 'question':
        return <BsQuestionCircle className="h-10 w-10 text-blue-500" />;
      case 'info':
        return <BsInfoCircle className="h-10 w-10 text-blue-400" />;
      default:
        return null;
    }
  };

  // Determinar colores de botones según el tipo
  const getDefaultConfirmColor = () => {
    if (confirmColor) return confirmColor;

    switch (type) {
      case 'success': return 'bg-green-600 hover:bg-green-700';
      case 'error': return 'bg-red-600 hover:bg-red-700';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700';
      case 'question': return 'bg-blue-600 hover:bg-blue-700';
      case 'info': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-green-600 hover:bg-green-700';
    }
  };

  // Manejar cierre del diálogo
  const handleClose = () => {
    onOpenChange(false);
    onCancel && onCancel();
  };

  // Manejar confirmación
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  // Renderizar icono
  const renderIcon = () => {
    if (icon) {
      return (
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${iconColor || ''}`}>
          {icon}
        </div>
      );
    }

    const defaultIcon = getDefaultIcon();
    if (defaultIcon) {
      return (
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full">
          {defaultIcon}
        </div>
      );
    }

    return null;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto relative"
      >
        {/* Botón para cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 focus:outline-none"
          disabled={isLoading}
        >
          <BsX className="w-6 h-6" />
        </button>

        {/* Contenido */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Icono */}
            {renderIcon()}
            
            {/* Título */}
            <h3 className="text-center text-xl font-semibold pt-4">
              {title}
            </h3>
            
            {/* Descripción */}
            {description && (
              <p className="text-center text-gray-600">
                {description}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex flex-row justify-center gap-3 mt-6">
            {cancelText && (
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md border ${
                  cancelColor || 'border-gray-300 hover:bg-gray-50 text-gray-700'
                } focus:outline-none disabled:opacity-50`}
              >
                {cancelText}
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-md text-white ${getDefaultConfirmColor()} focus:outline-none disabled:opacity-50`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivateAlert;