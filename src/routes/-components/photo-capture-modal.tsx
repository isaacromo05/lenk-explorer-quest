import { Camera, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge, Button, Heading, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { SECTORS, type Location } from "@/lib/locations";

interface PhotoCaptureModalProps {
  location: Location;
  onClose: () => void;
  onSave: (photo: string) => void;
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

export function PhotoCaptureModal({ location, onClose, onSave }: PhotoCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
    } catch {
      setCameraError("No pudimos abrir la cámara. Sube una foto desde tu galería.");
    }
  }, []);

  useEffect(() => {
    void startCamera();
    return stopCamera;
  }, [startCamera, stopCamera]);

  const composite = useCallback(
    (source: HTMLVideoElement | HTMLImageElement, w: number, h: number) => {
      const canvas = document.createElement("canvas");
      const size = Math.min(w, h);
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      const sx = (w - size) / 2;
      const sy = (h - size) / 2;
      ctx.drawImage(source, sx, sy, size, size, 0, 0, canvas.width, canvas.height);
      drawOverlay(ctx, canvas.width, canvas.height, location);
      return canvas.toDataURL("image/jpeg", 0.85);
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

  const handleFile = (file: File) => {
    const img = new Image();
    img.onload = () => {
      const data = composite(img, img.naturalWidth, img.naturalHeight);
      if (data) {
        setPhoto(data);
        stopCamera();
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const retake = () => {
    setPhoto(null);
    void startCamera();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Lugar desbloqueado: ${location.name}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-text/60 p-0 sm:items-center sm:p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface p-5 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <Badge variant="gold" className="mb-2">
              ¡Desbloqueado!
            </Badge>
            <Heading as="h2" level={3}>
              ¡Lugar Desbloqueado: {location.name}!
            </Heading>
            <Text tone="muted" size="sm">
              Hazte una foto para sellar tu pasaporte.
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
            className={cn("size-full object-cover", photo && "hidden")}
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
          {cameraError && !photo && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <Text tone="muted" size="sm">
                {cameraError}
              </Text>
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

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
            <Button variant="outline" className="flex-1" onClick={() => fileRef.current?.click()}>
              Subir foto
            </Button>
            <Button className="flex-1" onClick={capture} disabled={Boolean(cameraError)}>
              <Camera className="size-4" aria-hidden="true" />
              Tomar foto
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
