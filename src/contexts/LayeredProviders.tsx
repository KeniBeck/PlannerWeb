import { ReactNode } from 'react';
import { WorkerProvider } from './WorkerContext';
import { AreasProvider } from './AreasContext';
import { FaultProvider } from './FaultContext';
import { OperationProvider } from './OperationContext';
import { ClientsProvider } from './ClientsContext';
import { ServicesProvider } from './ServicesContext';
import { UsersProvider } from './UsersContext';

export enum Feature {
  WORKERS = 'workers',
  FAULTS = 'faults',
  AREAS = 'areas',
  SERVICES = 'services',
  USERS = 'users',
  SUPERVISORS = 'supervisors',
  CLIENTS = 'clients',
  OPERATION = 'operation',
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
      default:
        // TypeScript debería prevenir este caso gracias al enum
        console.error(`¡Feature desconocida: ${feature}!`);
        break;
    }
  }
  
  return <>{content}</>;
}

