import { useEffect, useRef } from 'react';
import notificationSound from '@/assets/sound/notificationSound.wav';

export const useNotificationSound = (alerts: any[]) => {
  const previousAlertsCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = (priority: number = 0) => {
    try {
      // Crear nuevo elemento de audio para cada reproducción
      const audio = new Audio(notificationSound);
      
      // Ajustar volumen según prioridad
      if (priority >= 10) {
        audio.volume = 0.8; // Más fuerte para urgente
      } else if (priority >= 5) {
        audio.volume = 0.6; // Medio
      } else {
        audio.volume = 0.4; // Suave para prioridad baja
      }

      // Reproducir el sonido
      audio.play().catch(error => {
        console.warn('No se pudo reproducir el sonido:', error);
      });
      
    } catch (error) {
      console.warn('Error al reproducir sonido:', error);
    }
  };

  useEffect(() => {
    const currentAlertsCount = alerts.length;
    
    if (currentAlertsCount > previousAlertsCountRef.current && previousAlertsCountRef.current > 0) {
      const newestAlert = alerts[0];
      playSound(newestAlert?.priority || 0);
    }
    
    previousAlertsCountRef.current = currentAlertsCount;
  }, [alerts]);
};