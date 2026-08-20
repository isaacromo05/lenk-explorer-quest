import { Link } from "@tanstack/react-router";
import { BookOpenText, Home, ScanLine, ShoppingBag, type LucideIcon } from "lucide-react";

import { Badge } from "@/design-system";
import { cn } from "@/design-system/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  scanned?: number;
  total?: number;
}

export function MobileLayout({ children, scanned = 0, total = 8 }: MobileLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between bg-primary px-4 text-primary-foreground shadow-sm">
        <span className="font-display text-lg font-bold tracking-tight">Lenk Quest 🏔️</span>
        <Badge
          variant="outline"
          className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
        >
          {scanned}/{total} QR Escaneados
        </Badge>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">{children}</main>

      <nav className="shrink-0 border-t border-border bg-surface px-2 pt-2 shadow-sm">
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
