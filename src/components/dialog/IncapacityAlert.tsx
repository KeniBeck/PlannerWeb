import React from 'react';
import ActivateAlert from './ActivateAlerts';
import { FaHeartbeat } from 'react-icons/fa';

// Props comunes para todos los alerts relacionados con trabajadores
interface IncacacityAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  workerName?: string; // Nombre del trabajador
}


/**
 * Alerta para finalizar incapacidad de un trabajador
 */
export const EndIncapacityAlert: React.FC<IncacacityAlertProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isLoading,
  workerName = 'este trabajador'
}) => (
  <ActivateAlert
    open={open}
    onOpenChange={onOpenChange}
    title={`Finalizar incapacidad`}
    description={`¿Estás seguro de que deseas finalizar la incapacidad de ${workerName}? Esto lo marcará como disponible nuevamente.`}
    type="warning"
    icon={<FaHeartbeat className="h-10 w-10 text-amber-600" />}
    confirmText="Finalizar incapacidad"
    cancelText="Cancelar"
    onConfirm={onConfirm}
    onCancel={onCancel}
    isLoading={isLoading}
  />
);