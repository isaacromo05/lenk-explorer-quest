import { useQuery } from "@tanstack/react-query";

import {
  fetchProducts,
  findBySku,
  productImage,
  type ShopifyProduct,
  type ShopifyVariant,
} from "@/lib/shopify";
import type { NewCartItem } from "@/stores/cartStore";

/** Live Shopify catalog, shared by the shop, configurator and passport. */
export function useCatalog() {
  return useQuery({
    queryKey: ["shopify", "products"],
    queryFn: () => fetchProducts(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Build a cart line from a Shopify product + variant. */
export function toCartItem(
  product: ShopifyProduct,
  variant: ShopifyVariant,
  options: { quantity?: number; attributes?: Array<{ key: string; value: string }> } = {},
): NewCartItem {
  return {
    variantId: variant.id,
    title: product.node.title,
    variantTitle: variant.title === "Default Title" ? "" : variant.title,
    image: variant.image?.url ?? productImage(product)?.url ?? null,
    price: variant.price,
    quantity: options.quantity ?? 1,
    selectedOptions: variant.selectedOptions.filter((o) => o.value !== "Default Title"),
    ...(options.attributes?.length ? { attributes: options.attributes } : {}),
  };
}

/** Locate a variant by SKU inside the loaded catalog. */
export function lookupSku(products: ShopifyProduct[] | undefined, sku: string) {
  if (!products) return null;
  return findBySku(products, sku);
}
