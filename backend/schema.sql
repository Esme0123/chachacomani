-- ============================================================
-- SISTEMA DE EVALUACIÓN DE ARTÍCULOS DEL REGLAMENTO INTERNO
-- Cooperativa Minera Aurífera Nevado Chachacomani R.L.
-- ------------------------------------------------------------
-- Instrucciones GoDaddy (cPanel):
--   1. Elija la base de datos en phpMyAdmin (Menú > MySQL® Databases)
--   2. Abra la pestaña "Importar" y seleccione este archivo
--   3. Ejecute la importación. El conjunto de caracteres es utf8mb4.
--
-- Requisitos: MySQL 5.6+ / MariaDB 10.1+ (suficiente para todo cPanel)
-- ============================================================

-- Tabla de votos por artículo --------------------------------
CREATE TABLE IF NOT EXISTS `votos_articulos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `articulo_id` INT NOT NULL,
  `capitulo_id` INT NOT NULL,
  `tipo_voto` ENUM('positivo', 'negativo') NOT NULL,
  `voter_token` VARCHAR(64) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  -- Un mismo voter_token NO puede votar dos veces el mismo artículo
  UNIQUE KEY `uq_articulo_token` (`articulo_id`, `voter_token`),
  -- Índices de apoyo para los agregados del Dashboard
  KEY `idx_capitulo` (`capitulo_id`),
  KEY `idx_token` (`voter_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Evaluación Me parece bien / No me parece bien por artículo';

-- Índice para acelerar el conteo por tipo de voto (opcional)
ALTER TABLE `votos_articulos` ADD KEY `idx_tipo` (`tipo_voto`);