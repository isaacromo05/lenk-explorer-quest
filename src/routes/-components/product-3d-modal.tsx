import { Box, X } from "lucide-react";
import { Component, useEffect, useState, type ReactNode } from "react";

import { Badge, Button, Heading, Text } from "@/design-system";

import { Guardian3DViewer } from "./guardian-3d-viewer";

/** Module-level cache so re-opening a modal never re-probes a model. */
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

/** Keeps a failed WebGL/model load from taking the whole route down. */
class ViewerBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

interface Product3DModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** URL of the .glb model to render inside the modal. */
  url: string;
  /** Static render shown when the .glb is not available. */
  fallbackImage: string;
}

/**
 * Lazy 3D viewer modal: the <Canvas> only mounts while the modal is open, so
 * product cards stay static images until the explorer asks for "Ver en 3D".
 */
export function Product3DModal({
  open,
  onClose,
  title,
  description,
  url,
  fallbackImage,
}: Product3DModalProps) {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !url) return;
    let active = true;
    setAvailable(availabilityCache.get(url) ?? null);
    probeModel(url).then((ok) => {
      if (active) setAvailable(ok);
    });
    return () => {
      active = false;
    };
  }, [open, url]);

  if (!open) return null;

  const staticPreview = (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-background p-4">
      <div className="relative flex h-[240px] w-full items-end justify-center">
        <div className="absolute bottom-4 h-6 w-40 rounded-full bg-text/10 blur-md" aria-hidden="true" />
        <img
          src={fallbackImage}
          alt={`Figura de colección de ${title}`}
          loading="lazy"
          className="relative z-10 h-full object-contain drop-shadow-xl"
        />
        <div
          className="absolute bottom-0 h-8 w-44 rounded-full border border-border bg-surface shadow-sm"
          aria-hidden="true"
        />
      </div>
      <Badge variant="outline" className="mt-2">
        <Box className="size-3" aria-hidden="true" /> Vista previa del producto
      </Badge>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Vista 3D de ${title}`}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-wood/70 p-0 sm:items-center sm:p-4"
    >
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl bg-surface p-5 shadow-lg">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Heading as="h2" level={3}>
              {title}
            </Heading>
            {description ? (
              <Text tone="muted" size="sm">
                {description}
              </Text>
            ) : null}
          </div>
          <Button variant="ghost" size="sm" aria-label="Cerrar vista 3D" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        {available === null ? (
          <div className="h-[260px] animate-pulse rounded-2xl bg-border" aria-hidden="true" />
        ) : available ? (
          <ViewerBoundary fallback={staticPreview}>
            <Guardian3DViewer
              url={url}
              label={`Cargando figura 3D de ${title}`}
              className="overflow-hidden rounded-2xl border border-border bg-background"
            />
          </ViewerBoundary>
        ) : (
          staticPreview
        )}

        <Text tone="muted" size="sm" className="mt-3 text-center text-xs">
          {available
            ? "Arrastra para girar la figura · pellizca para acercar"
            : "Vista 3D no disponible ahora mismo — te mostramos el render oficial."}
        </Text>
      </div>
    </div>
  );
}
