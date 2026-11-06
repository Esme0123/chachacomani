# Cooperativa Minera Aurífera "Nevado Chachacomani" R.L.

Plataforma web para la gestión del **Reglamento Interno**, la **evaluación por
artículo** de los documentos normativos y el **módulo financiero** de la
cooperativa (multas del Anexo I, aportes del Anexo II, deudas, comprobantes,
Caja Chica y notificaciones en tiempo real).

El sistema se compone de:

- **Frontend:** React 18 + Vite + Tailwind CSS.
- **Backend:** PHP 8 + PDO, sin framework, compatible con cPanel / GoDaddy.
- **Base de datos:** MySQL 5.6+ / MariaDB 10.1+ con charset `utf8mb4`.

---

## 1. Visión general

### 1.1 Módulos funcionales

| Módulo | Descripción |
| --- | --- |
| Autenticación y roles | Registro, login, sesión por token Bearer y control de acceso RBAC. |
| Normativa | Lectura del Reglamento Interno y del Estatuto Orgánico con lector, búsqueda, resaltado y TTS. |
| Votación por artículo | Evaluación "Me parece bien" / "No me parece bien" con voto único por socio o navegador. |
| Estadísticas | Agregados por documento, capítulo y artículo calculados en MySQL. |
| Multas (Anexo I) | Registro de sanciones, catálogo de infracciones y cobro desde Caja Chica. |
| Aportes (Anexo II) | Escala de aportes al Fondo de Accidentes. |
| Deudas y comprobantes | Ciclo `pendiente -> en_revision -> cancelado` con método de pago, QR, transferencia o efectivo. |
| Caja Chica | Ingresos y egresos menores, saldos y asientos automáticos por cobros. |
| Notificaciones | Campana del Header, badge de no leídas, toast flotante y sonido discreto. |
| DRM | Configuración global de protección de contenido, editable sólo por Administrador. |

### 1.2 Roles del sistema

Definidos en `backend/api/roles.php` y replicados en
`frontend/src/services/permisosService.js` sólo para ocultar controles. La
validación definitiva siempre ocurre en PHP.

| Rol | Capacidades |
| --- | --- |
| `lectura` (socio) | Leer normativa, votar, consultar sus multas y sus deudas. |
| `tesorero` | Todo lo del socio, más gestión de multas del Anexo I y consulta contable. |
| `caja_chica` | Todo lo del socio, más gestión de Caja Chica, cobros y deudas. |
| `admin` | Control total: usuarios, roles, DRM, multas, caja chica y estadísticas. |

### 1.3 Estructura del repositorio

```text
chachacomani/
├── backend/
│   ├── api/
│   │   ├── index.php              # Enrutador de rutas limpias /api/*
│   │   ├── helpers.php            # CORS, JSON, saneado y helpers de notificación
│   │   ├── auth_lib.php           # Tokens y usuario autenticado
│   │   ├── roles.php              # Matriz RBAC
│   │   ├── auth/                  # login, registro, perfil, password, usuarios
│   │   ├── deudas.php             # Emisión, consulta y aprobación de deudas
│   │   ├── notificar_pago.php     # Reporte de pago con comprobante
│   │   ├── notificaciones.php     # Campana del Header
│   │   ├── votar.php              # Registro de votos
│   │   ├── mis_votos.php          # Votos ya emitidos
│   │   ├── estadisticas.php       # Agregados de votación
│   │   ├── multas.php             # Anexo I
│   │   ├── caja_chica.php         # Movimientos de Caja Chica
│   │   └── cobros.php             # Cobro grupal (multas + aportes)
│   ├── config/db.php              # Credenciales PDO y orígenes CORS
│   ├── uploads/comprobantes/      # Adjuntos de pago (protegidos por .htaccess)
│   ├── migrar.php                 # Migración idempotente
│   └── schema.sql                 # Esquema completo
├── frontend/
│   ├── src/
│   │   ├── components/            # Header, campana, deudas, caja chica, etc.
│   │   ├── context/               # Auth, DRM y Notificaciones
│   │   ├── hooks/                 # useRefrescoEstadisticas, useTTS, useDRM
│   │   ├── services/              # Cliente HTTP y servicios por dominio
│   │   ├── views/                 # Vistas de la aplicación
│   │   └── utils/                 # Sonido de notificación
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 2. Arquitectura de base de datos

El esquema completo está en `backend/schema.sql`. La migración idempotente
`backend/migrar.php` crea las tablas faltantes, agrega columnas/índices y
conserva los datos existentes.

### 2.1 `votos_articulos`

Registra la evaluación de cada artículo. La columna `documento` separa el
Reglamento del Estatuto porque ambos documentos numeran sus artículos del 1 al
99. La clave única impide que una misma identidad vote dos veces el mismo
artículo del mismo documento.

```sql
CREATE TABLE `votos_articulos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `documento` VARCHAR(24) NOT NULL DEFAULT 'reglamento',
  `articulo_id` INT NOT NULL,
  `capitulo_id` INT NOT NULL,
  `tipo_voto` ENUM('positivo', 'negativo') NOT NULL,
  `voter_token` VARCHAR(64) NOT NULL,
  `usuario_id` INT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_documento_articulo_votante`
    (`documento`, `articulo_id`, `voter_token`),
  KEY `idx_votos_capitulo` (`documento`, `capitulo_id`),
  KEY `idx_votos_usuario` (`usuario_id`),
  KEY `idx_votos_tipo` (`tipo_voto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Identidad del votante:

- Con sesión iniciada: `voter_token = 'u:<usuario_id>'`.
- Sin sesión: UUID persistido en `localStorage` del navegador.

### 2.2 `deudas_multas`

Representa una multa del Anexo I o un aporte del Anexo II con su ciclo de pago.

```sql
CREATE TABLE `deudas_multas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `socio_id` INT NOT NULL,
  `concepto` VARCHAR(255) NOT NULL,
  `monto` DECIMAL(10, 2) NOT NULL,
  `tipo` ENUM('multa_anexo_1', 'aporte_anexo_2')
    NOT NULL DEFAULT 'multa_anexo_1',
  `estado` ENUM('pendiente', 'en_revision', 'cancelado')
    NOT NULL DEFAULT 'pendiente',
  `metodo_pago` ENUM('efectivo', 'qr', 'transferencia') NULL,
  `nro_comprobante` VARCHAR(100) NULL,
  `comprobante_url` VARCHAR(255) NULL,
  `registrado_por` INT NULL,
  `fecha_emision` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_pago` DATETIME NULL,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_deudas_socio` (`socio_id`, `estado`),
  KEY `idx_deudas_estado` (`estado`),
  KEY `idx_deudas_tipo` (`tipo`),
  KEY `idx_deudas_registrador` (`registrado_por`),
  CONSTRAINT `fk_deudas_socio` FOREIGN KEY (`socio_id`)
    REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_deudas_registrador` FOREIGN KEY (`registrado_por`)
    REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Estados:

- `pendiente`: deuda emitida, el socio aún no reportó el pago.
- `en_revision`: el socio subió método/comprobante y espera validación.
- `cancelado`: Tesorería/Caja Chica/Admin aprobó el pago. Se asienta un ingreso
  en `caja_chica_movimientos` con vínculo `deuda_id` único e idempotente.

### 2.3 `notificaciones`

Cada fila pertenece a un usuario concreto. El campo `rol_destino` conserva el
rol que originó el aviso para auditoría y filtrado.

```sql
CREATE TABLE `notificaciones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NULL,
  `rol_destino` ENUM('socio', 'tesorero', 'caja_chica', 'admin') NULL,
  `titulo` VARCHAR(150) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `leido` TINYINT(1) NOT NULL DEFAULT 0,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notificaciones_usuario` (`usuario_id`, `leido`),
  KEY `idx_notificaciones_rol` (`rol_destino`, `leido`),
  CONSTRAINT `fk_notificaciones_usuario` FOREIGN KEY (`usuario_id`)
    REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Las funciones `notificarUsuario()` y `notificarRoles()` de
`backend/api/helpers.php` insertan los avisos dentro de la misma transacción que
la operación de negocio.

### 2.4 Otras tablas relevantes

- `usuarios`: socios y personal con rol, estado activo y hash de contraseña.
- `sesiones`: tokens opacos de 64 caracteres hex con expiración y revocación.
- `multas`: historial de sanciones del Anexo I.
- `caja_chica_movimientos`: ingresos/egresos, con vínculos únicos `multa_id` y
  `deuda_id` para impedir asientos duplicados.
- `configuraciones`: flags globales, incluido `drm_activo`.

---

## 3. Endpoints de API

### 3.1 Convenciones

- Base local: `http://localhost:3000/api` (Vite) o `/api` en el mismo dominio.
- Autenticación: cabecera `Authorization: Bearer <token>`.
- Cuerpos JSON salvo `notificar-pago`, que acepta `multipart/form-data`.
- Respuestas de error: `{ "ok": false, "error": "mensaje" }`.
- Códigos habituales: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`.

El enrutador `backend/api/index.php` publica rutas limpias y el cliente React
(`frontend/src/services/apiClient.js`) reintenta automáticamente con la
extensión `.php` si el hosting no soporta `mod_rewrite`.

### 3.2 `deudas.php`

Rutas: `GET`, `POST`, `PUT` en `/api/deudas`.

**GET** — consulta de deudas.

- Socio (`lectura`): devuelve sólo sus deudas.
- Tesorería / Caja Chica / Admin: listado completo.
- Filtros opcionales: `estado`, `tipo`, `socio_id`.
- `propias=1`: fuerza las deudas del usuario autenticado incluso para staff.

Respuesta:

```json
{
  "ok": true,
  "deudas": [
    {
      "id": 12,
      "socioId": 4,
      "socioNombre": "Juan Pérez",
      "concepto": "Multa por inasistencia",
      "monto": 150.0,
      "tipo": "multa_anexo_1",
      "estado": "pendiente",
      "metodoPago": null,
      "nroComprobante": null,
      "comprobanteUrl": null,
      "fechaEmision": "2026-10-01 10:00:00",
      "fechaPago": null
    }
  ],
  "totales": {
    "total": 1,
    "pendientes": 1,
    "enRevision": 0,
    "canceladas": 0,
    "montoPendiente": 150.0,
    "montoEnRevision": 0,
    "montoCancelado": 0
  },
  "puedeGestionar": false,
  "socios": []
}
```

**POST** — emite una deuda y notifica al socio. Requiere
`multas:gestionar` o `caja_chica:gestionar`.

```json
{
  "socio_id": 4,
  "concepto": "Multa por inasistencia a asamblea",
  "monto": 150.0,
  "tipo": "multa_anexo_1",
  "fecha_emision": "2026-10-01"
}
```

Respuesta `201` con la deuda creada. Dentro de la transacción se inserta el
aviso `Nueva deuda registrada` para el socio.

**PUT** — cambia el estado de una deuda.

```json
{ "id": 12, "estado": "cancelado" }
```

- `cancelado`: marca `fecha_pago`, inserta el ingreso en Caja Chica de forma
  idempotente y notifica al socio con `Pago confirmado`.
- `pendiente`: reabre la deuda, retira el ingreso asociado y, si venía de
  `en_revision`, notifica al socio con `Pago observado`.
- `en_revision`: sólo cambia el estado.

### 3.3 `notificaciones.php`

Rutas: `GET`, `PUT` en `/api/notificaciones`. Requiere sesión.

**GET** — avisos del usuario autenticado (máximo 50) y contador de no leídos.
También incluye avisos dirigidos a su rol cuando `usuario_id` es `NULL`.

```json
{
  "ok": true,
  "notificaciones": [
    {
      "id": 31,
      "usuarioId": 4,
      "rolDestino": "socio",
      "titulo": "Pago confirmado",
      "mensaje": "Su pago de Bs. 150.00 fue aprobado.",
      "leido": false,
      "creadoEn": "2026-10-01 12:30:00"
    }
  ],
  "noLeidas": 1
}
```

**PUT** — marca un aviso o todos como leídos.

```json
{ "id": 31 }
```

```json
{ "todas": true }
```

Respuesta: `{ "ok": true, "noLeidas": 0, "mensaje": "..." }`.

Si la tabla aún no existe, responde `409` con la indicación de ejecutar
`backend/migrar.php`.

### 3.4 `notificar_pago.php`

Ruta: `POST /api/notificar-pago`. Acepta `multipart/form-data` o JSON.

Campos:

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `deuda_id` | Sí | Identificador de la deuda. |
| `metodo_pago` | Sí | `efectivo`, `qr` o `transferencia`. |
| `nro_comprobante` | No | Texto libre de hasta 100 caracteres. |
| `comprobante` | No | JPG, PNG, WEBP o PDF de hasta 5 MB. |

Comportamiento:

1. Valida que la deuda exista y que el solicitante sea su dueño o staff.
2. Rechaza deudas ya canceladas.
3. Guarda el archivo en `backend/uploads/comprobantes/` con nombre aleatorio.
4. Actualiza la deuda a `en_revision`, guarda método, número y URL del adjunto.
5. Notifica a `tesorero`, `caja_chica` y `admin` mediante `notificarRoles()`.

Respuesta `201`:

```json
{
  "ok": true,
  "deuda": {
    "id": 12,
    "estado": "en_revision",
    "metodoPago": "qr",
    "nroComprobante": "00012345",
    "comprobanteUrl": "https://dominio.com/uploads/comprobantes/comprobante_12_ab12cd34.jpg"
  },
  "mensaje": "Pago reportado. Tesorería revisará el comprobante y confirmará la cancelación."
}
```

### 3.5 `votar.php`

Ruta: `POST /api/votar` (también `/api/votos`).

```json
{
  "documento": "reglamento",
  "articulo_id": 12,
  "capitulo_id": 3,
  "tipo_voto": "positivo",
  "voter_token": "uuid-del-navegador"
}
```

- `documento`: `reglamento` (por defecto) o `estatuto`.
- `tipo_voto`: `positivo` o `negativo`.
- Con sesión se ignora `voter_token` y se usa `u:<usuario_id>`.

Respuestas:

- `200`: voto registrado.
- `400`: datos inválidos.
- `409`: esta identidad ya evaluó ese artículo.
- `500`: error del servidor.

La unicidad la garantiza la clave
`uq_documento_articulo_votante (documento, articulo_id, voter_token)`.

### 3.6 `estadisticas.php`

Ruta: `GET /api/estadisticas?documento=reglamento|estatuto`. Es pública.

Respuesta:

```json
{
  "ok": true,
  "documento": "reglamento",
  "totalVotos": 120,
  "aprobacionGeneral": 78,
  "capitulos": [
    {
      "capituloId": 1,
      "capituloRomano": "1",
      "titulo": "Capítulo 1",
      "likes": 80,
      "dislikes": 20,
      "totalVotos": 100,
      "aprobacion": 80,
      "articulos": [
        {
          "id": 1,
          "numero": 1,
          "denominacion": "Artículo 1",
          "likes": 10,
          "dislikes": 2,
          "total": 12,
          "aprobacion": 83
        }
      ]
    }
  ]
}
```

Todos los contadores se calculan en MySQL. Los artículos sin votos se completan
con ceros en el frontend a partir del catálogo oficial.

### 3.7 Otras rutas

| Ruta | Métodos | Uso |
| --- | --- | --- |
| `/api/auth/register` | POST | Registro de socio. |
| `/api/auth/login` | POST | Inicio de sesión y token. |
| `/api/auth/me` | GET, PUT | Perfil del usuario. |
| `/api/auth/password` | POST | Cambio de contraseña. |
| `/api/auth/usuarios` | GET, POST, PUT | Gestión de usuarios (Admin). |
| `/api/multas` | GET, POST, PUT | Anexo I. |
| `/api/caja-chica` | GET, POST | Movimientos de Caja Chica. |
| `/api/cobros` | POST | Cobro grupal del carrito. |
| `/api/drm` | GET, POST | Configuración del DRM. |
| `/api/votos` | GET, POST | Votos emitidos / registrar voto. |

---

## 4. Flujo de notificaciones y comprobantes

### 4.1 Ciclo de vida del pago

```text
Emisión de la deuda
  deudas.php POST
  -> deudas_multas.estado = 'pendiente'
  -> notificarUsuario(socio): "Nueva deuda registrada"
  -> el socio ve el badge y el toast en la campana

Reporte del pago
  notificar_pago.php POST (multipart)
  -> estado = 'en_revision'
  -> se guardan método, número y comprobante_url
  -> notificarRoles(tesorero, caja_chica, admin):
     "Pago reportado por <socio>"
  -> el staff lo ve en la bandeja "Pagos reportados"

Validación
  deudas.php PUT { estado: 'cancelado' }
  -> estado = 'cancelado' y fecha_pago
  -> ingreso automático en caja_chica_movimientos (deuda_id UNIQUE)
  -> notificarUsuario(socio): "Pago confirmado"
  -> el socio ve la deuda cancelada sin recargar la página

Rechazo / observación
  deudas.php PUT { estado: 'pendiente' }
  -> se retira el ingreso de Caja Chica si existía
  -> estado = 'pendiente'
  -> notificarUsuario(socio): "Pago observado"
```

### 4.2 Sincronización en tiempo real (Opción B)

El proyecto no depende de servicios externos de WebSockets (Pusher/Ably), lo
que simplifica el despliegue en GoDaddy. La sincronización se implementa con
polling ligero y revalidación al recuperar el foco:

- **Notificaciones:** `frontend/src/context/NotificacionesContext.jsx`
  - Consulta `GET /api/notificaciones` cada **7 segundos**.
  - Revalida en `visibilitychange` y `window.focus`.
  - Pausa el polling con la pestaña oculta para ahorrar datos y batería.
  - Mantiene un único estado global compartido por la campana de escritorio y
    la móvil, evitando peticiones duplicadas.
  - Compara los IDs ya conocidos: si aparecen avisos nuevos, actualiza el badge
    de inmediato, muestra un toast flotante y reproduce un tono discreto
    generado con la Web Audio API.
  - El audio se desbloquea con el primer gesto del usuario, respetando las
    políticas de autoplay de los navegadores.

- **Deudas del socio:** `frontend/src/components/MisDeudas.jsx`
  - Polling cada 7 segundos mediante `useRefrescoEstadisticas`.
  - Revalidación con `focus` y `visibilitychange`.
  - La bandeja pasa de `pendiente` a `en_revision` o `cancelado` sin recargar.

- **Pagos reportados (staff):** `frontend/src/components/GestionDeudas.jsx`
  - Polling cada 7 segundos mientras la bandeja está montada.
  - Los comprobantes reportados por los socios aparecen automáticamente.
  - Tras aprobar o rechazar, la bandeja se refresca de inmediato.

### 4.3 Limpieza de suscripciones

Todos los `useEffect` liberan sus recursos:

- `NotificacionesContext` ejecuta `clearInterval`, elimina los listeners de
  `visibilitychange` y `focus`, e invalida peticiones en vuelo al cambiar de
  sesión o desmontar.
- El temporizador del toast se cancela con `clearTimeout` mediante
  `cerrarAviso()` y en el cleanup del proveedor.
- `useRefrescoEstadisticas` ejecuta `clearInterval` y
  `removeEventListener` en su cleanup.
- `NotificacionesBell` elimina los listeners de clic fuera y tecla `Escape`.

---

## 5. Guía de despliegue en GoDaddy (cPanel)

### 5.1 Requisitos

- PHP 8.0 o superior con PDO MySQL, `fileinfo` recomendado.
- MySQL 5.6+ / MariaDB 10.1+.
- Node.js 18+ sólo para compilar el frontend.
- Acceso a cPanel y, preferiblemente, SSH o terminal.

### 5.2 Crear la base de datos

1. En cPanel abra **MySQL Databases**.
2. Cree la base de datos y el usuario.
3. Asigne todos los privilegios del usuario sobre la base.
4. Anote el prefijo de cPanel. GoDaddy suele anteponer `i9722939_` a los
   nombres. Por ejemplo:

   ```text
   Base de datos: i9722939_chachacomani
   Usuario:       i9722939_chachacomani
   Host:          localhost
   ```

### 5.3 Configurar credenciales

Edite `backend/config/db.php`:

```php
const DB_HOST = 'localhost';
const DB_PORT = 3306;
const DB_NAME = 'i9722939_chachacomani';
const DB_USER = 'i9722939_chachacomani';
const DB_PASS = 'SU_CONTRASENA_SEGURA';
```

Ajuste también `ALLOWED_ORIGINS` con el dominio real:

```php
const ALLOWED_ORIGINS = [
    'https://www.su-dominio.com',
    'https://su-dominio.com',
];
```

Las credenciales también pueden definirse como variables de entorno
(`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`), que tienen prioridad
sobre las constantes.

### 5.4 Ejecutar la migración

**Opción recomendada por SSH:**

```bash
cd /home/USUARIO/public_html/backend
php migrar.php
```

**Opción por navegador:**

```text
https://su-dominio.com/backend/migrar.php
```

La migración es idempotente: crea tablas faltantes, agrega columnas e índices y
conserva los votos y movimientos existentes.

Para crear el primer administrador:

```bash
php migrar.php --crear-admin \
  --admin-nombre="Administrador" \
  --admin-correo=admin@su-dominio.com \
  --admin-clave="ClaveSegura2026"
```

También puede usar variables de entorno:

```text
CHACHO_ADMIN_NOMBRE=Administrador
CHACHO_ADMIN_CORREO=admin@su-dominio.com
CHACHO_ADMIN_CLAVE=ClaveSegura2026
```

Por seguridad, elimine o renombre `migrar.php` cuando termine.

### 5.5 Subir el backend

1. Suba la carpeta `backend/` a `public_html/backend/`.
2. Verifique que exista el archivo `backend/.htaccess`.
3. Cree la carpeta `backend/uploads/comprobantes/` si no existe y asígnele
   permisos `755`.
4. Confirme que `backend/uploads/comprobantes/.htaccess` impide ejecutar
   archivos subidos.
5. Compruebe el API abriendo:

   ```text
   https://su-dominio.com/api
   ```

   Debe devolver el catálogo JSON de rutas.

### 5.6 Compilar y subir el frontend

Desde la carpeta `frontend/`:

```bash
npm install
npm run build
```

Opcionalmente defina la URL del API antes de compilar:

```bash
# frontend/.env.production
VITE_API_BASE_URL=https://su-dominio.com/api
```

Si el frontend y el API comparten dominio, el cliente usa automáticamente
`${origin}/api`.

Luego suba **el contenido** de `frontend/dist/` a `public_html/`:

```text
public_html/
├── index.html
├── assets/
├── backend/
└── .htaccess
```

El `.htaccess` raíz debe permitir el fallback de la SPA hacia `index.html`,
mientras que `backend/.htaccess` mantiene las reglas del API.

### 5.7 Verificación posterior al despliegue

1. Abra `https://su-dominio.com/api` y confirme JSON `ok: true`.
2. Inicie sesión con el administrador creado.
3. Verifique que la campana cargue sin errores.
4. Emita una deuda de prueba desde Caja Chica o Tesorería.
5. Confirme que el socio recibe la notificación y el badge se actualiza.
6. Reporte un pago con comprobante y valide que aparece en "Pagos reportados".
7. Apruebe el pago y compruebe el ingreso automático en Caja Chica.

---

## 6. Desarrollo local

### 6.1 Backend

Sirva la carpeta raíz con PHP:

```bash
php -S localhost:8000
```

El API queda disponible en `http://localhost:8000/backend/api/`.

Ajuste `frontend/.env.local` si usa otra URL:

```text
VITE_API_BASE_URL=http://localhost:8000/backend/api
```

### 6.2 Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite abre `http://localhost:3000`.

### 6.3 Compilación de verificación

```bash
cd frontend
npm run build
```

La compilación debe finalizar sin errores. El aviso de tamaño de bundle es
informativo.

---

## 7. Seguridad y consideraciones operativas

- Las contraseñas se almacenan con `password_hash()` y se verifican con
  `password_verify()`.
- Los tokens de sesión son aleatorios de 64 caracteres hex, con expiración y
  revocación.
- Toda operación sensible se valida en el backend; el frontend sólo oculta
  controles según los permisos.
- Los comprobantes se guardan fuera de la carpeta pública del API y se sirven
  mediante reglas controladas.
- Los movimientos automáticos de Caja Chica usan claves únicas
  (`multa_id`, `deuda_id`) para evitar duplicados ante reintentos.
- Las transacciones de emisión/aprobación de deudas incluyen la notificación,
  de modo que no queda un aviso sin su cambio de estado ni viceversa.
- El polling se detiene con la pestaña oculta y se reanuda al recuperar el
  foco, reduciendo el consumo en el hosting compartido.

---

## 8. Créditos

Cooperativa Minera Aurífera "Nevado Chachacomani" R.L.

Sistema de Reglamento Interno, evaluación por artículo y módulo financiero.
