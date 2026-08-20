import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

import { Card, CardContent, Heading, Text } from "@/design-system";
import { MobileLayout } from "./-components/mobile-layout";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Lenk Quest — Tienda" },
      { name: "description", content: "Canjea tus puntos por souvenirs de Lenk." },
      { property: "og:title", content: "Lenk Quest — Tienda" },
      { property: "og:description", content: "Canjea tus puntos por souvenirs de Lenk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <MobileLayout>
      <div className="space-y-4">
        <Heading as="h1" level={2}>
          Tienda de Souvenirs
        </Heading>
        <Text tone="muted">Próximamente: canjea tus medallas por recuerdos alpinos.</Text>
        <Card className="py-12">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <ShoppingBag className="size-10 text-text-muted" aria-hidden="true" />
            <Text tone="muted">La tienda abre pronto.</Text>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
