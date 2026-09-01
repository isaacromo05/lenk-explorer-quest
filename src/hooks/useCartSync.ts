import { useEffect } from "react";

import { useCartStore } from "@/stores/cartStore";

/** Clears the local cart once the Shopify cart is emptied (order completed). */
export function useCartSync() {
  const syncCart = useCartStore((state) => state.syncCart);

  useEffect(() => {
    void syncCart();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void syncCart();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [syncCart]);
}
