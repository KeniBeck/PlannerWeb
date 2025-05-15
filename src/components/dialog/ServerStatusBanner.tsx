import React, { useState, useEffect } from 'react';
import { TbServerOff } from "react-icons/tb";

// Almacén global para el estado del servidor
const serverStatusStore = {
  isDown: false,
  listeners: new Set<(isDown: boolean) => void>(),
  
  setStatus(isDown: boolean) {
    if (this.isDown !== isDown) {
      this.isDown = isDown;
      this.notifyListeners();
    }
  },
  
  subscribe(listener: (isDown: boolean) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },
  
  notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.isDown);
    }
  }
};

// Función para notificar desde cualquier parte de la aplicación
export const notifyServerStatus = (isDown: boolean) => {
  serverStatusStore.setStatus(isDown);
};

const ServerStatusBanner: React.FC = () => {
  // Estado de visibilidad del banner completo (cuando el servidor está caído)
  const [serverDown, setServerDown] = useState(serverStatusStore.isDown);
  // Estado para controlar si el banner está minimizado
  const [minimized, setMinimized] = useState(false);

  // Suscripción a cambios de estado del servidor
  useEffect(() => {
    const unsubscribe = serverStatusStore.subscribe((isDown) => {
      setServerDown(isDown);
      
      // Si el servidor vuelve a estar caído, mostrar el banner completo
      if (isDown) {
        setMinimized(false);
      }
    });
    
    return unsubscribe;
  }, []);

  // Si el servidor está bien, no mostrar nada
  if (!serverDown) {
    return null;
  }

  // Si está minimizado, mostrar solo el icono
  if (minimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 p-3 bg-red-600 text-white rounded-full shadow-lg z-50 cursor-pointer animate-pulse flex items-center justify-center"
        onClick={() => setMinimized(false)} 
        title="Error de conexión con el servidor"
      >
        <TbServerOff className="h-6 w-6" />
      </div>
    );
  }

  // Banner principal
  return (
    <div className="fixed top-0 inset-x-0 bg-red-600 text-white py-2 px-4 shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <TbServerOff className="h-5 w-5 mr-2" />
          <p className="text-sm font-medium">
            Estamos experimentando problemas de conexión con el servidor. Los datos podrían no estar actualizados.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-red-600 hover:bg-gray-100 px-3 py-1 rounded-md text-xs font-medium"
          >
            Reintentar
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="bg-red-500 hover:bg-red-400 px-3 py-1 rounded-md text-xs font-medium"
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerStatusBanner;