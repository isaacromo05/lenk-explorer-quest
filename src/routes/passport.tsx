import { createFileRoute } from "@tanstack/react-router";

import { Card, CardContent, Heading, Text } from "@/design-system";
import { MobileLayout } from "./-components/mobile-layout";

export const Route = createFileRoute("/passport")({
  head: () => ({
    meta: [
      { title: "Lenk Quest — Mi Pasaporte" },
      { name: "description", content: "Tu pasaporte de explorador con los hitos descubiertos." },
      { property: "og:title", content: "Lenk Quest — Mi Pasaporte" },
      { property: "og:description", content: "Tu pasaporte de explorador con los hitos descubiertos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PassportPage,
});

function PassportPage() {
  return (
    <MobileLayout>
      <div className="space-y-4">
        <Heading as="h1" level={2}>
          Mi Pasaporte
        </Heading>
        <Text tone="muted">Aquí aparecerán tus fotos y sellos de los hitos escaneados.</Text>
        <Card className="py-12">
          <CardContent className="text-center">
            <Text tone="muted">Aún no tienes hitos descubiertos.</Text>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
