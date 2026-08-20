import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Lock, Mail, ScanLine } from "lucide-react";
import { useState } from "react";

import { Badge, Button, Card, CardContent, Heading, Input, Medal, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { LOCATIONS, SECTORS, type Location } from "@/lib/locations";
import { usePassport } from "@/lib/passport";
import { GOLD_PIN, ROUTE_BADGES } from "@/lib/rewards";
import { MobileLayout } from "./-components/mobile-layout";
import { PhotoCaptureModal } from "./-components/photo-capture-modal";
import { PhotoManageModal } from "./-components/photo-manage-modal";
import { GoldPinModal } from "./-components/gold-pin-modal";
import { RouteBadgeModal } from "./-components/route-badge-modal";

export const Route = createFileRoute("/passport")({
  head: () => ({
    meta: [
      { title: "Lenk Quest — Mi Pasaporte" },
      { name: "description", content: "Tu pasaporte de explorador: fotos, sellos y guardianes desbloqueados en Lenk." },
      { property: "og:title", content: "Lenk Quest — Mi Pasaporte" },
      { property: "og:description", content: "Tu pasaporte de explorador: fotos, sellos y guardianes desbloqueados en Lenk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PassportPage,
});

const dateFormatter = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" });

function PassportPage() {
  const { state, scanned, total, hydrated, sectorProgress, setPhoto } = usePassport();
  const allDone = hydrated && scanned === total;
  const [managing, setManaging] = useState<Location | null>(null);
  const [retaking, setRetaking] = useState<Location | null>(null);
  const [backupEmail, setBackupEmail] = useState("");
  const [backupSent, setBackupSent] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [routeSector, setRouteSector] = useState<"water" | "summit" | "culture" | null>(null);
  const managingEntry = managing ? state[managing.id] : undefined;

  return (
    <MobileLayout>
      <div className="space-y-8">
        <section className="space-y-2">
          <Heading as="h1" level={2}>
            Mi Pasaporte
          </Heading>
          <Text tone="muted">
            {hydrated && scanned > 0
              ? `${scanned} de ${total} hitos sellados con tu foto.`
              : "Aquí aparecerán tus fotos y sellos de los hitos escaneados."}
          </Text>
        </section>

        <Card className="border-gold/50">
          <CardContent className="space-y-3 py-5">
            <Text className="font-semibold">
              <span aria-hidden="true">✉️</span> ¿Quieres guardar tu progreso?
            </Text>
            <Text tone="muted" size="sm">
              Introduce tu email para enviar un enlace de respaldo.
            </Text>
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                setBackupSent(true);
              }}
            >
              <label htmlFor="backup-email" className="sr-only">
                Email para el respaldo
              </label>
              <Input
                id="backup-email"
                type="email"
                required
                maxLength={255}
                autoComplete="email"
                placeholder="tu@email.com"
                value={backupEmail}
                onChange={(e) => {
                  setBackupEmail(e.target.value);
                  setBackupSent(false);
                }}
                className="flex-1"
              />
              <Button type="submit" variant="gold">
                <Mail className="size-4" aria-hidden="true" />
                Enviar enlace
              </Button>
            </form>
            {backupSent && (
              <Text tone="muted" size="sm">
                Enlace de respaldo enviado a {backupEmail}.
              </Text>
            )}
          </CardContent>
        </Card>

        <section className="space-y-4">
          <Heading as="h2" level={3}>
            Vitrina de insignias
          </Heading>
          <div className="grid grid-cols-2 gap-3">
            {(["water", "summit", "culture"] as const).map((sector) => {
              const progress = sectorProgress(sector);
              const complete = hydrated && progress.current === progress.total;
              const badge = ROUTE_BADGES[sector];
              return (
                <Card key={sector} className={cn("p-0", complete && "shadow-md ring-2 ring-gold")}>
                  <button
                    type="button"
                    onClick={() => setRouteSector(sector)}
                    aria-label={`Ver detalles de la ${SECTORS[sector].name}`}
                    className="flex w-full flex-col items-center rounded-2xl p-4 transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span className="relative flex size-20 items-center justify-center">
                      <img
                        src={badge.image}
                        alt={complete ? badge.name : `${badge.name} bloqueada`}
                        width={512}
                        height={512}
                        loading="lazy"
                        className={cn(
                          "size-20 object-contain",
                          complete ? "drop-shadow-md" : "opacity-25 grayscale",
                        )}
                      />
                      {!complete && (
                        <Lock
                          className="absolute size-6 text-text-muted"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <Text size="sm" className="mt-2 text-center text-xs font-semibold">
                      {badge.shortName}
                    </Text>
                    <Text tone="muted" size="sm" className="text-center text-xs">
                      {progress.current}/{progress.total}
                    </Text>
                  </button>
                </Card>
              );
            })}

            <Card className={cn("p-0", allDone && "shadow-md ring-2 ring-gold")}>
              <button
                type="button"
                onClick={() => allDone && setPinOpen(true)}
                disabled={!allDone}
                aria-label={
                  allDone
                    ? `Ver el pin ${GOLD_PIN.name} en 3D`
                    : `Pin ${GOLD_PIN.name} bloqueado — completa los 8 hitos`
                }
                className="flex w-full flex-col items-center rounded-2xl p-4 transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed"
              >
                <span className="relative flex size-20 items-center justify-center">
                  <img
                    src={GOLD_PIN.front.image}
                    alt={allDone ? `Pin ${GOLD_PIN.name}` : `Pin ${GOLD_PIN.name} bloqueado`}
                    width={512}
                    height={512}
                    loading="lazy"
                    className={cn(
                      "size-20 object-contain",
                      allDone ? "drop-shadow-md" : "opacity-25 grayscale",
                    )}
                  />
                  {!allDone && <Lock className="absolute size-6 text-text-muted" aria-hidden="true" />}
                </span>
                <Text size="sm" className="mt-2 text-center text-xs font-semibold">
                  {GOLD_PIN.name}
                </Text>
                <Text tone="muted" size="sm" className="text-center text-xs">
                  {allDone ? GOLD_PIN.serial : `${scanned}/${total} hitos`}
                </Text>
              </button>
            </Card>
          </div>
          {allDone && (
            <Card className="shadow-md">
              <CardContent className="flex items-center gap-4">
                <Medal label="Lenk Gold Edition">🏅</Medal>
                <Text size="sm">
                  ¡Has completado los 8 hitos del valle! Pulsa el Pin Supremo para verlo en 3D y
                  obtener tu credencial digital de canje.
                </Text>
              </CardContent>
            </Card>
          )}
        </section>


        <section className="space-y-4">
          <Heading as="h2" level={3}>
            Hitos del valle
          </Heading>
          <div className="grid gap-4">
            {LOCATIONS.map((location) => {
              const entry = hydrated ? state[location.id] : undefined;
              const sector = SECTORS[location.sector];
              return (
                <Card key={location.id} className="overflow-hidden">
                  {entry?.photo ? (
                    <button
                      type="button"
                      onClick={() => setManaging(location)}
                      aria-label={`Gestionar tu foto de ${location.name}`}
                      className="block w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      <img
                        src={entry.photo}
                        alt={`Tu foto en ${location.name}`}
                        className="aspect-square w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ) : entry ? (
                    <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 bg-background">
                      <span className="text-4xl" aria-hidden="true">
                        {sector.mascotEmoji}
                      </span>
                      <Text tone="muted" size="sm">
                        Desbloqueado · foto pendiente
                      </Text>
                      <Button variant="gold" size="sm" onClick={() => setRetaking(location)}>
                        <Camera className="size-4" aria-hidden="true" />
                        Tomar foto
                      </Button>
                    </div>
                  ) : (
                    <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 bg-background">
                      <span className="text-4xl opacity-30 grayscale" aria-hidden="true">
                        {sector.mascotEmoji}
                      </span>
                      <Lock className="size-5 text-text-muted" aria-hidden="true" />
                    </div>
                  )}
                  <CardContent className="flex items-start justify-between gap-3 py-4">
                    <div>
                      <Text className="font-semibold">{location.name}</Text>
                      <Text tone="muted" size="sm">
                        {entry
                          ? `${dateFormatter.format(new Date(entry.unlockedAt))}${entry.photo ? "" : " · sin foto"}`
                          : "Bloqueado — escanea su QR"}
                      </Text>
                    </div>
                    <Badge variant={entry?.photo ? "gold" : entry ? "primary" : "outline"}>
                      <span aria-hidden="true" className={cn(!entry && "grayscale")}>
                        {sector.mascotEmoji}
                      </span>
                      {entry?.photo ? "Sellado" : entry ? "Desbloqueado" : "Pendiente"}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <Button size="lg" className="w-full" asChild>
          <Link to="/scan" className="inline-flex items-center gap-2">
            <ScanLine className="size-5" aria-hidden="true" />
            Escanear otro QR
          </Link>
        </Button>
      </div>

      {managing && managingEntry?.photo && (
        <PhotoManageModal
          location={managing}
          photo={managingEntry.photo}
          unlockedAtLabel={dateFormatter.format(new Date(managingEntry.unlockedAt))}
          onClose={() => setManaging(null)}
          onRetake={() => {
            setRetaking(managing);
            setManaging(null);
          }}
          onDelete={() => {
            setPhoto(managing.id, null);
            setManaging(null);
          }}
        />
      )}

      {retaking && state[retaking.id] && (
        <PhotoCaptureModal
          location={retaking}
          mode="retake"
          onClose={() => setRetaking(null)}
          onSave={(photo) => {
            setPhoto(retaking.id, photo);
            setRetaking(null);
          }}
        />
      )}

      {pinOpen && allDone && <GoldPinModal onClose={() => setPinOpen(false)} />}

      {routeSector && (
        <RouteBadgeModal sector={routeSector} state={state} onClose={() => setRouteSector(null)} />
      )}
    </MobileLayout>
  );
}
