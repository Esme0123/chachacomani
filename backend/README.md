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