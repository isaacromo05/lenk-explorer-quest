import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";

import { Badge, Button, Heading, Text } from "@/design-system";
import { GUARDIANS } from "@/lib/guardians";
import type { SectorId } from "@/lib/locations";
import { GOLD_PIN, ROUTE_BADGES } from "@/lib/rewards";

export type Achievement = { kind: "route"; sector: SectorId } | { kind: "gold" };

interface AchievementModalProps {
  achievement: Achievement;
  onClose: () => void;
}

/** Celebration sheet shown after completing a route (3/3) or all 8 hitos. */
export function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  const gold = achievement.kind === "gold";
  const badge = gold ? null : ROUTE_BADGES[achievement.sector];
  const guardian = gold ? null : GUARDIANS[achievement.sector];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={gold ? "Gran Premio Lenk Gold Edition" : `Logro: ${badge?.name}`}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-text/70 p-0 sm:items-center sm:p-4"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto overscroll-contain scroll-smooth rounded-2xl bg-surface p-6 pb-12 text-center shadow-lg">
        <div className="mb-2 flex justify-end">
          <Button variant="ghost" size="sm" aria-label="Cerrar" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <img
          src={gold ? GOLD_PIN.front.image : badge!.image}
          alt={gold ? `Pin ${GOLD_PIN.name}` : badge!.name}
          width={512}
          height={512}
          loading="lazy"
          className="mx-auto size-40 object-contain drop-shadow-lg"
        />

        <Badge variant="gold" className="my-4">
          {gold ? "Gran Premio 8/8" : "Ruta completada"}
        </Badge>

        <Heading as="h2" level={3}>
          {gold
            ? "¡Felicidades, te has convertido en un LENK GOLD EDITION!"
            : `¡Has conseguido la ${badge!.shortName}!`}
        </Heading>

        <Text tone="muted" size="sm" className="mt-2">
          {gold
            ? `Has sellado los 8 hitos del valle. Tu Pin Supremo ${GOLD_PIN.name} ${GOLD_PIN.serial} ya está en tu vitrina.`
            : `${guardian!.name} te entrega su insignia oficial por completar todos los hitos de la ruta.`}
        </Text>

        <div className="mt-6 flex flex-col gap-2">
          <Button variant="gold" size="lg" className="w-full" asChild>
            <Link to="/passport" onClick={onClose} className="inline-flex items-center justify-center gap-2">
              🎖️ Ver mi vitrina de insignias
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Seguir explorando
          </Button>
        </div>
      </div>
    </div>
  );
}
