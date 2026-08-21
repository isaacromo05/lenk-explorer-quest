import { Minus, Plus, Wrench } from "lucide-react";
import { useState } from "react";

import { Badge, Button, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { LOCATIONS, SECTORS, locationsBySector, type SectorId } from "@/lib/locations";
import { usePassport } from "@/lib/passport";

const SECTOR_IDS: SectorId[] = ["water", "summit", "culture"];

/**
 * Temporary QA panel to simulate the physical journey: increment/decrement
 * scanned QRs and toggle each sector badge. Remove before launch.
 */
export function DebugProgressPanel({ className }: { className?: string }) {
  const { state, scanned, total, unlock, remove, sectorProgress } = usePassport();
  const [open, setOpen] = useState(false);

  const addOne = () => {
    const next = LOCATIONS.find((l) => !state[l.id]);
    if (next) unlock(next.id);
  };
  const removeOne = () => {
    const last = [...LOCATIONS].reverse().find((l) => state[l.id]);
    if (last) remove(last.id);
  };
  const toggleSector = (sector: SectorId) => {
    const locations = locationsBySector(sector);
    const complete = locations.every((l) => state[l.id]);
    locations.forEach((l) => (complete ? remove(l.id) : unlock(l.id)));
  };

  return (
    <div className={cn("rounded-2xl border border-dashed border-border bg-surface/60 p-3", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 text-left text-xs font-semibold text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Wrench className="size-3.5" aria-hidden="true" />
        Modo pruebas · {scanned}/{total} QR
        <span className="ml-auto" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={removeOne}
              disabled={scanned === 0}
              aria-label="Quitar un QR escaneado"
            >
              <Minus className="size-4" aria-hidden="true" />
            </Button>
            <Text size="sm" className="min-w-16 text-center font-semibold">
              {scanned}/{total}
            </Text>
            <Button
              size="sm"
              variant="outline"
              onClick={addOne}
              disabled={scanned === total}
              aria-label="Añadir un QR escaneado"
            >
              <Plus className="size-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SECTOR_IDS.map((sector) => {
              const progress = sectorProgress(sector);
              const complete = progress.current === progress.total;
              return (
                <button
                  key={sector}
                  type="button"
                  onClick={() => toggleSector(sector)}
                  className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <Badge variant={complete ? "trail" : "outline"}>
                    {SECTORS[sector].mascotEmoji} {SECTORS[sector].name}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
