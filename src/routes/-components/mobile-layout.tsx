import { Link } from "@tanstack/react-router";
import { BookOpenText, Home, ScanLine, ShoppingBag, ShoppingCart, type LucideIcon } from "lucide-react";

import { Badge } from "@/design-system";
import { cn } from "@/design-system/lib/utils";
import { useCartSync } from "@/hooks/useCartSync";
import { usePassport } from "@/lib/passport";
import { useCartStore, useCartTotals } from "@/stores/cartStore";

import { CartDrawer, CartToast } from "./cart-drawer";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const { scanned, total, hydrated } = usePassport();
  const { count } = useCartTotals();
  const openCart = useCartStore((s) => s.openCart);
  useCartSync();
  return (

    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between bg-primary px-4 text-primary-foreground shadow-sm">
        <div className="flex flex-col">
          <span className="font-display text-lg font-bold leading-tight tracking-tight">
            Lenk Quest 🏔️
          </span>
          <span className="text-[10px] font-semibold text-primary-foreground/80">
            🟢 Modo Offline Activo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
          >
            {hydrated ? scanned : 0}/{total} QR Escaneados
          </Badge>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Abrir carrito (${count} artículos)`}
            className="relative rounded-xl p-2 text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
          >
            <ShoppingCart className="size-5" aria-hidden="true" />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-primary">
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-28">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-md">
        <ul className="flex items-end justify-around">
          <NavItem to="/" icon={Home} label="Inicio" />
          <NavItem to="/passport" icon={BookOpenText} label="Mi Pasaporte" />
          <li className="flex flex-1 justify-center">
            <Link
              to="/scan"
              className="relative -mt-5 flex flex-col items-center gap-1 rounded-xl p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span className="sr-only">Escanear QR</span>
              <span
                className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary-hover active:bg-primary-hover"
                aria-hidden="true"
              >
                <ScanLine className="size-6" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold text-text">Escanear</span>
            </Link>
          </li>
          <NavItem to="/shop" icon={ShoppingBag} label="Tienda" />
        </ul>
      </nav>

      <CartDrawer />
      <CartToast />
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

function NavItem({ to, icon: Icon, label }: NavItemProps) {
  return (
    <li className="flex flex-1 justify-center">
      <Link
        to={to}
        activeProps={{ className: "text-primary" }}
        inactiveProps={{ className: "text-text-muted" }}
        className="flex flex-col items-center gap-1 rounded-xl py-2 px-3 text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        activeOptions={{ exact: true }}
      >
        <Icon className="size-5" aria-hidden="true" />
        <span className="text-xs font-medium">{label}</span>
      </Link>
    </li>
  );
}
