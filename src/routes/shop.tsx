import { createFileRoute } from "@tanstack/react-router";
import { Check, CreditCard, ShoppingBag, Store, Truck, X } from "lucide-react";
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
  { id: "s", label: "Pequeño", dims: "15x20 cm", price: 24 },
  { id: "m", label: "Mediano", dims: "20x30 cm", price: 39 },
  { id: "l", label: "Grande", dims: "30x40 cm", price: 59 },
  { id: "xl", label: "XL Completo", dims: "40x50 cm", price: 79 },
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
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  const activeFrame = FRAMES.find((f) => f.id === frame)!;
  const completedSectors = (Object.keys(SECTORS) as SectorId[]).filter((s) => {
    const p = sectorProgress(s);
    return p.total > 0 && p.current === p.total;
  });
  const medalFree = completedSectors.length > 0;

  const toggleAddon = (id: AddonId) =>
    setAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  const togglePhoto = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  /** Place (or swap) a photo into a specific mockup slot from the picker modal. */
  const assignSlot = (index: number, id: string) =>
    setSelected((prev) => {
      const next = prev.filter((p) => p !== id);
      if (index >= prev.length) return [...prev, id];
      next.splice(index, 0, id);
      return next.filter((p, i) => next.indexOf(p) === i);
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

  /** Photos shown in the wall mockup, in the order the explorer picked them. */
  const mockupPhotos = useMemo(
    () =>
      selected
        .map((id) => entries.find((e) => e.locationId === id))
        .filter(Boolean) as typeof entries,
    [selected, entries],
  );

  const slotCount = Math.max(mockupPhotos.length + 1, 1);
  const gridClass =
    mockupPhotos.length <= 1
      ? "grid-cols-1 w-44"
      : mockupPhotos.length <= 4
        ? "grid-cols-2 w-56"
        : "grid-cols-3 w-60";

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
            <div className="grid grid-cols-2 gap-2">
              {FRAMES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={frame === f.id}
                  onClick={() => setFrame(f.id)}
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
                Selecciona las fotos que quieras ({selected.length} seleccionada
                {selected.length === 1 ? "" : "s"} de {entries.length})
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
                        gridClass,
                      )}
                    >
                      {Array.from({ length: slotCount }).map((_, i) => {
                        const entry = mockupPhotos[i];
                        const location = entry
                          ? LOCATIONS.find((l) => l.id === entry.locationId)
                          : undefined;
                        return entry ? (
                          <button
                            key={entry.locationId}
                            type="button"
                            onClick={() => setPickerIndex(i)}
                            aria-label={`Cambiar la foto de la posición ${i + 1}`}
                            className="block w-full overflow-hidden rounded-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <img
                              src={entry.photo}
                              alt={`${location?.name ?? ""} en el marco`}
                              className="aspect-square w-full object-cover shadow-[0_1px_3px_rgba(15,23,42,0.35)]"
                            />
                          </button>
                        ) : (
                          <button
                            key={`empty-${i}`}
                            type="button"
                            onClick={() => setPickerIndex(i)}
                            aria-label={`Añadir una foto en la posición ${i + 1}`}
                            className="flex aspect-square w-full items-center justify-center rounded-[2px] bg-[#eceae4] text-lg text-text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <span aria-hidden="true">＋</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-center text-[10px] font-bold tracking-[0.18em] text-primary">
                      LENK COLLECTOR BOX
                    </p>
                    <p className="text-center text-[9px] font-semibold text-text-muted">
                      {activeFrame.dims} · Lenk Alpine Edition
                    </p>
                  </div>
                </div>
                <span
                  className="mt-1 h-3 w-[72%] rounded-full bg-text/15 blur-[3px]"
                  aria-hidden="true"
                />
              </div>
              <figcaption className="mt-3 text-center text-[11px] font-semibold text-text-muted">
                Vista previa en pared · marco {activeFrame.label} ({activeFrame.dims}) ·{" "}
                {mockupPhotos.length} foto{mockupPhotos.length === 1 ? "" : "s"} · toca un hueco para
                cambiarla
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
              {routeComplete && (
                <div className="flex items-center gap-3 rounded-xl border border-gold bg-gold/10 p-3">
                  <span className="text-2xl" aria-hidden="true">
                    🎉
                  </span>
                  <div>
                    <Badge variant="gold">10% Descuento Especial Fin de Ruta</Badge>
                    <Text size="sm" tone="muted">
                      ¡8/8 hitos completados! Aplicado automáticamente a tu pedido.
                    </Text>
                  </div>
                </div>
              )}
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
                {discount > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-secondary">Descuento Fin de Ruta (10%)</dt>
                    <dd className="font-semibold text-secondary">-{chf(discount)}</dd>
                  </div>
                )}
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

      {pickerIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Elegir foto para el marco"
          className="fixed inset-0 z-50 flex items-end justify-center bg-text/60 p-0 sm:items-center sm:p-4"
        >
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-surface p-5 shadow-lg">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <Heading as="h2" level={3}>
                  Posición {pickerIndex + 1}
                </Heading>
                <Text tone="muted" size="sm">
                  Elige una foto de tu pasaporte para este hueco.
                </Text>
              </div>
              <Button variant="ghost" size="sm" aria-label="Cerrar" onClick={() => setPickerIndex(null)}>
                <X className="size-5" aria-hidden="true" />
              </Button>
            </div>

            {entries.length === 0 ? (
              <Text size="sm" tone="muted">
                Aún no tienes fotos. Escanea un QR para sellar tu primer hito.
              </Text>
            ) : (
              <ul className="grid grid-cols-3 gap-2">
                {entries.map((entry) => {
                  const location = LOCATIONS.find((l) => l.id === entry.locationId);
                  const inSlot = mockupPhotos[pickerIndex]?.locationId === entry.locationId;
                  return (
                    <li key={entry.locationId}>
                      <button
                        type="button"
                        aria-pressed={inSlot}
                        onClick={() => {
                          assignSlot(pickerIndex, entry.locationId);
                          setPickerIndex(null);
                        }}
                        className={cn(
                          "block w-full overflow-hidden rounded-xl border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          inSlot ? "border-gold" : "border-border",
                        )}
                      >
                        <img
                          src={entry.photo}
                          alt={`Foto de ${location?.name ?? entry.locationId}`}
                          className="aspect-square w-full object-cover"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {mockupPhotos[pickerIndex] && (
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => {
                  const id = mockupPhotos[pickerIndex]!.locationId;
                  setSelected((prev) => prev.filter((p) => p !== id));
                  setPickerIndex(null);
                }}
              >
                Quitar esta foto del marco
              </Button>
            )}
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
