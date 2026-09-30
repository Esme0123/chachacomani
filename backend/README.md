# Backend PHP + MySQL — Evaluación de Artículos

Sistema de evaluación ("Me parece bien" / "No me parece bien") del Reglamento
Interno, listo para desplegar en **GoDaddy (cPanel)**.

## Estructura

```
backend/
├── schema.sql        → importar en phpMyAdmin (crea la tabla votos_articulos)
├── .htaccess         → reglas de Apache para cPanel
├── config/
│   └── db.php        → credenciales PDO (edite aquí DB_HOST/DB_NAME/USER/PASS)
└── api/
    ├── helpers.php           → CORS + respuestas JSON + validaciones
    ├── votar.php             → POST  : registra el voto (HTTP 409 si duplicado)
    ├── estadisticas.php      → GET   : métricas globales / por capítulo / artículo
    └── mis_votos.php         → GET   : artículos ya votados por un voter_token
```

## Despliegue en cPanel (pasos)

1. **Base de datos**
   - cPanel → *MySQL® Databases*: cree la BD y su usuario (con todos los permisos).
   - Abra *phpMyAdmin*, seleccione la BD y use *Importar* → suba `schema.sql`.

2. **Credenciales**
   - Edite `config/db.php` con los datos de cPanel (host suele ser `localhost`).

3. **Subir archivos**
   - Suba la carpeta `backend/` a `public_html/` (o a `/api` si prefiere):
     `public_html/backend/...`
   - El frontend buscará el API automáticamente en `${origen}/backend/api`.

4. **CORS / dominio**
   - En `config/db.php`, lista `ALLOWED_ORIGINS`, agregue su dominio de GoDaddy,
     por ejemplo `https://www.su-dominio.com`. En desarrollo local el servidor
     Vite (`localhost:5173`) ya está autorizado.

5. **Compilar el frontend** (desde `frontend/`)
   ```bash
   npm install
   npm run build
   ```
   Sublica el contenido de `frontend/dist/` a `public_html/`.

## Anexo I (multas) ↔ Caja Chica

- `api/multas.php` — `GET` devuelve las multas visibles para el rol (el socio con
  rol `lectura` sólo ve las suyas; el Tesorero/Admin obtienen además el padrón
  `socios`), `POST` imputa una sanción y `PUT` la cierra.
- Al marcar una multa como **PAGADA**, `PUT` asienta el cobro como **ingreso**
  en `caja_chica_movimientos` (categoría «Multas cobradas», concepto
  «Cobro de Multa: socio - infracción (artículo)», monto cobrado). El vínculo es
  la columna `multa_id` (UNIQUE), por lo que el asiento es idempotente; anular
  o reabrir la sanción retira el ingreso. Para asentar el cobro a mano, envía
  `"registrar_caja_chica": false` en el `PUT`.
- **Cobro desde el panel de Caja Chica** (conmutador «Registrar Multa a Socio»):
  el `POST` acepta `"cobrar": true` y entonces la sanción nace **PAGADA** y su
  ingreso entra en caja chica en la **misma transacción**, con el concepto que
  arma el panel (`"concepto_cobro"`, opcional; por defecto el del `PUT`) y la
  fecha de cobro en `"fecha_cobro"`. Así el Tesorero —que tiene
  `multas:gestionar` pero no `caja_chica:gestionar`— cobra sin saltar al
  Anexo I y sin poder duplicar el asiento. Una sanción con monto 0 no se puede
  cobrar: el endpoint la rechaza y deja registrarla como pendiente.
- Esa columna la crea `migrar.php` (paso 4). Si todavía no se ha ejecutado, el
  endpoint responde con un aviso en el mensaje y no rompe la actualización:

  ```bash
  cd /home/USUARIO/public_html/backend
  php migrar.php
  ```

- El rol `lectura` (socio) no ve nada de esto: consulta sus sanciones en
  **Perfil → Revisar mis Multas**, sin formulario ni controles del Tesorero.

## Anti-spam

La contra votación se garantiza en dos capas:

- **Base de datos:** índice `UNIQUE KEY uq_articulo_token (articulo_id, voter_token)`.
  Si el mismo navegador reintenta, `votar.php` responde **HTTP 409**.
- **Frontend React:** al cargar la app se genera un `voter_token` (UUID en
  `localStorage`) y se consulta `mis_votos.php`; los artículos ya evaluados
  quedan deshabilitados y con la insignia "Ya evaluaste este artículo (👍/👎)".

## Modo simulación (sin PHP)

Si el API no responde (por ejemplo en `npm run dev` sin backend), el frontend
cae automáticamente a un modo de simulación persistido en `localStorage`, con
la misma interfaz. Para forzar un modo:

```js
localStorage.setItem('chachacomani_modo_api', 'real')        // o 'simulacion'
```