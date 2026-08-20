import { Link } from "@tanstack/react-router";
import { Check, Lock, ScanLine, X } from "lucide-react";

import { Badge, Button, Heading, Medal, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { GUARDIANS } from "@/lib/guardians";
import type { Location, SectorId } from "@/lib/locations";

interface RouteDetailModalProps {
  title: string;
  sector: SectorId;
  progress: { current: number; total: number };
  barClassName: string;
  locations: Location[];
  unlockedIds: string[];
  onClose: () => void;
}

/** "Explorar Ruta" sheet: guardian legend, stop checklist and scan CTA. */
export function RouteDetailModal({
  title,
  sector,
  progress,
  barClassName,
  locations,
  unlockedIds,
  onClose,
}: RouteDetailModalProps) {
  const guardian = GUARDIANS[sector];
  const pct = progress.total ? Math.round((progress.current / progress.total) * 100) : 0;
  const completed = progress.total > 0 && progress.current >= progress.total;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ruta: ${title}`}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-text/60 p-0 sm:items-center sm:p-4"
    >
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto overscroll-contain scroll-smooth rounded-2xl bg-surface p-5 pb-12 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={guardian.image}
              alt={`Render 3D de ${guardian.name}`}
              width={512}
              height={512}
              loading="lazy"
              className="size-16 shrink-0 object-contain"
            />
            <div>
              <Heading as="h2" level={3}>
                {title}
              </Heading>
              <Text tone="muted" size="sm">
                {guardian.name}
              </Text>
            </div>
          </div>
          <Button variant="ghost" size="sm" aria-label="Cerrar" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="mb-5 rounded-2xl border border-border bg-background p-4">
          <Text size="sm" className="mb-1 font-semibold">
            La leyenda del guardián
          </Text>
          <Text tone="muted" size="sm">
            {guardian.story}
          </Text>
        </div>

        <div className="mb-1 flex items-center justify-between gap-3">
          <Text size="sm" className="font-semibold">
            Progreso de la ruta
          </Text>
          <Badge variant="primary" size="sm">
            {progress.current}/{progress.total}
          </Badge>
        </div>
        <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-border" aria-hidden="true">
          <div className={cn("h-full transition-all", barClassName)} style={{ width: `${pct}%` }} />
        </div>

        <ul className="mb-5 space-y-2">
          {locations.map((location) => {
            const unlocked = unlockedIds.includes(location.id);
            return (
              <li
                key={location.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    unlocked ? "bg-gold text-gold-foreground" : "bg-surface text-text-muted",
                  )}
                  aria-hidden="true"
                >
                  {unlocked ? <Check className="size-4" /> : <Lock className="size-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <Text size="sm" className="font-semibold">
                    {location.name}
                  </Text>
                  <Text tone="muted" size="sm" className="text-xs">
                    {unlocked ? "Sellado en tu pasaporte" : location.hint}
                  </Text>
                </span>
                <Badge variant={unlocked ? "trail" : "outline"} size="sm">
                  {unlocked ? "Completado" : "Pendiente"}
                </Badge>
              </li>
            );
          })}
        </ul>

        <Button variant="primary" size="lg" className="w-full" asChild>
          <Link to="/scan" onClick={onClose} className="inline-flex items-center justify-center gap-2">
            <ScanLine className="size-5" aria-hidden="true" />
            Escanear QR de esta ruta
          </Link>
        </Button>

        {completed && (
          <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-gold/50 bg-gold/10 p-5 text-center">
            <Medal label={guardian.badgeName}>{guardian.badgeEmoji}</Medal>
            <Heading as="h3" level={4}>
              ¡Ruta completada {progress.current}/{progress.total}!
            </Heading>
            <Text tone="muted" size="sm">
              Has sellado todos los hitos de esta ruta. Has conseguido su Insignia Oficial de Ruta.
            </Text>
            <Button variant="gold" size="lg" className="w-full" asChild>
              <Link to="/shop" onClick={onClose} className="inline-flex items-center justify-center gap-2">
                🎖️ Ir a la Tienda a reclamar insignia
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
