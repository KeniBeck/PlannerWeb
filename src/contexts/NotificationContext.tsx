import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

// Definir el tipo de notificación
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  time: string;
  read: boolean;
  key?: string; // Clave única opcional para evitar duplicados
  isAlert?: boolean; // Indica si es una alerta especial
  priority?: number; // Prioridad de la alerta (mayor número = más importante)
  actions?: {
    label: string;
    handler: () => void;
  }[]; // Acciones disponibles para esta alerta
}

// Clave para el almacenamiento en localStorage (cambiado para evitar problemas entre pestañas)
const STORAGE_KEY = "app_notifications";
const ALERTS_STORAGE_KEY = "app_alerts";
const DELETED_KEYS_STORAGE_KEY = "deleted_notification_keys";

// Definir el contexto
interface NotificationContextType {
  notifications: Notification[];
  alerts: Notification[]; // Lista separada de alertas
  unreadCount: number;
  alertsCount: number;
  addNotification: (notification: Omit<Notification, "id" | "time" | "read">) => void;
  addAlert: (alert: Omit<Notification, "id" | "time" | "read" | "isAlert"> & { key: string }) => void; // Método específico para alertas
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  removeAlertByKey: (key: string) => void; // Eliminar alerta por su clave
  clearAll: () => void;
  clearAllAlerts: () => void; // Limpiar solo alertas
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  removeDuplicates: () => void;
  hasAlert: (key: string) => boolean; // Verificar si existe una alerta con cierta clave
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Inicializar el estado desde localStorage
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Error al cargar notificaciones:", e);
      return [];
    }
  });

  // Estado separado para alertas
  const [alerts, setAlerts] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Error al cargar alertas:", e);
      return [];
    }
  });

  const [unreadCount, setUnreadCount] = useState(0);
  const [alertsCount, setAlertsCount] = useState(0);
  const notificationsRef = useRef<Notification[]>([]);
  const alertsRef = useRef<Notification[]>([]);
  
  // Al cargar, eliminar duplicados automáticamente
  useEffect(() => {
    removeDuplicates();
  }, []);

  // Guardar en localStorage cuando cambian las notificaciones
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error("Error al guardar notificaciones:", e);
    }
  }, [notifications]);

  // Guardar en localStorage cuando cambian las alertas
  useEffect(() => {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) {
      console.error("Error al guardar alertas:", e);
    }
  }, [alerts]);

  // Actualizar el contador y la referencia cuando cambian las notificaciones
  useEffect(() => {
    const count = notifications.filter((notification) => !notification.read).length;
    setUnreadCount(count);
    notificationsRef.current = notifications;
  }, [notifications]);

  // Actualizar el contador de alertas
  useEffect(() => {
    setAlertsCount(alerts.length);
    alertsRef.current = alerts;
  }, [alerts]);

  // Función para eliminar duplicados
  const removeDuplicates = () => {
    // Eliminar duplicados en notificaciones
    const keyMap = new Map(); 
    const contentMap = new Map();
    
    const uniqueNotifications = notifications.filter((notification) => {
      if (notification.key) {
        if (keyMap.has(notification.key)) {
          return false; // Es un duplicado
        }
        keyMap.set(notification.key, true);
        return true;
      }
      
      const contentKey = notification.title + "::" + notification.message;
      if (contentMap.has(contentKey)) {
        return false; // Es un duplicado
      }
      contentMap.set(contentKey, true);
      return true;
    });
    
    if (uniqueNotifications.length < notifications.length) {
      console.log(`[NotificationContext] Eliminados ${notifications.length - uniqueNotifications.length} duplicados de notificaciones`);
      setNotifications(uniqueNotifications);
    }

    // Eliminar duplicados en alertas (solo por clave, todas las alertas deben tener clave)
    const alertKeyMap = new Map();
    const uniqueAlerts = alerts.filter((alert) => {
      if (!alert.key) return false; // Alertas sin clave se ignoran

      if (alertKeyMap.has(alert.key)) {
        return false; // Es un duplicado
      }
      alertKeyMap.set(alert.key, true);
      return true;
    });

    if (uniqueAlerts.length < alerts.length) {
      console.log(`[NotificationContext] Eliminados ${alerts.length - uniqueAlerts.length} duplicados de alertas`);
      setAlerts(uniqueAlerts);
    }
  };

  // Verificar si una clave de notificación fue eliminada manualmente
  const isNotificationKeyDeleted = (key: string): boolean => {
    try {
      const deletedKeys = localStorage.getItem(DELETED_KEYS_STORAGE_KEY);
      if (!deletedKeys) return false;
      
      const deletedKeysSet = new Set(JSON.parse(deletedKeys));
      return deletedKeysSet.has(key);
    } catch (e) {
      console.error("Error al verificar claves eliminadas:", e);
      return false;
    }
  };

  // Verificar si existe una alerta con cierta clave
  const hasAlert = (key: string): boolean => {
    return alerts.some(alert => alert.key === key);
  };

  // Agregar una nueva notificación 
  const addNotification = (
    notification: Omit<Notification, "id" | "time" | "read"> & { key?: string, isAlert?: boolean }
  ) => {
    // Las alertas se manejan de forma diferente
    if (notification.isAlert) {
      if (!notification.key) {
        console.error("[NotificationContext] Las alertas deben tener una clave única");
        return;
      }
      addAlert(notification as Omit<Notification, "id" | "time" | "read" | "isAlert"> & { key: string });
      return;
    }

    // Verificar si la notificación fue eliminada manualmente
    if (notification.key && isNotificationKeyDeleted(notification.key)) {
      console.log(`[NotificationContext] La notificación con clave '${notification.key}' fue eliminada previamente por el usuario, no se mostrará`);
      return;
    }
    
    console.log("[NotificationContext] Agregando notificación:", notification);

    // Si tiene una clave única, eliminar TODAS las existentes con esa clave
    if (notification.key) {
      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.key !== notification.key);
        
        if (filtered.length < prev.length) {
          console.log(`[NotificationContext] Eliminadas ${prev.length - filtered.length} notificaciones con clave '${notification.key}'`);
        }
        
        const newNotification: Notification = {
          ...notification,
          id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
          time: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }),
          read: false,
        };
        
        return [newNotification, ...filtered];
      });
    } else {
      // Para notificaciones sin clave, verificar duplicados por contenido
      const isDuplicate = notifications.some(
        (existingNotif) =>
          existingNotif.title === notification.title &&
          existingNotif.message === notification.message
      );

      if (isDuplicate) {
        console.log(
          "[NotificationContext] Notificación duplicada, ignorando:",
          notification
        );
        return;
      }
      
      const newNotification: Notification = {
        ...notification,
        id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        time: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }),
        read: false,
      };
      
      setNotifications((prev) => [newNotification, ...prev]);
    }
  };

  // Agregar una nueva alerta (siempre requiere clave)
  const addAlert = (
    alert: Omit<Notification, "id" | "time" | "read" | "isAlert"> & { key: string }
  ) => {
    if (!alert.key) {
      console.error("[NotificationContext] Las alertas deben tener una clave única");
      return;
    }

    // Verificar si la alerta fue eliminada manualmente
    if (isNotificationKeyDeleted(alert.key)) {
      console.log(`[NotificationContext] La alerta con clave '${alert.key}' fue eliminada previamente por el usuario, no se mostrará`);
      return;
    }

    console.log("[NotificationContext] Agregando alerta:", alert);

    // Eliminar cualquier alerta existente con la misma clave
    setAlerts((prev) => {
      const filtered = prev.filter((a) => a.key !== alert.key);
      
      if (filtered.length < prev.length) {
        console.log(`[NotificationContext] Reemplazando ${prev.length - filtered.length} alertas con clave '${alert.key}'`);
      }
      
      const newAlert: Notification = {
        ...alert,
        id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        time: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" }),
        read: false,
        isAlert: true,
      };
      
      // Ordenar por prioridad (mayor primero)
      const newAlerts = [newAlert, ...filtered].sort((a, b) => 
        (b.priority || 0) - (a.priority || 0)
      );
      
      return newAlerts;
    });
  };

  // Marcar notificación como leída
  const markAsRead = (id: string) => {
    // Intentar marcar en notificaciones
    setNotifications((prev) => {
      const updated = prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      );
      
      // Si se actualizó alguna, retornar el nuevo array
      if (JSON.stringify(updated) !== JSON.stringify(prev)) {
        return updated;
      }
      
      return prev;
    });
    
    // Intentar marcar en alertas
    setAlerts((prev) => {
      const updated = prev.map((alert) =>
        alert.id === id ? { ...alert, read: true } : alert
      );
      
      // Si se actualizó alguna, retornar el nuevo array
      if (JSON.stringify(updated) !== JSON.stringify(prev)) {
        return updated;
      }
      
      return prev;
    });
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    
    setAlerts((prev) =>
      prev.map((alert) => ({ ...alert, read: true }))
    );
  };

  // Eliminar una notificación por ID
  const removeNotification = (id: string) => {
    // Buscar primero en notificaciones regulares
    const notificationToRemove = notifications.find((n) => n.id === id);

    if (notificationToRemove) {
      // Registrar la clave si existe
      if (notificationToRemove.key) {
        registerDeletedKey(notificationToRemove.key);
      }

      // Eliminar la notificación
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
      return;
    }

    // Si no se encontró, buscar en alertas
    const alertToRemove = alerts.find((a) => a.id === id);
    
    if (alertToRemove) {
      // Registrar la clave si existe
      if (alertToRemove.key) {
        registerDeletedKey(alertToRemove.key);
      }

      // Eliminar la alerta
      setAlerts((prev) =>
        prev.filter((alert) => alert.id !== id)
      );
    }
  };

  // Eliminar alerta por clave
  const removeAlertByKey = (key: string) => {
    const alertToRemove = alerts.find((a) => a.key === key);
    
    if (alertToRemove) {
      // Registrar la clave como eliminada
      registerDeletedKey(key);
      
      // Eliminar la alerta
      setAlerts((prev) => prev.filter((alert) => alert.key !== key));
      console.log(`[NotificationContext] Eliminada alerta con clave '${key}'`);
    } else {
      console.log(`[NotificationContext] No se encontró alerta con clave '${key}'`);
    }
  };

  // Registrar una clave como eliminada
  const registerDeletedKey = (key: string) => {
    try {
      // Obtener claves eliminadas existentes
      const existingDeletedKeys = localStorage.getItem(DELETED_KEYS_STORAGE_KEY);
      const deletedKeys = existingDeletedKeys ? JSON.parse(existingDeletedKeys) : [];

      // Agregar la nueva clave eliminada
      if (!deletedKeys.includes(key)) {
        deletedKeys.push(key);
        localStorage.setItem(DELETED_KEYS_STORAGE_KEY, JSON.stringify(deletedKeys));
        console.log(`[NotificationContext] Registrando clave '${key}' como eliminada`);
      }
    } catch (e) {
      console.error("Error al registrar clave eliminada:", e);
    }
  };

  // Eliminar todas las notificaciones
  const clearAll = () => {
    setNotifications([]);
    setAlerts([]);
  };

  // Eliminar solo alertas
  const clearAllAlerts = () => {
    // Registrar todas las claves como eliminadas
    alerts.forEach(alert => {
      if (alert.key) {
        registerDeletedKey(alert.key);
      }
    });
    
    setAlerts([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        alerts,
        unreadCount,
        alertsCount,
        addNotification,
        addAlert,
        markAsRead,
        markAllAsRead,
        removeNotification,
        removeAlertByKey,
        clearAll,
        clearAllAlerts,
        setNotifications,
        removeDuplicates,
        hasAlert
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};