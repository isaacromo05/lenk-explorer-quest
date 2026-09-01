import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, ImagePlus, Lock, Plus, ShoppingCart, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Badge, Button, Card, CardContent, Heading, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { lookupSku, toCartItem, useCatalog } from "@/lib/catalog";
import { SECTORS, locationsBySector, type SectorId } from "@/lib/locations";
import { usePassport } from "@/lib/passport";
import { SKU, formatMoney } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

import { DebugProgressPanel } from "./-components/debug-progress-panel";
import { MobileLayout } from "./-components/mobile-layout";

type ProductId = "frame" | "figure";

export const Route = createFileRoute("/shop/configure")({
  validateSearch: (search: Record<string, unknown>): { product: ProductId } => ({
    product: search.product === "figure" ? "figure" : "frame",
  }),
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
        content: "Sube tus fotos, elige los grabados en madera y confirma tu recuerdo alpino de Lenk.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfigurePage,
});

interface BaseProduct {
  id: ProductId;
  name: string;
  note: string;
  emoji: string;
  price: number;
  /** Frames need the photo-collage step; figures don't. */
  needsPhotos?: boolean;
}

const BASE_PRODUCTS: Record<ProductId, BaseProduct> = {
  frame: {
    id: "frame",
    name: "Marco de Recuerdos",
    note: "Marco de madera de abeto con tu collage de hitos.",
    emoji: "🖼️",
    price: 39,
    needsPhotos: true,
  },
  figure: {
    id: "figure",
    name: "Figura 3D del Guardián",
    note: "Figura coleccionable impresa en 3D sobre peana de madera.",
    emoji: "🗿",
    price: 29,
  },
};

interface Engraving {
  id: string;
  name: string;
  note: string;
  price: number;
  sector?: SectorId;
}

const ENGRAVINGS: Engraving[] = [
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

const chf = (value: number) => formatMoney({ amount: value, currencyCode: "CHF" });

const MAX_PHOTOS = 8;

/** Adaptive collage layout: columns + per-cell spans so 1–8 photos always fill the frame. */
function collageLayout(count: number): { cols: number; span: (index: number) => string } {
  switch (count) {
    case 1:
      return { cols: 1, span: () => "col-span-1 row-span-1" };
    case 2:
      return { cols: 2, span: () => "col-span-1" };
    case 3:
      return {
        cols: 2,
        span: (i) => (i === 0 ? "col-span-2 aspect-[2/1]" : "col-span-1"),
      };
    case 4:
      return { cols: 2, span: () => "col-span-1" };
    case 5:
      return {
        cols: 6,
        span: (i) => (i < 2 ? "col-span-3" : "col-span-2"),
      };
    case 6:
      return { cols: 3, span: () => "col-span-1" };
    case 7:
      return {
        cols: 6,
        span: (i) => (i < 1 ? "col-span-6 aspect-[3/1]" : i < 3 ? "col-span-3" : "col-span-2"),
      };
    default:
      return { cols: 4, span: () => "col-span-1" };
  }
}

type StepId = "photos" | "engraving" | "summary";

const STEP_LABELS: Record<StepId, string> = {
  photos: "Tus Fotos",
  engraving: "Grabado en madera",
  summary: "Resumen",
};

interface Photo {
  id: string;
  url: string;
}

function ConfigurePage() {
  const { product } = Route.useSearch();
  const { hydrated, sectorProgress } = usePassport();
  const [step, setStep] = useState(0);
  const [engravingIds, setEngravingIds] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: products } = useCatalog();
  const addItem = useCartStore((s) => s.addItem);
  const isBusy = useCartStore((s) => s.isLoading);

  const base = BASE_PRODUCTS[product];
  const baseEntry = lookupSku(products, product === "frame" ? SKU.frame.m : SKU.figure.water);
  const basePrice = baseEntry ? Number.parseFloat(baseEntry.variant.price.amount) : base.price;

  /** Shopify variant behind each engraving option, gated by the route badge. */
  const engravingEntry = (option: Engraving) =>
    option.sector ? lookupSku(products, SKU.engraving[option.sector]) : null;
  const engravingPrice = (option: Engraving) => {
    const entry = engravingEntry(option);
    return entry ? Number.parseFloat(entry.variant.price.amount) : option.price;
  };

  const selectedEngravings = ENGRAVINGS.filter((e) => engravingIds.includes(e.id));
  const engravingTotal = selectedEngravings.reduce((sum, e) => sum + engravingPrice(e), 0);
  const total = basePrice + engravingTotal;

  const addConfiguredToCart = async () => {
    if (!baseEntry) return;
    const lines = [
      toCartItem(baseEntry.product, baseEntry.variant, {
        attributes: base.needsPhotos
          ? [{ key: "Fotos del collage", value: String(photos.length) }]
          : undefined,
      }),
      ...selectedEngravings
        .map((option) => {
          const entry = engravingEntry(option);
          return entry ? toCartItem(entry.product, entry.variant) : null;
        })
        .filter((line): line is NonNullable<typeof line> => line !== null),
    ];
    await addItem(lines[0]!, `${base.name} añadido al carrito`);
    for (const line of lines.slice(1)) {
      await addItem(line, `${line.title} añadido al carrito`);
    }
    setAdded(true);
  };

  const steps: StepId[] = base.needsPhotos
    ? ["photos", "engraving", "summary"]
    : ["engraving", "summary"];
  const currentStep = steps[Math.min(step, steps.length - 1)];
  const photoCount = photos.length;
  const layout = collageLayout(Math.max(photoCount, 1));

  const badgeUnlocked = useMemo(
    () => (sector: SectorId) => {
      const progress = sectorProgress(sector);
      return hydrated && progress.current === progress.total;
    },
    [hydrated, sectorProgress],
  );

  const addPhotos = (files: FileList | null) => {
    if (!files?.length) return;
    setPhotos((prev) => {
      const room = MAX_PHOTOS - prev.length;
      const next = Array.from(files)
        .slice(0, room)
        .map((file) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          url: URL.createObjectURL(file),
        }));
      return [...prev, ...next];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const toggleEngraving = (id: string) =>
    setEngravingIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

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
            <span className="mr-1" aria-hidden="true">
              {base.emoji}
            </span>
            {base.name} · {base.note}
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

        {currentStep === "photos" && (
          <section className="space-y-3">
            <Heading as="h2" level={4}>
              Paso 1 · Tus Fotos
            </Heading>
            <Text tone="muted" size="sm">
              Añade entre 1 y {MAX_PHOTOS} fotos de tu aventura. El collage se reorganiza solo para
              llenar el marco.
            </Text>

            <Card className="border-wood/30 shadow-md">
              <CardContent className="py-5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addPhotos(e.target.files)}
                />
                <div
                  className="grid gap-2 rounded-xl border-4 border-wood/70 bg-wood/10 p-3"
                  style={{ gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))` }}
                >
                  {photos.map((photo, index) => (
                    <div key={photo.id} className={cn("relative", layout.span(index))}>
                      <img
                        src={photo.url}
                        alt={`Foto ${index + 1} del collage`}
                        className="size-full aspect-square rounded-lg border-2 border-bronze object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        aria-label={`Quitar foto ${index + 1}`}
                        className="absolute -right-1 -top-1 rounded-full bg-wood p-1 text-wood-foreground shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <X className="size-3" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  {photoCount < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Añadir foto"
                      className={cn(
                        "flex aspect-square w-full items-center justify-center gap-1 rounded-lg border-2 border-dashed border-bronze/60 bg-surface transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        photoCount === 0 && "col-span-full",
                      )}
                    >
                      {photoCount === 0 ? (
                        <>
                          <ImagePlus className="size-6 text-bronze" aria-hidden="true" />
                          <span className="text-xs font-semibold text-bronze">Añadir fotos</span>
                        </>
                      ) : (
                        <Plus className="size-6 text-bronze" aria-hidden="true" />
                      )}
                    </button>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <Badge variant="outline">
                    {photoCount}/{MAX_PHOTOS} fotos
                  </Badge>
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
              Puedes combinar varios grabados. Los temáticos requieren la insignia digital de esa
              ruta.
            </Text>
            {ENGRAVINGS.map((option) => {
              const locked = option.sector ? !badgeUnlocked(option.sector) : false;
              const selected = engravingIds.includes(option.id);
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
                    onClick={() => toggleEngraving(option.id)}
                    role="checkbox"
                    aria-checked={selected}
                    title={
                      locked
                        ? `Necesitas la insignia de la ${sectorName} — te faltan ${missing} QR`
                        : undefined
                    }
                    className="flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:grayscale"
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-md border-2",
                        selected && !locked
                          ? "border-forest bg-forest text-white"
                          : "border-border bg-surface",
                      )}
                      aria-hidden="true"
                    >
                      {selected && !locked && <Check className="size-3.5" />}
                    </span>
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
                      +{chf(engravingPrice(option))}
                    </span>
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
                      style={{ gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))` }}
                    >
                      {photos.map((photo, index) => (
                        <div
                          key={photo.id}
                          className={cn(
                            "overflow-hidden rounded border border-bronze/40 bg-surface",
                            layout.span(index),
                          )}
                        >
                          <img
                            src={photo.url}
                            alt={`Foto ${index + 1} del collage`}
                            className="size-full aspect-square object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-text-muted">{base.name}</dt>
                    <dd className="font-semibold text-text">{chf(basePrice)}</dd>
                  </div>
                  {selectedEngravings.length === 0 && (
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Sin grabado</dt>
                      <dd className="font-semibold text-text">{chf(0)}</dd>
                    </div>
                  )}
                  {selectedEngravings.map((option) => (
                    <div key={option.id} className="flex justify-between">
                      <dt className="text-text-muted">{option.name}</dt>
                      <dd className="font-semibold text-text">{chf(engravingPrice(option))}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-border pt-2 text-base">
                    <dt className="font-bold text-wood">Total</dt>
                    <dd className="font-bold text-wood">{chf(total)}</dd>
                  </div>
                </dl>
                <Button
                  className="w-full bg-bronze text-bronze-foreground hover:bg-bronze-hover"
                  size="lg"
                  disabled={isBusy || !baseEntry}
                  onClick={() => void addConfiguredToCart()}
                >
                  <ShoppingCart className="size-5" aria-hidden="true" />
                  Añadir al carrito
                </Button>
                {added && (
                  <Text tone="muted" size="sm">
                    ✅ {base.name}
                    {selectedEngravings.length > 0
                      ? ` con ${selectedEngravings.length} grabado${selectedEngravings.length === 1 ? "" : "s"}`
                      : ""}{" "}
                    añadido al carrito.
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
            disabled={step === steps.length - 1 || (currentStep === "photos" && photoCount === 0)}
          >
            Siguiente
          </Button>
        </div>

        <DebugProgressPanel />
      </div>
    </MobileLayout>
  );
}
