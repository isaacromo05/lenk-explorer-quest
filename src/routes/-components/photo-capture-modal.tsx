import { Camera, Clock, RefreshCw, SwitchCamera, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge, Button, Heading, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { SECTORS, type Location } from "@/lib/locations";

interface PhotoCaptureModalProps {
  location: Location;
  /** "unlock" shows the celebration + choice first; "retake" goes straight to the live camera. */
  mode?: "unlock" | "retake";
  onClose: () => void;
  onSave: (photo: string) => void;
  /** "Hacer foto más tarde" — the location stays unlocked without a photo. */
  onLater?: () => void;
}

function token(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** Draw the branded Lenk Quest frame + location name on top of a captured frame. */
function drawOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, location: Location) {
  const primary = token("--lenk-primary", "#1a2b4c");
  const gold = token("--lenk-gold", "#d4af37");
  const white = token("--lenk-primary-foreground", "#ffffff");
  const pad = Math.round(width * 0.03);
  const border = Math.max(6, Math.round(width * 0.018));

  ctx.strokeStyle = gold;
  ctx.lineWidth = border;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  const barHeight = Math.round(height * 0.16);
  ctx.fillStyle = primary;
  ctx.globalAlpha = 0.9;
  ctx.fillRect(pad + border / 2, height - pad - barHeight, width - pad * 2 - border, barHeight);
  ctx.globalAlpha = 1;

  ctx.fillStyle = white;
  ctx.textBaseline = "middle";
  ctx.font = `800 ${Math.round(barHeight * 0.34)}px "Plus Jakarta Sans", Inter, sans-serif`;
  ctx.fillText(location.name, pad + border * 2, height - pad - barHeight * 0.62);

  ctx.fillStyle = gold;
  ctx.font = `600 ${Math.round(barHeight * 0.22)}px "Plus Jakarta Sans", Inter, sans-serif`;
  ctx.fillText(
    `LENK QUEST 🏔️ · ${SECTORS[location.sector].name}`,
    pad + border * 2,
    height - pad - barHeight * 0.26,
  );
}

export function PhotoCaptureModal({
  location,
  mode = "unlock",
  onClose,
  onSave,
  onLater,
}: PhotoCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stage, setStage] = useState<"celebrate" | "camera">(mode === "unlock" ? "celebrate" : "camera");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [starting, setStarting] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
  }, []);

  /**
   * Full WebRTC restart whenever the live camera is shown or the facing mode
   * toggles: old tracks are stopped, the <video> is detached, and a fresh
   * stream is attached — this is what prevents the black-screen on switch.
   */
  useEffect(() => {
    if (stage !== "camera" || photo) return;
    let cancelled = false;

    const attach = async () => {
      setStarting(true);
      setCameraError(null);
      stopCamera();
      const attempts: MediaStreamConstraints[] = [
        { video: { facingMode: { ideal: facingMode } }, audio: false },
        { video: true, audio: false },
      ];
      for (const constraints of attempts) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          const video = videoRef.current;
          if (video) {
            video.srcObject = stream;
            await video.play().catch(() => undefined);
          }
          setStarting(false);
          return;
        } catch {
          /* try the next, less strict constraint set */
        }
      }
      if (!cancelled) {
        setStarting(false);
        setCameraError(
          "Necesitamos acceso a la cámara para sellar este hito. Activa el permiso y vuelve a intentarlo.",
        );
      }
    };

    void attach();
    return () => {
      cancelled = true;
    };
  }, [stage, facingMode, photo, stopCamera, retryKey]);

  useEffect(() => stopCamera, [stopCamera]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  const composite = useCallback(
    (source: HTMLVideoElement | HTMLImageElement, w: number, h: number) => {
      const canvas = document.createElement("canvas");
      const size = Math.min(w, h);
      // Compress to WebP, capped at 1920px on the long edge, to keep LocalStorage light.
      const target = Math.min(1920, Math.max(720, size));
      canvas.width = target;
      canvas.height = target;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      const sx = (w - size) / 2;
      const sy = (h - size) / 2;
      ctx.drawImage(source, sx, sy, size, size, 0, 0, canvas.width, canvas.height);
      drawOverlay(ctx, canvas.width, canvas.height, location);
      const webp = canvas.toDataURL("image/webp", 0.85);
      return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.85);
    },
    [location],
  );

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const data = composite(video, video.videoWidth, video.videoHeight);
    if (data) {
      setPhoto(data);
      stopCamera();
    }
  };

  const retake = () => {
    setPhoto(null);
    setRetryKey((k) => k + 1);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Lugar desbloqueado: ${location.name}`}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-text/60 p-0 sm:items-center sm:p-4"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto overscroll-contain scroll-smooth rounded-2xl bg-surface p-5 pb-12 shadow-lg">
        {stage === "celebrate" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="text-6xl" aria-hidden="true">
              {SECTORS[location.sector].mascotEmoji}
            </span>
            <Badge variant="gold">¡Desbloqueado y guardado!</Badge>
            <Heading as="h2" level={3}>
              ¡{location.name} desbloqueado!
            </Heading>
            <Text tone="muted" size="sm">
              {SECTORS[location.sector].mascot} te acompaña. Ya está sellado en tu pasaporte: puedes
              hacer la foto ahora o cuando quieras.
            </Text>
            <div className="mt-2 flex w-full flex-col gap-3">
              <Button variant="gold" size="lg" onClick={() => setStage("camera")}>
                <Camera className="size-4" aria-hidden="true" />
                Tomar foto ahora
              </Button>
              <Button variant="outline" size="lg" onClick={() => (onLater ?? onClose)()}>
                <Clock className="size-4" aria-hidden="true" />
                Hacer foto más tarde
              </Button>
            </div>
          </div>
        )}
        <div className={cn(stage === "celebrate" && "hidden")}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <Badge variant="gold" className="mb-2">
              {mode === "retake" ? "Repetir foto" : "¡Desbloqueado!"}
            </Badge>
            <Heading as="h2" level={3}>
              {mode === "retake" ? location.name : `¡Lugar Desbloqueado: ${location.name}!`}
            </Heading>
            <Text tone="muted" size="sm">
              Foto en directo: sella tu pasaporte aquí mismo.
            </Text>
          </div>
          <Button variant="ghost" size="sm" aria-label="Cerrar" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl border border-border bg-background">
          <video
            ref={videoRef}
            playsInline
            muted
            className={cn(
              "size-full object-cover",
              photo && "hidden",
              facingMode === "user" && "-scale-x-100",
            )}
          />
          {photo ? (
            <img src={photo} alt={`Tu foto en ${location.name}`} className="size-full object-cover" />
          ) : (
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-end">
              <div className="m-3 rounded-lg border-2 border-gold" aria-hidden="true">
                <div className="flex flex-col gap-0.5 bg-primary/90 px-3 py-2">
                  <span className="font-display text-sm font-extrabold text-primary-foreground">
                    {location.name}
                  </span>
                  <span className="text-[10px] font-semibold text-gold">
                    LENK QUEST 🏔️ · {SECTORS[location.sector].name}
                  </span>
                </div>
              </div>
            </div>
          )}
          {starting && !photo && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 p-6 text-center">
              <Text tone="muted" size="sm">
                Activando la cámara…
              </Text>
            </div>
          )}
          {cameraError && !photo && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <Text tone="muted" size="sm">
                {cameraError}
              </Text>
            </div>
          )}
        </div>

        {photo ? (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={retake}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Rehacer
            </Button>
            <Button variant="gold" className="flex-1" onClick={() => onSave(photo)}>
              Guardar en pasaporte
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            {cameraError && (
              <Button variant="outline" className="flex-1" onClick={() => setRetryKey((k) => k + 1)}>
                Reintentar cámara
              </Button>
            )}
            <Button className="flex-1" onClick={capture} disabled={Boolean(cameraError) || starting}>
              <Camera className="size-4" aria-hidden="true" />
              Tomar foto
            </Button>
            <Button
              variant="outline"
              onClick={switchCamera}
              aria-label="Cambiar cámara"
              title="Cambiar cámara"
              disabled={starting}
            >
              <SwitchCamera className="size-4" aria-hidden="true" />
              Cambiar cámara 🔄
            </Button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
