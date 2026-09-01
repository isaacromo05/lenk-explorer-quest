/**
 * Shopify Storefront API client for the Lenk Quest store.
 * The storefront token is publishable, so requests run straight from the client.
 */
export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "ikf11j-nk.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = "7d77554fb7284d7a2dc5710d4571a5ba";

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  sku: string | null;
  price: ShopifyMoney;
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
  image: { url: string; altText: string | null } | null;
}

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: { minVariantPrice: ShopifyMoney };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: { edges: Array<{ node: ShopifyVariant }> };
    options: Array<{ name: string; values: string[] }>;
  };
}

const PRODUCT_FIELDS = `
  id
  title
  description
  handle
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 5) { edges { node { url altText } } }
  variants(first: 20) {
    edges {
      node {
        id
        title
        sku
        price { amount currencyCode }
        availableForSale
        selectedOptions { name value }
        image { url altText }
      }
    }
  }
  options { name values }
`;

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges { node { ${PRODUCT_FIELDS} } }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) { ${PRODUCT_FIELDS} }
  }
`;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/** Single entry point for every Storefront API call. */
export async function storefrontApiRequest<T = unknown>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<GraphQLResponse<T> | undefined> {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    console.error(
      "Shopify: se requiere un plan de facturación activo para usar la API. Revisa https://admin.shopify.com",
    );
    return undefined;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as GraphQLResponse<T>;
  if (data.errors?.length) {
    throw new Error(`Error calling Shopify: ${data.errors.map((e) => e.message).join(", ")}`);
  }
  return data;
}

/** All products of the store, newest first. */
export async function fetchProducts(query?: string): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest<{ products: { edges: ShopifyProduct[] } }>(
    PRODUCTS_QUERY,
    { first: 50, query: query ?? null },
  );
  return data?.data?.products?.edges ?? [];
}

/** One product by its Shopify handle, for the product detail route. */
export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await storefrontApiRequest<{ product: ShopifyProduct["node"] | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
  );
  const product = data?.data?.product;
  return product ? { node: product } : null;
}

/** Format a Shopify money object with its own currency code. */
export function formatMoney(money: ShopifyMoney | { amount: number; currencyCode: string }) {
  const amount = typeof money.amount === "string" ? Number.parseFloat(money.amount) : money.amount;
  return new Intl.NumberFormat("es-CH", {
    style: "currency",
    currency: money.currencyCode || "CHF",
  }).format(Number.isFinite(amount) ? amount : 0);
}

/** Convenience: price of the cheapest variant of a product. */
export function productFromPrice(product: ShopifyProduct) {
  return formatMoney(product.node.priceRange.minVariantPrice);
}

export function variants(product: ShopifyProduct): ShopifyVariant[] {
  return product.node.variants.edges.map((e) => e.node);
}

export function findVariantBySku(product: ShopifyProduct, sku: string) {
  return variants(product).find((v) => v.sku === sku) ?? null;
}

export function productImage(product: ShopifyProduct) {
  return product.node.images.edges[0]?.node ?? null;
}

/** SKUs of the Lenk Quest catalog, used to wire products to app progression. */
export const SKU = {
  frame: { s: "LENK-FRAME-S", m: "LENK-FRAME-M", l: "LENK-FRAME-L", xl: "LENK-FRAME-XL" },
  figure: {
    water: "LENK-FIG-AGUA",
    summit: "LENK-FIG-CUMBRES",
    culture: "LENK-FIG-TRADICION",
  },
  engraving: {
    water: "LENK-ENG-AGUA",
    summit: "LENK-ENG-CUMBRES",
    culture: "LENK-ENG-TRADICION",
  },
  badge: {
    water: "LENK-BADGE-AGUA",
    summit: "LENK-BADGE-CUMBRES",
    culture: "LENK-BADGE-TRADICION",
  },
  magnet: "LENK-MAGNET",
  passport: "LENK-PASSPORT",
  pin: "LENK-PIN-GOLD",
} as const;

/** Discount code applied automatically when the explorer completes all 8 milestones. */
export const QUEST_COMPLETE_DISCOUNT_CODE = "LENK8DE8";

/** Find the product that owns a given SKU inside a product list. */
export function findBySku(products: ShopifyProduct[], sku: string) {
  for (const product of products) {
    const variant = findVariantBySku(product, sku);
    if (variant) return { product, variant };
  }
  return null;
}
