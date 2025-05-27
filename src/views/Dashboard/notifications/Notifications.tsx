import { useNotifications } from "@/contexts/NotificationContext";
import { HiOutlineBell, HiOutlineCheck, HiX, HiOutlineTrash } from "react-icons/hi";
import { useOverdueProgrammingNotifications } from "@/lib/hooks/useProgrammingNotifications";
import { RiAlarmWarningLine } from "react-icons/ri";
import { formatLocalTimeToElegant } from "@/lib/utils/formatDate";
import { useEffect } from "react";

export default function Notifications() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll,
    removeDuplicates, 
  } = useNotifications();

  useOverdueProgrammingNotifications();

    useEffect(() => {
    removeDuplicates();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Notificaciones</h1>
        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
            disabled={unreadCount === 0}
          >
            Marcar todas como leídas
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            <HiOutlineTrash className="h-4 w-4" />
            Limpiar todas
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <HiOutlineBell className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No tienes notificaciones</h3>
            <p className="text-gray-500">Las notificaciones aparecerán aquí cuando haya actualizaciones importantes.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <p className={`text-sm font-medium ${
                        !notification.read ? "text-blue-800" : "text-gray-800"
                      }`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatLocalTimeToElegant(notification.time)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                    <div className="mt-2 flex space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors flex items-center"
                        >
                          <HiOutlineCheck className="mr-1 h-3 w-3" />
                          Marcar como leída
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors flex items-center"
                      >
                        <HiX className="mr-1 h-3 w-3" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "success":
      return <div className="p-2 bg-green-100 rounded-full"><HiOutlineCheck className="h-5 w-5 text-green-600" /></div>;
    case "warning":
      return <div className="p-2 bg-amber-100 rounded-full"><RiAlarmWarningLine className="h-5 w-5 text-amber-600" /></div>; 
    case "error":
      return <div className="p-2 bg-red-100 rounded-full"><HiX className="h-5 w-5 text-red-600" /></div>;
    default:
      return <div className="p-2 bg-blue-100 rounded-full"><HiOutlineBell className="h-5 w-5 text-blue-600" /></div>;
  }
}