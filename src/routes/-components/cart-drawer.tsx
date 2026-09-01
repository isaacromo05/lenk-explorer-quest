import { CheckCircle2, ExternalLink, Loader2, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect } from "react";

import { Button, Heading, Text } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { usePassport } from "@/lib/passport";
import { formatMoney, QUEST_COMPLETE_DISCOUNT_CODE } from "@/lib/shopify";
import { useCartStore, useCartTotals } from "@/stores/cartStore";

/** Slide-out cart backed by the Shopify Storefront API. */
export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const open = useCartStore((s) => s.open);
  const isLoading = useCartStore((s) => s.isLoading);
  const isSyncing = useCartStore((s) => s.isSyncing);
  const closeCart = useCartStore((s) => s.closeCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getCheckoutUrl = useCartStore((s) => s.getCheckoutUrl);
  const applyDiscountCodes = useCartStore((s) => s.applyDiscountCodes);
  const syncCart = useCartStore((s) => s.syncCart);
  const { count, formattedTotal } = useCartTotals();
  const { scanned, total: milestones } = usePassport();
  const questComplete = scanned >= milestones;

  useEffect(() => {
    if (open) void syncCart();
  }, [open, syncCart]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeCart]);

  const handleCheckout = async () => {
    if (questComplete) await applyDiscountCodes([QUEST_COMPLETE_DISCOUNT_CODE]);
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
      closeCart();
    }
  };

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
          <Heading as="h2" level={3} className="flex items-center gap-2">
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
                  key={item.variantId}
                  className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      width={64}
                      height={64}
                      loading="lazy"
                      className="size-16 shrink-0 rounded-xl object-contain"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <Text className="font-semibold leading-tight">{item.title}</Text>
                    {item.variantTitle ? (
                      <Text tone="muted" size="sm">
                        {item.variantTitle}
                      </Text>
                    ) : null}
                    {item.attributes?.map((attr) => (
                      <Text key={attr.key} tone="muted" size="sm">
                        {attr.key}: {attr.value}
                      </Text>
                    ))}
                    <div className="mt-2 flex items-center gap-2">
                      <QtyButton
                        label="Quitar una unidad"
                        onClick={() => void updateQuantity(item.variantId, item.quantity - 1)}
                      >
                        <Minus className="size-4" aria-hidden="true" />
                      </QtyButton>
                      <span className="min-w-6 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <QtyButton
                        label="Añadir una unidad"
                        onClick={() => void updateQuantity(item.variantId, item.quantity + 1)}
                      >
                        <Plus className="size-4" aria-hidden="true" />
                      </QtyButton>
                      <span className="ml-auto text-sm font-bold text-text">
                        {formatMoney({
                          amount: Number.parseFloat(item.price.amount) * item.quantity,
                          currencyCode: item.price.currencyCode,
                        })}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeItem(item.variantId)}
                    aria-label={`Eliminar ${item.title}`}
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
            <Text className="text-lg font-bold">{formattedTotal}</Text>
          </div>
          {questComplete ? (
            <Text tone="muted" size="sm">
              🏅 Aventura completada: aplicaremos tu descuento {QUEST_COMPLETE_DISCOUNT_CODE} en el
              pago.
            </Text>
          ) : null}
          <Button
            size="lg"
            className="w-full"
            disabled={items.length === 0 || isLoading || isSyncing}
            onClick={() => void handleCheckout()}
          >
            {isLoading || isSyncing ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <>
                <ExternalLink className="size-5" aria-hidden="true" />
                Pagar con Shopify
              </>
            )}
          </Button>
          <Text tone="muted" size="sm" className="text-center">
            Envío a domicilio en toda Suiza. Pago seguro con Shopify.
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
  const toast = useCartStore((s) => s.toast);
  const clearToast = useCartStore((s) => s.clearToast);

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
