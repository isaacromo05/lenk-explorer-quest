import { createFileRoute, Link } from "@tanstack/react-router";
import { Box, Gift, Lock, ShoppingCart, Sparkles, Truck, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  Badge,
  Button,
  Card,
  Heading,
  Text,
  cn,
} from "@/design-system";
import productEngraving from "@/assets/photography/product-engraving.jpg";
import productFrame from "@/assets/photography/product-frame.jpg";
import productMagnet from "@/assets/photography/product-magnet.jpg";
import productPassport from "@/assets/photography/product-passport.jpg";
import { SECTORS, type SectorId } from "@/lib/locations";
import { ROUTE_BADGES } from "@/lib/rewards";
import { GUARDIANS, GUARDIAN_LIST } from "@/lib/guardians";
import { usePassport } from "@/lib/passport";
import { addToCart, chf } from "@/lib/cart";
import { DebugProgressPanel } from "./-components/debug-progress-panel";
import { MobileLayout } from "./-components/mobile-layout";
import { Product3DModal } from "./-components/product-3d-modal";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Lenk Quest — Tienda de souvenirs alpinos" },
      {
        name: "description",
        content:
          "Marcos de fotos artesanales, figuras 3D de los Guardianes de Lenk y coleccionables de madera grabada.",
      },
      { property: "og:title", content: "Lenk Quest — Tienda de souvenirs alpinos" },
      {
        property: "og:description",
        content:
          "Marcos de fotos artesanales, figuras 3D de los Guardianes de Lenk y coleccionables de madera grabada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

const FRAMES = [
  { id: "s", label: "Pequeño", dims: "15x20 cm", price: 24 },
  { id: "m", label: "Mediano", dims: "20x30 cm", price: 39 },
  { id: "l", label: "Grande", dims: "30x40 cm", price: 59 },
  { id: "xl", label: "XL Completo", dims: "40x50 cm", price: 79 },
] as const;

type FrameId = (typeof FRAMES)[number]["id"];

const EXTRAS = [
  {
    id: "magnet",
    image: productMagnet,
    name: "Imán grabado en madera de Lenk",
    price: 9,
    description:
      "Madera local de abeto grabada a láser con el perfil del Wildstrubel y la cruz suiza. 6x6 cm, imán de neodimio.",
  },
  {
    id: "passport",
    image: productPassport,
    name: "Pasaporte alpino impreso",
    price: 15,
    description:
      "Tu pasaporte digital convertido en libreta encuadernada con tapa azul, letras doradas y sello de cera oficial de La Lenk.",
  },
] as const;

const FIGURE_PRICE = 29;
const ENGRAVING_PRICE = 19;
const SHIPPING_HOME = 8;

function ShopPage() {
  const { sectorProgress, scanned, total } = usePassport();
  const [frame, setFrame] = useState<FrameId>("m");
  const [modelSector, setModelSector] = useState<SectorId | null>(null);
  const rewardsRef = useRef<HTMLElement | null>(null);

  const activeFrame = FRAMES.find((f) => f.id === frame)!;
  const sectors = Object.keys(SECTORS) as SectorId[];
  const isComplete = (sector: SectorId) => {
    const p = sectorProgress(sector);
    return p.total > 0 && p.current === p.total;
  };
  const questComplete = scanned === total && total > 0;

  /** Deep link from the route-completed modal: scroll to the rewards block. */
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#recompensas-desbloqueadas") {
      rewardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const modelGuardian = modelSector ? GUARDIANS[modelSector] : null;

  return (
    <MobileLayout>
      <div className="space-y-8">
        {/* Hero */}
        <header className="overflow-hidden rounded-2xl bg-wood p-6 text-wood-foreground shadow-md">
          <Badge className="bg-bronze/20 text-bronze">
            <Sparkles className="size-3" aria-hidden="true" />
            Lenk Alpine Edition
          </Badge>
          <Heading as="h1" level={2} className="mt-3 text-wood-foreground">
            Taller de souvenirs
          </Heading>
          <Text size="sm" className="mt-1 text-wood-foreground/80">
            Piezas artesanales de madera y coleccionables numerados, hechos en el valle del Simme y
            enviados a tu casa.
          </Text>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-wood-foreground/80">
            <Truck className="size-4" aria-hidden="true" />
            Envío a domicilio en toda Suiza · {chf(SHIPPING_HOME)}
          </div>
        </header>

        {/* Main products */}
        <section className="space-y-4">
          <SectionTitle
            title="Productos destacados"
            subtitle="Marco personalizado y figuras oficiales de los Guardianes."
          />

          {/* Frame */}
          <ProductCard
            image={productFrame}
            imageAlt="Marco de madera de nogal con un collage de fotos alpinas colgado en una pared"
            title="Marco de fotos artesanal"
            price={activeFrame.price}
            description="Nogal macizo con paspartú de algodón y grabado “Lenk Collector Box”. Elige el tamaño y monta el collage con las fotos de tu pasaporte."
            badge="Más vendido"
          >
            <div className="grid grid-cols-2 gap-2">
              {FRAMES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={frame === f.id}
                  onClick={() => setFrame(f.id)}
                  className={cn(
                    "rounded-xl border p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    frame === f.id ? "border-bronze bg-bronze/10" : "border-border bg-surface",
                  )}
                >
                  <span className="block text-xs font-semibold text-primary">{f.label}</span>
                  <span className="block text-[11px] text-text-muted">{f.dims}</span>
                  <span className="block text-[11px] font-semibold text-forest">{chf(f.price)}</span>
                </button>
              ))}
            </div>
            <Button
              className="w-full"
              onClick={() =>
                addToCart(
                  {
                    id: `frame-${activeFrame.id}`,
                    name: `Marco artesanal ${activeFrame.label}`,
                    price: activeFrame.price,
                    image: productFrame,
                    note: activeFrame.dims,
                  },
                  1,
                  `Marco ${activeFrame.label} añadido al carrito`,
                )
              }
            >
              <ShoppingCart className="size-4" aria-hidden="true" />
              Añadir al carrito · {chf(activeFrame.price)}
            </Button>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link
                to="/shop/configure"
                search={{ product: "frame" as const }}
                className="inline-flex items-center gap-2"
              >
                <Wand2 className="size-4" aria-hidden="true" />
                Personalizar mis fotos
              </Link>
            </Button>
          </ProductCard>

          {/* 3D figures */}
          {GUARDIAN_LIST.map((item) => {
            const guardian = GUARDIANS[item.sector];
            return (
              <ProductCard
                key={item.sector}
                image={guardian.image}
                imageAlt={`Figura de colección del ${guardian.name}`}
                imageClassName="object-contain p-4"
                title={`Figura 3D · ${guardian.name}`}
                price={FIGURE_PRICE}
                description={`${guardian.sector}. ${guardian.description} Impresa en resina y pintada a mano, 12 cm con peana de madera grabada.`}
                badge="Coleccionable"
              >
                <Button
                  className="w-full"
                  onClick={() =>
                    addToCart(
                      {
                        id: `figure-${item.sector}`,
                        name: `Figura 3D · ${guardian.name}`,
                        price: FIGURE_PRICE,
                        image: guardian.image,
                        note: guardian.sector,
                      },
                      1,
                      `${guardian.name} añadido al carrito`,
                    )
                  }
                >
                  <ShoppingCart className="size-4" aria-hidden="true" />
                  Añadir al carrito · {chf(FIGURE_PRICE)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setModelSector(item.sector)}
                >
                  <Box className="size-4" aria-hidden="true" />
                  Ver en 3D
                </Button>
              </ProductCard>
            );
          })}
        </section>

        {/* Extras */}
        <section className="space-y-4">
          <SectionTitle
            title="Extras y coleccionables"
            subtitle="Piezas pequeñas para completar tu caja alpina."
          />

          {EXTRAS.map((extra) => (
            <ProductCard
              key={extra.id}
              image={extra.image}
              imageAlt={extra.name}
              title={extra.name}
              price={extra.price}
              description={extra.description}
            >
              <Button
                className="w-full"
                onClick={() =>
                  addToCart(
                    { id: extra.id, name: extra.name, price: extra.price, image: extra.image },
                    1,
                    `${extra.name} añadido al carrito`,
                  )
                }
              >
                <ShoppingCart className="size-4" aria-hidden="true" />
                Añadir al carrito · {chf(extra.price)}
              </Button>
            </ProductCard>
          ))}

          {sectors.map((sector) => {
            const unlocked = isComplete(sector);
            const progress = sectorProgress(sector);
            const badge = ROUTE_BADGES[sector];
            const name = `Grabado en madera · ${badge.shortName}`;
            return (
              <ProductCard
                key={`engraving-${sector}`}
                image={productEngraving}
                imageAlt="Placa de madera oscura con un grabado de cumbre alpina y línea de ruta"
                title={name}
                price={ENGRAVING_PRICE}
                description={`Placa de roble ahumado con la silueta de la ${GUARDIANS[sector].sector} grabada a láser y detalles en bronce. Se desbloquea al completar la ruta.`}
                badge={unlocked ? "Desbloqueado" : undefined}
                locked={!unlocked}
              >
                {unlocked ? (
                  <Button
                    className="w-full bg-bronze text-bronze-foreground hover:bg-bronze-hover"
                    onClick={() =>
                      addToCart(
                        {
                          id: `engraving-${sector}`,
                          name,
                          price: ENGRAVING_PRICE,
                          image: productEngraving,
                          note: GUARDIANS[sector].sector,
                        },
                        1,
                        `${name} añadido al carrito`,
                      )
                    }
                  >
                    <ShoppingCart className="size-4" aria-hidden="true" />
                    Añadir al carrito · {chf(ENGRAVING_PRICE)}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    <Lock className="size-4" aria-hidden="true" />
                    Bloqueado · {progress.current}/{progress.total} hitos
                  </Button>
                )}
              </ProductCard>
            );
          })}
        </section>

        {/* Unlocked gifts */}
        <section
          id="recompensas-desbloqueadas"
          ref={rewardsRef}
          className="scroll-mt-20 space-y-4"
        >
          <SectionTitle
            title="Tus recompensas desbloqueadas"
            subtitle="Insignias físicas de regalo (0,00 CHF) con cualquier compra de la tienda."
          />

          <div className="space-y-3">
            {sectors.map((sector) => {
              const unlocked = isComplete(sector);
              const progress = sectorProgress(sector);
              const badge = ROUTE_BADGES[sector];
              return (
                <Card
                  key={sector}
                  className={cn(
                    "flex items-center gap-4 p-4",
                    unlocked ? "border-gold shadow-md" : "opacity-70",
                  )}
                >
                  <span
                    className={cn(
                      "relative flex size-16 shrink-0 items-center justify-center rounded-full",
                      unlocked ? "bg-gold/15" : "bg-background",
                    )}
                  >
                    <img
                      src={badge.image}
                      alt={unlocked ? badge.name : `${badge.name} bloqueada`}
                      width={512}
                      height={512}
                      loading="lazy"
                      className={cn(
                        "size-12 object-contain",
                        unlocked ? "drop-shadow-md" : "opacity-30 grayscale",
                      )}
                    />
                    {!unlocked && (
                      <Lock className="absolute size-5 text-text-muted" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <Text size="sm" className="font-semibold">
                      {badge.shortName}
                    </Text>
                    {unlocked ? (
                      <>
                        <Text tone="muted" size="sm" className="text-xs">
                          Regalo desbloqueado · {progress.current}/{progress.total} hitos
                        </Text>
                        <Button
                          variant="gold"
                          size="sm"
                          className="mt-1 w-full"
                          onClick={() =>
                            addToCart(
                              {
                                id: `gift-${sector}`,
                                name: badge.name,
                                price: 0,
                                image: badge.image,
                                note: "Regalo · 0,00 CHF",
                              },
                              1,
                              `${badge.shortName} añadida como regalo`,
                            )
                          }
                        >
                          <Gift className="size-4" aria-hidden="true" />
                          Añadir regalo
                        </Button>
                      </>
                    ) : (
                      <Text tone="muted" size="sm" className="text-xs">
                        Completa los hitos de esta ruta para desbloquear tu regalo (
                        {progress.current}/{progress.total}).
                      </Text>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {questComplete && (
            <Card className="flex items-center gap-3 border-gold p-4">
              <span className="text-2xl" aria-hidden="true">
                🏅
              </span>
              <Text size="sm">
                ¡8/8 hitos! El Pin Supremo Lenk Gold / Imperial Edition se incluye gratis en tu
                pedido.
              </Text>
            </Card>
          )}
        </section>

        <DebugProgressPanel />
      </div>

      <Product3DModal
        open={modelGuardian !== null}
        onClose={() => setModelSector(null)}
        title={modelGuardian?.name ?? ""}
        description={modelGuardian?.sector}
        url={modelGuardian?.model3d ?? ""}
        fallbackImage={modelGuardian?.image ?? ""}
      />
    </MobileLayout>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-1">
      <Heading as="h2" level={3}>
        {title}
      </Heading>
      <Text tone="muted" size="sm">
        {subtitle}
      </Text>
    </div>
  );
}

interface ProductCardProps {
  image: string;
  imageAlt: string;
  imageClassName?: string;
  title: string;
  description: string;
  price: number;
  badge?: string;
  locked?: boolean;
  children: React.ReactNode;
}

/** Premium split product card: static preview on the left, details and actions on the right. */
function ProductCard({
  image,
  imageAlt,
  imageClassName,
  title,
  description,
  price,
  badge,
  locked,
  children,
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden shadow-md">
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full shrink-0 bg-background sm:w-44">
          <img
            src={image}
            alt={imageAlt}
            width={1024}
            height={1024}
            loading="lazy"
            className={cn(
              "aspect-square w-full object-cover",
              locked && "opacity-40 grayscale",
              imageClassName,
            )}
          />
          {badge ? (
            <span className="absolute left-3 top-3">
              <Badge className="bg-bronze text-bronze-foreground shadow-sm">{badge}</Badge>
            </span>
          ) : null}
          {locked ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <Lock className="size-8 text-text-muted" aria-hidden="true" />
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
          <div className="space-y-1">
            <Heading as="h3" level={4}>
              {title}
            </Heading>
            <Text tone="muted" size="sm">
              {description}
            </Text>
          </div>
          <Text className="font-display text-xl font-bold text-forest">{chf(price)}</Text>
          <div className="mt-auto space-y-2">{children}</div>
        </div>
      </div>
    </Card>
  );
}
