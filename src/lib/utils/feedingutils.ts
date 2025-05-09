import { format } from 'date-fns';
import { feedingService } from '@/services/feedingService';


export function determineEligibleFoods(timeStart?: string | null, timeEnd?: string | null): string[] {
  const foods: string[] = [];
  
  // Obtener hora actual
  const now = new Date();
  const currentHour = 6;
  const currentMinute = 24;
  const currentMinutes = currentHour * 60 + currentMinute;
  
  // Convertir strings de hora a minutos
  if (!timeStart) return ["Sin alimentación"];
  
  const [startHour, startMinute] = timeStart.split(':').map(Number);
  let startMinutes = startHour * 60 + startMinute;
  
  let endMinutes;
  if (timeEnd) {
    const [endHour, endMinute] = timeEnd.split(':').map(Number);
    endMinutes = endHour * 60 + endMinute;
    // Si la operación termina antes que inicia, asumimos que cruza la medianoche
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60; // Sumar un día completo
    }
  } else {
    endMinutes = startMinutes + 1440; // Asumir 24 horas por defecto
  }
  
  // Definir horarios exactos de comidas
  const desayunoHora = 6 * 60; // 6:00 am
  const almuerzoHora = 12 * 60; // 12:00 pm
  const cenaHora = 18 * 60; // 6:00 pm
  const mediaNocheHora = 0; // 00:00 am
  
  // Definir periodos extendidos para cada comida (cuando se puede reclamar)
  const periodoDesayuno = 10 * 60; // Hasta las 10 am
  const periodoAlmuerzo = 16 * 60; // Hasta las 4 pm
  const periodoCena = 21 * 60; // Hasta las 9 pm
  const periodoMediaNoche = 3 * 60; // Hasta las 3 am
  
  // Verificar si la operación está activa actualmente
  const operacionEnCursoAhora = (startMinutes <= currentMinutes && (endMinutes >= currentMinutes || !timeEnd));
  
  if (!operacionEnCursoAhora) {
    return ["Sin alimentación"];
  }
  
  // Una operación tiene derecho a una comida solo si:
  // 1. La operación comienza ANTES de la hora de esa comida, Y
  // 2. La operación termina DESPUÉS de la hora de esa comida
  const comidasAutorizadas: string[] = [];
  
  // Desayuno - 6:00 am
  if (startMinutes < desayunoHora && endMinutes > desayunoHora) {
    comidasAutorizadas.push('BREAKFAST');
  }
  
  // Almuerzo - 12:00 pm
  if (startMinutes < almuerzoHora && endMinutes > almuerzoHora) {
    comidasAutorizadas.push('LUNCH');
  }
  
  // Cena - 6:00 pm
  if (startMinutes < cenaHora && endMinutes > cenaHora) {
    comidasAutorizadas.push('DINNER');
  }
  
  // Media noche - 00:00 am (caso especial por cruce de día)
  if (startMinutes < mediaNocheHora && endMinutes > mediaNocheHora) {
    comidasAutorizadas.push('SNACK');
  } else if (startMinutes < (24 * 60) && endMinutes > (24 * 60)) {
    comidasAutorizadas.push('SNACK');
  }
  
  if (comidasAutorizadas.length === 0) {
    return ["Sin alimentación"];
  }
  
  // Determinar cuál comida mostrar según la hora actual
  let comidaActual = '';
  
  // Entre 12 am y 3 am: Media noche
  if (currentMinutes >= mediaNocheHora && currentMinutes <= periodoMediaNoche) {
    if (comidasAutorizadas.includes('SNACK')) {
      comidaActual = 'SNACK';
    }
  }
  // Entre 6 am y 10 am: Desayuno
  else if (currentMinutes >= desayunoHora && currentMinutes <= periodoDesayuno) {
    if (comidasAutorizadas.includes('BREAKFAST')) {
      comidaActual = 'BREAKFAST';
    }
  }
  // Entre 12 pm y 4 pm: Almuerzo
  else if (currentMinutes >= almuerzoHora && currentMinutes <= periodoAlmuerzo) {
    if (comidasAutorizadas.includes('LUNCH')) {
      comidaActual = 'LUNCH';
    }
  }
  // Entre 6 pm y 9 pm: Cena
  else if (currentMinutes >= cenaHora && currentMinutes <= periodoCena) {
    if (comidasAutorizadas.includes('DINNER')) {
      comidaActual = 'DINNER';
    }
  }
  // Entre 9 pm y 12 am: Media noche (si la operación va a cruzar medianoche)
  else if (currentMinutes >= periodoCena && currentMinutes < 24 * 60) {
    if (comidasAutorizadas.includes('SNACK')) {
      comidaActual = 'SNACK';
    }
  }
  
  // Si tenemos una comida válida para el período actual, la retornamos
  if (comidaActual) {
    return [comidaActual];
  }
  
  // Si hay comidas autorizadas pero no para este período
  return ["Sin alimentación actual"];
}

export function tieneDerechoAComidaAhora(timeStart?: string | null, timeEnd?: string | null): boolean {
  const comidas = determineEligibleFoods(timeStart, timeEnd);
  return comidas.length > 0 && comidas[0] !== "Sin alimentación" && comidas[0] !== "Sin alimentación actual";
}


// Función auxiliar para verificar si todos los trabajadores ya recibieron la comida
export async function todosTrabajadaresRecibieronComida(operation: any): Promise<boolean> {
  if (!operation || !operation.id) return true;
  
  try {
    // Obtener las alimentaciones asignadas a esta operación
    const feedings = await feedingService.getOperationFeedings(operation.id);
    
    // Determinar la comida actual elegible
    const foods = determineEligibleFoods(
      operation.timeStrat || operation.timeStart, 
      operation.timeEnd
    );
    
    const currentEligibleFood = foods[0] !== "Sin alimentación" && 
                               foods[0] !== "Sin alimentación actual" ? 
                               foods[0] : "";
    
    // Si no hay comida elegible, no hay más que verificar
    if (!currentEligibleFood) return true;
    
    // Contar cuántos trabajadores tiene la operación
    let totalWorkers = 0;
    if (operation.workerGroups && Array.isArray(operation.workerGroups)) {
      operation.workerGroups.forEach((group: any) => {
        if (group.workers && Array.isArray(group.workers)) {
          totalWorkers += group.workers.length;
        }
      });
    }
    
    // Si no hay trabajadores, no hay más que verificar
    if (totalWorkers === 0) return true;
    
   
    const workersWithFood = feedings
      .filter(f => f.type === currentEligibleFood)
      .map(f => f.id_worker) // Cambiar de workerId a id_worker
      .length;
    
    // Si todos los trabajadores ya recibieron la comida, retornar true
    return workersWithFood >= totalWorkers;
    
  } catch (error) {
    console.error("Error verificando alimentación:", error);
    return true; // En caso de error, asumimos que todos recibieron comida
  }
}