import { Camera, Lock, X } from "lucide-react";

import { Badge, Button, Heading, Medal, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { SECTORS, locationsBySector, type SectorId } from "@/lib/locations";
import type { PassportState } from "@/lib/passport";

interface RouteBadgeModalProps {
  sector: SectorId;
  state: PassportState;
  onClose: () => void;
}

const BADGE_IMAGES: Record<SectorId, string> = {
  water: "/insignia-agua.png",
  summit: "/insignia-cumbres.png",
  culture: "/insignia.tradicion.png",
};

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** Passport route detail: earned route badge, completion date and that route's photos. */
export function RouteBadgeModal({ sector, state, onClose }: RouteBadgeModalProps) {
  const info = SECTORS[sector];
  const locations = locationsBySector(sector);
  const unlocked = locations.filter((l) => state[l.id]);
  const complete = unlocked.length === locations.length && locations.length > 0;
  const completedAt = complete
    ? unlocked
        .map((l) => state[l.id]!.unlockedAt)
        .sort()
        .at(-1)
    : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ruta: ${info.name}`}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-text/60 p-0 sm:items-center sm:p-4"
    >
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto overscroll-contain scroll-smooth rounded-2xl bg-surface p-5 pb-12 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <Heading as="h2" level={3}>
              {info.name}
            </Heading>
            <Text tone="muted" size="sm">
              <span aria-hidden="true">{info.mascotEmoji}</span> {info.mascot}
            </Text>
          </div>
          <Button variant="ghost" size="sm" aria-label="Cerrar" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <div
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border p-5 text-center",
            complete ? "border-gold/50 bg-gold/10" : "border-border bg-background",
          )}
        >
          {complete ? (
            <img
              src={BADGE_IMAGES[sector]}
              alt={`Insignia de la ${info.name}`}
              width={512}
              height={512}
              className="h-32 w-32 object-contain drop-shadow-lg sm:h-40 sm:w-40"
            />
          ) : (
            <Medal label={`Insignia de la ${info.name}`} locked={!complete}>
              <span className={cn(!complete && "grayscale")} aria-hidden="true">
                {info.mascotEmoji}
              </span>
            </Medal>
          )}
          <Badge variant={complete ? "gold" : "outline"}>
            {unlocked.length}/{locations.length} hitos
          </Badge>
          <Text size="sm" tone="muted">
            {complete && completedAt
              ? `Insignia Oficial de Ruta conseguida el ${dateFormatter.format(new Date(completedAt))}.`
              : "Completa todos los hitos de esta ruta para ganar su Insignia Oficial de Ruta."}
          </Text>
        </div>

        <Heading as="h3" level={4} className="mt-5 mb-3">
          Fotos de esta ruta
        </Heading>
        <ul className="grid grid-cols-2 gap-3">
          {locations.map((location) => {
            const entry = state[location.id];
            return (
              <li
                key={location.id}
                className="overflow-hidden rounded-xl border border-border bg-background"
              >
                {entry?.photo ? (
                  <img
                    src={entry.photo}
                    alt={`Tu foto en ${location.name}`}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-square w-full flex-col items-center justify-center gap-1 text-text-muted">
                    {entry ? (
                      <Camera className="size-5" aria-hidden="true" />
                    ) : (
                      <Lock className="size-5" aria-hidden="true" />
                    )}
                    <Text tone="muted" size="sm" className="text-xs">
                      {entry ? "Foto pendiente" : "Bloqueado"}
                    </Text>
                  </div>
                )}
                <div className="p-2">
                  <Text size="sm" className="font-semibold">
                    {location.name}
                  </Text>
                  <Text tone="muted" size="sm" className="text-xs">
                    {entry ? dateFormatter.format(new Date(entry.unlockedAt)) : location.hint}
                  </Text>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}