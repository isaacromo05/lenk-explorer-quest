# Contenido de la app que aún no está en la tienda de Shopify

Comparé el catálogo de Shopify (9 productos) con lo que la app ya tiene definido y con los assets del proyecto. Todo lo que la app vende hoy ya existe en Shopify (marcos, 3 figuras, grabados, imán, pasaporte, 3 insignias y el pin Gold). Lo que sí existe en el proyecto pero **no** tiene producto en Shopify es lo siguiente.

## Candidatos a añadir

1. **Grabado "Leyenda de Lenk"** — el proyecto incluye la ilustración `grabado-leyenda.png`, pero el producto "Grabado en madera de ruta" solo tiene 3 variantes (Agua, Cumbres, Tradición). Se añadiría como cuarta variante (SKU `LENK-ENG-LEYENDA`), sin bloqueo por insignia, disponible para todos.

2. **Medalla de Oro Trans-Simmental** — la app tiene un componente `Medal` y la narrativa de recompensa 8/8, pero no existe producto físico. Se crearía como recompensa de regalo (0,00 CHF), igual que las insignias.

3. **Pack Trío de Guardianes** — las 3 figuras se venden solo por separado a 29 CHF. Se crearía un producto de bundle (SKU `LENK-FIG-TRIO`) con precio de conjunto y `compare_at_price` de 87 CHF.

4. **Impresión del collage de fotos (sin marco)** — el configurador ya genera un collage de 1 a 8 fotos; hoy solo se puede comprar con marco de madera. Se crearía "Impresión del collage" en 2 tamaños como alternativa económica.

5. **Imágenes adicionales de producto** — cada producto de Shopify tiene una sola imagen. La figura de Tradición ya tiene renders trasero y lateral (`guardian-tradicion-back.png`, `guardian-tradicion-left.png`) que se subirían como imágenes secundarias, y las insignias y el pin usarían sus renders oficiales.

## Detalle técnico

- Los nuevos SKUs se añaden al mapa `SKU` de `src/lib/shopify.ts` para que la app los localice igual que el resto.
- El grabado "Leyenda" entra en la lista de grabados de `src/routes/shop.index.tsx` y del configurador (`shop.configure.tsx`) como opción sin bloqueo.
- La medalla se muestra en la sección de recompensas de regalo del Shop y en el pasaporte al completar 8/8, con la misma lógica de las insignias.
- El bundle y la impresión del collage se listan en el Shop reutilizando las tarjetas de producto existentes; los precios vienen siempre de Shopify.
- No se toca el flujo de carrito ni de checkout: todo pasa por la Storefront API que ya está en marcha.

## Nota sobre precios

Los grabados están a 19 CHF en Shopify mientras que la app mostraba 5 CHF como valor de reserva antiguo. Ahora la app siempre lee el precio real de Shopify, así que no hay descuadre; si 19 CHF no es el precio deseado, se ajusta en Shopify.
