-- ============================================================
-- COOPERATIVA MINERA AURÍFERA NEVADO CHACHACOMANI R.L.
-- Esquema completo: autenticación, roles, votación, multas, caja
-- chica y configuración global del DRM.
-- ------------------------------------------------------------
-- Instrucciones GoDaddy (cPanel):
--   1. Elija la base de datos en phpMyAdmin (Menú > MySQL® Databases)
--   2. Abra la pestaña "Importar" y seleccione este archivo
--   3. Ejecute la importación. El conjunto de caracteres es utf8mb4.
--   4. Cree el primer administrador con:
--        INSERT INTO `usuarios` (`nombre`, `correo`, `contrasena_hash`, `rol`)
--        VALUES ('Administrador', 'admin@chachacomani.com',
--                '<hash password_hash()>', 'admin');
--      (generate el hash desde backend/migrar.php con ?crear_admin=1)
--
-- Si la base YA existe (instalación previa con solo `votos_articulos`),
-- EJECUTE `php backend/migrar.php`, que aplica los cambios de forma
-- idempotente sin borrar los votos ya registrados.
--
-- Requisitos: MySQL 5.6+ / MariaDB 10.1+ (suficiente para todo cPanel)
-- ============================================================

-- ------------------------------------------------------------
-- 1. USUARIOS Y CONTROL DE ACCESO (RBAC)
-- ------------------------------------------------------------
-- Roles: lectura | tesorero | caja_chica | admin
-- El mapa rol -> permisos vive en backend/api/roles.php
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `correo` VARCHAR(190) NOT NULL,
  `contrasena_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('lectura', 'tesorero', 'caja_chica', 'admin') NOT NULL DEFAULT 'lectura',
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuarios_correo` (`correo`),
  KEY `idx_usuarios_rol` (`rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Socios y personal con acceso a la plataforma';

-- Sesiones (tokens opacos de 64 hex, enviados como Authorization: Bearer)
CREATE TABLE IF NOT EXISTS `sesiones` (
  `token` CHAR(64) NOT NULL,
  `usuario_id` INT NOT NULL,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expira_en` TIMESTAMP NOT NULL,
  `revocado` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`token`),
  KEY `idx_sesiones_usuario` (`usuario_id`),
  CONSTRAINT `fk_sesiones_usuario` FOREIGN KEY (`usuario_id`)
    REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sesiones activas por token';

-- ------------------------------------------------------------
-- 2. VOTACIÓN DE ARTÍCULOS (Reglamento Interno y Estatuto Orgánico)
-- ------------------------------------------------------------
-- `documento` separa los dos corpora normativos: los artículos se
-- numeran 1..N en ambos, por lo que sin esta columna un voto del
-- Art. 12 del Reglamento colisionaría con el Art. 12 del Estatuto.
--
-- `voter_token` es la IDENTIDAD del votante:
--    · 'u:<usuario_id>'  -> socio registrado (voto único por usuario)
--    · <uuid navegador>  -> visitante anónimo (voto único por navegador)
CREATE TABLE IF NOT EXISTS `votos_articulos` (
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
  -- Un votante NO puede evaluar dos veces el mismo artículo del mismo documento
  UNIQUE KEY `uq_documento_articulo_votante` (`documento`, `articulo_id`, `voter_token`),
  -- Índices de apoyo para los agregados del Dashboard
  KEY `idx_votos_capitulo` (`documento`, `capitulo_id`),
  KEY `idx_votos_usuario` (`usuario_id`),
  KEY `idx_votos_tipo` (`tipo_voto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Evaluación Me parece bien / No me parece bien por artículo y documento';

-- ------------------------------------------------------------
-- 3. MULTAS (Anexo I: Cuadro N.º 1 y Cuadro N.º 2)
-- ------------------------------------------------------------
-- El monto y la categoría se copian aquí como "fotografía" del momento
-- en que se imputa la sanción, para que una actualización posterior de
-- la escala oficial no altere el historial ya notificado.
CREATE TABLE IF NOT EXISTS `multas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `socio_id` INT NOT NULL,
  `infraccion` VARCHAR(255) NOT NULL,
  `articulo_referencia` VARCHAR(60) NOT NULL,
  `categoria` ENUM('Leve', 'Grave', 'Muy grave', 'Falta gravísima') NOT NULL DEFAULT 'Leve',
  `monto` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `fecha_infraccion` DATE NOT NULL,
  `estado` ENUM('pendiente', 'pagada', 'anulada') NOT NULL DEFAULT 'pendiente',
  `medida_complementaria` VARCHAR(255) NULL,
  `observaciones` TEXT NULL,
  `registrado_por` INT NOT NULL,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_multas_socio` (`socio_id`, `fecha_infraccion`),
  KEY `idx_multas_estado` (`estado`),
  KEY `idx_multas_registrador` (`registrado_por`),
  CONSTRAINT `fk_multas_socio` FOREIGN KEY (`socio_id`)
    REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_multas_registrador` FOREIGN KEY (`registrado_por`)
    REFERENCES `usuarios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sanciones pecuniarias imputadas a los socios (Anexo I)';

-- ------------------------------------------------------------
-- 4. CAJA CHICA (ingresos y egresos menores)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `caja_chica_movimientos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo` ENUM('ingreso', 'egreso') NOT NULL,
  `concepto` VARCHAR(255) NOT NULL,
  `categoria` VARCHAR(80) NOT NULL DEFAULT 'Otros',
  `monto` DECIMAL(10, 2) NOT NULL,
  `fecha` DATE NOT NULL,
  `observaciones` TEXT NULL,
  `registrado_por` INT NOT NULL,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_caja_tipo_fecha` (`tipo`, `fecha`),
  KEY `idx_caja_registrador` (`registrado_por`),
  CONSTRAINT `fk_caja_registrador` FOREIGN KEY (`registrado_por`)
    REFERENCES `usuarios` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Movimientos de ingresos y egresos menores de caja chica';

-- ------------------------------------------------------------
-- 5. CONFIGURACIÓN GLOBAL (estado del DRM)
-- ------------------------------------------------------------
-- El estado leído por TODAS las páginas; solo el rol `admin` puede
-- escribirlo (backend/api/drm.php).
CREATE TABLE IF NOT EXISTS `configuraciones` (
  `clave` VARCHAR(60) NOT NULL,
  `valor` VARCHAR(255) NOT NULL,
  `actualizado_por` INT NULL,
  `actualizado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Flags de configuración leídos por toda la plataforma';

-- DRM protegido por defecto (ARRANCA ACTIVO en todo el sitio).
INSERT INTO `configuraciones` (`clave`, `valor`)
VALUES ('drm_activo', '1')
ON DUPLICATE KEY UPDATE `clave` = `clave`;
