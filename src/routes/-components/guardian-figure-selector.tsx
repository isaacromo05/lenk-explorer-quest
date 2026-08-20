import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Eye, Loader2 } from "lucide-react";

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { GUARDIAN_LIST, GUARDIANS } from "@/lib/guardians";
import type { SectorId } from "@/lib/locations";

/** Loads the <model-viewer> custom element once, on demand. */
function useModelViewerScript(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;
    const id = "model-viewer-script";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "module";
    script.src = "https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js";
    document.head.appendChild(script);
  }, [enabled]);
}

/** Module-level cache so switching tabs never re-probes or re-downloads a model. */
const availabilityCache = new Map<string, boolean>();
const warmedModels = new Set<string>();

async function probeModel(url: string) {
  const cached = availabilityCache.get(url);
  if (cached !== undefined) return cached;
  try {
    const res = await fetch(url, { method: "HEAD" });
    const type = res.headers.get("content-type") ?? "";
    const ok = res.ok && !type.includes("text/html");
    availabilityCache.set(url, ok);
    return ok;
  } catch {
    availabilityCache.set(url, false);
    return false;
  }
}

/** Warms the HTTP cache for a .glb so a later tab switch renders instantly. */
function warmModel(url: string) {
  if (warmedModels.has(url) || typeof document === "undefined") return;
  warmedModels.add(url);
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "fetch";
  link.crossOrigin = "anonymous";
  link.href = url;
  document.head.appendChild(link);
}

/** Probes every guardian model once and prefetches the ones that exist. */
function useModelPreload(activeUrl: string) {
  const [available, setAvailable] = useState<boolean | null>(() => availabilityCache.get(activeUrl) ?? null);

  useEffect(() => {
    let active = true;
    setAvailable(availabilityCache.get(activeUrl) ?? null);
    probeModel(activeUrl).then((ok) => {
      if (!active) return;
      setAvailable(ok);
      if (ok) warmModel(activeUrl);
    });
    return () => {
      active = false;
    };
  }, [activeUrl]);

  // Background: probe + prefetch the other guardians when the browser is idle.
  useEffect(() => {
    const others = GUARDIAN_LIST.map((item) => GUARDIANS[item.sector].model3d).filter((url) => url !== activeUrl);
    const run = () => {
      others.forEach((url) => {
        probeModel(url).then((ok) => {
          if (ok) warmModel(url);
        });
      });
    };
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (idle) {
      idle(run);
      return;
    }
    const timer = window.setTimeout(run, 1200);
    return () => window.clearTimeout(timer);
  }, [activeUrl]);

  return available;
}

/** Skeleton mostrado mientras se prepara o descarga el modelo 3D. */
function FigureSkeleton({ label }: { label: string }) {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center gap-3" aria-hidden="true">
      <div className="h-32 w-24 animate-pulse rounded-2xl bg-border" />
      <div className="h-5 w-40 animate-pulse rounded-full bg-border" />
      <div className="h-3 w-28 animate-pulse rounded-full bg-border" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Tabbed 3D collectible viewer for the three official Lenk guardians. */
export function GuardianFigureSelector() {
  const [sector, setSector] = useState<SectorId>("water");
  const guardian = GUARDIANS[sector];
  const hasModel = useModelPreload(guardian.model3d);
  const [preview, setPreview] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const viewerRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useModelViewerScript(hasModel === true);

  // model-viewer emits non-React events, so wire them imperatively.
  const attachViewer = useCallback((node: HTMLElement | null) => {
    viewerRef.current = node;
    if (!node) return;
    const onProgress = (event: Event) => {
      const detail = (event as CustomEvent<{ totalProgress: number }>).detail;
      setProgress(Math.round((detail?.totalProgress ?? 0) * 100));
    };
    const onLoad = () => {
      setProgress(100);
      setLoaded(true);
    };
    node.addEventListener("progress", onProgress);
    node.addEventListener("load", onLoad);
  }, []);

  const selectSector = (next: SectorId) => {
    setSector(next);
    setPreview(false);
    setProgress(0);
    setLoaded(false);
  };

  /** Flechas / Inicio / Fin mueven el foco entre pestañas, como pide WAI-ARIA. */
  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const last = GUARDIAN_LIST.length - 1;
    const nextIndex =
      event.key === "ArrowRight"
        ? (index + 1) % GUARDIAN_LIST.length
        : event.key === "ArrowLeft"
          ? (index + last) % GUARDIAN_LIST.length
          : event.key === "Home"
            ? 0
            : last;
    const nextSector = GUARDIAN_LIST[nextIndex].sector;
    selectSector(nextSector);
    tabRefs.current[nextSector]?.focus();
  };

  const panelId = `guardian-panel-${sector}`;

  return (
    <Card id="figura-3d-coleccion">
      <CardHeader>
        <CardTitle>Figura 3D de Colección</CardTitle>
        <CardDescription>Elige tu Guardián oficial y visualiza la figura antes de pedirla.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div role="tablist" aria-label="Guardianes de Lenk" className="grid grid-cols-3 gap-2">
          {GUARDIAN_LIST.map((item, index) => {
            const selected = sector === item.sector;
            return (
              <button
                key={item.sector}
                ref={(node) => {
                  tabRefs.current[item.sector] = node;
                }}
                type="button"
                role="tab"
                id={`guardian-tab-${item.sector}`}
                aria-selected={selected}
                aria-controls={selected ? panelId : undefined}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectSector(item.sector)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                onMouseEnter={() => warmModel(GUARDIANS[item.sector].model3d)}
                onFocus={() => warmModel(GUARDIANS[item.sector].model3d)}
                className={cn(
                  "rounded-xl border px-2 py-3 text-center text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                  selected ? "border-primary bg-primary/5 text-primary" : "border-border bg-surface text-text-muted",
                )}
              >
                <span className="block text-lg" aria-hidden="true">
                  {item.emoji}
                </span>
                {item.tab}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={panelId}
          aria-labelledby={`guardian-tab-${sector}`}
          tabIndex={0}
          className="rounded-2xl border border-border bg-background p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {hasModel === null ? (
            <>
              <FigureSkeleton label={`Preparando la figura 3D de ${guardian.name}`} />
              <p role="status" aria-live="polite" className="sr-only">
                Preparando la figura 3D de {guardian.name}
              </p>
            </>
          ) : hasModel ? (
            <div className="relative">
              {/* @ts-expect-error -- model-viewer is a custom element */}
              <model-viewer
                key={guardian.model3d}
                ref={attachViewer}
                src={guardian.model3d}
                poster={guardian.image}
                alt={`Figura 3D de ${guardian.name}`}
                camera-controls
                auto-rotate
                loading="eager"
                reveal="auto"
                aria-busy={!loaded}
                style={{ width: "100%", height: "260px" }}
              />
              {!loaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-end gap-3 rounded-xl bg-background/80 p-4 backdrop-blur-sm">
                  <FigureSkeleton label={`Cargando figura 3D de ${guardian.name}`} />
                  <div
                    className="w-full space-y-2"
                    role="progressbar"
                    aria-label={`Cargando figura 3D de ${guardian.name}`}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
                      <Text size="sm" className="font-semibold">
                        Cargando figura 3D · {progress}%
                      </Text>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-300"
                        style={{ width: `${Math.max(progress, 6)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <img
                src={guardian.image}
                alt={`Render 3D de ${guardian.name}`}
                width={512}
                height={512}
                loading="lazy"
                className={cn(
                  "h-48 object-contain drop-shadow-lg transition-transform duration-500",
                  preview && "scale-110",
                )}
              />
              {/* Peana 3D estilizada */}
              <span
                className="mt-[-6px] h-5 w-40 rounded-[50%] bg-gradient-to-b from-primary/25 to-primary/5"
                aria-hidden="true"
              />
              <span
                className="h-6 w-32 rounded-b-2xl bg-gradient-to-b from-primary/20 to-transparent"
                aria-hidden="true"
              />
              <Badge variant="outline" size="sm" className="mt-2">
                <Box className="size-3" aria-hidden="true" /> Vista previa del producto
              </Badge>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Text size="sm" className="font-semibold">
            {guardian.name}
          </Text>
          <Text tone="muted" size="sm">
            {guardian.sector} · {guardian.description}
          </Text>
        </div>

        {hasModel === false && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            aria-pressed={preview}
            onClick={() => setPreview((p) => !p)}
          >
            <Eye className="size-4" aria-hidden="true" />
            {preview ? "Reducir previsualización" : "Previsualizar el producto"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
