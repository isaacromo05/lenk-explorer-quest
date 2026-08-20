import { createFileRoute } from "@tanstack/react-router";
import { Check, CreditCard, ShoppingBag, Store, Truck } from "lucide-react";
import { useMemo, useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  Input,
  Text,
  cn,
} from "@/design-system";
import { LOCATIONS, SECTORS, type SectorId } from "@/lib/locations";
import { usePassport } from "@/lib/passport";
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

const FRAMES = [
  { id: "s", label: "Pequeño", dims: "15x20 cm", price: 24, slots: 1 },
  { id: "m", label: "Mediano", dims: "20x30 cm", price: 39, slots: 3 },
  { id: "l", label: "Grande", dims: "30x40 cm", price: 59, slots: 6 },
] as const;

type FrameId = (typeof FRAMES)[number]["id"];

const ADDONS = [
  { id: "medal", emoji: "🏅", name: "Medalla física de sector", note: "Gratis si tienes un sector completo", price: 12 },
  { id: "figure", emoji: "🗿", name: "Figura 3D del Guardián", note: "Coleccionable pintado a mano", price: 29 },
  { id: "magnet", emoji: "🌲", name: "Imán grabado en madera de Lenk", note: "Madera local grabada a láser", price: 9 },
  { id: "passport", emoji: "📜", name: "Pasaporte / Certificado alpino impreso", note: "Con sello oficial de Lenk", price: 15 },
] as const;

type AddonId = (typeof ADDONS)[number]["id"];

const SHIPPING_HOME = 8;
const MEDAL_TIER: Record<SectorId, string> = {
  water: "Medalla de Bronce del Sector Agua",
  summit: "Medalla de Plata del Sector Cumbres",
  culture: "Medalla de Tradición AlpKultur",
};

function chf(value: number) {
  return `CHF ${value.toFixed(2)}`;
}

function ShopPage() {
  const { photoEntries: entries, sectorProgress, scanned, total } = usePassport();
  const [frame, setFrame] = useState<FrameId>("m");
  const [selected, setSelected] = useState<string[]>([]);
  const [addons, setAddons] = useState<AddonId[]>([]);
  const [delivery, setDelivery] = useState<"home" | "pickup">("home");
  const [paid, setPaid] = useState(false);

  const activeFrame = FRAMES.find((f) => f.id === frame)!;
  const completedSectors = (Object.keys(SECTORS) as SectorId[]).filter((s) => {
    const p = sectorProgress(s);
    return p.total > 0 && p.current === p.total;
  });
  const medalFree = completedSectors.length > 0;

  const toggleAddon = (id: AddonId) =>
    setAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  const togglePhoto = (id: string) =>
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= activeFrame.slots) return [...prev.slice(1), id];
      return [...prev, id];
    });

  const addonTotal = useMemo(
    () =>
      addons.reduce((sum, id) => {
        const addon = ADDONS.find((a) => a.id === id)!;
        if (addon.id === "medal" && medalFree) return sum;
        return sum + addon.price;
      }, 0),
    [addons, medalFree],
  );

  const shipping = delivery === "home" ? SHIPPING_HOME : 0;
  const routeComplete = scanned === total && total > 0;
  const subtotal = activeFrame.price + addonTotal;
  const discount = routeComplete ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const totalPrice = subtotal - discount + shipping;

  /** Photos shown in the wall mockup: the explicit selection, padded with the newest stamps. */
  const mockupPhotos = useMemo(() => {
    const chosen = selected
      .map((id) => entries.find((e) => e.locationId === id))
      .filter(Boolean) as typeof entries;
    const rest = entries.filter((e) => !selected.includes(e.locationId));
    return [...chosen, ...rest].slice(0, activeFrame.slots);
  }, [selected, entries, activeFrame.slots]);

  return (
    <MobileLayout>
      <div className="space-y-5">
        <div>
          <Heading as="h1" level={2}>
            Tienda de Souvenirs
          </Heading>
          <Text tone="muted" size="sm">
            Diseña tu Lenk Collector Box con las fotos de tu pasaporte.
          </Text>
        </div>

        <Card className={cn(medalFree && "border-gold")}>
          <CardContent className="flex items-start gap-3 py-5">
            <span className="text-3xl" aria-hidden="true">
              {medalFree ? "🏅" : "🧭"}
            </span>
            <div className="space-y-1">
              {medalFree ? (
                <>
                  <Badge variant="gold">
                    ¡Has completado {completedSectors.length} sector
                    {completedSectors.length > 1 ? "es" : ""}!
                  </Badge>
                  <Text size="sm">
                    Tienes acceso a la {MEDAL_TIER[completedSectors[0]!]}
                    {completedSectors.length > 1 ? " y más recompensas" : ""}.
                  </Text>
                </>
              ) : (
                <>
                  <Badge variant="outline">
                    {scanned}/{total} hitos sellados
                  </Badge>
                  <Text size="sm" tone="muted">
                    Completa una ruta entera para desbloquear tu medalla física gratuita.
                  </Text>
                </>
              )}
              {scanned === total && (
                <Text size="sm" tone="muted">
                  Ruta Trans-Simmental completa: Medalla de Oro incluida.
                </Text>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cuadro / marco de fotos personalizado</CardTitle>
            <CardDescription>Elige el tamaño y las fotos que irán dentro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {FRAMES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={frame === f.id}
                  onClick={() => {
                    setFrame(f.id);
                    setSelected((prev) => prev.slice(0, f.slots));
                  }}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    frame === f.id ? "border-primary bg-primary/5" : "border-border bg-surface",
                  )}
                >
                  <span className="block text-sm font-semibold text-primary">{f.label}</span>
                  <span className="block text-xs text-text-muted">{f.dims}</span>
                  <span className="mt-1 block text-xs font-semibold text-secondary">{chf(f.price)}</span>
                </button>
              ))}
            </div>

            <div>
              <Text size="sm" tone="muted" className="mb-2">
                Selecciona hasta {activeFrame.slots} foto{activeFrame.slots > 1 ? "s" : ""} (
                {selected.length}/{activeFrame.slots})
              </Text>
              {entries.length === 0 ? (
                <div className="rounded-xl border border-border bg-background p-6 text-center">
                  <ShoppingBag className="mx-auto mb-2 size-8 text-text-muted" aria-hidden="true" />
                  <Text size="sm" tone="muted">
                    Aún no tienes fotos. Escanea un QR para sellar tu primer hito.
                  </Text>
                </div>
              ) : (
                <ul className="grid grid-cols-3 gap-2">
                  {entries.map((entry) => {
                    const location = LOCATIONS.find((l) => l.id === entry.locationId);
                    const active = selected.includes(entry.locationId);
                    return (
                      <li key={entry.locationId}>
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => togglePhoto(entry.locationId)}
                          className={cn(
                            "relative block w-full overflow-hidden rounded-xl border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            active ? "border-gold" : "border-border",
                          )}
                        >
                          <img
                            src={entry.photo}
                            alt={`Foto de ${location?.name ?? entry.locationId}`}
                            className="aspect-square w-full object-cover"
                          />
                          {active && (
                            <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-gold text-gold-foreground">
                              <Check className="size-3" aria-hidden="true" />
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Realistic wall mockup: lit plaster wall, hanging wire, wooden frame + matte. */}
            <figure className="overflow-hidden rounded-2xl bg-[radial-gradient(120%_90%_at_50%_0%,#f4f1ec_0%,#e6e1d8_55%,#d8d2c7_100%)] px-6 pb-7 pt-5">
              <div className="mx-auto flex w-fit flex-col items-center">
                <span className="size-1.5 rounded-full bg-text/40" aria-hidden="true" />
                <span
                  className="h-4 w-16 border-x border-t border-text/25"
                  style={{ borderRadius: "0 0 60% 60% / 0 0 100% 100%" }}
                  aria-hidden="true"
                />
                <div
                  className="rounded-[6px] p-3 shadow-[0_14px_28px_-10px_rgba(15,23,42,0.45)] ring-1 ring-black/20"
                  style={{
                    background:
                      "linear-gradient(135deg,#6b4a2b 0%,#8a6236 25%,#5d3f24 55%,#7d5730 80%,#4e3520 100%)",
                  }}
                >
                  <div className="rounded-[2px] bg-[#fbfaf7] p-3 shadow-[inset_0_2px_6px_rgba(15,23,42,0.18)]">
                    <div
                      className={cn(
                        "grid gap-2",
                        activeFrame.slots === 1 ? "grid-cols-1" : "grid-cols-3",
                        activeFrame.slots === 1 ? "w-40" : activeFrame.slots === 3 ? "w-56" : "w-60",
                      )}
                    >
                      {Array.from({ length: activeFrame.slots }).map((_, i) => {
                        const entry = mockupPhotos[i];
                        const location = entry
                          ? LOCATIONS.find((l) => l.id === entry.locationId)
                          : undefined;
                        return entry ? (
                          <img
                            key={entry.locationId}
                            src={entry.photo}
                            alt={`${location?.name ?? ""} en el marco`}
                            className="aspect-square w-full rounded-[2px] object-cover shadow-[0_1px_3px_rgba(15,23,42,0.35)]"
                          />
                        ) : (
                          <div
                            key={`empty-${i}`}
                            className="flex aspect-square w-full items-center justify-center rounded-[2px] bg-[#eceae4] text-lg text-text-muted/50"
                            aria-hidden="true"
                          >
                            🏔️
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-center text-[10px] font-bold tracking-[0.18em] text-primary">
                      LENK COLLECTOR BOX
                    </p>
                    <p className="text-center text-[9px] font-semibold text-text-muted">
                      {activeFrame.dims} · {SECTORS.water.name.split(" ")[0]} Alpine Edition
                    </p>
                  </div>
                </div>
                <span
                  className="mt-1 h-3 w-[72%] rounded-full bg-text/15 blur-[3px]"
                  aria-hidden="true"
                />
              </div>
              <figcaption className="mt-3 text-center text-[11px] font-semibold text-text-muted">
                Vista previa en pared · marco {activeFrame.label} ({activeFrame.dims})
              </figcaption>
            </figure>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extras y coleccionables</CardTitle>
            <CardDescription>Añade piezas físicas a tu caja.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {ADDONS.map((addon) => {
              const free = addon.id === "medal" && medalFree;
              return (
                <label
                  key={addon.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface p-3"
                >
                  <input
                    type="checkbox"
                    checked={addons.includes(addon.id)}
                    onChange={() => toggleAddon(addon.id)}
                    className="size-4 accent-[var(--lenk-primary)]"
                  />
                  <span className="text-xl" aria-hidden="true">
                    {addon.emoji}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-text">{addon.name}</span>
                    <span className="block text-xs text-text-muted">{addon.note}</span>
                  </span>
                  {free ? (
                    <Badge variant="gold">Gratis</Badge>
                  ) : (
                    <span className="text-sm font-semibold text-primary">{chf(addon.price)}</span>
                  )}
                </label>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entrega y pago</CardTitle>
            <CardDescription>Resumen de tu pedido en francos suizos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={delivery === "home"}
                onClick={() => setDelivery("home")}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  delivery === "home" ? "border-primary bg-primary/5" : "border-border bg-surface",
                )}
              >
                <Truck className="size-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold text-primary">Envío a domicilio</span>
                <span className="text-xs text-text-muted">{chf(SHIPPING_HOME)}</span>
              </button>
              <button
                type="button"
                aria-pressed={delivery === "pickup"}
                onClick={() => setDelivery("pickup")}
                className={cn(
                  "flex flex-col items-start gap-1 rounded-xl border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  delivery === "pickup" ? "border-primary bg-primary/5" : "border-border bg-surface",
                )}
              >
                <Store className="size-4 text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold text-primary">Recoger en Lenk</span>
                <span className="text-xs text-text-muted">Oficina de Turismo · Gratis</span>
              </button>
            </div>

            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setPaid(true);
              }}
            >
              <div className="space-y-1">
                <label htmlFor="shop-name" className="text-xs font-semibold text-text-muted">
                  Nombre completo
                </label>
                <Input id="shop-name" name="name" required maxLength={100} autoComplete="name" />
              </div>
              <div className="space-y-1">
                <label htmlFor="shop-email" className="text-xs font-semibold text-text-muted">
                  Email
                </label>
                <Input id="shop-email" name="email" type="email" required maxLength={255} autoComplete="email" />
              </div>
              {delivery === "home" && (
                <>
                  <div className="space-y-1">
                    <label htmlFor="shop-address" className="text-xs font-semibold text-text-muted">
                      Dirección
                    </label>
                    <Input id="shop-address" name="address" required maxLength={200} autoComplete="street-address" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="shop-zip" className="text-xs font-semibold text-text-muted">
                      Código postal
                    </label>
                    <Input id="shop-zip" name="zip" required maxLength={10} autoComplete="postal-code" />
                  </div>
                </>
              )}

              <dl className="space-y-1 rounded-xl bg-background p-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-muted">
                    Marco {activeFrame.label} ({activeFrame.dims})
                  </dt>
                  <dd className="font-semibold text-text">{chf(activeFrame.price)}</dd>
                </div>
                {addons.map((id) => {
                  const addon = ADDONS.find((a) => a.id === id)!;
                  const free = addon.id === "medal" && medalFree;
                  return (
                    <div key={id} className="flex justify-between">
                      <dt className="text-text-muted">{addon.name}</dt>
                      <dd className="font-semibold text-text">{free ? "Gratis" : chf(addon.price)}</dd>
                    </div>
                  );
                })}
                <div className="flex justify-between">
                  <dt className="text-text-muted">
                    {delivery === "home" ? "Envío a domicilio" : "Recogida en Lenk"}
                  </dt>
                  <dd className="font-semibold text-text">{shipping ? chf(shipping) : "Gratis"}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base">
                  <dt className="font-bold text-primary">Total</dt>
                  <dd className="font-bold text-primary">{chf(totalPrice)}</dd>
                </div>
              </dl>

              <Button type="submit" variant="gold" size="lg" className="w-full">
                <CreditCard className="size-4" aria-hidden="true" />
                Pagar con TWINT / Tarjeta ({chf(totalPrice)})
              </Button>
              {paid && (
                <Text size="sm" tone="muted" className="text-center">
                  Pago simulado confirmado. Te enviaremos la confirmación de tu Lenk Collector Box por
                  email.
                </Text>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
