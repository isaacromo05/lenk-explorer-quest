import { useEffect, useRef, useState } from "react";
import { Box, Eye } from "lucide-react";

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { GUARDIAN_LIST, GUARDIANS } from "@/lib/guardians";
import type { SectorId } from "@/lib/locations";
import { Guardian3DViewer, preloadGuardianModels } from "./guardian-3d-viewer";

/** Module-level cache so switching tabs never re-probes a model. */
const availabilityCache = new Map<string, boolean>();

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

/** Comprueba si el .glb del guardián activo existe y precarga los demás. */
function useModelAvailability(activeUrl: string) {
  const [available, setAvailable] = useState<boolean | null>(() => availabilityCache.get(activeUrl) ?? null);

  useEffect(() => {
    let active = true;
    setAvailable(availabilityCache.get(activeUrl) ?? null);
    probeModel(activeUrl).then((ok) => {
      if (active) setAvailable(ok);
    });
    return () => {
      active = false;
    };
  }, [activeUrl]);

  // Precarga en segundo plano todos los modelos disponibles (useGLTF.preload).
  useEffect(() => {
    let cancelled = false;
    const urls = GUARDIAN_LIST.map((item) => GUARDIANS[item.sector].model3d);
    Promise.all(urls.map(async (url) => ((await probeModel(url)) ? url : null))).then((results) => {
      if (cancelled) return;
      preloadGuardianModels(results.filter((url): url is string => Boolean(url)));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return available;
}

/** Placeholder mostrado mientras se comprueba el modelo 3D. */
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

interface GuardianFigureSelectorProps {
  /** Guardián seleccionado (controlado por la Tienda para marcar su checkbox). */
  sector: SectorId;
  onSectorChange: (sector: SectorId) => void;
}

/** Tabbed 3D collectible viewer for the three official Lenk guardians. */
export function GuardianFigureSelector({ sector, onSectorChange }: GuardianFigureSelectorProps) {
  const guardian = GUARDIANS[sector];
  const hasModel = useModelAvailability(guardian.model3d);
  const [preview, setPreview] = useState(false);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const selectSector = (next: SectorId) => {
    onSectorChange(next);
    setPreview(false);
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
            <Guardian3DViewer
              url={guardian.model3d}
              label={`Cargando figura 3D de ${guardian.name}`}
              className="overflow-hidden rounded-xl"
            />
          ) : (
            <div className="flex flex-col items-center">
              {/* Peana 3D de reserva cuando el .glb aún no está publicado. */}
              <div className="relative flex h-[220px] w-full items-end justify-center">
                <div className="absolute bottom-4 h-6 w-40 rounded-full bg-text/10 blur-md" aria-hidden="true" />
                <img
                  src={guardian.image}
                  alt={`Figura de colección del ${guardian.name}`}
                  className={cn(
                    "relative z-10 h-full object-contain drop-shadow-xl transition-transform duration-300",
                    preview && "scale-110",
                  )}
                  loading="lazy"
                />
                <div
                  className="absolute bottom-0 h-8 w-44 rounded-[999px] border border-border bg-surface shadow-soft"
                  aria-hidden="true"
                />
              </div>
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
