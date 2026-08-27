import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect } from "react";

import { Button, Heading, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { chf, useCart } from "@/lib/cart";

/** Slide-out cart with the added items, total and checkout CTA. */
export function CartDrawer() {
  const { items, total, count, open, closeCart } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeCart]);

  return (
    <div
      className={cn("fixed inset-0 z-[100]", open ? "" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={closeCart}
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
        tabIndex={open ? 0 : -1}
      />
      <aside
        role="dialog"
        aria-modal={open}
        aria-label="Carrito de la compra"
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-surface shadow-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-4">
          <Heading as="h2" size="sm" className="flex items-center gap-2">
            <ShoppingBag className="size-5" aria-hidden="true" />
            Tu carrito ({count})
          </Heading>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="rounded-xl p-2 text-text-muted transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <Text tone="muted" className="py-10 text-center">
              Tu carrito está vacío.
            </Text>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      loading="lazy"
                      className="size-16 shrink-0 rounded-xl object-contain"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <Text className="font-semibold leading-tight">{item.name}</Text>
                    {item.note ? (
                      <Text tone="muted" size="sm">
                        {item.note}
                      </Text>
                    ) : null}
                    <div className="mt-2 flex items-center gap-2">
                      <QtyButton
                        label="Quitar una unidad"
                        onClick={() => setQty(item.id, item.quantity - 1)}
                      >
                        <Minus className="size-4" aria-hidden="true" />
                      </QtyButton>
                      <span className="min-w-6 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <QtyButton
                        label="Añadir una unidad"
                        onClick={() => setQty(item.id, item.quantity + 1)}
                      >
                        <Plus className="size-4" aria-hidden="true" />
                      </QtyButton>
                      <span className="ml-auto text-sm font-bold text-text">
                        {chf(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Eliminar ${item.name}`}
                    className="self-start rounded-xl p-2 text-text-muted transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="shrink-0 space-y-3 border-t border-border px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <Text className="font-semibold">Total</Text>
            <Text className="text-lg font-bold">{chf(total)}</Text>
          </div>
          <Button size="lg" className="w-full" disabled={items.length === 0}>
            Proceder al Pago
          </Button>
          <Text tone="muted" size="sm" className="text-center">
            Envío a domicilio en toda Suiza. Pago seguro online.
          </Text>
        </footer>
      </aside>
    </div>
  );
}

function QtyButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-7 items-center justify-center rounded-full border border-border text-text transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {children}
    </button>
  );
}

/** Toast shown when an item lands in the cart. */
export function CartToast() {
  const { toast, clearToast } = useCart();

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(clearToast, 3000);
    return () => window.clearTimeout(id);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-4 z-[110] flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-secondary-foreground shadow-lg"
    >
      <CheckCircle2 className="size-5" aria-hidden="true" />
      <span className="text-sm font-semibold">{toast.message}</span>
    </div>
  );
}

// Imported lazily to keep the drawer body readable.
import { removeFromCart as removeItem, setQuantity as setQty } from "@/lib/cart";
