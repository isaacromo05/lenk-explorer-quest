import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  formatMoney,
  storefrontApiRequest,
  type ShopifyMoney,
  type ShopifyProduct,
} from "@/lib/shopify";

export interface CartItem {
  /** Shopify cart line ID, null until synced. */
  lineId: string | null;
  variantId: string;
  title: string;
  variantTitle: string;
  image: string | null;
  price: ShopifyMoney;
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
  /** Personalisations sent to Shopify as line attributes. */
  attributes?: Array<{ key: string; value: string }>;
}

export type NewCartItem = Omit<CartItem, "lineId">;

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  open: boolean;
  toast: { id: number; message: string } | null;
  addItem: (item: NewCartItem, toastMessage?: string) => Promise<void>;
  addItems: (items: NewCartItem[], toastMessage?: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  applyDiscountCodes: (codes: string[]) => Promise<void>;
  getCheckoutUrl: () => string | null;
  openCart: () => void;
  closeCart: () => void;
  clearToast: () => void;
}

const CART_QUERY = `
  query cart($id: ID!) {
    cart(id: $id) { id totalQuantity }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_DISCOUNT_CODES_UPDATE_MUTATION = `
  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart { id discountCodes { code applicable } }
      userErrors { field message }
    }
  }
`;

type UserErrors = Array<{ field: string[] | null; message: string }>;

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    // Required so checkout is not password protected.
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function isCartNotFoundError(userErrors: UserErrors): boolean {
  return userErrors.some(
    (e) =>
      e.message.toLowerCase().includes("cart not found") ||
      e.message.toLowerCase().includes("does not exist"),
  );
}

function toLineInput(item: NewCartItem) {
  return {
    quantity: item.quantity,
    merchandiseId: item.variantId,
    ...(item.attributes?.length ? { attributes: item.attributes } : {}),
  };
}

interface CartLinesPayload {
  cart: {
    id: string;
    checkoutUrl?: string;
    lines: { edges: Array<{ node: { id: string; merchandise: { id: string } } }> };
  } | null;
  userErrors: UserErrors;
}

async function createShopifyCart(items: NewCartItem[]) {
  const data = await storefrontApiRequest<{ cartCreate: CartLinesPayload }>(CART_CREATE_MUTATION, {
    input: { lines: items.map(toLineInput) },
  });

  const userErrors = data?.data?.cartCreate?.userErrors ?? [];
  if (userErrors.length > 0) {
    console.error("Cart creation failed:", userErrors);
    return null;
  }

  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;

  return {
    cartId: cart.id,
    checkoutUrl: formatCheckoutUrl(cart.checkoutUrl),
    lines: cart.lines.edges.map((e) => ({ lineId: e.node.id, variantId: e.node.merchandise.id })),
  };
}

async function addLinesToShopifyCart(cartId: string, items: NewCartItem[]) {
  const data = await storefrontApiRequest<{ cartLinesAdd: CartLinesPayload }>(
    CART_LINES_ADD_MUTATION,
    { cartId, lines: items.map(toLineInput) },
  );

  const userErrors = data?.data?.cartLinesAdd?.userErrors ?? [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true } as const;
  if (userErrors.length > 0) {
    console.error("Add line failed:", userErrors);
    return { success: false } as const;
  }

  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges ?? [];
  return {
    success: true,
    lines: lines.map((l) => ({ lineId: l.node.id, variantId: l.node.merchandise.id })),
  } as const;
}

async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontApiRequest<{ cartLinesUpdate: { userErrors: UserErrors } }>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines: [{ id: lineId, quantity }] },
  );
  const userErrors = data?.data?.cartLinesUpdate?.userErrors ?? [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true } as const;
  if (userErrors.length > 0) {
    console.error("Update line failed:", userErrors);
    return { success: false } as const;
  }
  return { success: true } as const;
}

async function removeLineFromShopifyCart(cartId: string, lineId: string) {
  const data = await storefrontApiRequest<{ cartLinesRemove: { userErrors: UserErrors } }>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds: [lineId] },
  );
  const userErrors = data?.data?.cartLinesRemove?.userErrors ?? [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true } as const;
  if (userErrors.length > 0) {
    console.error("Remove line failed:", userErrors);
    return { success: false } as const;
  }
  return { success: true } as const;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      open: false,
      toast: null,

      addItem: async (item, toastMessage) => {
        await get().addItems([item], toastMessage);
      },

      addItems: async (newItems, toastMessage) => {
        if (newItems.length === 0) return;
        const { cartId, clearCart } = get();
        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart(newItems);
            if (result) {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: newItems.map((item) => ({
                  ...item,
                  lineId:
                    result.lines.find((l) => l.variantId === item.variantId)?.lineId ?? null,
                })),
              });
            }
          } else {
            const current = get().items;
            const existing = newItems.filter((item) =>
              current.some((i) => i.variantId === item.variantId),
            );
            const fresh = newItems.filter(
              (item) => !current.some((i) => i.variantId === item.variantId),
            );

            for (const item of existing) {
              const line = get().items.find((i) => i.variantId === item.variantId);
              if (!line?.lineId) continue;
              const quantity = line.quantity + item.quantity;
              const result = await updateShopifyCartLine(cartId, line.lineId, quantity);
              if (result.success) {
                set({
                  items: get().items.map((i) =>
                    i.variantId === item.variantId ? { ...i, quantity } : i,
                  ),
                });
              } else if (result.cartNotFound) {
                clearCart();
                return;
              }
            }

            if (fresh.length > 0) {
              const result = await addLinesToShopifyCart(cartId, fresh);
              if (result.success) {
                set({
                  items: [
                    ...get().items,
                    ...fresh.map((item) => ({
                      ...item,
                      lineId:
                        result.lines?.find((l) => l.variantId === item.variantId)?.lineId ?? null,
                    })),
                  ],
                });
              } else if (result.cartNotFound) {
                clearCart();
                return;
              }
            }
          }

          set({
            open: true,
            toast: {
              id: Date.now(),
              message: toastMessage ?? `${newItems[0]!.title} añadido al carrito`,
            },
          });
        } catch (error) {
          console.error("Failed to add item:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;

        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            set({
              items: get().items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
            });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to update quantity:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;

        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const newItems = get().items.filter((i) => i.variantId !== variantId);
            if (newItems.length === 0) clearCart();
            else set({ items: newItems });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to remove item:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => get().checkoutUrl,
      openCart: () => set({ open: true }),
      closeCart: () => set({ open: false }),
      clearToast: () => set({ toast: null }),

      applyDiscountCodes: async (codes) => {
        const { cartId } = get();
        if (!cartId) return;
        try {
          await storefrontApiRequest(CART_DISCOUNT_CODES_UPDATE_MUTATION, {
            cartId,
            discountCodes: codes,
          });
        } catch (error) {
          console.error("Failed to apply discount codes:", error);
        }
      },

      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;

        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest<{
            cart: { id: string; totalQuantity: number } | null;
          }>(CART_QUERY, { id: cartId });
          if (!data) return; // API error — preserve the local cart.
          const cart = data.data?.cart;
          if (!cart || cart.totalQuantity === 0) clearCart();
        } catch (error) {
          console.error("Failed to sync cart with Shopify:", error);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        checkoutUrl: state.checkoutUrl,
      }),
    },
  ),
);

/** Derived totals for headers, badges and the drawer footer. */
export function useCartTotals() {
  const items = useCartStore((s) => s.items);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + Number.parseFloat(i.price.amount) * i.quantity, 0);
  const currencyCode = items[0]?.price.currencyCode ?? "CHF";
  return { count, total, currencyCode, formattedTotal: formatMoney({ amount: total, currencyCode }) };
}

export type { ShopifyProduct };
