import React from 'react';
import ActivateAlert, { AlertType } from './ActivateAlerts';
import { HiOutlineRefresh, HiOutlineTrash, HiOutlineBan, HiOutlineCheck } from 'react-icons/hi';

// Props comunes para todos los alerts
interface CommonAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  itemName?: string; // Nombre del elemento a activar/desactivar/eliminar
}

/**
 * Alerta para activar un elemento
 */
export const ActivateItemAlert: React.FC<CommonAlertProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isLoading,
  itemName = 'elemento'
}) => (
  <ActivateAlert
    open={open}
    onOpenChange={onOpenChange}
    title={`Activar ${itemName}`}
    description={`¿Estás seguro de que deseas activar este ${itemName}? Esta acción lo hará disponible en el sistema.`}
    type="success"
    icon={<HiOutlineRefresh className="h-10 w-10 text-green-500" />}
    confirmText="Sí, activar"
    cancelText="Cancelar"
    onConfirm={onConfirm}
    onCancel={onCancel}
    isLoading={isLoading}
  />
);

/**
 * Alerta para desactivar un elemento
 */
export const DeactivateItemAlert: React.FC<CommonAlertProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isLoading,
  itemName = 'elemento'
}) => (
  <ActivateAlert
    open={open}
    onOpenChange={onOpenChange}
    title={`Desactivar ${itemName}`}
    description={`¿Estás seguro de que deseas desactivar este ${itemName}? Esto lo hará no disponible pero no se eliminará.`}
    type="warning"
    icon={<HiOutlineBan className="h-10 w-10 text-amber-500" />}
    confirmText="Sí, desactivar"
    cancelText="Cancelar"
    onConfirm={onConfirm}
    onCancel={onCancel}
    isLoading={isLoading}
  />
);

/**
 * Alerta para eliminar un elemento
 */
export const DeleteItemAlert: React.FC<CommonAlertProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isLoading,
  itemName = 'elemento'
}) => (
  <ActivateAlert
    open={open}
    onOpenChange={onOpenChange}
    title={`Eliminar ${itemName}`}
    description={`¿Estás seguro de que deseas eliminar este ${itemName}? Esta acción no se puede deshacer.`}
    type="error"
    icon={<HiOutlineTrash className="h-10 w-10 text-red-500" />}
    confirmText="Sí, eliminar"
    cancelText="Cancelar"
    onConfirm={onConfirm}
    onCancel={onCancel}
    isLoading={isLoading}
  />
);

/**
 * Alerta para confirmar una acción genérica
 */
export const ConfirmActionAlert: React.FC<CommonAlertProps & { 
  title: string;
  description?: string;
  confirmText?: string;
  type?: AlertType;
}> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirmar',
  type = 'question',
  onConfirm,
  onCancel,
  isLoading
}) => (
  <ActivateAlert
    open={open}
    onOpenChange={onOpenChange}
    title={title}
    description={description}
    type={type}
    confirmText={confirmText}
    cancelText="Cancelar"
    onConfirm={onConfirm}
    onCancel={onCancel}
    isLoading={isLoading}
  />
);