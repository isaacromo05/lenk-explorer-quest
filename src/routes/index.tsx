import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";

import { Badge, Button, Card, CardContent, Heading, Text } from "@/design-system";
import { LOCATIONS, SECTORS } from "@/lib/locations";
import { usePassport } from "@/lib/passport";
import { MobileLayout } from "./-components/mobile-layout";
import { RouteCard } from "./-components/route-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lenk Quest — Inicio" },
      { name: "description", content: "Descubre las leyendas de Lenk y completa los 8 hitos." },
      { property: "og:title", content: "Lenk Quest — Inicio" },
      { property: "og:description", content: "Descubre las leyendas de Lenk y completa los 8 hitos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { entries, scanned, sectorProgress, hydrated, state } = usePassport();
  const unlockedIds = Object.keys(state);
  const recent = [...entries].sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt)).slice(0, 3);
  return (
    <MobileLayout>
      <div className="space-y-8 bg-slate-100 p-4">
        <section className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm">
          <Badge
            variant="outline"
            className="mb-3 border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
          >
            Aventura alpina
          </Badge>
          <Heading as="h1" level={2} className="text-primary-foreground">
            Descubre las Leyendas de Lenk
          </Heading>
          <Text tone="inverse" className="mb-6 opacity-90">
            {hydrated && scanned > 0
              ? `Llevas ${scanned} de 8 hitos sellados. ¡Sigue explorando el valle!`
              : "Completa los 8 hitos, colecciona tus fotos y consigue la Medalla de Oro Alpina."}
          </Text>
          <Button variant="gold" size="lg" asChild>
            <Link to="/scan" className="inline-flex items-center gap-2">
              <ScanLine className="size-5" aria-hidden="true" />
              {hydrated && scanned > 0 ? "Escanear siguiente QR" : "Escanear mi primer QR"}
            </Link>
          </Button>
        </section>

        <section className="space-y-4">
          <Heading as="h2" level={3}>
            Rutas del valle
          </Heading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <RouteCard
              title="Ruta del Agua"
              places="Simmenfälle, Siebenbrunnen, Iffigsee"
              progress={sectorProgress("water")}
              variant="water"
              unlockedIds={unlockedIds}
            />
            <RouteCard
              title="Ruta de las Cumbres"
              places="Betelberg, Gryden, Wallbachschlucht"
              progress={sectorProgress("summit")}
              variant="summit"
              unlockedIds={unlockedIds}
            />
            <RouteCard
              title="Ruta de la Tradición & AlpKultur"
              places="Lenkerseeli, Metschstand"
              progress={sectorProgress("culture")}
              variant="culture"
              unlockedIds={unlockedIds}
            />
          </div>
        </section>

        <section className="space-y-4">
          <Heading as="h2" level={3}>
            Desbloqueos recientes
          </Heading>
          {recent.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {recent.map((entry) => {
                const location = LOCATIONS.find((l) => l.id === entry.locationId);
                if (!location) return null;
                return (
                  <Card key={entry.locationId} className="overflow-hidden">
                    {entry.photo ? (
                      <img
                        src={entry.photo}
                        alt={`Foto de ${location.name}`}
                        className="aspect-square w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex aspect-square w-full flex-col items-center justify-center gap-1 bg-background">
                        <span className="text-2xl" aria-hidden="true">
                          {SECTORS[location.sector].mascotEmoji}
                        </span>
                        <span className="text-[10px] font-semibold text-text-muted">Sin foto</span>
                      </div>
                    )}
                    <div className="p-2">
                      <Text size="sm" className="truncate font-semibold">
                        {location.name}
                      </Text>
                      <Text tone="muted" size="sm" className="truncate text-xs">
                        {SECTORS[location.sector].mascotEmoji} {SECTORS[location.sector].name}
                      </Text>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="py-10">
              <CardContent className="text-center">
                <div className="mb-3 text-4xl" aria-hidden="true">
                  🔭
                </div>
                <Heading as="h3" level={4}>
                  Aún no has escaneado ningún punto
                </Heading>
                <Text tone="muted" size="sm">
                  ¡Visita el primer lugar emblemático en Lenk y escanea tu primer QR para empezar tu colección!
                </Text>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </MobileLayout>
  );
}
