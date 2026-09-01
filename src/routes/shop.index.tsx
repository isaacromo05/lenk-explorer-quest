import { createFileRoute, Link } from "@tanstack/react-router";
import { Box, Gift, Loader2, Lock, ShoppingCart, Sparkles, Truck, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge, Button, Card, Heading, Text, cn } from "@/design-system";
import { lookupSku, toCartItem, useCatalog } from "@/lib/catalog";
import { SECTORS, type SectorId } from "@/lib/locations";
import { ROUTE_BADGES } from "@/lib/rewards";
import { GUARDIANS, GUARDIAN_LIST } from "@/lib/guardians";
import { usePassport } from "@/lib/passport";
import { formatMoney, productImage, SKU, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
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

const SHIPPING_HOME = "8.00";

function ShopPage() {
  const { sectorProgress, scanned, total } = usePassport();
  const { data: products, isLoading, isError } = useCatalog();
  const addItem = useCartStore((s) => s.addItem);
  const isBusy = useCartStore((s) => s.isLoading);
  const [frameSku, setFrameSku] = useState<string>(SKU.frame.m);
  const [modelSector, setModelSector] = useState<SectorId | null>(null);
  const rewardsRef = useRef<HTMLElement | null>(null);

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

  const frame = lookupSku(products, frameSku);
  const frameProduct = frame?.product ?? null;
  const frameVariants = Object.values(SKU.frame)
    .map((sku) => lookupSku(products, sku))
    .filter((v): v is NonNullable<typeof v> => v !== null);

  const add = async (
    entry: { product: ShopifyProduct; variant: NonNullable<ReturnType<typeof lookupSku>>["variant"] } | null,
    message: string,
  ) => {
    if (!entry) return;
    await addItem(toCartItem(entry.product, entry.variant), message);
  };

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
            Envío a domicilio en toda Suiza · {formatMoney({ amount: SHIPPING_HOME, currencyCode: "CHF" })}
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-text-muted">
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            <Text tone="muted">Cargando la tienda…</Text>
          </div>
        ) : isError || !products || products.length === 0 ? (
          <Card className="p-6 text-center">
            <Text className="font-semibold">No products found</Text>
            <Text tone="muted" size="sm" className="mt-1">
              La tienda de Shopify todavía no tiene productos disponibles. Cuéntame qué producto
              quieres crear y su precio, y lo añado al catálogo.
            </Text>
          </Card>
        ) : (
          <>
            {/* Main products */}
            <section className="space-y-4">
              <SectionTitle
                title="Productos destacados"
                subtitle="Marco personalizado y figuras oficiales de los Guardianes."
              />

              {frameProduct && frame ? (
                <ProductCard
                  image={productImage(frameProduct)?.url ?? ""}
                  imageAlt={
                    productImage(frameProduct)?.altText ??
                    "Marco de madera con un collage de fotos alpinas"
                  }
                  title={frameProduct.node.title}
                  price={formatMoney(frame.variant.price)}
                  description={frameProduct.node.description}
                  badge="Más vendido"
                  handle={frameProduct.node.handle}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {frameVariants.map(({ variant }) => (
                      <button
                        key={variant.id}
                        type="button"
                        aria-pressed={variant.sku === frameSku}
                        onClick={() => setFrameSku(variant.sku ?? frameSku)}
                        className={cn(
                          "rounded-xl border p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          variant.sku === frameSku
                            ? "border-bronze bg-bronze/10"
                            : "border-border bg-surface",
                        )}
                      >
                        <span className="block text-xs font-semibold text-primary">
                          {variant.title}
                        </span>
                        <span className="block text-[11px] font-semibold text-forest">
                          {formatMoney(variant.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    disabled={isBusy || !frame.variant.availableForSale}
                    onClick={() => void add(frame, `${frame.variant.title} añadido al carrito`)}
                  >
                    <ShoppingCart className="size-4" aria-hidden="true" />
                    Añadir al carrito · {formatMoney(frame.variant.price)}
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
              ) : null}

              {/* 3D figures */}
              {GUARDIAN_LIST.map((item) => {
                const guardian = GUARDIANS[item.sector];
                const entry = lookupSku(products, SKU.figure[item.sector]);
                if (!entry) return null;
                return (
                  <ProductCard
                    key={item.sector}
                    image={productImage(entry.product)?.url ?? guardian.image}
                    imageAlt={`Figura de colección del ${guardian.name}`}
                    imageClassName="object-contain p-4"
                    title={entry.product.node.title}
                    price={formatMoney(entry.variant.price)}
                    description={entry.product.node.description}
                    badge="Coleccionable"
                    handle={entry.product.node.handle}
                  >
                    <Button
                      className="w-full"
                      disabled={isBusy || !entry.variant.availableForSale}
                      onClick={() => void add(entry, `${guardian.name} añadido al carrito`)}
                    >
                      <ShoppingCart className="size-4" aria-hidden="true" />
                      Añadir al carrito · {formatMoney(entry.variant.price)}
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
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link
                        to="/shop/configure"
                        search={{ product: "figure" as const }}
                        className="inline-flex items-center gap-2"
                      >
                        <Wand2 className="size-4" aria-hidden="true" />
                        Personalizar grabado
                      </Link>
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

              {[SKU.magnet, SKU.passport].map((sku) => {
                const entry = lookupSku(products, sku);
                if (!entry) return null;
                return (
                  <ProductCard
                    key={sku}
                    image={productImage(entry.product)?.url ?? ""}
                    imageAlt={productImage(entry.product)?.altText ?? entry.product.node.title}
                    title={entry.product.node.title}
                    price={formatMoney(entry.variant.price)}
                    description={entry.product.node.description}
                    handle={entry.product.node.handle}
                  >
                    <Button
                      className="w-full"
                      disabled={isBusy || !entry.variant.availableForSale}
                      onClick={() =>
                        void add(entry, `${entry.product.node.title} añadido al carrito`)
                      }
                    >
                      <ShoppingCart className="size-4" aria-hidden="true" />
                      Añadir al carrito · {formatMoney(entry.variant.price)}
                    </Button>
                  </ProductCard>
                );
              })}

              {sectors.map((sector) => {
                const unlocked = isComplete(sector);
                const progress = sectorProgress(sector);
                const badge = ROUTE_BADGES[sector];
                const entry = lookupSku(products, SKU.engraving[sector]);
                if (!entry) return null;
                return (
                  <ProductCard
                    key={`engraving-${sector}`}
                    image={productImage(entry.product)?.url ?? ""}
                    imageAlt="Placa de madera oscura con un grabado de cumbre alpina y línea de ruta"
                    title={`${entry.product.node.title} · ${badge.shortName}`}
                    price={formatMoney(entry.variant.price)}
                    description={entry.product.node.description}
                    badge={unlocked ? "Desbloqueado" : undefined}
                    locked={!unlocked}
                    handle={unlocked ? entry.product.node.handle : undefined}
                  >
                    {unlocked ? (
                      <Button
                        className="w-full bg-bronze text-bronze-foreground hover:bg-bronze-hover"
                        disabled={isBusy}
                        onClick={() =>
                          void add(entry, `Grabado ${badge.shortName} añadido al carrito`)
                        }
                      >
                        <ShoppingCart className="size-4" aria-hidden="true" />
                        Añadir al carrito · {formatMoney(entry.variant.price)}
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
                  const entry = lookupSku(products, SKU.badge[sector]);
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
                              disabled={isBusy || !entry}
                              onClick={() =>
                                void add(entry, `${badge.shortName} añadida como regalo`)
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
                    ¡8/8 hitos! Aplicaremos automáticamente tu 10% de descuento (LENK8DE8) al pagar.
                  </Text>
                </Card>
              )}
            </section>
          </>
        )}

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
  price: string;
  badge?: string;
  locked?: boolean;
  handle?: string;
  children: React.ReactNode;
}

/** Premium split product card: Shopify preview on the left, details and actions on the right. */
function ProductCard({
  image,
  imageAlt,
  imageClassName,
  title,
  description,
  price,
  badge,
  locked,
  handle,
  children,
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden shadow-md">
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full shrink-0 bg-background sm:w-44">
          {image ? (
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
          ) : (
            <div className="aspect-square w-full bg-background" />
          )}
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
            {handle ? (
              <Link to="/product/$handle" params={{ handle }} className="hover:underline">
                <Heading as="h3" level={4}>
                  {title}
                </Heading>
              </Link>
            ) : (
              <Heading as="h3" level={4}>
                {title}
              </Heading>
            )}
            <Text tone="muted" size="sm">
              {description}
            </Text>
          </div>
          <Text className="font-display text-xl font-bold text-forest">{price}</Text>
          <div className="mt-auto space-y-2">{children}</div>
        </div>
      </div>
    </Card>
  );
}
