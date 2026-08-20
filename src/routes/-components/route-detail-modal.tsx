import { Check, Lock, X } from "lucide-react";

import { Badge, Button, Heading, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import type { Location } from "@/lib/locations";

interface RouteDetailModalProps {
  title: string;
  mascot: string;
  mascotEmoji: string;
  progress: { current: number; total: number };
  barClassName: string;
  locations: Location[];
  unlockedIds: string[];
  onClose: () => void;
}

/** "Ver ruta" detail sheet: sector progress plus the list of its locations. */
export function RouteDetailModal({
  title,
  mascot,
  mascotEmoji,
  progress,
  barClassName,
  locations,
  unlockedIds,
  onClose,
}: RouteDetailModalProps) {
  const pct = progress.total ? Math.round((progress.current / progress.total) * 100) : 0;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ruta: ${title}`}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-text/60 p-0 sm:items-center sm:p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface p-5 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <Heading as="h2" level={3}>
              {title}
            </Heading>
            <Text tone="muted" size="sm">
              <span aria-hidden="true">{mascotEmoji}</span> {mascot}
            </Text>
          </div>
          <Button variant="ghost" size="sm" aria-label="Cerrar" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </Button>
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

        <ul className="space-y-2">
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
                <span className="min-w-0">
                  <Text size="sm" className="font-semibold">
                    {location.name}
                  </Text>
                  <Text tone="muted" size="sm" className="text-xs">
                    {unlocked ? "Sellado en tu pasaporte" : location.hint}
                  </Text>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}