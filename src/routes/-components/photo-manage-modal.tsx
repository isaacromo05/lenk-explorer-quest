import { RefreshCw, Trash2, X } from "lucide-react";

import { Badge, Button, Heading, Text } from "@/design-system";
import { SECTORS, type Location } from "@/lib/locations";

interface PhotoManageModalProps {
  location: Location;
  photo: string;
  unlockedAtLabel: string;
  onClose: () => void;
  onRetake: () => void;
  onDelete: () => void;
}

/** Passport photo actions: retake with the live camera, or delete the photo. */
export function PhotoManageModal({
  location,
  photo,
  unlockedAtLabel,
  onClose,
  onRetake,
  onDelete,
}: PhotoManageModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto de ${location.name}`}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-text/60 p-0 sm:items-center sm:p-4"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto overscroll-contain scroll-smooth rounded-2xl bg-surface p-5 pb-12 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <Badge variant="gold" className="mb-2">
              <span aria-hidden="true">{SECTORS[location.sector].mascotEmoji}</span> Sellado
            </Badge>
            <Heading as="h2" level={3}>
              {location.name}
            </Heading>
            <Text tone="muted" size="sm">
              {unlockedAtLabel}
            </Text>
          </div>
          <Button variant="ghost" size="sm" aria-label="Cerrar" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <img
          src={photo}
          alt={`Tu foto en ${location.name}`}
          className="mb-4 aspect-square w-full rounded-xl border border-border object-cover"
        />

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onDelete}>
            <Trash2 className="size-4" aria-hidden="true" />
            Eliminar foto
          </Button>
          <Button variant="gold" className="flex-1" onClick={onRetake}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Repetir foto
          </Button>
        </div>
      </div>
    </div>
  );
}