import { useEffect, useState, useRef } from "react";
import { useProgramming } from "@/contexts/ProgrammingContext";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  formatDate,
  getMinutesBetween,
  isDateBefore,
} from "../utils/formatDate";
import { isSameDay } from "date-fns";

// Claves para almacenamiento en localStorage
const CHECKED_IDS_KEY = "programming_notified_ids";
const DELETED_NOTIFICATION_KEYS = "deleted_notification_keys";

// Variables globales para evitar bucles infinitos
let LAST_CHECK_TIMESTAMP = 0;
const THROTTLE_TIME = 30000; // 30 segundos entre verificaciones

export function useOverdueProgrammingNotifications() {
  const { programming, isLoading } = useProgramming();
  const { addNotification, addAlert } = useNotifications();
  const [overdueCount, setOverdueCount] = useState(0);

  // Usar ref para almacenar los IDs ya revisados
  const checkedProgrammingIdsRef = useRef<Set<number>>(new Set());
  const initialNotificationSentRef = useRef<boolean>(false);

  // Cargar IDs verificados previamente desde localStorage
  useEffect(() => {
    try {
      const savedIds = localStorage.getItem(CHECKED_IDS_KEY);
      if (savedIds) {
        checkedProgrammingIdsRef.current = new Set(JSON.parse(savedIds));
        console.log(
          "[ProgrammingNotifications] Cargados IDs ya notificados:",
          checkedProgrammingIdsRef.current.size
        );
      }
    } catch (e) {
      console.error("Error al cargar IDs notificados:", e);
    }
  }, []);

  // Guardar IDs verificados en localStorage cuando cambien
  const saveCheckedIds = () => {
    try {
      const idsArray = Array.from(checkedProgrammingIdsRef.current);
      localStorage.setItem(CHECKED_IDS_KEY, JSON.stringify(idsArray));
    } catch (e) {
      console.error("Error al guardar IDs notificados:", e);
    }
  };

  // Verificar si una clave de notificación fue eliminada manualmente
  const isNotificationKeyDeleted = (key: string): boolean => {
    try {
      const deletedKeys = localStorage.getItem(DELETED_NOTIFICATION_KEYS);
      if (!deletedKeys) return false;

      const deletedKeysSet = new Set(JSON.parse(deletedKeys));
      return deletedKeysSet.has(key);
    } catch (e) {
      console.error("Error al verificar claves eliminadas:", e);
      return false;
    }
  };

  // Función para limpiar IDs verificados
  const resetCheckedIds = () => {
    try {
      console.log("[ProgrammingNotifications] Limpiando IDs notificados");
      checkedProgrammingIdsRef.current = new Set();
      localStorage.removeItem(CHECKED_IDS_KEY);
      initialNotificationSentRef.current = false;
    } catch (e) {
      console.error("Error al limpiar IDs notificados:", e);
    }
  };

  useEffect(() => {
    // Evitar múltiples ejecuciones en un intervalo corto de tiempo
    const now = Date.now();
    if (now - LAST_CHECK_TIMESTAMP < THROTTLE_TIME) {
      console.log(
        "[ProgrammingNotifications] Omitiendo verificación (throttling)"
      );
      return;
    }

    // Solo ejecutar cuando programming esté cargado y no esté vacío
    if (!isLoading && programming.length > 0) {
      LAST_CHECK_TIMESTAMP = now;
      console.log("[ProgrammingNotifications] Generando notificación inicial");

      // Clave para la notificación de resumen
      const summaryKey = "programming-summary";

      // Solo mostrar si no ha sido eliminada manualmente
      if (
        !isNotificationKeyDeleted(summaryKey) &&
        !initialNotificationSentRef.current
      ) {
        // Marcar que la notificación inicial ya fue enviada
        initialNotificationSentRef.current = true;
      }

      // Verificar programaciones vencidas con un pequeño retraso
      setTimeout(() => {
        checkOverdueProgramming();
      }, 1000);
    }
  }, [isLoading, programming, addNotification]);

  // Función para verificar programaciones vencidas y pendientes
  const checkOverdueProgramming = () => {
    console.log("[ProgrammingNotifications] Verificando programaciones");

    // Fecha y hora actual en Colombia - CORREGIDA
    const colombiaTime = new Date().toLocaleString("en-US", {
      timeZone: "America/Bogota",
    });
    const nowInColombia = new Date(colombiaTime);

    console.log(
      `[ProgrammingNotifications] Hora actual Colombia: ${nowInColombia.toLocaleString()}`
    );

    // Evitar generar muchas notificaciones en un solo batch
    let notificationCount = 0;
    const MAX_NOTIFICATIONS = 5;

    // Arrays para separar programaciones por categoría
    const pastDaysServices: any[] = []; // Días anteriores (ayer o antes)
    const todayOverdueServices: any[] = []; // Hoy, pero ya pasó la hora
    const todayPendingServices: any[] = []; // Hoy, aún no llega la hora
    const futureDaysServices: any[] = []; // Mañana o después

    // Verificar si ya se ha enviado alerta para un ID
    const hasImmientAlertBeenSent = (id: number): boolean => {
      try {
        const sentAlertsStr = localStorage.getItem("imminent_alerts");
        if (!sentAlertsStr) return false;

        const sentAlerts = JSON.parse(sentAlertsStr);
        return sentAlerts.includes(id);
      } catch (e) {
        console.error("Error al verificar alertas inminentes:", e);
        return false;
      }
    };

    // Marcar alerta como enviada
    const markImmientAlertAsSent = (id: number): void => {
      try {
        const sentAlertsStr = localStorage.getItem("imminent_alerts");
        const sentAlerts = sentAlertsStr ? JSON.parse(sentAlertsStr) : [];

        if (!sentAlerts.includes(id)) {
          sentAlerts.push(id);
          localStorage.setItem("imminent_alerts", JSON.stringify(sentAlerts));
        }
      } catch (e) {
        console.error("Error al guardar alerta inminente:", e);
      }
    };

    // Filtrar y clasificar programaciones
    programming.forEach((prog) => {
      if (!prog.dateStart || !prog.id || prog.status !== "UNASSIGNED") {
        return;
      }

      if (checkedProgrammingIdsRef.current.has(prog.id)) {
        return;
      }

      try {
        // CORRECCIÓN: Interpretar explícitamente en zona horaria
        const originalDate = new Date(prog.dateStart);
        const dateStr = originalDate.toISOString().split("T")[0]; // YYYY-MM-DD

        // Obtener la hora de programación
        const timeOnly = prog.timeStart || "00:00";
        const [hours, minutes] = timeOnly.split(":").map(Number);

        // Crear fecha en Colombia con hora correcta
        const scheduledDateTimeStr = `${dateStr}T${hours
          .toString()
          .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
        const scheduledDateTime = new Date(scheduledDateTimeStr);

        console.log(
          `[ProgrammingNotifications] Servicio ${
            prog.id
          } programado para: ${scheduledDateTime.toLocaleString()}`
        );

        // Clasificar según la fecha
        if (isDateBefore(scheduledDateTime, nowInColombia)) {
          // Es de un día anterior (ayer o antes)
          pastDaysServices.push(prog);
        } else if (isSameDay(scheduledDateTime, nowInColombia)) {
          // Es para HOY
          if (scheduledDateTime < nowInColombia) {
            // Ya pasó la hora
            todayOverdueServices.push(prog);
          } else {
            // Aún no llega la hora
            todayPendingServices.push(prog);
          }
        } else {
          // Es para mañana o después
          futureDaysServices.push(prog);

          // Verificar si está a punto de comenzar (5 minutos o menos)
          const minutesToStart = getMinutesBetween(
            scheduledDateTime,
            nowInColombia
          );

          if (minutesToStart <= 5 && !hasImmientAlertBeenSent(prog.id)) {
            console.log(
              `[ProgrammingNotifications] Servicio inminente: ${prog.id}, faltan ${minutesToStart} minutos`
            );

            // Crear alerta especial con mayor prioridad
            const alertKey = `imminent-${prog.id}`;

            if (!isNotificationKeyDeleted(alertKey)) {
              addAlert({
                title: "⏰ ¡Servicio a punto de comenzar!",
                message: `${prog.service || "Servicio"} (${
                  prog.service_request || "Sin referencia"
                }) 
                    programado para hoy a las ${prog.timeStart || "00:00"} 
                    comenzará en ${minutesToStart} minuto${
                  minutesToStart !== 1 ? "s" : ""
                }.`,
                type: "warning",
                key: alertKey,
                priority: 10, // Alta prioridad
              });

              // Marcar como enviada para no repetir
              markImmientAlertAsSent(prog.id);
            }
          }
        }
      } catch (error) {
        console.error(`Error al analizar fecha y hora:`, error, prog);
      }
    });

    console.log(`[ProgrammingNotifications] Encontrados: 
      - ${pastDaysServices.length} servicios de días anteriores
      - ${todayOverdueServices.length} servicios vencidos de hoy
      - ${todayPendingServices.length} servicios pendientes de hoy
      - ${futureDaysServices.length} servicios para días futuros`);

    // 1. NOTIFICACIONES PARA SERVICIOS DE DÍAS ANTERIORES
    pastDaysServices.forEach((prog) => {
      if (notificationCount >= MAX_NOTIFICATIONS) return;

      const notificationKey = `past-${prog.id}`;
      if (isNotificationKeyDeleted(notificationKey)) return;

      if (prog.id) {
        checkedProgrammingIdsRef.current.add(prog.id);
      }

      addNotification({
        title: "⚠️ Servicio no programado (vencido)",
        message: `${prog.service || "Servicio"} (${
          prog.service_request || "Sin referencia"
        }) programado para ${formatDate(prog.dateStart)} - ${
          prog.timeStart || "00:00"
        } venció sin asignar.`,
        type: "error",
        key: notificationKey,
      });

      notificationCount++;
    });

    // 2. NOTIFICACIONES PARA SERVICIOS VENCIDOS DE HOY
    todayOverdueServices.forEach((prog) => {
      if (notificationCount >= MAX_NOTIFICATIONS) return;

      const notificationKey = `today-overdue-${prog.id}`;
      if (isNotificationKeyDeleted(notificationKey)) return;

      if (prog.id) {
        checkedProgrammingIdsRef.current.add(prog.id);
      }

      addNotification({
        title: "⏱️ Servicio no programado a tiempo (hoy)",
        message: `${prog.service || "Servicio"} (${
          prog.service_request || "Sin referencia"
        }) programado para hoy a las ${prog.timeStart || "00:00"} ya pasó.`,
        type: "error",
        key: notificationKey,
      });

      addAlert({
        title: "Servicio no programado a tiempo",
        message: `El servicio ${prog.service || "Servicio"} (${
          prog.service_request || "Sin referencia"
        }) programado para hoy a las ${prog.timeStart || "00:00"} ya pasó.`,
          type: "error",
                  key: `alert-today-overdue-${prog.id}`,                          
      })

      notificationCount++;
    });

    // 3. NOTIFICACIONES PARA SERVICIOS PENDIENTES DE HOY
    todayPendingServices.forEach((prog) => {
      if (notificationCount >= MAX_NOTIFICATIONS) return;

      const notificationKey = `today-pending-${prog.id}`;
      if (isNotificationKeyDeleted(notificationKey)) return;

      if (prog.id) {
        checkedProgrammingIdsRef.current.add(prog.id);
      }

      addNotification({
        title: "🕒 Servicio pendiente para hoy",
        message: `${prog.service || "Servicio"} (${
          prog.service_request || "Sin referencia"
        }) debe ser programado para hoy a las ${prog.timeStart || "00:00"}.`,
        type: "warning",
        key: notificationKey,
      });

      addAlert({
        title: "🔔 Alerta de programación pendiente",
        message: `El servicio ${prog.service || "Servicio"} (${
          prog.service_request || "Sin referencia"
        }) debe ser programado para hoy a las ${prog.timeStart || "00:00"}.`,
        type: "warning",
        key: `alert-today-pending-${prog.id}`,
        priority: 5, // Prioridad normal
      });

      notificationCount++;
    });

    // Guardar los IDs verificados
    saveCheckedIds();

    // RESUMEN POR CATEGORÍAS (una sola vez por categoría)

    // 1. Resumen días anteriores
    if (pastDaysServices.length > 0) {
      const summaryKey = "programming-past-summary";
      if (!isNotificationKeyDeleted(summaryKey)) {
        addNotification({
          title: "📊 Programaciones vencidas",
          message: `Hay ${pastDaysServices.length} servicios de días anteriores sin asignar.`,
          type: "error",
          key: summaryKey,
        });
      }
    }

    // 2. Resumen de hoy (vencidos + pendientes)
    if (todayOverdueServices.length > 0 || todayPendingServices.length > 0) {
      const summaryKey = "programming-today-summary";
      if (!isNotificationKeyDeleted(summaryKey)) {
        addNotification({
          title: "📆 Programaciones para hoy",
          message: `Hay ${todayOverdueServices.length} servicios vencidos y ${todayPendingServices.length} pendientes para hoy.`,
          type: "warning",
          key: summaryKey,
        });
      }
    }

    // 3. Resumen días futuros (solo si hay)
    if (futureDaysServices.length > 0) {
      const summaryKey = "programming-future-summary";
      if (!isNotificationKeyDeleted(summaryKey)) {
        addNotification({
          title: "🔄 Próximas programaciones",
          message: `Hay ${futureDaysServices.length} servicios para programar en días futuros.`,
          type: "info",
          key: summaryKey,
        });
      }
    }

    // Actualizar el contador total (servicios vencidos)
    setOverdueCount(pastDaysServices.length + todayOverdueServices.length);
  };

  return {
    overdueCount,
    checkNow: () => {
      // Permitir forzar una nueva verificación
      LAST_CHECK_TIMESTAMP = 0; // Reset throttling
      checkOverdueProgramming();
    },
    resetNotifications: resetCheckedIds, // Exponer función para reiniciar notificaciones
  };
}
