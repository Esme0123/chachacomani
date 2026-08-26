-- ==============================================================================
-- BASE DE DATOS: REGLAMENTO INTERNO COOPERATIVA MINERA AURÍFERA NEVADO CHACHACOMANI R.L.
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `cooperativa_chachacomani` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `cooperativa_chachacomani`;

-- -----------------------------------------------------------------------------
-- 1. ESTRUCTURA DDL
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS `anexo_tablas`;
DROP TABLE IF EXISTS `anexos`;
DROP TABLE IF EXISTS `articulos`;
DROP TABLE IF EXISTS `capitulos`;

CREATE TABLE `capitulos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `numero_romano` VARCHAR(10) NOT NULL,
    `numero` INT NOT NULL,
    `titulo` VARCHAR(255) NOT NULL,
    `descripcion` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `articulos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `capitulo_id` INT NOT NULL,
    `numero` INT NOT NULL,
    `denominacion` VARCHAR(255) NOT NULL,
    `contenido` LONGTEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_articulos_capitulos` 
        FOREIGN KEY (`capitulo_id`) 
        REFERENCES `capitulos` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FULLTEXT INDEX `ft_articulos_search` (`denominacion`, `contenido`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `anexos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `numero_romano` VARCHAR(10) NOT NULL,
    `titulo` VARCHAR(255) NOT NULL,
    `nota` TEXT NULL,
    `disposiciones` LONGTEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FULLTEXT INDEX `ft_anexos_search` (`titulo`, `nota`, `disposiciones`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `anexo_tablas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `anexo_id` INT NOT NULL,
    `nombre_tabla` VARCHAR(150) NOT NULL,
    `datos_json` JSON NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_tablas_anexos` 
        FOREIGN KEY (`anexo_id`) 
        REFERENCES `anexos` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. POBLACIÓN DE DATOS (DML) - CAPÍTULOS I AL XXI & ANEXOS I Y II
-- -----------------------------------------------------------------------------

INSERT INTO `capitulos` (`id`, `numero_romano`, `numero`, `titulo`, `descripcion`) VALUES
(1, 'I', 1, 'DENOMINACIÓN, NATURALEZA JURÍDICA, PRINCIPIOS, DOMICILIO, OBJETO Y FINES DE LA COOPERATIVA', 'Marco legal, naturaleza jurídica y principios del cooperativismo aurífero.'),
(2, 'II', 2, 'DE LAS ASOCIADAS Y ASOCIADOS, REPRESENTANTES, LAS CONDICIONES, DERECHOS Y OBLIGACIONES', 'Derechos, deberes, jornada laboral y descansos de los asociados.'),
(3, 'III', 3, 'DECLARATORIA EN COMISIÓN Y LICENCIAS JUSTIFICADAS POR FUERZA MAYOR', 'Régimen de licencias por salud, asuntos familiares y comisiones.'),
(4, 'IV', 4, 'SEGURIDAD INDUSTRIAL Y SALUD OCUPACIONAL', 'Normas de EPP, prevención de riesgos y protocolos en operaciones mineras.'),
(5, 'V', 5, 'DE LAS FALLAS, DEL ROBO O HURTO DE MINERAL AURÍFERO Y DESFALCO A LA COOPERATIVA', 'Sanciones ante inasistencias, sustracción de oro y faltas económicas.'),
(6, 'VI', 6, 'DE LA PÉRDIDA DE CALIDAD DE LA ASOCIADA O ASOCIADO', 'Causales de retiro voluntario, exclusión, expulsión y sucesión por fallecimiento.'),
(7, 'VII', 7, 'DE LAS ASAMBLEAS, REUNIONES Y SUS RESOLUCIONES', 'Funcionamiento democrático de Asambleas Ordinarias, Extraordinarias y Actas.'),
(8, 'VIII', 8, 'DEL MANEJO ADMINISTRATIVO', 'Estructura orgánica, Consejo de Administración, Vigilancia y jefaturas.'),
(9, 'IX', 9, 'DE LA PRODUCCIÓN, BENEFICIOS Y DISTRIBUCIÓN DE EXCEDENTES', 'Alzas del lavadero, arqueos de oro, bonos y liquidación de excedentes.'),
(10, 'X', 10, 'MEDIDAS DISCIPLINARIAS Y RESPONSABILIDADES', 'Clasificación de faltas leves, graves y muy graves.'),
(11, 'XI', 11, 'DEL TRIBUNAL DE HONOR Y PROCEDIMIENTO', 'Sumario informativo, términos probatorios y garantías del debido proceso.'),
(12, 'XII', 12, 'DE LA JUNTA DE CONCILIACIÓN Y DEL REGLAMENTO DE CONCILIACIÓN Y ARBITRAJE COOPERATIVO', 'Resolución pacífica de controversias internas y arbitraje cooperativo.'),
(13, 'XIII', 13, 'DE LOS BIENES DE LA COOPERATIVA', 'Custodia de maquinaria, herramientas, inventarios y combustible.'),
(14, 'XIV', 14, 'DE LA ENTREGA Y RECEPCIÓN DE CARGO Y DOCUMENTACIÓN DE LA COOPERATIVA', 'Procedimientos formales de transición de autoridades y actas de descargo.'),
(15, 'XV', 15, 'LA CONTABILIDAD DE LA COOPERATIVA', 'Registros contables, libros oficiales, digitalización y auditorías.'),
(16, 'XVI', 16, 'DEL COMITÉ ELECTORAL', 'Conformación y modalidades de sufragio democrático.'),
(17, 'XVII', 17, 'DE LOS CONSEJOS DE ADMINISTRACIÓN Y VIGILANCIA: DURACIÓN Y OBLIGACIONES', 'Periodo de mandato (2 años), reelección y responsabilidades.'),
(18, 'XVIII', 18, 'DEL COMITÉ LABORAL', 'Instancia técnica de asesoramiento y planificación minera.'),
(19, 'XIX', 19, 'DE LAS ACTIVIDADES CULTURALES Y DEPORTIVAS', 'Fomento a la convivencia deportiva, cultural y presupuestos asignados.'),
(20, 'XX', 20, 'RÉGIMEN DISCIPLINARIO DEL PERSONAL DE APOYO', 'Marco laboral para dependientes contratados bajo Ley General del Trabajo.'),
(21, 'XXI', 21, 'DISPOSICIONES FINALES', 'Disposiciones transitorias sobre multas en Bs/oro, fondo de accidentes y vigencia.');

-- Insertar Artículos 1 al 105
INSERT INTO `articulos` (`capitulo_id`, `numero`, `denominacion`, `contenido`) VALUES
(1, 1, 'DENOMINACIÓN', 'La Cooperativa Minera “AURÍFERA NEVADO CHACHACOMANI” R.L. es una cooperativa de primer grado, perteneciente al sector de producción y de clase minera, constituida y organizada conforme a la Ley General de Cooperativas N° 356, el Decreto Supremo Reglamentario N° 1995, el Estatuto Orgánico y las demás disposiciones legales aplicables. Está integrada por personas dedicadas a la actividad minera que cumplen los requisitos de admisión establecidos en la Ley General de Cooperativas, el Estatuto Orgánico y el presente Reglamento Interno.'),
(1, 2, 'MARCO NORMATIVO', 'La Cooperativa se rige por la Constitución Política del Estado Plurinacional de Bolivia, la Ley General de Cooperativas Nº 356, el Decreto Supremo Reglamentario Nº 1995, las disposiciones y resoluciones emitidas por la Autoridad de Fiscalización y Control de Cooperativas (AFCOOP) dentro del ámbito de sus competencias, el Estatuto Orgánico, el presente Reglamento Interno, las resoluciones válidamente emitidas por la Asamblea General, dentro de sus competencias y demás disposiciones legales aplicables.\n\nAsimismo, en el marco de la integración cooperativa, la cooperativa podrá afiliarse y coordinar acciones con las organizaciones de representación del sistema cooperativo, tales como la Confederación Nacional de Cooperativas de Bolivia (CONCOBOL), la Federación Departamental de Cooperativas Mineras de La Paz (FECOMAN L.P.), la Federación Nacional de Cooperativas Mineras de Bolivia (FENCOMIN R.L.) y otras organizaciones legalmente reconocidas, conforme a la normativa vigente.'),
(1, 3, 'PRINCIPIOS', 'La Cooperativa Minera “AURÍFERA NEVADO CHACHACOMANI\" R.L. desarrolla sus actividades conforme a los principios establecidos en los artículos 6 y 7 de la Ley General de Cooperativas Nº 356 y, de manera complementaria, observa los principios del cooperativismo minero contenidos en el Estatuto Orgánico de la Federación de Cooperativas Mineras Auríferas del Norte de La Paz (FECOMAN L.P.), en todo aquello que no contravenga la normativa vigente, el Estatuto Orgánico y el presente Reglamento Interno.\n\nI. Principios de la Ley General de Cooperativas: Solidaridad, Igualdad, Reciprocidad, Equidad, Finalidad Social, No lucro de las asociadas y asociados.\nII. Principios del Cooperativismo Minero: Libre adhesión, Unidad y autonomía de gestión democrática, Educación y capacitación, Participación con derecho propio, Producción en equipo y equidad, Responsabilidad ambiental y seguridad ocupacional.'),
(1, 4, 'DE LA OBLIGATORIEDAD DE CUMPLIMIENTO DEL REGLAMENTO INTERNO', 'Las disposiciones contenidas en el presente Reglamento Interno son de cumplimiento obligatorio para todas las asociadas y asociados de la Cooperativa y, en lo que corresponda según sus funciones y responsabilidades, para las consejeras y consejeros, integrantes de comités, comisiones, personal de apoyo, representantes y demás personas que, por razón de sus funciones o relación con la Cooperativa, se encuentren sujetas a sus disposiciones.\n\nEl cumplimiento del presente Reglamento constituye una obligación institucional y deberá observarse en el ejercicio de los derechos, obligaciones, funciones y responsabilidades establecidos en la Ley General de Cooperativas N.º 356, su Decreto Supremo Reglamentario N.º 1995, el Estatuto Orgánico y demás disposiciones aplicables.'),
(1, 5, 'DE LA CONFIDENCIALIDAD DE LAS DISPOSICIONES INTERNAS', 'I. Las asociadas y asociados, consejeras y consejeros, integrantes de comités y comisiones, personal de apoyo y demás personas que, por razón de sus funciones o relación con la Cooperativa, tengan acceso a información de carácter confidencial, deberán guardar reserva y utilizar dicha información exclusivamente para los fines institucionales correspondientes.\nII. Se considerará información confidencial aquella que, por su naturaleza, contenido o disposición legal, deba mantenerse reservada.\nIII. La obligación de confidencialidad no alcanzará a la información que deba ser conocida por las asociadas y asociados, la Asamblea General, el Consejo de Vigilancia o la AFCOOP.'),
(1, 6, 'DE LAS PROHIBICIONES E IMPEDIMENTOS', 'I. Prohibiciones para las asociadas y asociados:\na) Pertenecer simultáneamente a otra cooperativa de producción.\nb) Pertenecer simultáneamente a un sindicato laboral de la Cooperativa.\nc) Integrar simultáneamente el Consejo de Administración o Consejo de Vigilancia de más de una cooperativa.\nd) Participar deliberadamente en actos u organizaciones que tengan por finalidad ocasionar daño económico, patrimonial o institucional a la Cooperativa.\ne) Obtener o conceder privilegios o tratamientos preferenciales no autorizados.\n\nII. Impedimentos para la admisión: menores de 18 años, no cumplir requisitos estatutarios, personas expulsadas de otra cooperativa de producción o con antecedentes perjudiciales comprobados.');

-- Insertar Anexos I y II
INSERT INTO `anexos` (`id`, `numero_romano`, `titulo`, `nota`, `disposiciones`) VALUES
(1, 'I', 'ESCALA DE MULTAS Y MEDIDAS DISCIPLINARIAS', 
'Nota: Los montos consignados en este Anexo son una propuesta técnica sujeta a validación por el Consejo de Administración y aprobación final de la Asamblea General, conforme al Art. 100 del Reglamento Interno. Mientras la Cooperativa no alcance producción regular, todas las sanciones pecuniarias se fijan y pagan en bolivianos (Bs.); una vez iniciada la producción regular, la Asamblea General podrá resolver su conversión a un equivalente en gramos de oro físico.',
'• El plazo para el pago de toda multa es de quince (15) días calendario desde la notificación (Art. 73).\n• La falta de pago dentro del plazo dará lugar a intereses y medidas de cobro.\n• Las faltas muy graves serán conocidas obligatoriamente por el Tribunal de Honor mediante sumario informativo (Art. 76).'),

(2, 'II', 'ESCALA DE APORTES AL FONDO DE ACCIDENTES', 
'Nota: Montos propuestos conforme al Art. 13 del Reglamento Interno, sujetos a validación del Consejo de Administración y aprobación de la Asamblea General.',
'• El Fondo de Accidentes es administrado por Tesorería y fiscalizado por el Consejo de Vigilancia (Art. 13).\n• Los recursos se destinan exclusivamente a contingencias derivadas de accidentes laborales.\n• El incumplimiento habilita el descuento directo en la distribución de excedentes.');

INSERT INTO `anexo_tablas` (`anexo_id`, `nombre_tabla`, `datos_json`) VALUES
(1, 'Cuadro N.º 1. Clasificación de Faltas y Escala General de Sanciones', '[
    {"categoria": "Falta Leve", "descripcion": "Conductas del Art. 72.II, incisos a) al h).", "referencia": "Art. 72.II", "multa": "1ª vez: Amonestación escrita; 2ª vez: Bs. 100; 3ª vez: Bs. 150"},
    {"categoria": "Falta Grave", "descripcion": "Conductas del Art. 72.III, incisos a) al n).", "referencia": "Art. 72.III", "multa": "Bs. 300"},
    {"categoria": "Falta Muy Grave", "descripcion": "Conductas del Art. 72.IV, incisos a) al f). Remisión obligatoria al Tribunal de Honor.", "referencia": "Art. 72.IV", "multa": "Multa máxima de Bs. 500 como sanción complementaria, sin perjuicio de exclusión/expulsión"},
    {"categoria": "Reincidencia General", "descripcion": "Comisión de nueva falta de igual o mayor categoría dentro de los 12 meses.", "referencia": "Art. 72 / 75", "multa": "Se aplica el monto máximo de la categoría correspondiente"}
]'),
(1, 'Cuadro N.º 2. Infracciones Específicas, Multas y Medidas Complementarias', '[
    {"infraccion": "Inasistencia injustificada al trabajo (por día)", "articulo": "Art. 28.I.a)", "multa": "150 Bs.", "categoria": "Leve", "medida": "Pago previo a la reincorporación"},
    {"infraccion": "Tres atrasos en un mes", "articulo": "Art. 10.c)", "multa": "150 Bs.", "categoria": "Leve", "medida": "Se computa como una inasistencia"},
    {"infraccion": "Inasistencia injustificada a Asamblea General Ordinaria", "articulo": "Art. 41", "multa": "300 Bs.", "categoria": "Grave", "medida": "—"},
    {"infraccion": "Inasistencia injustificada a Asamblea General Extraordinaria", "articulo": "Art. 41", "multa": "300 Bs.", "categoria": "Grave", "medida": "—"},
    {"infraccion": "Inasistencia injustificada a reunión de Consejo", "articulo": "Art. 18.a)", "multa": "150 Bs.", "categoria": "Consejeros", "medida": "Amonestación escrita"},
    {"infraccion": "Inasistencia injustificada de consejeros a Asamblea", "articulo": "Art. 18.b)", "multa": "300 Bs.", "categoria": "Consejeros", "medida": "Amonestación escrita"},
    {"infraccion": "Negativa injustificada a aceptar un cargo o comisión", "articulo": "Art. 8.h)", "multa": "300 Bs.", "categoria": "Grave", "medida": "—"},
    {"infraccion": "Incumplimiento de comisión oficialmente encomendada", "articulo": "Art. 8.g)", "multa": "300 Bs.", "categoria": "Grave", "medida": "Informe al Consejo"},
    {"infraccion": "Incumplimiento de normas de seguridad industrial", "articulo": "Arts. 20 a 22", "multa": "200 Bs.", "categoria": "Grave", "medida": "Suspensión inmediata de la actividad si existe riesgo"},
    {"infraccion": "Ingreso al trabajo sin EPP obligatorio", "articulo": "Art. 21", "multa": "150 Bs.", "categoria": "Leve", "medida": "Prohibición de ingreso hasta regularizar"},
    {"infraccion": "Presentarse en estado de ebriedad o bajo sustancias", "articulo": "Art. 10.d) y 22.a)", "multa": "500 Bs.", "categoria": "Muy grave", "medida": "Retiro inmediato e informe al Tribunal de Honor en reincidencia"},
    {"infraccion": "Manipular explosivos o maquinaria sin autorización", "articulo": "Art. 22.b)", "multa": "500 Bs.", "categoria": "Muy grave", "medida": "Suspensión preventiva"},
    {"infraccion": "Dañar intencionalmente maquinaria, herramientas o bienes", "articulo": "Art. 8.j)", "multa": "500 Bs.", "categoria": "Muy grave", "medida": "Reparación del daño y proceso disciplinario"},
    {"infraccion": "Escándalos, peleas o insultos graves (1.ª vez)", "articulo": "Art. 10.e)", "multa": "300 Bs.", "categoria": "Grave", "medida": "Amonestación escrita"},
    {"infraccion": "Escándalos, peleas o insultos graves (2.ª vez)", "articulo": "Art. 10.e)", "multa": "500 Bs.", "categoria": "Muy grave", "medida": "Suspensión preventiva"},
    {"infraccion": "Escándalos, peleas o insultos graves (3.ª vez)", "articulo": "Art. 10.e)", "multa": "1000 Bs.", "categoria": "Muy grave", "medida": "Remisión obligatoria al Tribunal de Honor"},
    {"infraccion": "Agresión verbal a consejeras/os o asociados (1.ª vez)", "articulo": "Art. 10.e)", "multa": "250 Bs.", "categoria": "Grave", "medida": "Amonestación escrita"},
    {"infraccion": "Agresión verbal reincidente", "articulo": "Art. 10.e)", "multa": "500 Bs.", "categoria": "Muy grave", "medida": "Tribunal de Honor"},
    {"infraccion": "Agresión física", "articulo": "Arts. 10.e) y 28.II", "multa": "1000 Bs.", "categoria": "Muy grave", "medida": "Suspensión preventiva y Tribunal de Honor"},
    {"infraccion": "Divulgación de información confidencial", "articulo": "Art. 5", "multa": "500 Bs.", "categoria": "Muy grave", "medida": "Tribunal de Honor"},
    {"infraccion": "Utilización indebida de activos digitales institucionales", "articulo": "Art. 47.V", "multa": "500 Bs.", "categoria": "Muy grave", "medida": "Tribunal de Honor"},
    {"infraccion": "Negativa injustificada a entregar documentación o bienes", "articulo": "Arts. 46 y 47", "multa": "500 Bs.", "categoria": "Muy grave", "medida": "Tribunal de Honor"},
    {"infraccion": "Robo, hurto o apropiación de mineral aurífero", "articulo": "Art. 28.II", "multa": "—", "categoria": "Falta gravísima", "medida": "Tribunal de Honor y acciones legales penales/civiles"},
    {"infraccion": "Malversación o desfalco", "articulo": "Art. 28.II", "multa": "—", "categoria": "Falta gravísima", "medida": "Tribunal de Honor y acciones legales"},
    {"infraccion": "Falsificación o utilización de documentos falsos", "articulo": "Art. 31.IV.c)", "multa": "1000 Bs.", "categoria": "Muy grave", "medida": "Tribunal de Honor"},
    {"infraccion": "Daños intencionales a la imagen institucional", "articulo": "Arts. 5 y 31", "multa": "500 Bs.", "categoria": "Muy grave", "medida": "Tribunal de Honor"}
]'),
(2, 'Escala de Aportes al Fondo de Accidentes', '[
    {"concepto": "Aporte Ordinario al Fondo de Accidentes", "periodicidad": "Semestral, por cada asociada o asociado activo", "monto": "Bs. 50.- Anual"},
    {"concepto": "Aporte Ordinario", "periodicidad": "Según Resolución de Asamblea", "monto": "Bs. 10.- Mensual"},
    {"concepto": "Aporte Extraordinario", "periodicidad": "Cuando el saldo del Fondo resulte insuficiente para cubrir contingencia", "monto": "Hasta Bs. 100.- por asociado"},
    {"concepto": "Fondo de Mantenimiento", "periodicidad": "Mediante Resolución de Asamblea (variable)", "monto": "Bs. 100.- Anual"},
    {"concepto": "Forma de recaudación", "periodicidad": "Descuento directo en la distribución de excedentes o pago en Tesorería dentro de primeros 5 días", "monto": "—"},
    {"concepto": "Actualización económica", "periodicidad": "Revisión anual por Asamblea General considerando inflación y disponibilidad", "monto": "—"}
]');
