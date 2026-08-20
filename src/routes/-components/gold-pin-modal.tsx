import { Link } from "@tanstack/react-router";
import { QrCode, RotateCcw, X } from "lucide-react";
import { useState } from "react";

import { Badge, Button, Heading, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { GOLD_PIN } from "@/lib/rewards";

interface GoldPinModalProps {
  onClose: () => void;
}

/** Interactive 3D flip card for the supreme "Lenk Gold Edition" pin. */
export function GoldPinModal({ onClose }: GoldPinModalProps) {
  const [flipped, setFlipped] = useState(false);
  const [credential, setCredential] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Pin ${GOLD_PIN.name}`}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-text/70 p-0 sm:items-center sm:p-4"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto overscroll-contain scroll-smooth rounded-2xl bg-surface p-6 pb-12 shadow-lg">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <Heading as="h2" level={3}>
              {GOLD_PIN.name}
            </Heading>
            <Text tone="muted" size="sm">
              Pin Supremo · {GOLD_PIN.serial}
            </Text>
          </div>
          <Button variant="ghost" size="sm" aria-label="Cerrar" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Tarjeta 3D con dos caras */}
        <div className="mx-auto w-full max-w-xs [perspective:1200px]">
          <div
            className={cn(
              "relative aspect-square w-full transition-transform duration-700 [transform-style:preserve-3d]",
              flipped && "[transform:rotateY(180deg)]",
            )}
          >
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gold/10 p-4 [backface-visibility:hidden]">
              <img
                src={GOLD_PIN.front.image}
                alt={`${GOLD_PIN.front.title}: ${GOLD_PIN.front.caption}`}
                width={512}
                height={512}
                loading="lazy"
                className="size-full object-contain drop-shadow-lg"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gold/10 p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <img
                src={GOLD_PIN.back.image}
                alt={`${GOLD_PIN.back.title} grabado: ${GOLD_PIN.back.lines.join(", ")}`}
                width={512}
                height={512}
                loading="lazy"
                className="size-full object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Badge variant="gold">{flipped ? GOLD_PIN.back.title : GOLD_PIN.front.title}</Badge>
          <Text tone="muted" size="sm" className="mt-2">
            {flipped ? GOLD_PIN.back.lines.join(" · ") : GOLD_PIN.front.caption}
          </Text>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Button variant="gold" size="lg" className="w-full" onClick={() => setFlipped((f) => !f)}>
            <RotateCcw className="size-5" aria-hidden="true" />
            Dar la vuelta al Pin
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => setCredential((c) => !c)}>
            <QrCode className="size-5" aria-hidden="true" />
            {credential ? "Ocultar credencial digital" : "Mostrar Credencial Digital"}
          </Button>
          <Button variant="primary" size="lg" className="w-full" asChild>
            <Link
              to="/shop"
              hash="recompensas-desbloqueadas"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2"
            >
              📦 Pedir mi Pin de Colección Online
            </Link>
          </Button>
        </div>

        {credential && (
          <div className="mt-5 rounded-2xl border border-gold/50 bg-gold/10 p-5 text-center">
            <Text className="font-semibold">Credencial Digital de canje</Text>
            <Text tone="muted" size="sm" className="mb-4">
              Usa esta credencial en tu pedido online para recibir tu pin físico en casa.
            </Text>
            <div
              className="mx-auto grid size-32 grid-cols-8 gap-px rounded-xl bg-surface p-2"
              aria-hidden="true"
            >
              {Array.from({ length: 64 }).map((_, i) => (
                <span
                  key={i}
                  className={cn("block size-full rounded-[1px]", (i * 7) % 5 < 2 ? "bg-primary" : "bg-transparent")}
                />
              ))}
            </div>
            <Text size="sm" className="mt-3 font-semibold">
              CERTIFIED ALPINIST · {GOLD_PIN.serial}
            </Text>
            <Text tone="muted" size="sm" className="text-xs">
              SWITZERLAND • 8/8 TRAILS
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
