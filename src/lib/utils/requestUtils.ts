// Mapa global para almacenar solicitudes en curso
const activeRequests = new Map<string, Promise<any>>();

/**
 * Ejecuta una solicitud evitando duplicados para la misma clave
 * @param key Clave única para identificar esta solicitud
 * @param requestFn Función que realiza la solicitud y devuelve una promesa
 * @returns Resultado de la solicitud
 */
export function executeWithoutDuplicates<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  // Si ya existe una solicitud activa con esta clave, devolver esa promesa
  if (activeRequests.has(key)) {
    console.log(`[RequestUtils] Reutilizando solicitud existente para: ${key}`);
    return activeRequests.get(key) as Promise<T>;
  }

  // Crear nueva solicitud
  console.log(`[RequestUtils] Creando nueva solicitud para: ${key}`);
  const requestPromise = requestFn().finally(() => {
    // Limpiar la solicitud del registro cuando termine (ya sea éxito o error)
    setTimeout(() => {
      activeRequests.delete(key);
    }, 200); // Breve retraso para evitar carreras
  });

  // Registrar la solicitud activa
  activeRequests.set(key, requestPromise);

  return requestPromise;
}

/**
 * Crea un espacio de caché para evitar peticiones repetidas
 * @returns Funciones para interactuar con la caché
 */
export function createRequestCache() {
  const cacheData = new Map<string, any>();
  const cacheTimes = new Map<string, number>();
  const cacheExpiry = 60000; // 1 minuto por defecto

  return {
    /**
     * Obtiene un valor de la caché o ejecuta la función para obtenerlo
     */
    getOrFetch: async <T>(
      key: string, 
      fetchFn: () => Promise<T>,
      expiryMs: number = cacheExpiry
    ): Promise<T> => {
      const now = Date.now();
      
      // Verificar si tenemos un valor en caché y no ha expirado
      if (cacheData.has(key) && (now - (cacheTimes.get(key) || 0) < expiryMs)) {
        console.log(`[Cache] Usando valor en caché para: ${key}`);
        return cacheData.get(key) as T;
      }
      
      // Ejecutar la función sin duplicados
      const result = await executeWithoutDuplicates<T>(key, fetchFn);
      
      // Guardar el resultado en caché
      cacheData.set(key, result);
      cacheTimes.set(key, now);
      
      return result;
    },
    
    /**
     * Invalida un valor específico en la caché
     */
    invalidate: (key: string) => {
      cacheData.delete(key);
      cacheTimes.delete(key);
    },
    
    /**
     * Invalida toda la caché o un grupo de claves
     */
    invalidateAll: (prefix?: string) => {
      if (prefix) {
        // Eliminar solo las claves que empiezan con el prefijo
        for (const key of cacheData.keys()) {
          if (key.startsWith(prefix)) {
            cacheData.delete(key);
            cacheTimes.delete(key);
          }
        }
      } else {
        // Eliminar toda la caché
        cacheData.clear();
        cacheTimes.clear();
      }
    }
  };
}

// Crear un cache global para servicios comunes
export const globalServiceCache = createRequestCache();