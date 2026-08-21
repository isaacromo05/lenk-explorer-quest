import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Lock, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";

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
        content: "Elige base, grabado en madera y confirma tu recuerdo alpino de Lenk.",
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
}

const BASE_PRODUCTS: BaseProduct[] = [
  {
    id: "frame",
    name: "Marco de Recuerdos",
    note: "Marco de madera de abeto con tu collage de hitos.",
    emoji: "🖼️",
    price: 39,
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

const STEPS = ["Objeto base", "Grabado en madera", "Resumen"] as const;

function ConfigurePage() {
  const { hydrated, sectorProgress } = usePassport();
  const [step, setStep] = useState(0);
  const [baseId, setBaseId] = useState(BASE_PRODUCTS[0].id);
  const [engravingId, setEngravingId] = useState("none");
  const [added, setAdded] = useState(false);

  const base = BASE_PRODUCTS.find((p) => p.id === baseId)!;
  const engraving = ENGRAVINGS.find((e) => e.id === engravingId)!;
  const total = base.price + engraving.price;

  const badgeUnlocked = useMemo(
    () => (sector: SectorId) => {
      const progress = sectorProgress(sector);
      return hydrated && progress.current === progress.total;
    },
    [hydrated, sectorProgress],
  );

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
            Tres pasos: elige el objeto, el grabado en madera y confirma tu pedido.
          </Text>
        </section>

        <ol className="flex items-center gap-2">
          {STEPS.map((label, index) => (
            <li key={label} className="flex flex-1 flex-col gap-1">
              <span
                className={cn(
                  "h-1.5 rounded-full",
                  index <= step ? "bg-bronze" : "bg-border",
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  index === step ? "text-wood" : "text-text-muted",
                )}
              >
                {index + 1}. {label}
              </span>
            </li>
          ))}
        </ol>

        {step === 0 && (
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
                    onClick={() => setBaseId(product.id)}
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

        {step === 1 && (
          <section className="space-y-3">
            <Heading as="h2" level={4}>
              Paso 2 · Grabado en madera
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

        {step === 2 && (
          <section className="space-y-3">
            <Heading as="h2" level={4}>
              Paso 3 · Resumen
            </Heading>
            <Card className="border-bronze/50 shadow-md">
              <CardContent className="space-y-3 py-5">
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
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={step === STEPS.length - 1}
          >
            Siguiente
          </Button>
        </div>

        <DebugProgressPanel />
      </div>
    </MobileLayout>
  );
}
