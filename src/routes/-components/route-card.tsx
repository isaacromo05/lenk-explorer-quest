import { useState } from "react";
import { Compass } from "lucide-react";

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { GUARDIANS } from "@/lib/guardians";
import { ROUTE_BADGES } from "@/lib/rewards";
import { locationsBySector, type SectorId } from "@/lib/locations";
import { RouteDetailModal } from "./route-detail-modal";

export interface RouteCardProps {
  title: string;
  places: string;
  progress: { current: number; total: number };
  variant: SectorId;
  /** Ids of unlocked locations, used by the "Explorar Ruta" modal. */
  unlockedIds?: string[];
}

const variantConfig = {
  water: {
    bar: "bg-secondary",
    badge: "trail" as const,
    chip: "bg-secondary/10 text-secondary border-secondary/20",
    mascotBg: "bg-secondary/10",
  },
  summit: {
    bar: "bg-primary",
    badge: "primary" as const,
    chip: "bg-primary/10 text-primary border-primary/20",
    mascotBg: "bg-primary/10",
  },
  culture: {
    bar: "bg-text-muted",
    badge: "outline" as const,
    chip: "bg-border/60 text-text border-border",
    mascotBg: "bg-border/60",
  },
};

export function RouteCard({ title, places, progress, variant, unlockedIds = [] }: RouteCardProps) {
  const cfg = variantConfig[variant];
  const guardian = GUARDIANS[variant];
  const routeBadge = ROUTE_BADGES[variant];
  const pct = progress.total ? Math.round((progress.current / progress.total) * 100) : 0;
  const earned = progress.total > 0 && progress.current >= progress.total;
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card className="overflow-hidden shadow-md">
        <div className="h-2 w-full bg-border" aria-hidden="true">
          <div className={cn("h-full transition-all", cfg.bar)} style={{ width: `${pct}%` }} />
        </div>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{places}</CardDescription>
            </div>
            {/* Insignia de ruta (recompensa) en la esquina superior derecha */}
            <div
              className={cn(
                "flex size-16 shrink-0 flex-col items-center justify-center rounded-full p-1",
                earned
                  ? "bg-gold/15 shadow-md ring-2 ring-gold"
                  : "border border-dashed border-border bg-background opacity-70",
              )}
              title={routeBadge.name}
              aria-label={earned ? `${routeBadge.name} conseguida` : `${routeBadge.name} bloqueada`}
            >
              <img
                src={routeBadge.image}
                alt=""
                width={512}
                height={512}
                loading="lazy"
                className={cn("size-10 object-contain", !earned && "opacity-40 grayscale")}
              />
              <span className="text-[9px] font-bold text-primary">
                {progress.current}/{progress.total}
              </span>
            </div>

          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full",
                cfg.mascotBg,
              )}
            >
              <img
                src={guardian.image}
                alt={`Render 3D de ${guardian.name}`}
                width={512}
                height={512}
                loading="lazy"
                className="size-14 object-contain"
              />
            </span>
            <div className="min-w-0 space-y-1">
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
                  cfg.chip,
                )}
              >
                <Text size="sm" className="text-inherit">
                  {guardian.name}
                </Text>
              </div>
              <Badge variant={cfg.badge} size="sm">
                {progress.current}/{progress.total} hitos
              </Badge>
            </div>
          </div>
          <Button variant="primary" size="sm" className="w-full" onClick={() => setOpen(true)}>
            <Compass className="size-4" aria-hidden="true" />
            Ver Detalles de Ruta

          </Button>
        </CardContent>
      </Card>
      {open && (
        <RouteDetailModal
          title={title}
          sector={variant}
          progress={progress}
          barClassName={cfg.bar}
          locations={locationsBySector(variant)}
          unlockedIds={unlockedIds}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
