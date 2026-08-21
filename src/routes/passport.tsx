import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Camera, CheckCircle2, Lock, Mail, ScanLine } from "lucide-react";
import { useState } from "react";

import { Badge, Button, Card, CardContent, Heading, Input, Medal, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { LOCATIONS, SECTORS, type Location } from "@/lib/locations";
import { usePassport } from "@/lib/passport";
import { GUARDIANS } from "@/lib/guardians";

import { GOLD_PIN, ROUTE_BADGES } from "@/lib/rewards";
import { DebugProgressPanel } from "./-components/debug-progress-panel";
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
        <section className="space-y-3">
          <Heading as="h1" level={2}>
            Mi Pasaporte
          </Heading>
          <Text tone="muted">
            {hydrated && scanned > 0
              ? `${scanned} de ${total} hitos sellados con tu foto.`
              : "Aquí aparecerán tus fotos y sellos de los hitos escaneados."}
          </Text>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-wood">{hydrated ? scanned : 0}/{total} QR escaneados</span>
              <span className="text-text-muted">
                {Math.round(((hydrated ? scanned : 0) / total) * 100)}%
              </span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-border"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={hydrated ? scanned : 0}
              aria-label="Progreso de QR escaneados"
            >
              <div
                className="h-full rounded-full bg-bronze transition-all"
                style={{ width: `${((hydrated ? scanned : 0) / total) * 100}%` }}
              />
            </div>
          </div>
          <DebugProgressPanel />
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
            Tus Guardianes Desbloqueados
          </Heading>
          <div className="grid grid-cols-3 gap-3">
            {(["water", "summit", "culture"] as const).map((sector) => {
              const progress = sectorProgress(sector);
              const unlocked = hydrated && progress.current === progress.total;
              const guardian = GUARDIANS[sector];
              return (
                <Card
                  key={sector}
                  className={cn(
                    "flex flex-col items-center p-3",
                    unlocked ? "shadow-md ring-2 ring-gold" : "opacity-80",
                  )}
                >
                  <img
                    src={guardian.image}
                    alt={unlocked ? guardian.name : `${guardian.name} en silueta (bloqueado)`}
                    width={512}
                    height={512}
                    loading="lazy"
                    className={cn(
                      "h-24 object-contain",
                      unlocked
                        ? "drop-shadow-[0_0_12px_var(--lenk-gold)]"
                        : "brightness-0 opacity-40",
                    )}
                  />
                  <Text size="sm" className="mt-2 text-center text-xs font-semibold">
                    {guardian.name}
                  </Text>
                  <Text tone="muted" size="sm" className="text-center text-xs">
                    {progress.current}/{progress.total} hitos
                  </Text>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <Heading as="h2" level={3}>
            Insignias digitales
          </Heading>
          <Text tone="muted" size="sm">
            Logros gratuitos: completa todos los hitos de una ruta para desbloquear su insignia.
          </Text>

          <div className="grid grid-cols-3 gap-3">
            {(["water", "summit", "culture"] as const).map((sector) => {
              const progress = sectorProgress(sector);
              const complete = hydrated && progress.current === progress.total;
              const badge = ROUTE_BADGES[sector];
              const missing = progress.total - progress.current;
              return (
                <Card
                  key={sector}
                  className={cn("p-0", complete ? "shadow-md ring-2 ring-bronze" : "opacity-70")}
                >
                  <button
                    type="button"
                    onClick={() => setRouteSector(sector)}
                    aria-label={`Ver detalles de la ${SECTORS[sector].name}`}
                    className="flex w-full flex-col items-center rounded-2xl p-3 transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
                          complete ? "drop-shadow-md" : "opacity-40 grayscale",
                        )}
                      />
                      {!complete && (
                        <Lock className="absolute size-6 text-text-muted" aria-hidden="true" />
                      )}
                      {complete && (
                        <CheckCircle2
                          className="absolute -bottom-1 -right-1 size-6 rounded-full bg-surface text-forest"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <Text size="sm" className="mt-2 text-center text-xs font-semibold">
                      {badge.shortName}
                    </Text>
                    <Text tone="muted" size="sm" className="text-center text-[11px]">
                      {complete
                        ? "Desbloqueada"
                        : `Escanea ${missing} QR para desbloquear`}
                    </Text>
                  </button>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <Heading as="h2" level={3}>
            Pin exclusivo
          </Heading>
          <Card className={cn("border-bronze/50", allDone && "shadow-md ring-2 ring-bronze")}>
            <CardContent className="flex flex-col items-center gap-3 py-6">
              <button
                type="button"
                onClick={() => allDone && setPinOpen(true)}
                disabled={!allDone}
                aria-label={
                  allDone
                    ? `Ver el pin ${GOLD_PIN.name} en 3D`
                    : `Pin ${GOLD_PIN.name} bloqueado — completa los 8 QR`
                }
                className="relative flex size-28 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed"
              >
                <img
                  src={GOLD_PIN.front.image}
                  alt={allDone ? `Pin ${GOLD_PIN.name}` : `Silueta del pin ${GOLD_PIN.name}`}
                  width={512}
                  height={512}
                  loading="lazy"
                  className={cn(
                    "size-28 object-contain",
                    allDone
                      ? "drop-shadow-[0_0_16px_var(--lenk-gold)]"
                      : "opacity-30 grayscale",
                  )}
                />
                {!allDone && <Lock className="absolute size-7 text-text-muted" aria-hidden="true" />}
              </button>
              <Text className="text-center font-semibold">{GOLD_PIN.name}</Text>
              {allDone ? (
                <>
                  <Text tone="muted" size="sm" className="text-center">
                    ¡Has completado los 8 QR del valle! Serial {GOLD_PIN.serial}.
                  </Text>
                  <Button
                    size="lg"
                    className="w-full bg-bronze text-bronze-foreground shadow-md hover:bg-bronze-hover"
                    asChild
                  >
                    <Link to="/shop/configure" className="inline-flex items-center gap-2">
                      <Award className="size-5" aria-hidden="true" />
                      Reclamar Pin Exclusivo — 8,50 CHF
                    </Link>
                  </Button>
                </>
              ) : (
                <Text tone="muted" size="sm" className="text-center">
                  Completa los 8 QR para desbloquear el Pin Exclusivo ({hydrated ? scanned : 0}/
                  {total}).
                </Text>
              )}
            </CardContent>
          </Card>
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
