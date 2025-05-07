import { ShipLoader } from './Loading';
import ReactDOM from 'react-dom/client';
import { PiUserCircleCheckDuotone, PiShieldWarningDuotone } from "react-icons/pi";
import { TbFaceIdError } from "react-icons/tb";



export const StatusCodeAlert = (error: any) => {
  // Analizar el error para determinar el código de estado
  let statusCode;
  if (error) {
    if (error.code === "ERR_NETWORK") {
      statusCode = "ERR_NETWORK";
    } 

    if (error.statusCode) {
      statusCode = error.statusCode;
    } else if (error.response && error.response.status) {
      statusCode = error.response.status;
    }
  }

  let title = "Error";
  let message = "Ocurrió un error inesperado.";
  let type: 'success' | 'error' | 'warning' = "error";

  switch (statusCode) {
    case "ERR_NETWORK":
      title = "Error de conexión";
      message = "Verifica tu conexión a internet.";
      break;
    case 400:
      title = "Solicitud incorrecta";
      message = "Los datos enviados son incorrectos.";
      type = "warning";
      break;
    case 401:
      title = "No autorizado";
      message = "Usuario o contraseña incorrectos.";
      break;
    case 403:
      title = "Prohibido";
      message = "Acceso denegado.";
      break;
    case 404:
      title = "No encontrado";
      message = "El recurso solicitado no fue encontrado.";
      break;
    case 429:
      title = "Demasiadas solicitudes";
      message = "Has realizado demasiadas solicitudes en un corto período de tiempo.";
      type = "warning";
      break;
    case 500:
      title = "Error interno del servidor";
      message = "Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.";
      break;
    default:
      title = "Error de conexión";
      message = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
  }

  showAlert(type, title, message);
};

export const StatusSuccessAlert = (title: string, message: string) => {
  showAlert('success', title, message);
};

// Variables para controlar el timing de la alerta de carga
let isLoading = false;
let loadingStartTime: number = 0;
const MIN_LOADING_DURATION = 1000;

// Función para mostrar alertas
const showAlert = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
  const container = document.createElement('div');
  container.className = 'fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm';
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  
  root.render(
    <div className="bg-white/90 rounded-lg shadow-xl p-6 max-w-md mx-4">
      <div className="flex gap-4">
        <div className={`text-2xl ${
          type === 'success' ? 'text-green-500' :
          type === 'error' ? 'text-red-500' : 'text-yellow-500'
        }`}>
          {type === 'success' ? <PiUserCircleCheckDuotone/> : type === 'error' ? <TbFaceIdError/> : <PiShieldWarningDuotone/>}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
      <button
        onClick={() => {
          root.unmount();
          document.body.removeChild(container);
        }}
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
      >
        Aceptar
      </button>
    </div>
  );
};

// Componente para el loader
const LoaderPortal = () => {
  if (!isLoading) return null;
  return <ShipLoader />;
};

// Asegurar que existe el contenedor del loader
const ensureLoaderContainer = () => {
  let container = document.getElementById('loader-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'loader-container';
    document.body.appendChild(container);
  }
  return container;
};

export const isLoadingAlert = async (status: boolean) => {
  if (status) {
    if (isLoading) {
      loadingStartTime = Date.now();
      return;
    }

    isLoading = true;
    loadingStartTime = Date.now();
    
    const container = ensureLoaderContainer();
    const root = ReactDOM.createRoot(container);
    root.render(<LoaderPortal />);
  } else {
    if (!isLoading) return;

    const elapsed = Date.now() - loadingStartTime;
    const remainingTime = Math.max(0, MIN_LOADING_DURATION - elapsed);

    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }

    isLoading = false;
    
    const container = document.getElementById('loader-container');
    if (container) {
      const root = ReactDOM.createRoot(container);
      root.unmount();
      document.body.removeChild(container);
    }
  }
};