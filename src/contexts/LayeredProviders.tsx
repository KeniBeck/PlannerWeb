import  { ReactNode } from 'react';
import { WorkerProvider } from './WorkerContext';
// import { FaultProvider } from './FaultContext';
// Importar otros providers según necesites

type FeatureType = 'workers' | 'faults' | 'projects'; // Añade más según necesites

interface LayeredProvidersProps {
  children: ReactNode;
  features: FeatureType[];
}

export function LayeredProviders({ children, features }: LayeredProvidersProps) {
  let content = children;
  
  // Envuelve el contenido en los providers necesarios (en orden inverso)
  // para que el primer proveedor en la lista sea el más externo
  for (let i = features.length - 1; i >= 0; i--) {
    const feature = features[i];
    
    switch (feature) {
      case 'workers':
        content = <WorkerProvider>{content}</WorkerProvider>;
        break;
      case 'faults':
        // content = <FaultProvider>{content}</FaultProvider>;
        break;
      case 'projects':
        // content = <ProjectProvider>{content}</ProjectProvider>;
        break;
      // Añade más casos según necesites
    }
  }
  
  return <>{content}</>;
}