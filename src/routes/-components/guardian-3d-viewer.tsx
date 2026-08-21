import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, ContactShadows, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import { Loader2 } from "lucide-react";

import { Text } from "@/design-system";

/** Precarga los .glb en segundo plano para que abrir el visor sea instantáneo. */
export function preloadGuardianModels(urls: string[]) {
  if (typeof window === "undefined") return;
  const run = () => urls.forEach((url) => useGLTF.preload(url));
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
  if (idle) idle(run);
  else window.setTimeout(run, 800);
}

function GuardianModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as unknown as { isMesh?: boolean; castShadow?: boolean; receiveShadow?: boolean };
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
  }, [scene]);

  // Libera la memoria de GPU al cambiar de guardián o cerrar la vista 3D.
  useEffect(() => () => useGLTF.clear(url), [url]);

  return <primitive object={scene} />;
}

/** Pantalla de carga ligera con porcentaje real (useProgress + Suspense). */
function LoadingOverlay({ label }: { label: string }) {
  const { progress, active } = useProgress();
  const pct = Math.round(progress);
  if (!active && pct >= 100) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/85 p-4 backdrop-blur-sm">
      <div className="h-24 w-20 animate-pulse rounded-2xl bg-border" aria-hidden="true" />
      <div
        className="w-full max-w-[220px] space-y-2"
        role="progressbar"
        aria-label={label}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
          <Text size="sm" className="font-semibold">
            Cargando figura 3D · {pct}%
          </Text>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${Math.max(pct, 6)}%` }}
          />
        </div>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {label} · {pct}%
      </p>
    </div>
  );
}

interface Guardian3DViewerProps {
  url: string;
  label: string;
  className?: string;
}

/** Visor 3D del guardián: R3F + drei, sombras ligeras y limpieza de memoria. */
export function Guardian3DViewer({ url, label, className }: Guardian3DViewerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={className} style={{ height: 260 }} aria-hidden="true" />;
  }

  return (
    <div className={className} style={{ position: "relative", height: 260 }} aria-busy>
      <Canvas
        key={url}
        shadows
        dpr={[1, 1.6]}
        frameloop="demand"
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0.6, 3], fov: 40 }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[3, 5, 3]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[512, 512]}
          shadow-bias={-0.0005}
        />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.2}>
            <GuardianModel url={url} />
          </Bounds>
        </Suspense>
        <ContactShadows position={[0, -1, 0]} opacity={0.35} scale={6} blur={2.4} far={3} resolution={512} />
        <OrbitControls makeDefault enablePan={false} autoRotate autoRotateSpeed={1.2} minDistance={1.2} maxDistance={6} />
      </Canvas>
      <LoadingOverlay label={label} />
    </div>
  );
}
