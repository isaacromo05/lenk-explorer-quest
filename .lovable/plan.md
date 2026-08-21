# Guardián de Tradición: nuevo modelo 3D y vistas oficiales

Los archivos subidos (1 modelo `.glb` + 3 renders PNG: frontal, espalda y perfil izquierdo) corresponden al **excursionista alpino suizo** (sombrero rojo con cruz, peto rojo, bastón), no a la cuña de queso que hoy representa la Ruta Tradición & AlpKultur.

## Qué se hará

1. **Alojar los archivos**
   - Subir `figura-3d-preview-3.glb` al CDN y crear su puntero en `src/assets/guardian-tradicion.glb.asset.json`.
   - Publicar el render frontal como imagen oficial del guardián de Tradición en `public/assets/guardian-tradicion.png` (reemplaza la cuña de queso), y añadir las vistas de espalda y perfil como `guardian-tradicion-back.png` y `guardian-tradicion-left.png`.

2. **Actualizar el store de guardianes** (`src/lib/guardians.ts`)
   - `model3d` del sector `culture` pasa a usar el puntero CDN del nuevo `.glb` (ya no la ruta estática inexistente), por lo que el visor 3D dejará de caer al PNG.
   - Renombrar el guardián a **"Excursionista Guardián de Tradición"**, emoji `🥾`, y actualizar descripción, leyenda y la pestaña del selector ("Excursionista de Tradición"). La insignia de ruta sigue siendo "Insignia de Tradición".

3. **Propagación automática a las 3 vistas**
   - Inicio: la tarjeta de la Ruta Tradición mostrará el nuevo mascota y su leyenda.
   - Pasaporte: la rejilla "Tus Guardianes Desbloqueados" usará el nuevo render (color al completar, silueta si está bloqueado).
   - Tienda: la pestaña de Tradición cargará el `.glb` real con precarga, barra de progreso y `poster` PNG.

4. **Verificación**: build + comprobación en el navegador de que el visor 3D del guardián de Tradición carga y que Inicio/Pasaporte muestran el nuevo render.

## Nota

Si prefieres mantener el nombre y el emoji del queso (🧀) y solo cambiar la figura, dímelo y ajusto únicamente los assets sin tocar el naming.
