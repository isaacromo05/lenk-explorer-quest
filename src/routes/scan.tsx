import { createFileRoute } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";

import { Button, Heading, Text } from "@/design-system";
import { MobileLayout } from "./-components/mobile-layout";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Lenk Quest — Escanear QR" },
      { name: "description", content: "Escanea un código QR en un hito de Lenk." },
      { property: "og:title", content: "Lenk Quest — Escanear QR" },
      { property: "og:description", content: "Escanea un código QR en un hito de Lenk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  return (
    <MobileLayout>
      <div className="flex flex-col items-center justify-center rounded-2xl bg-surface p-8 text-center shadow-sm">
        <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ScanLine className="size-10" aria-hidden="true" />
        </div>
        <Heading as="h1" level={2}>
          Escanear QR
        </Heading>
        <Text tone="muted" className="mb-6">
          Apunta la cámara al código QR del hito para desbloquearlo.
        </Text>
        <Button size="lg">
          <ScanLine className="size-5" aria-hidden="true" />
          Abrir cámara
        </Button>
      </div>
    </MobileLayout>
  );
}
