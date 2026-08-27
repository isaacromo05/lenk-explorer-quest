import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, ImagePlus, Lock, ShoppingCart, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Badge, Button, Card, CardContent, Heading, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { SECTORS, locationsBySector, type SectorId } from "@/lib/locations";
import { usePassport } from "@/lib/passport";

import { DebugProgressPanel } from "./-components/debug-progress-panel";
import { MobileLayout } from "./-components/mobile-layout";

export const Route = createFileRoute("/shop/configure")({
  head: () => ({
    meta: [
      { title: "Lenk Quest — Configura tu recuerdo" },
      {
        name: "description",
        content:
          "Personaliza tu marco de fotos o figura 3D del Guardián con grabados en madera de las rutas de Lenk.",
      },
      { property: "og:title", content: "Lenk Quest — Configura tu recuerdo" },
      {
        property: "og:description",
        content: "Elige base, sube tus fotos, el grabado en madera y confirma tu recuerdo alpino de Lenk.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfigurePage,
});

interface BaseProduct {
  id: string;
  name: string;
  note: string;
  emoji: string;
  price: number;
  /** Frames need the photo-collage step; figures don't. */
  needsPhotos?: boolean;
}

const BASE_PRODUCTS: BaseProduct[] = [
  {
    id: "frame",
    name: "Marco de Recuerdos",
    note: "Marco de madera de abeto con tu collage de hitos.",
    emoji: "🖼️",
    price: 39,
    needsPhotos: true,
  },
  {
    id: "figure",
    name: "Figura 3D del Guardián",
    note: "Figura coleccionable impresa en 3D sobre peana de madera.",
    emoji: "🗿",
    price: 29,
  },
];

interface Engraving {
  id: string;
  name: string;
  note: string;
  price: number;
  sector?: SectorId;
}

const ENGRAVINGS: Engraving[] = [
  { id: "none", name: "Base estándar (sin grabado)", note: "Madera natural sin grabar.", price: 0 },
  {
    id: "water",
    name: "Grabado Ruta del Agua",
    note: "Cascadas del Simme talladas a láser.",
    price: 5,
    sector: "water",
  },
  {
    id: "summit",
    name: "Grabado Ruta de las Cumbres",
    note: "Silueta del Wildstrubel con el íbice.",
    price: 5,
    sector: "summit",
  },
  {
    id: "culture",
    name: "Grabado Tradición & AlpKultur",
    note: "Cencerro y motivos del Berner Alpkäse.",
    price: 5,
    sector: "culture",
  },
];

const chf = (value: number) => `CHF ${value.toFixed(2)}`;

/** Collage cells: one large central photo plus four smaller ones around it. */
const COLLAGE_CELLS = [
  { id: "top-left", area: "1 / 1 / 2 / 2", label: "Foto superior izquierda" },
  { id: "top-right", area: "1 / 3 / 2 / 4", label: "Foto superior derecha" },
  { id: "center", area: "1 / 2 / 3 / 3", label: "Foto principal" },
  { id: "bottom-left", area: "2 / 1 / 3 / 2", label: "Foto inferior izquierda" },
  { id: "bottom-right", area: "2 / 3 / 3 / 4", label: "Foto inferior derecha" },
] as const;

type StepId = "base" | "photos" | "engraving" | "summary";

const STEP_LABELS: Record<StepId, string> = {
  base: "Objeto base",
  photos: "Tus Fotos",
  engraving: "Grabado en madera",
  summary: "Resumen",
};

function ConfigurePage() {
  const { hydrated, sectorProgress } = usePassport();
  const [step, setStep] = useState(0);
  const [baseId, setBaseId] = useState(BASE_PRODUCTS[0].id);
  const [engravingId, setEngravingId] = useState("none");
  const [added, setAdded] = useState(false);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const inputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const base = BASE_PRODUCTS.find((p) => p.id === baseId)!;
  const engraving = ENGRAVINGS.find((e) => e.id === engravingId)!;
  const total = base.price + engraving.price;

  const steps: StepId[] = base.needsPhotos
    ? ["base", "photos", "engraving", "summary"]
    : ["base", "engraving", "summary"];
  const currentStep = steps[Math.min(step, steps.length - 1)];
  const photoCount = Object.values(photos).filter(Boolean).length;

  const badgeUnlocked = useMemo(
    () => (sector: SectorId) => {
      const progress = sectorProgress(sector);
      return hydrated && progress.current === progress.total;
    },
    [hydrated, sectorProgress],
  );

  const selectBase = (id: string) => {
    setBaseId(id);
    setStep(0);
  };

  const handleFile = (cellId: string, file: File | undefined) => {
    if (!file) return;
    setPhotos((prev) => {
      const previous = prev[cellId];
      if (previous) URL.revokeObjectURL(previous);
      return { ...prev, [cellId]: URL.createObjectURL(file) };
    });
  };

  const removePhoto = (cellId: string) => {
    setPhotos((prev) => {
      const previous = prev[cellId];
      if (previous) URL.revokeObjectURL(previous);
      const next = { ...prev };
      delete next[cellId];
      return next;
    });
    const input = inputsRef.current[cellId];
    if (input) input.value = "";
  };

  const goNext = () => setStep((s) => Math.min(steps.length - 1, s + 1));

  return (
    <MobileLayout>
      <div className="space-y-6">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a la Tienda
        </Link>

        <section className="space-y-2">
          <Heading as="h1" level={2}>
            Configura tu recuerdo
          </Heading>
          <Text tone="muted">
            {base.needsPhotos
              ? "Elige el objeto, sube tus fotos, el grabado en madera y confirma tu pedido."
              : "Tres pasos: elige el objeto, el grabado en madera y confirma tu pedido."}
          </Text>
        </section>

        <ol className="flex items-center gap-2">
          {steps.map((id, index) => (
            <li key={id} className="flex flex-1 flex-col gap-1">
              <span
                className={cn("h-1.5 rounded-full", index <= step ? "bg-bronze" : "bg-border")}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  index === step ? "text-wood" : "text-text-muted",
                )}
              >
                {index + 1}. {STEP_LABELS[id]}
              </span>
            </li>
          ))}
        </ol>

        {currentStep === "base" && (
          <section className="space-y-3">
            <Heading as="h2" level={4}>
              Paso 1 · Objeto base
            </Heading>
            {BASE_PRODUCTS.map((product) => {
              const selected = product.id === baseId;
              return (
                <Card
                  key={product.id}
                  className={cn("p-0", selected && "ring-2 ring-bronze shadow-md")}
                >
                  <button
                    type="button"
                    onClick={() => selectBase(product.id)}
                    aria-pressed={selected}
                    className="flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span className="text-3xl" aria-hidden="true">
                      {product.emoji}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-text">{product.name}</span>
                      <span className="block text-xs text-text-muted">{product.note}</span>
                    </span>
                    <span className="text-sm font-semibold text-wood">{chf(product.price)}</span>
                    {selected && <Check className="size-5 text-forest" aria-hidden="true" />}
                  </button>
                </Card>
              );
            })}
          </section>
        )}

        {currentStep === "photos" && (
          <section className="space-y-3">
            <Heading as="h2" level={4}>
              Paso 2 · Tus Fotos
            </Heading>
            <Text tone="muted" size="sm">
              Toca cada hueco del marco para elegir una foto de tu aventura. Necesitas al menos una.
            </Text>

            <Card className="border-wood/30 shadow-md">
              <CardContent className="py-5">
                <div
                  className="grid gap-2 rounded-xl border-4 border-wood/70 bg-wood/10 p-3"
                  style={{
                    gridTemplateColumns: "1fr 1.4fr 1fr",
                    gridTemplateRows: "1fr 1fr",
                  }}
                >
                  {COLLAGE_CELLS.map((cell) => {
                    const src = photos[cell.id];
                    return (
                      <div key={cell.id} className="relative" style={{ gridArea: cell.area }}>
                        <input
                          ref={(el) => {
                            inputsRef.current[cell.id] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFile(cell.id, e.target.files?.[0])}
                        />
                        <button
                          type="button"
                          onClick={() => inputsRef.current[cell.id]?.click()}
                          aria-label={src ? `Cambiar ${cell.label}` : `Añadir ${cell.label}`}
                          className={cn(
                            "flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-bronze/60 bg-surface transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                            src && "border-solid border-bronze",
                          )}
                        >
                          {src ? (
                            <img
                              src={src}
                              alt={cell.label}
                              className="size-full object-cover"
                            />
                          ) : (
                            <ImagePlus className="size-6 text-bronze" aria-hidden="true" />
                          )}
                        </button>
                        {src && (
                          <button
                            type="button"
                            onClick={() => removePhoto(cell.id)}
                            aria-label={`Quitar ${cell.label}`}
                            className="absolute -right-1 -top-1 rounded-full bg-wood p-1 text-wood-foreground shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          >
                            <X className="size-3" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <Badge variant="outline">{photoCount}/5 fotos</Badge>
                  <Button
                    className="bg-bronze text-bronze-foreground hover:bg-bronze-hover"
                    onClick={goNext}
                    disabled={photoCount === 0}
                  >
                    Continuar al Grabado
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {currentStep === "engraving" && (
          <section className="space-y-3">
            <Heading as="h2" level={4}>
              Paso {steps.indexOf("engraving") + 1} · Grabado en madera
            </Heading>
            <Text tone="muted" size="sm">
              Los grabados temáticos requieren la insignia digital de esa ruta.
            </Text>
            {ENGRAVINGS.map((option) => {
              const locked = option.sector ? !badgeUnlocked(option.sector) : false;
              const selected = option.id === engravingId;
              const sectorName = option.sector ? SECTORS[option.sector].name : null;
              const missing = option.sector
                ? locationsBySector(option.sector).length - sectorProgress(option.sector).current
                : 0;
              return (
                <Card
                  key={option.id}
                  className={cn(
                    "p-0",
                    selected && !locked && "ring-2 ring-bronze shadow-md",
                    locked && "opacity-60",
                  )}
                >
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => setEngravingId(option.id)}
                    aria-pressed={selected}
                    title={
                      locked
                        ? `Necesitas la insignia de la ${sectorName} — te faltan ${missing} QR`
                        : undefined
                    }
                    className="flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:grayscale"
                  >
                    <span className="flex-1">
                      <span className="flex items-center gap-2 text-sm font-semibold text-text">
                        {option.name}
                        {locked && <Lock className="size-3.5 text-text-muted" aria-hidden="true" />}
                      </span>
                      <span className="block text-xs text-text-muted">
                        {locked
                          ? `Bloqueado · escanea ${missing} QR de la ${sectorName}`
                          : option.note}
                      </span>
                    </span>
                    <span className="text-sm font-semibold text-wood">
                      {option.price === 0 ? "+0 CHF" : `+${option.price} CHF`}
                    </span>
                    {selected && !locked && (
                      <Check className="size-5 text-forest" aria-hidden="true" />
                    )}
                  </button>
                </Card>
              );
            })}
          </section>
        )}

        {currentStep === "summary" && (
          <section className="space-y-3">
            <Heading as="h2" level={4}>
              Paso {steps.length} · Resumen
            </Heading>
            <Card className="border-bronze/50 shadow-md">
              <CardContent className="space-y-3 py-5">
                {base.needsPhotos && photoCount > 0 && (
                  <div className="space-y-2">
                    <Text tone="muted" size="sm">
                      Tu collage ({photoCount} {photoCount === 1 ? "foto" : "fotos"})
                    </Text>
                    <div
                      className="grid w-40 gap-1 rounded-lg border-2 border-wood/70 bg-wood/10 p-1.5"
                      style={{ gridTemplateColumns: "1fr 1.4fr 1fr", gridTemplateRows: "1fr 1fr" }}
                    >
                      {COLLAGE_CELLS.map((cell) => (
                        <div
                          key={cell.id}
                          style={{ gridArea: cell.area }}
                          className="aspect-square overflow-hidden rounded border border-bronze/40 bg-surface"
                        >
                          {photos[cell.id] && (
                            <img
                              src={photos[cell.id]}
                              alt={cell.label}
                              className="size-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-text-muted">{base.name}</dt>
                    <dd className="font-semibold text-text">{chf(base.price)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">{engraving.name}</dt>
                    <dd className="font-semibold text-text">{chf(engraving.price)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base">
                    <dt className="font-bold text-wood">Total</dt>
                    <dd className="font-bold text-wood">{chf(total)}</dd>
                  </div>
                </dl>
                <Button
                  className="w-full bg-bronze text-bronze-foreground hover:bg-bronze-hover"
                  size="lg"
                  onClick={() => setAdded(true)}
                >
                  <ShoppingCart className="size-5" aria-hidden="true" />
                  Añadir al carrito
                </Button>
                {added && (
                  <Text tone="muted" size="sm">
                    ✅ {base.name} con {engraving.name.toLowerCase()} añadido al carrito.
                  </Text>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Anterior
          </Button>
          <Button
            className="flex-1"
            onClick={goNext}
            disabled={
              step === steps.length - 1 || (currentStep === "photos" && photoCount === 0)
            }
          >
            Siguiente
          </Button>
        </div>

        <DebugProgressPanel />
      </div>
    </MobileLayout>
  );
}
