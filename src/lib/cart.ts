import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "lenk-quest-cart-v1";

export interface CartItem {
  id: string;
  name: string;
  /** Unit price in CHF. */
  price: number;
  quantity: number;
  image?: string;
  note?: string;
}

export type CartState = Record<string, CartItem>;

interface CartStore {
  items: CartState;
  open: boolean;
  toast: { id: number; message: string } | null;
}

let store: CartStore = { items: {}, open: false, toast: null };
const listeners = new Set<(s: CartStore) => void>();

function readItems(): CartState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as CartState) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function emit(next: CartStore) {
  store = next;
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next.items));
    }
  } catch {
    /* storage unavailable — keep in-memory state */
  }
  listeners.forEach((fn) => fn(store));
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  const existing = store.items[item.id];
  emit({
    ...store,
    items: {
      ...store.items,
      [item.id]: { ...item, quantity: (existing?.quantity ?? 0) + quantity },
    },
    open: true,
    toast: { id: Date.now(), message: `${item.name} añadido al carrito` },
  });
}

export function removeFromCart(id: string) {
  const next = { ...store.items };
  delete next[id];
  emit({ ...store, items: next });
}

export function setQuantity(id: string, quantity: number) {
  const existing = store.items[id];
  if (!existing) return;
  if (quantity <= 0) return removeFromCart(id);
  emit({ ...store, items: { ...store.items, [id]: { ...existing, quantity } } });
}

export function openCart() {
  emit({ ...store, open: true });
}

export function closeCart() {
  emit({ ...store, open: false });
}

export function clearToast() {
  emit({ ...store, toast: null });
}

export const chf = (value: number) =>
  new Intl.NumberFormat("es-CH", { style: "currency", currency: "CHF" }).format(value);

/** Global cart shared across mounted components, persisted in LocalStorage. */
export function useCart() {
  const [state, setState] = useState<CartStore>(store);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!hydrated && Object.keys(store.items).length === 0) {
      store = { ...store, items: readItems() };
    }
    setState(store);
    setHydrated(true);
    const listener = (s: CartStore) => setState({ ...s });
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = Object.values(state.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return {
    items,
    count: hydrated ? count : 0,
    total,
    hydrated,
    open: state.open,
    toast: state.toast,
    add: useCallback(addToCart, []),
    remove: useCallback(removeFromCart, []),
    setQuantity: useCallback(setQuantity, []),
    openCart: useCallback(openCart, []),
    closeCart: useCallback(closeCart, []),
    clearToast: useCallback(clearToast, []),
  };
}
