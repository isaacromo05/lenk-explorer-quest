# Conectar el proyecto con GitHub (Git sync)

Objetivo: sincronizar el código de este proyecto Lovable con un repositorio de GitHub para backup, desarrollo colaborativo y edición paralela.

## Pasos

1. **Iniciar la conexión desde el editor de Lovable**
   - Abrir el menú **Plus (+)** en el input del chat (abajo a la izquierda).
   - Seleccionar **GitHub → Connect project**.

2. **Autorizar la Lovable GitHub App**
   - Se abrirá un flujo OAuth en GitHub.
   - Autorizar la aplicación de Lovable para acceder a la cuenta.

3. **Seleccionar cuenta u organización**
   - Elegir la cuenta personal o la organización de GitHub donde se creará el repositorio.

4. **Crear el repositorio**
   - Dentro de Lovable, hacer clic en **Create Repository**.
   - Esto genera un nuevo repo en GitHub con el código actual del proyecto.
   - Nota: Lovable no permite importar un repositorio existente directamente; se crea uno nuevo desde aquí.

5. **Verificar la sincronización inicial**
   - Confirmar que el código del proyecto aparece en el repositorio de GitHub.
   - Revisar la primera commit/push desde Lovable.

6. **Usar el flujo bidireccional**
   - Los cambios hechos en Lovable se empujan automáticamente a GitHub.
   - Los cambios hechos en GitHub (incluyendo PRs mergeadas) se sincronizan de vuelta a Lovable.
   - Se puede clonar el repo localmente, crear ramas y seguir usando Lovable simultáneamente.

## Consideraciones

- Solo se puede conectar una cuenta de GitHub a la vez por usuario de Lovable.
- La base de datos no se exporta con el código; si se necesita, se solicita por separado desde Cloud → Advanced settings → Export data.
- Si en el futuro se quiere desconectar, se gestiona desde la misma sección de GitHub en el editor.
