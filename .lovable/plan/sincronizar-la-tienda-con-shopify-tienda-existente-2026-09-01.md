# Sincronizar la tienda con Shopify (tienda existente)

Objetivo: conectar tu tienda Shopify existente con Lenk Quest, de modo que el catálogo (figuras 3D de los Guardianes, marcos, imanes, insignias) venga de Shopify y el pago se haga con Shopify Checkout, en lugar del carrito local en LocalStorage.

## Fase 1 — Conectar Shopify

- Abrir el flujo de conexión de Shopify para una tienda existente (necesitarás tu enlace de admin de Shopify).
- Tras la aprobación, verifico el acceso al catálogo y reviso qué productos ya existen en tu tienda.

## Fase 2 — Mapear el catálogo

- Revisar productos/variantes existentes y compararlos con los ítems actuales de la app:
  - 3 Figuras 3D de Colección (Agua, Cumbres, Tradición) — CHF 29.00
  - Marco de fotos (S / M / L / XL)
  - Imanes, insignias, Pin Exclusivo Lenk Gold Edition
- Lo que falte, se crea en Shopify con precio, variantes e imágenes; lo que ya exista se reutiliza.
- Los precios y nombres pasan a leerse desde Shopify (fuente de verdad), no desde constantes en el código.

## Fase 3 — Carrito y checkout reales

- Sustituir el carrito local por líneas de carrito de Shopify (variant IDs reales).
- El botón "Proceder al Pago" del cajón del carrito redirige al Shopify Checkout.
- El configurador de `/shop/configure` (pasos: objeto base → grabados → resumen) sigue igual visualmente, pero al añadir al carrito envía la variante correcta más las personalizaciones como atributos de línea (grabado elegido, fotos del collage, tamaño del marco).

## Fase 4 — Recompensas del pasaporte

- Las insignias desbloqueadas se siguen calculando en la app (progreso QR en LocalStorage).
- Los regalos a 0,00 CHF y el descuento del 10% por 8/8 se aplican mediante códigos de descuento de Shopify, generados/aplicados al pasar al checkout, en vez de restar en el cliente.
- El Pin Exclusivo (8.50 CHF) se vincula a su producto de Shopify y solo es comprable con 8/8.

## Detalles técnicos

- Las llamadas al catálogo y al carrito se hacen desde el servidor (server functions de TanStack Start); las credenciales de Shopify nunca llegan al navegador.
- `src/lib/cart.ts` mantiene su API de hooks (`useCart`, `add`, `setQuantity`) para no reescribir la UI, pero por debajo guarda el `cartId` de Shopify y sincroniza cantidades contra Shopify.
- La lógica de desbloqueo (`src/lib/passport.ts`, `src/lib/rewards.ts`) no cambia; solo pasa a traducirse en descuentos al checkout.

## Fuera de alcance por ahora

- Reemplazar tu escaparate actual de Shopify por esta app.
- Envíos/impuestos avanzados: se usan las reglas que ya tengas configuradas en Shopify.
