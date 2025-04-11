import Swal, { SweetAlertIcon } from 'sweetalert2';

export const StatusCodeAlert = (error: any) => {
  // Analizar el error para determinar el código de estado
  let statusCode;
  if (error.statusCode) {
    // Si el error ya tiene un statusCode definido
    statusCode = error.statusCode;
  } else if (error.response && error.response.status) {
    // Si es un error de Axios
    statusCode = error.response.status;
  } else {
    // Error desconocido
    statusCode = 0;
  }

  let title = 'Error';
  let text = 'Ocurrió un error inesperado.';
  let icon: SweetAlertIcon = 'error';
  
  switch (statusCode) {
    case 400:
      title = 'Solicitud incorrecta';
      text = 'Los datos enviados son incorrectos.';
      icon = 'warning';
      break;
    case 401:
      title = 'No autorizado';
      text = 'Usuario o contraseña incorrectos.';
      icon = 'error';
      break;
    case 403:
      title = 'Prohibido';
      text = 'Acceso denegado.';
      icon = 'error';
      break;
    case 404:
      title = 'No encontrado';
      text = 'El recurso solicitado no fue encontrado.';
      icon = 'error';
      break;
    case 429:
      title = 'Demasiadas solicitudes';
      text = 'Has realizado demasiadas solicitudes en un corto período de tiempo.';
      icon = 'warning';
      break;
    case 500:
      title = 'Error interno del servidor';
      text = 'Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.';
      icon = 'error';
      break;
    default:
      title = 'Error de conexión';
      text = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      icon = 'error';
  }
  
  Swal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonText: 'Aceptar',
  });
}

export const StatusSuccessAlert = (title: string, text: string) => {
  Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    confirmButtonText: 'Aceptar',
  });
}

// Variables para controlar el timing de la alerta de carga
let loadingAlert: ReturnType<typeof Swal.fire> | null = null; // Tipado más estricto
let isLoading = false; // Flag para controlar el estado
let loadingStartTime: number = 0;
const MIN_LOADING_DURATION = 1000; // Duración mínima en milisegundos (1 segundo)

export const isLoadingAlert = async (status: boolean) => {
  if (status) {
    if (isLoading) {
      // Si ya hay una alerta de carga, simplemente actualiza el tiempo de inicio
      loadingStartTime = Date.now();
      return;
    }
    
    isLoading = true;
    loadingStartTime = Date.now();
    
 
    if (loadingAlert) {
      Swal.close();
      loadingAlert = null;
    }
    
    loadingAlert = Swal.fire({
      title: 'Cargando...',
      text: 'Por favor, espera un momento.',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  } else {
    if (!isLoading) {
      // Si no hay alerta de carga activa, no hacemos nada
      return;
    }
    
    isLoading = false;
    
    // Calcular el tiempo transcurrido
    const elapsed = Date.now() - loadingStartTime;
    const remainingTime = Math.max(0, MIN_LOADING_DURATION - elapsed);
    
    // Si ha pasado menos del tiempo mínimo, espera antes de cerrar
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
    
    // Cerrar la alerta de carga de forma segura
    try {
      Swal.close(); // Usamos Swal.close() en lugar de loadingAlert.close()
      loadingAlert = null;
    } catch (e) {
      console.warn("Error al intentar cerrar la alerta de carga:", e);
      loadingAlert = null; 
    }
  }
}