import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, CameraOff, CheckCircle2, Lock, ScanLine } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Heading, Text } from "@/design-system";
import { LOCATIONS, resolveLocation, SECTORS, type Location } from "@/lib/locations";
import { usePassport } from "@/lib/passport";
import { MobileLayout } from "./-components/mobile-layout";
import { PhotoCaptureModal } from "./-components/photo-capture-modal";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Lenk Quest — Escanear QR" },
      { name: "description", content: "Escanea el código QR de un hito de Lenk y sella tu pasaporte con una foto." },
      { property: "og:title", content: "Lenk Quest — Escanear QR" },
      { property: "og:description", content: "Escanea el código QR de un hito de Lenk y sella tu pasaporte con una foto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const { scanned, total, isUnlocked, unlock, hydrated } = usePassport();
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Location | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      setActive(true);
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => undefined);
      }
      const { default: jsQR } = await import("jsqr");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      const tick = () => {
        const v = videoRef.current;
        if (!v || !ctx || !streamRef.current) return;
        if (v.videoWidth) {
          canvas.width = v.videoWidth;
          canvas.height = v.videoHeight;
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
          const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(image.data, image.width, image.height);
          const found = result?.data ? resolveLocation(result.data) : undefined;
          if (found) {
            stop();
            setPending(found);
            return;
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError("No pudimos acceder a la cámara. Usa los botones de prueba para simular un escaneo.");
      setActive(false);
    }
  }, [stop]);

  useEffect(() => stop, [stop]);

  return (
    <MobileLayout>
      <div className="space-y-8">
        <section className="flex flex-col items-center rounded-2xl bg-surface p-6 text-center shadow-sm">
          <Heading as="h1" level={2}>
            Escanear QR
          </Heading>
          <Text tone="muted" size="sm" className="mb-5">
            Apunta la cámara al código QR del hito para desbloquearlo.
          </Text>

          <div className="relative mb-5 aspect-square w-full overflow-hidden rounded-xl border border-border bg-background">
            <video ref={videoRef} playsInline muted className="size-full object-cover" />
            {!active && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
                <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {error ? (
                    <CameraOff className="size-9" aria-hidden="true" />
                  ) : (
                    <ScanLine className="size-9" aria-hidden="true" />
                  )}
                </div>
                <Text tone="muted" size="sm">
                  {error ?? "La cámara está apagada."}
                </Text>
              </div>
            )}
            {active && (
              <div
                className="pointer-events-none absolute inset-8 rounded-xl border-2 border-gold"
                aria-hidden="true"
              />
            )}
          </div>

          {active ? (
            <Button variant="outline" size="lg" onClick={stop}>
              <CameraOff className="size-5" aria-hidden="true" />
              Detener cámara
            </Button>
          ) : (
            <Button size="lg" onClick={() => void start()}>
              <Camera className="size-5" aria-hidden="true" />
              Abrir cámara
            </Button>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Heading as="h2" level={3}>
              Simular escaneo
            </Heading>
            <Badge variant="primary">{hydrated ? `${scanned}/${total}` : `0/${total}`}</Badge>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Los 8 hitos de Lenk</CardTitle>
              <CardDescription>
                Bloqueados por defecto 🔒 — en modo de pruebas puedes simular el escaneo de su QR
                para desbloquearlos.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {LOCATIONS.map((location) => {
                const done = hydrated && isUnlocked(location.id);
                return (
                  <Button
                    key={location.id}
                    variant={done ? "secondary" : "outline"}
                    size="sm"
                    className="h-auto flex-col items-start gap-1 py-3 text-left"
                    onClick={() => {
                      stop();
                      setPending(location);
                    }}
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span aria-hidden="true">{SECTORS[location.sector].mascotEmoji}</span>
                      {done ? (
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                      ) : (
                        <Lock className="size-4 opacity-60" aria-hidden="true" />
                      )}
                    </span>
                    <span className="font-semibold">{location.name}</span>
                    <span className="text-xs font-medium opacity-80">
                      {done ? location.hint : `🔒 ${location.hint}`}
                    </span>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </div>

      {pending && (
        <PhotoCaptureModal
          location={pending}
          onClose={() => setPending(null)}
          onLater={() => {
            setPending(null);
            void navigate({ to: "/passport" });
          }}
          onSave={(photo) => {
            unlock(pending.id, photo);
            setPending(null);
            void navigate({ to: "/passport" });
          }}
        />
      )}
    </MobileLayout>
  );
}
