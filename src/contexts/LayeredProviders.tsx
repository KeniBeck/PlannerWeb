import React, { ReactNode } from 'react';
import { WorkerProvider } from './WorkerContext';
import { AreasProvider } from './AreasContext';
import { FaultProvider } from './FaultContext';
import { OperationProvider } from './OperationContext';
import { ClientsProvider } from './ClientsContext';
import { ServicesProvider } from './ServicesContext';
import { UsersProvider } from './UsersContext';
import { FeedingProvider } from './FeedingContext';
import { ProgrammingProvider } from './ProgrammingContext';
import { NotificationProvider } from './NotificationContext';
import { UnitsMeasureProvider } from './UnitMeasureContext';

export enum Feature {
  WORKERS = 'workers',
  FAULTS = 'faults',
  AREAS = 'areas',
  SERVICES = 'services',
  USERS = 'users',
  SUPERVISORS = 'supervisors',
  CLIENTS = 'clients',
  OPERATION = 'operation',
  FEEDINGS = 'feedings',
  PROGRAMMING = "programming",
  NOTIFICATIONS = "notifications",
  UNIT_MEASURE = "unit_measure"
}

type FeatureType = Feature;

interface LayeredProvidersProps {
  children: ReactNode;
  features: FeatureType[];
}

// Singleton para el NotificationProvider - Se creará solo una vez
// No necesitamos usar un estado o localStorage, solo mantener
// una única instancia del contexto en toda la aplicación
let globalNotificationProvider: ReactNode | null = null;

export function LayeredProviders({ children, features }: LayeredProvidersProps) {
  // Start with the children
  let content = children;
  
  // Envuelve el contenido en los providers necesarios (en orden inverso)
  for (let i = features.length - 1; i >= 0; i--) {
    const feature = features[i];
    
    switch (feature) {
      case Feature.WORKERS:
        content = <WorkerProvider>{content}</WorkerProvider>;
        break;
      case Feature.FAULTS:
        content = <FaultProvider>{content}</FaultProvider>;
        break;
      case Feature.OPERATION:
        content = <OperationProvider>{content}</OperationProvider>
        break;
      case Feature.AREAS:
        content = <AreasProvider>{content}</AreasProvider>;
        break;
      case Feature.CLIENTS:
        content = <ClientsProvider>{content}</ClientsProvider>;
        break;
      case Feature.SERVICES:
        content = <ServicesProvider>{content}</ServicesProvider>;
        break;
      case Feature.USERS:
        content = <UsersProvider>{content}</UsersProvider>;
        break;
      case Feature.SUPERVISORS:
        console.warn(`Provider para ${feature} no está implementado`);
        break;
      case Feature.FEEDINGS:
        content = <FeedingProvider>{content}</FeedingProvider>;
        break;
      case Feature.PROGRAMMING:
        content = <ProgrammingProvider>{content}</ProgrammingProvider>;
        break;
      case Feature.UNIT_MEASURE:
        content = <UnitsMeasureProvider>{content}</UnitsMeasureProvider>;
        break;
      case Feature.NOTIFICATIONS:
        // Verificar si ya existe la instancia global
        if (!globalNotificationProvider) {
          console.log('Creando instancia única de NotificationProvider');
          // Crear la instancia global solo la primera vez
          globalNotificationProvider = (
            <NotificationProvider>{content}</NotificationProvider>
          );
          content = globalNotificationProvider;
        } else {
          // Si ya existe una instancia, hay que clonarla con el nuevo contenido
          content = React.cloneElement(
            globalNotificationProvider as React.ReactElement, 
            {}, // Sin props adicionales
            content // El nuevo children
          );
        }
        break;  
      default:
        console.error(`¡Feature desconocida: ${feature}!`);
        break;
    }
  }
  
  return <>{content}</>;
}