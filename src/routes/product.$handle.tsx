import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { Badge, Button, Card, Heading, Text, cn } from "@/design-system";
import { toCartItem } from "@/lib/catalog";
import { fetchProductByHandle, formatMoney, productImage, variants } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useQuery } from "@tanstack/react-query";

import { MobileLayout } from "./-components/mobile-layout";

export const Route = createFileRoute("/product/$handle")({
  head: () => ({
    meta: [
      { title: "Producto — Lenk Quest" },
      {
        name: "description",
        content: "Detalles del souvenir alpino de Lenk Quest, con precios y variantes en vivo.",
      },
      { property: "og:title", content: "Producto — Lenk Quest" },
      {
        property: "og:description",
        content: "Detalles del souvenir alpino de Lenk Quest, con precios y variantes en vivo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const addItem = useCartStore((s) => s.addItem);
  const isBusy = useCartStore((s) => s.isLoading);
  const [variantId, setVariantId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shopify", "product", handle],
    queryFn: () => fetchProductByHandle(handle),
  });

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center gap-2 py-16 text-text-muted">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          <Text tone="muted">Cargando producto…</Text>
        </div>
      </MobileLayout>
    );
  }

  if (isError || !data) {
    return (
      <MobileLayout>
        <Card className="space-y-3 p-6 text-center">
          <Text className="font-semibold">Producto no encontrado</Text>
          <Button variant="outline" asChild>
            <Link to="/shop" className="inline-flex items-center gap-2">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver a la tienda
            </Link>
          </Button>
        </Card>
      </MobileLayout>
    );
  }

  const list = variants(data);
  const selected = list.find((v) => v.id === variantId) ?? list[0]!;
  const image = selected.image ?? productImage(data);

  return (
    <MobileLayout>
      <article className="space-y-5">
        <Button variant="outline" size="sm" asChild>
          <Link to="/shop" className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Tienda
          </Link>
        </Button>

        {image ? (
          <img
            src={image.url}
            alt={image.altText ?? data.node.title}
            width={1024}
            height={1024}
            className="aspect-square w-full rounded-2xl bg-background object-cover shadow-md"
          />
        ) : null}

        <div className="space-y-2">
          <Heading as="h1" level={2}>
            {data.node.title}
          </Heading>
          <Text className="font-display text-2xl font-bold text-forest">
            {formatMoney(selected.price)}
          </Text>
          {!selected.availableForSale ? <Badge variant="outline">Agotado</Badge> : null}
          <Text tone="muted" size="sm">
            {data.node.description}
          </Text>
        </div>

        {list.length > 1 ? (
          <div className="grid grid-cols-2 gap-2">
            {list.map((variant) => (
              <button
                key={variant.id}
                type="button"
                aria-pressed={variant.id === selected.id}
                onClick={() => setVariantId(variant.id)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  variant.id === selected.id
                    ? "border-bronze bg-bronze/10"
                    : "border-border bg-surface",
                )}
              >
                <span className="block text-xs font-semibold text-primary">{variant.title}</span>
                <span className="block text-[11px] font-semibold text-forest">
                  {formatMoney(variant.price)}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <Button
          size="lg"
          className="w-full"
          disabled={isBusy || !selected.availableForSale}
          onClick={() =>
            void addItem(toCartItem(data, selected), `${data.node.title} añadido al carrito`)
          }
        >
          <ShoppingCart className="size-5" aria-hidden="true" />
          Añadir al carrito · {formatMoney(selected.price)}
        </Button>
      </article>
    </MobileLayout>
  );
}

export { notFound };
