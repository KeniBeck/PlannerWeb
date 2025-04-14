import { ReactNode } from 'react';
import { WorkerProvider } from './WorkerContext';
import { AreasProvider } from './AreasContext';
// import { FaultProvider } from './FaultContext';
import { FaultProvider } from './FaultContext';

// Importar otros providers según necesites

// Usar enum para las features disponibles
export enum Feature {
  WORKERS = 'workers',
  FAULTS = 'faults',
  PROJECTS = 'projects',
  AREAS = 'areas',
  SERVICES = 'services',
  USERS = 'users',
  SUPERVISORS = 'supervisors',
  CLIENTS = 'clients'
}

type FeatureType = Feature;

interface LayeredProvidersProps {
  children: ReactNode;
  features: FeatureType[];
}

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
      case Feature.PROJECTS:
        console.warn(`Provider para ${feature} no está implementado`);
        // content = <ProjectProvider>{content}</ProjectProvider>;
        break;
      case Feature.AREAS:
        content = <AreasProvider>{content}</AreasProvider>;
        break;
      case Feature.CLIENTS:
        console.warn(`Provider para ${feature} no está implementado`);
        // Cuando implementes ClientsProvider, descomenta esta línea:
        // content = <ClientsProvider>{content}</ClientsProvider>;
        break;
      case Feature.SERVICES:
      case Feature.USERS:
      case Feature.SUPERVISORS:
        console.warn(`Provider para ${feature} no está implementado`);
        break;
      default:
        // TypeScript debería prevenir este caso gracias al enum
        console.error(`¡Feature desconocida: ${feature}!`);
        break;
    }
  }
  
  return <>{content}</>;
}

