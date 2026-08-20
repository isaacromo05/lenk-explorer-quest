import { useEffect, useState } from "react";
import { Box, Eye } from "lucide-react";

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

/** Probes the .glb path so we can fall back to the PNG pedestal when it is not published. */
function useModelAvailable(url: string) {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    let active = true;
    setAvailable(false);
    fetch(url, { method: "HEAD" })
      .then((res) => {
        const type = res.headers.get("content-type") ?? "";
        if (active) setAvailable(res.ok && !type.includes("text/html"));
      })
      .catch(() => {
        if (active) setAvailable(false);
      });
    return () => {
      active = false;
    };
  }, [url]);
  return available;
}

/** Tabbed 3D collectible viewer for the three official Lenk guardians. */
export function GuardianFigureSelector() {
  const [sector, setSector] = useState<SectorId>("water");
  const guardian = GUARDIANS[sector];
  const hasModel = useModelAvailable(guardian.model3d);
  const [preview, setPreview] = useState(false);
  useModelViewerScript(hasModel);

  return (
    <Card id="figura-3d-coleccion">
      <CardHeader>
        <CardTitle>Figura 3D de Colección</CardTitle>
        <CardDescription>Elige tu Guardián oficial y visualiza la figura antes de pedirla.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div role="tablist" aria-label="Guardianes de Lenk" className="grid grid-cols-3 gap-2">
          {GUARDIAN_LIST.map((item) => (
            <button
              key={item.sector}
              type="button"
              role="tab"
              aria-selected={sector === item.sector}
              onClick={() => {
                setSector(item.sector);
                setPreview(false);
              }}
              className={cn(
                "rounded-xl border px-2 py-3 text-center text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                sector === item.sector
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-surface text-text-muted",
              )}
            >
              <span className="block text-lg" aria-hidden="true">
                {item.emoji}
              </span>
              {item.tab}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-background p-4">
          {hasModel ? (
            /* @ts-expect-error -- model-viewer is a custom element */
            <model-viewer
              src={guardian.model3d}
              alt={`Figura 3D de ${guardian.name}`}
              camera-controls
              auto-rotate
              style={{ width: "100%", height: "260px" }}
            />
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

        {!hasModel && (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setPreview((p) => !p)}>
            <Eye className="size-4" aria-hidden="true" />
            {preview ? "Reducir previsualización" : "Previsualizar el producto"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
