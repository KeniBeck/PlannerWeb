import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Stage, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';

function Model() {
  const { scene } = useGLTF('/assets/logo-container.glb');
  
  return (
    <group>
      <primitive 
        object={scene} 
        scale={0.4} // Escala reducida para mejor visualización
        position={[0, 0, 0]} // Centrado
        rotation={[0, Math.PI / 4, 0]} 
      />
    </group>
  );
}

export function ShipLoader() {
  return (
    <div className="fixed inset-0 z-[9999] backdrop-blur-md flex flex-col items-center justify-center">
      <div className="w-[300px] h-[200px] relative">
        <Canvas>
          <PerspectiveCamera
            makeDefault
            position={[0, 0, 10]}
            fov={35}
          />
          
          <ambientLight intensity={1.5} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={2}
          />
          
          <Suspense fallback={null}>
            <Stage 
              environment="sunset"
              intensity={0.2}
              preset="soft"
              shadows={false}
            >
              <Model />
            </Stage>
            
            <OrbitControls
              autoRotate
              autoRotateSpeed={4}
              enableZoom={false}
              enablePan={false}
            />
          </Suspense>
          
          <Environment preset="sunset" />
        </Canvas>
      </div>

      {/* Texto de carga con animación minimalista */}
      <div className="mt-4 text-blue-600 font-medium">
        Cargando
        <span className="inline-flex w-[32px]">
          <span className="animate-[dots_1.4s_infinite]">...</span>
        </span>
      </div>
    </div>
  );
}