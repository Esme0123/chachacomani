/**
 * Dataset Oficial: Reglamento Interno de la Cooperativa Minera Aurífera Nevado Chachacomani R.L.
 * Alcance: Capítulos I al XXI (Artículos 1 al 105) + ANEXO I y ANEXO II.
 * Excluye expresamente Anexo III, Formularios Oficiales y Actas de Entrega.
 */

export const REGLAMENTO_METADATA = {
  nombre: "Cooperativa Minera 'Aurífera Nevado Chachacomani' R.L.",
  tipo: "Reglamento Interno Oficial",
  subtitulo: "Documento normativo que regula la organización, el funcionamiento y la convivencia cooperativa, conforme al Estatuto Orgánico y la normativa vigente.",
  fechaAprobacion: "4 de octubre de 2026",
  instancia: "Asamblea General Extraordinaria",
  marcoLegal: "Ley General de Cooperativas N° 356 y D.S. Reglamentario N° 1995",
  totalCapitulos: 21,
  totalArticulos: 105
};

export const CAPITULOS_DATA = [
  {
    id: 1,
    numero_romano: "I",
    numero: 1,
    titulo: "DENOMINACIÓN, NATURALEZA JURÍDICA, PRINCIPIOS, DOMICILIO, OBJETO Y FINES DE LA COOPERATIVA",
    descripcion: "Fundamentos constitutivos, marco regulatorio boliviano y principios rectores del cooperativismo aurífero.",
    articulos: [
      {
        id: 1,
        numero: 1,
        denominacion: "DENOMINACIÓN",
        contenido: "La Cooperativa Minera “AURÍFERA NEVADO CHACHACOMANI” R.L. es una cooperativa de primer grado, perteneciente al sector de producción y de clase minera, constituida y organizada conforme a la Ley General de Cooperativas N° 356, el Decreto Supremo Reglamentario N° 1995, el Estatuto Orgánico y las demás disposiciones legales aplicables. Está integrada por personas dedicadas a la actividad minera que cumplen los requisitos de admisión establecidos en la Ley General de Cooperativas, el Estatuto Orgánico y el presente Reglamento Interno."
      },
      {
        id: 2,
        numero: 2,
        denominacion: "MARCO NORMATIVO",
        contenido: "La Cooperativa se rige por la Constitución Política del Estado Plurinacional de Bolivia, la Ley General de Cooperativas Nº 356, el Decreto Supremo Reglamentario Nº 1995, las disposiciones y resoluciones emitidas por la Autoridad de Fiscalización y Control de Cooperativas (AFCOOP) dentro del ámbito de sus competencias, el Estatuto Orgánico, el presente Reglamento Interno, las resoluciones válidamente emitidas por la Asamblea General, dentro de sus competencias y demás disposiciones legales aplicables.\n\nAsimismo, en el marco de la integración cooperativa, la cooperativa podrá afiliarse y coordinar acciones con las organizaciones de representación del sistema cooperativo, tales como la Confederación Nacional de Cooperativas de Bolivia (CONCOBOL), la Federación Departamental de Cooperativas Mineras de La Paz (FECOMAN L.P.), la Federación Nacional de Cooperativas Mineras de Bolivia (FENCOMIN R.L.) y otras organizaciones legalmente reconocidas, conforme a la normativa vigente."
      },
      {
        id: 3,
        numero: 3,
        denominacion: "PRINCIPIOS",
        contenido: "La Cooperativa Minera “AURÍFERA NEVADO CHACHACOMANI\" R.L. desarrolla sus actividades conforme a los principios establecidos en los artículos 6 y 7 de la Ley General de Cooperativas Nº 356 y, de manera complementaria, observa los principios del cooperativismo minero contenidos en el Estatuto Orgánico de la Federación de Cooperativas Mineras Auríferas del Norte de La Paz (FECOMAN L.P.), en todo aquello que no contravenga la normativa vigente, el Estatuto Orgánico y el presente Reglamento Interno.\n\nI. Principios de la Ley General de Cooperativas:\na) Solidaridad: Interés por la colectividad y promoción de prácticas de ayuda mutua y cooperación.\nb) Igualdad: Las asociadas y asociados tienen igualdad de derechos, obligaciones y oportunidades, sin preferencias ni privilegios indebidos.\nc) Reciprocidad: Prestación mutua de bienes, servicios y trabajo para beneficio común.\nd) Equidad: Las asociadas y asociados deben recibir en forma equitativa los excedentes de percepción en función a su participación en el trabajo.\ne) Finalidad Social: Primacía del interés colectivo por encima del interés individual.\nf) No lucro de las asociadas y asociados: La cooperativa no tiene fines de lucro y los excedentes de percepción se distribuyen conforme a la Ley, evitando toda finalidad especulativa.\n\nII. Principios del Cooperativismo Minero:\na) Libre adhesión para gozar de la calidad de asociada o asociado.\nb) Unidad, autonomía de gestión y funcionamiento democrático.\nc) Educación, capacitación y formación cooperativa, técnica y minera.\nd) Participación con derecho propio en el movimiento cooperativista.\ne) Solidaridad e integración cooperativista.\nf) Producción en equipo y distribución de excedentes de percepción con equidad.\ng) Educación y cultura cooperativista con sentido liberador.\nh) Desarrollo minero con responsabilidad ambiental, seguridad ocupacional y respeto comunitario."
      },
      {
        id: 4,
        numero: 4,
        denominacion: "DE LA OBLIGATORIEDAD DE CUMPLIMIENTO DEL REGLAMENTO INTERNO",
        contenido: "Las disposiciones contenidas en el presente Reglamento Interno son de cumplimiento obligatorio para todas las asociadas y asociados de la Cooperativa y, en lo que corresponda según sus funciones y responsabilidades, para las consejeras y consejeros, integrantes de comités, comisiones, personal de apoyo, representantes y demás personas que, por razón de sus funciones o relación con la Cooperativa, se encuentren sujetas a sus disposiciones.\n\nEl cumplimiento del presente Reglamento constituye una obligación institucional y deberá observarse en el ejercicio de los derechos, obligaciones, funciones y responsabilidades establecidos en la Ley General de Cooperativas N.º 356, su Decreto Supremo Reglamentario N.º 1995, el Estatuto Orgánico y demás disposiciones aplicables.\n\nNinguna disposición del presente Reglamento Interno podrá interpretarse o aplicarse en contravención de la Constitución Política del Estado, la Ley General de Cooperativas N.º 356, su Decreto Supremo Reglamentario N.º 1995, el Estatuto Orgánico o las disposiciones legales aplicables."
      },
      {
        id: 5,
        numero: 5,
        denominacion: "DE LA CONFIDENCIALIDAD DE LAS DISPOSICIONES INTERNAS",
        contenido: "I. Las asociadas y asociados, consejeras y consejeros, integrantes de comités y comisiones, personal de apoyo y demás personas que tengan acceso a información confidencial, deberán guardar reserva y utilizarla exclusivamente para fines institucionales.\n\nII. Se considerará información confidencial aquella que por su naturaleza o disposición legal deba mantenerse reservada para evitar perjuicios económicos, patrimoniales, comerciales o institucionales.\n\nIII. La confidencialidad no alcanzará a la información que deba ser conocida por los asociados, la Asamblea General, el Consejo de Vigilancia o la AFCOOP.\n\nIV. No impedirá proporcionar datos a autoridades judiciales, fiscales o administrativas competentes.\n\nV. La divulgación indebida constituirá infracción disciplinaria sancionada previo debido proceso."
      },
      {
        id: 6,
        numero: 6,
        denominacion: "DE LAS PROHIBICIONES E IMPEDIMENTOS",
        contenido: "I. Prohibiciones para las asociadas y asociados:\na) Pertenecer simultáneamente a otra cooperativa de producción.\nb) Pertenecer simultáneamente a un sindicato laboral de la Cooperativa.\nc) Integrar simultáneamente el Consejo de Administración o Consejo de Vigilancia de más de una cooperativa en territorio nacional.\nd) Participar deliberadamente en actos u organizaciones con el fin de ocasionar daño económico, patrimonial o institucional a la Cooperativa.\ne) Obtener o conceder privilegios o tratamientos preferenciales indebidos.\n\nII. Impedimentos para la admisión:\na) No cumplir el requisito de edad (18 años).\nb) No cumplir los requisitos de admisión estatutarios.\nc) Haber sido expulsadas de otra cooperativa de producción sin rehabilitación firme.\nd) Registrar antecedentes debidamente comprobados de grave perjuicio a cooperativas."
      }
    ]
  },
  {
    id: 2,
    numero_romano: "II",
    numero: 2,
    titulo: "DE LAS ASOCIADAS Y ASOCIADOS, REPRESENTANTES, LAS CONDICIONES, DERECHOS Y OBLIGACIONES",
    descripcion: "Régimen de derechos y deberes societarios, jornada en turnos, descanso anual y Fondo de Accidentes.",
    articulos: [
      {
        id: 7,
        numero: 7,
        denominacion: "SON DERECHOS DE LAS ASOCIADAS Y ASOCIADOS",
        contenido: "Además de los reconocidos por la Ley N° 356 y Estatuto Orgánico:\na) Recibir y mantener vigente su Certificado de Aportación.\nb) Participar con voz y voto en Asambleas Ordinarias y Extraordinarias.\nc) Elegir y ser elegidos para cargos de administración, fiscalización y comisiones.\nd) Ejercer debido proceso y derecho a la defensa e impugnación.\ne) Solicitar información administrativa y económico-financiera.\nf) Formular propuestas y peticiones.\ng) Recibir capacitación cooperativa, técnica y minera.\nh) Participar en la distribución de excedentes de percepción.\ni) Acceder a beneficios y servicios de la Cooperativa."
      },
      {
        id: 8,
        numero: 8,
        denominacion: "SON OBLIGACIONES DE LAS ASOCIADAS Y ASOCIADOS",
        contenido: "a) Cumplir el Estatuto Orgánico, Reglamento Interno y resoluciones de Asamblea.\nb) Asistir puntualmente y participar activamente en Asambleas y convocatorias.\nc) Cumplir planes de trabajo, programas y tareas asignadas.\nd) Realizar el trabajo personal obligatorio en puntas, comisiones y áreas asignadas.\ne) Comunicar por escrito cualquier cambio de representante autorizado.\nf) Cumplir comisiones externas asignadas ante entes matrices (FECOMAN L.P.).\ng) Mantener lealtad y no realizar actividades perjudiciales en comisión.\nh) Aceptar y desempeñar responsablemente los cargos electos.\ni) Conocer y no alegar desconocimiento de la normativa interna.\nj) Proteger, conservar y velar por el patrimonio, maquinaria y bienes.\nk) Estar al día con obligaciones económicas, laborales y disciplinarias.\nl) Observar conducta ética, responsable y respetuosa en el área de operaciones."
      },
      {
        id: 9,
        numero: 9,
        denominacion: "DESCANSO ANUAL DE LAS ASOCIADAS Y ASOCIADOS",
        contenido: "I. Beneficio institucional de bienestar social:\na) Consejeras/os que concluyan satisfactoriamente su mandato gozarán de 30 días calendario de descanso previa evaluación.\nb) Aplicable también a Coordinador y Jefe de Máquinas.\nII. El descanso será autorizado por la Asamblea General.\nIII. Asociados de base gozarán de hasta dos (2) semanas por gestión de descanso rotativo/escalonado, estando al día en sus obligaciones. No genera relación laboral dependiente."
      },
      {
        id: 10,
        numero: 10,
        denominacion: "DEL LUGAR DE TRABAJO Y LA JORNADA LABORAL",
        contenido: "a) Trabajo personal, mediante representante autorizado o como aportista.\nb) Jornada de 8 horas en tres turnos:\n  • 00:00 a 08:00 horas.\n  • 08:00 a 16:00 horas.\n  • 16:00 a 24:00 horas.\nTolerancia de ingreso: 10 minutos.\nc) Tres (3) atrasos en un mes equivalen a 1 falta.\nd) Prohibido ingresar en estado de ebriedad o bajo sustancias (retiro inmediato y falta).\ne) Prohibido generar conflictos o difundir rumores en áreas de trabajo, campamento y pijcheadero.\nf) Reemplazo obligatorio e inmediato de representantes infractores."
      },
      {
        id: 11,
        numero: 11,
        denominacion: "ENFERMEDADES Y ACCIDENTES",
        contenido: "I. Accidente laboral: Licencia con respaldo médico por el tiempo necesario conservando beneficios según Asamblea y apoyo del Fondo de Previsión Social.\n\nII. Casos especiales:\na) Accidente fuera de jornada: Licencia hasta 15 días o plazo mayor determinado por Asamblea.\nb) Enfermedad ocupacional minera acreditada: Liberación laboral temporal hasta por 1 año sujeta a alta médica.\nc) Enfermedad común: Licencia temporal autorizada por Asamblea General previa certificación."
      },
      {
        id: 12,
        numero: 12,
        denominacion: "DE LOS REPRESENTANTES",
        contenido: "a) Persona autorizada excepcionalmente para realizar temporalmente el trabajo del asociado titular.\nb) Si excede 2 semanas requiere solicitud escrita ante el Consejo de Administración con conocimiento de Vigilancia.\nc) Procedente solo por enfermedad, comisión, fuerza mayor o causas justificadas.\nd) Requisitos: Mayor de 18 años y aptitud para labores mineras.\ne) No adquiere calidad de asociado.\nf) El titular mantiene plena responsabilidad económica, laboral y disciplinaria.\ng) Apoyo del Fondo de Previsión Social condicionado a ausencia de negligencia o ebriedad."
      },
      {
        id: 13,
        numero: 13,
        denominacion: "DEL FONDO DE ACCIDENTES",
        contenido: "I. Fondo de auxilio económico inmediato ante siniestros de asociados en labores o comisiones.\nII. Financiado provisionalmente con los aportes del Anexo II.\nIII. Complementado con utilidades del Fondo de Previsión Social al operar regularmente.\nIV. Aporte obligatorio reglamentado en Anexo II.\nV. Administrado por Tesorería y fiscalizado por Consejo de Vigilancia.\nVI. Destino específico e inembargable para atención de accidentes de trabajo."
      }
    ]
  },
  {
    id: 3,
    numero_romano: "III",
    numero: 3,
    titulo: "DECLARATORIA EN COMISIÓN Y LICENCIAS JUSTIFICADAS POR FUERZA MAYOR",
    descripcion: "Supuestos de excepción al trabajo personal, trámites de permisos y sanciones para autoridades.",
    articulos: [
      {
        id: 14,
        numero: 14,
        denominacion: "EXCEPCIONES AL TRABAJO PERSONAL",
        contenido: "El trabajo personal es la base cooperativa; no obstante, se autorizan licencias y comisiones reglamentadas sin pérdida de la calidad de asociado."
      },
      {
        id: 15,
        numero: 15,
        denominacion: "DE LAS LICENCIAS",
        contenido: "a) Enfermedad o accidente: Solicitada ante Consejo de Administración y aprobada por Asamblea Extraordinaria.\nb) Asuntos familiares: Hasta 5 días calendario por solicitud escrita ante Presidencia en reunión de Consejos.\nc) Fuerza mayor o emergencia: Hasta 7 días por desastres naturales o emergencias graves comprobadas.\nd) Autoridad originaria o comunal: Hasta 1 año por 2/3 de votos en Asamblea Extraordinaria."
      },
      {
        id: 16,
        numero: 16,
        denominacion: "MOTIVOS PARA DECLARAR EN COMISIÓN",
        contenido: "a) Cumplimiento del servicio militar obligatorio.\nb) Estudios técnicos o mineros mediante becas oficiales.\nc) Estudios de grado/posgrado de interés cooperativo.\nd) Cargos directivos en organizaciones matrices cooperativas.\ne) Representación institucional en congresos o seminarios.\nf) Misiones especiales encomendadas por la Asamblea."
      },
      {
        id: 17,
        numero: 17,
        denominacion: "DECLARATORIA EN COMISIÓN",
        contenido: "I. Requiere Resolución de Asamblea General Extraordinaria indicando motivo, plazo y condiciones.\nII. Al culminar, la reincorporación es inmediata con presentación de informe escrito de descargo."
      },
      {
        id: 18,
        numero: 18,
        denominacion: "SANCIONES PARA CONSEJERAS Y CONSEJEROS",
        contenido: "a) Inasistencia a reuniones de Consejo sancionada según Anexo I.\nb) Inasistencia a Asambleas sancionada según Anexo I.\nc) Primera falta: Amonestación escrita.\nd) 3 faltas consecutivas o 6 discontinuas sin justificativo dan lugar al inicio de revocatoria y remoción."
      }
    ]
  },
  {
    id: 4,
    numero_romano: "IV",
    numero: 4,
    titulo: "SEGURIDAD INDUSTRIAL Y SALUD OCUPACIONAL",
    descripcion: "Normas de EPP obligatorio, inspecciones preventivas, emergencias y capacitaciones mineras.",
    articulos: [
      {
        id: 19,
        numero: 19,
        denominacion: "OBJETO",
        contenido: "Establecer normas obligatorias de seguridad y prevención para proteger la vida, integridad y patrimonio en las operaciones mineras."
      },
      {
        id: 20,
        numero: 20,
        denominacion: "OBLIGACIÓN DE CUMPLIMIENTO",
        contenido: "Deber ineludible de asociados, trabajadores y voluntarios de acatar directivas de seguridad e instrucciones de mandos operativos."
      },
      {
        id: 21,
        numero: 21,
        denominacion: "EQUIPO DE PROTECCIÓN PERSONAL",
        contenido: "Uso obligatorio permanente de:\na) Casco de seguridad con barbiquejo.\nb) Botas de seguridad minera.\nc) Linterna minera reglamentaria.\nd) Guantes de protección industrial.\ne) Protección respiratoria contra polvo y gases.\nf) Arnés de seguridad para trabajos en altura.\nSe prohibirá tajantemente el ingreso a quienes no porten EPP completo."
      },
      {
        id: 22,
        numero: 22,
        denominacion: "PROHIBICIONES EN MATERIA DE SEGURIDAD",
        contenido: "Queda terminantemente prohibido:\na) Ingresar al interior de la mina en estado de ebriedad o drogadicción.\nb) Manipular explosivos o maquinaria sin acreditación ni autorización.\nc) Retirar guardas o protecciones de seguridad en maquinaria.\nd) Fumar en polvorines o cercanías de combustible.\ne) Desobedecer indicaciones preventivas de los jefes operativos.\nf) Ingresar a sectores clausurados o peligrosos.\ng) Dañar o mover señalización preventiva de seguridad."
      },
      {
        id: 23,
        numero: 23,
        denominacion: "OBLIGACIONES DEL COORDINADOR Y JEFES DE PUNTA",
        contenido: "Verificación diaria de labores, suspensión de faenas ante riesgo inminente, evacuación oportuna y fiscalización de señalética de seguridad."
      },
      {
        id: 24,
        numero: 24,
        denominacion: "ACCIDENTES DE TRABAJO",
        contenido: "Notificación inmediata a jefaturas, auxilio médico de emergencia y reporte circunstanciado dentro de las 24 horas."
      },
      {
        id: 25,
        numero: 25,
        denominacion: "CAPACITACIÓN",
        contenido: "Programas periódicos en seguridad minera, primeros auxilios, manipulación técnica de explosivos y simulacros de rescate."
      },
      {
        id: 26,
        numero: 26,
        denominacion: "INSPECCIONES DE SEGURIDAD",
        contenido: "Inspecciones conjuntas periódicas de Coordinador, Jefe de Máquinas y Consejo de Vigilancia levantando actas técnicas."
      },
      {
        id: 27,
        numero: 27,
        denominacion: "INCUMPLIMIENTO",
        contenido: "Infracción disciplinaria sujeta a sanciones del Anexo I, sin perjuicio de acciones de ley correspondientes."
      }
    ]
  },
  {
    id: 5,
    numero_romano: "V",
    numero: 5,
    titulo: "DE LAS FALLAS, DEL ROBO O HURTO DE MINERAL AURÍFERO Y DESFALCO A LA COOPERATIVA",
    descripcion: "Tipificación de sanciones ante inasistencias laborales y actos ilícitos contra el oro y fondos.",
    articulos: [
      {
        id: 28,
        numero: 28,
        denominacion: "DE LAS CAUSALES",
        contenido: "I. Las Fallas:\na) Multa por cada falta injustificada según Anexo I, a cancelar previo retorno.\nb) Acumular más de 90 días constituye abandono y pérdida de calidad de socio.\n\nII. Robo, Hurto o Desfalco de Oro:\na) Suspensión preventiva inmediata, sumario ante Tribunal de Honor y expulsión en Asamblea Extraordinaria más denuncias penales.\nb) Liquidación del Certificado de Aportación en plazo máximo de 180 días deduciendo deudas y daños ocasionados."
      }
    ]
  },
  {
    id: 6,
    numero_romano: "VI",
    numero: 6,
    titulo: "DE LA PÉRDIDA DE CALIDAD DE LA ASOCIADA O ASOCIADO",
    descripcion: "Causales y procedimientos de retiro voluntario, exclusión sumarial, expulsión y sucesión mortis causa.",
    articulos: [
      {
        id: 29,
        numero: 29,
        denominacion: "RÉGIMEN DE PÉRDIDA DE LA CALIDAD DE ASOCIADA O ASOCIADO",
        contenido: "Regulado bajo la Ley N° 356, D.S. N° 1995, Estatuto Orgánico y este cuerpo normativo."
      },
      {
        id: 30,
        numero: 30,
        denominacion: "RETIRO VOLUNTARIO",
        contenido: "I. Renuncia escrita estando al día en cuentas y labores sin perjudicar operaciones.\nII. Reembolso del Certificado según balances en producción.\nIII. Readmisión sujeta a nuevo trámite ante Asamblea Extraordinaria."
      },
      {
        id: 31,
        numero: 31,
        denominacion: "EXCLUSIÓN",
        contenido: "I. Supresión temporal de derechos societarios por faltas estatutarias.\nII. Suspensión preventiva en 48 horas por Consejo de Administración.\nIII. Sumario tramitado por Tribunal de Honor con derecho a apelación.\nIV. Causales: divisionismo, documentos adulterados, desvío de fondos o daño patrimonial."
      },
      {
        id: 32,
        numero: 32,
        denominacion: "EXPULSIÓN",
        contenido: "Pérdida definitiva de la calidad de asociado tras sumario del Tribunal de Honor y ratificación por 2/3 de votos en Asamblea General Extraordinaria con remisión a AFCOOP."
      },
      {
        id: 33,
        numero: 33,
        denominacion: "ABANDONO INJUSTIFICADO",
        contenido: "Alejamiento voluntario no avisado superior a 90 días calendarios continuos."
      },
      {
        id: 34,
        numero: 34,
        denominacion: "MUERTE DE LA ASOCIADA O ASOCIADO",
        contenido: "Subrogación por declaratoria de herederos:\na) Cónyuge: 1 año de liberación laboral con beneficios del alza.\nb) Hijos huérfanos: 1 año de gracia laboral.\nc) Múltiples hijos: designación de titular único con 3 meses de gracia para trámites.\nd) Vencido el plazo: transferencia de certificado o liquidación formal."
      }
    ]
  },
  {
    id: 7,
    numero_romano: "VII",
    numero: 7,
    titulo: "DE LAS ASAMBLEAS, REUNIONES Y SUS RESOLUCIONES",
    descripcion: "Asambleas Ordinarias, Extraordinarias, quórum, actas y administración de activos digitales.",
    articulos: [
      {
        id: 35,
        numero: 35,
        denominacion: "DE LAS FACULTADES PARA EMITIR CONVOCATORIAS A LAS ASAMBLEAS Y REUNIONES DE EMERGENCIA",
        contenido: "La Asamblea es la máxima autoridad soberana de la Cooperativa. El Consejo de Administración convoca indicando temario, fecha y hora."
      },
      {
        id: 36,
        numero: 36,
        denominacion: "LA ASAMBLEA GENERAL ORDINARIA",
        contenido: "Realizada mínimo 1 vez al año con 10 días de anticipación de convocatoria formal."
      },
      {
        id: 37,
        numero: 37,
        denominacion: "LA ASAMBLEA GENERAL EXTRAORDINARIA",
        contenido: "Convocada para temario específico con 10 días de anticipación las veces necesarias."
      },
      {
        id: 38,
        numero: 38,
        denominacion: "REUNIÓN DE EMERGENCIA",
        contenido: "Reunión operativa de coordinación que no suplanta competencias soberanas de la Asamblea."
      },
      {
        id: 39,
        numero: 39,
        denominacion: "DE LOS ACUERDOS Y RESOLUCIONES DE LAS ASAMBLEAS GENERALES ORDINARIAS Y EXTRAORDINARIAS",
        contenido: "Aprobados por mayoría simple (mitad más uno) o 2/3 según mandato reglamentario, de cumplimiento obligatorio para todos."
      },
      {
        id: 40,
        numero: 40,
        denominacion: "LA INCLUSIÓN DE UN TEMA ESPECÍFICO A TRATAR EN EL ORDEN DEL DÍA",
        contenido: "Aprobada por mayoría simple de los asistentes al inicio de la sesión."
      },
      {
        id: 41,
        numero: 41,
        denominacion: "DEL QUÓRUM",
        contenido: "I. Asistencia obligatoria con guardatojo e identificativo institucional.\nII. Quórum: mitad más uno de asociados. Si no se logra, segunda convocatoria media hora después sesionando con los asistentes."
      },
      {
        id: 42,
        numero: 42,
        denominacion: "DEL USO DE LA PALABRA EN LAS ASAMBLEAS",
        contenido: "Libertad de expresión enfocada al tema, respeto y orden disciplinario en deliberaciones."
      },
      {
        id: 43,
        numero: 43,
        denominacion: "DEL DERECHO A VOZ Y VOTO",
        contenido: "Un voto por asociado activo. Dirigentes no votan en aprobación de sus propios balances o rendiciones de cuentas."
      },
      {
        id: 44,
        numero: 44,
        denominacion: "DE LA CONVOCATORIA A LA ASAMBLEA GENERAL ORDINARIA REALIZADA POR EL CONSEJO DE VIGILANCIA",
        contenido: "Facultad subsidiaria del Consejo de Vigilancia ante omisión de Administración (Art. 55 Ley 356)."
      },
      {
        id: 45,
        numero: 45,
        denominacion: "REUNIONES DE CONSEJO DE ADMINISTRACIÓN",
        contenido: "Sesión ordinaria mensual y extraordinarias convocadas con mínimo 48 horas de anticipación."
      },
      {
        id: 46,
        numero: 46,
        denominacion: "DE LAS ACTAS",
        contenido: "Registro notariado/habilitado en libro oficial de debates, votos y firmas de directiva y asistentes."
      },
      {
        id: 47,
        numero: 47,
        denominacion: "ADMINISTRACIÓN DE LOS ACTIVOS DIGITALES",
        contenido: "Bases de datos, correos, WhatsApp y dominios son patrimonio institucional intransferible; prohibida su apropiación personal."
      },
      {
        id: 48,
        numero: 48,
        denominacion: "MEDIOS OFICIALES DE COMUNICACIÓN DIGITAL",
        contenido: "Validez legal de comunicados y citaciones emitidas en canales verificados por el Consejo."
      }
    ]
  },
  {
    id: 8,
    numero_romano: "VIII",
    numero: 8,
    titulo: "DEL MANEJO ADMINISTRATIVO",
    descripcion: "Estructura de Consejos, Coordinador, Jefes de Punta, Almacén, Caja Chica y Serenos.",
    articulos: [
      {
        id: 49,
        numero: 49,
        denominacion: "DE LOS CONSEJOS DE ADMINISTRACIÓN Y VIGILANCIA",
        contenido: "Órganos representativos y fiscalizadores elegidos democráticamente por voto societario."
      },
      {
        id: 50,
        numero: 50,
        denominacion: "COMPOSICIÓN DEL CONSEJO DE ADMINISTRACIÓN",
        contenido: "Titulares: Presidente, Secretario, Tesorero, 2 Vocales.\nCargos de apoyo operativo: Coordinador, Jefe de Campamento, Secretario de Deportes, Jefe de Máquinas y Almacén, Encargado de Caja Chica, Jefes de Punta y Responsables de Control."
      },
      {
        id: 51,
        numero: 51,
        denominacion: "COMPOSICIÓN DEL CONSEJO DE VIGILANCIA",
        contenido: "Presidente, Secretario y Vocal de Vigilancia."
      },
      {
        id: 52,
        numero: 52,
        denominacion: "ATRIBUCIONES Y OBLIGACIONES DEL CONSEJO DE ADMINISTRACIÓN",
        contenido: "Ejecución de acuerdos, representación institucional, gestión contable, presupuestaria y patrimonial."
      },
      {
        id: 53,
        numero: 53,
        denominacion: "ELECCIÓN, ATRIBUCIONES Y REQUISITOS DEL PRESIDENTE DEL CONSEJO DE ADMINISTRACIÓN",
        contenido: "I. Representación legal ante AJAM, COMIBOL, AFCOOP, SENARECOM, firma mancomunada de cheques.\nII. Requisitos: 2 años de antigüedad, solvencia societaria y no tener incompatibilidades."
      },
      {
        id: 54,
        numero: 54,
        denominacion: "DE LAS ATRIBUCIONES DEL SECRETARIO GENERAL",
        contenido: "Custodia documental, libros de actas, registro de socios, kárdex y archivo digital."
      },
      {
        id: 55,
        numero: 55,
        denominacion: "DE LAS ATRIBUCIONES DEL TESORERO",
        contenido: "Custodia de finanzas y oro físico, arqueos, balances y control estricto de descargos en 15 días."
      },
      {
        id: 56,
        numero: 56,
        denominacion: "DEL RÉGIMEN DE CERTIFICADOS DE APORTACIÓN",
        contenido: "Certificados nominativos e indivisibles. Máximo 1 certificado por asociado para resguardar la igualdad societaria."
      },
      {
        id: 57,
        numero: 57,
        denominacion: "NOMBRAMIENTO Y ATRIBUCIONES DEL COORDINADOR",
        contenido: "Dirección técnica y operativa en plataformas, socavones y lavaderos; permisos de hasta 2 días."
      },
      {
        id: 58,
        numero: 58,
        denominacion: "NOMBRAMIENTO Y ATRIBUCIONES DEL JEFE DE CAMPAMENTO",
        contenido: "Orden, pulcritud, control de pensiones y servicios esenciales del campamento minero."
      },
      {
        id: 59,
        numero: 59,
        denominacion: "NOMBRAMIENTO Y ATRIBUCIONES DEL SECRETARIO DE DEPORTES",
        contenido: "Fomento de integración deportiva y cultural con presupuestos aprobados."
      },
      {
        id: 60,
        numero: 60,
        denominacion: "NOMBRAMIENTO Y ATRIBUCIONES DEL JEFE DE MÁQUINAS Y ALMACÉN",
        contenido: "Mantenimiento preventivo de maquinaria pesada, control de combustible y polvorín."
      },
      {
        id: 61,
        numero: 61,
        denominacion: "NOMBRAMIENTO Y ATRIBUCIONES DEL ENCARGADO DE CAJA CHICA",
        contenido: "Cobro de multas y aportes especiales los días lunes y pago de gastos menores autorizados."
      },
      {
        id: 62,
        numero: 62,
        denominacion: "NOMBRAMIENTO Y ATRIBUCIONES DE LOS JEFES DE PUNTA",
        contenido: "Control de asistencia de turnos mineros, orden operativo y permisos de hasta 1 día."
      },
      {
        id: 63,
        numero: 63,
        denominacion: "NOMBRAMIENTO Y SUS ATRIBUCIONES DE LOS RESPONSABLES DE CONTROL",
        contenido: "Supervisión de carga movida, limpieza de faena y registro de novedades en libro de control."
      },
      {
        id: 64,
        numero: 64,
        denominacion: "NOMBRAMIENTO Y ATRIBUCIONES DEL CONSEJO DE VIGILANCIA",
        contenido: "Fiscalización independiente de cuentas, inventarios, arqueos de oro y legalidad."
      },
      {
        id: 65,
        numero: 65,
        denominacion: "FUNCIONES DE LOS VOCALES DE AMBOS CONSEJOS",
        contenido: "Apoyo en citaciones, comisiones especiales y suplencias temporales autorizadas."
      },
      {
        id: 66,
        numero: 66,
        denominacion: "DESIGNACIÓN Y ATRIBUCIONES DE LOS SERENOS",
        contenido: "Custodia patrimonial de 15 días rotativos por cada asociado; control riguroso de accesos."
      },
      {
        id: 67,
        numero: 67,
        denominacion: "RESPONSABILIDAD ADMINISTRATIVA DE LAS CONSEJERAS Y LOS CONSEJEROS",
        contenido: "Rendición obligatoria al culminar mandato con inventarios y Actas de Entrega y Recepción."
      }
    ]
  },
  {
    id: 9,
    numero_romano: "IX",
    numero: 9,
    titulo: "DE LA PRODUCCIÓN, BENEFICIOS Y DISTRIBUCIÓN DE EXCEDENTES",
    descripcion: "Alzas del lavadero de oro, distribución del 60% de excedentes y fondos de reserva obligatorios.",
    articulos: [
      {
        id: 68,
        numero: 68,
        denominacion: "DE LAS ALZAS DEL LAVADERO",
        contenido: "a) Tesorero responsable de recepción y pesaje de oro obtenido.\nb) Prohibición absoluta de donaciones sin autorización formal.\nc) Donaciones hasta 5 gramos por Consejo de Administración; mayores a 5g solo por Asamblea Extraordinaria.\nd) Alza efectuada solo por directivos y Jefe de Punta (prohibido 'chispeo' informal).\ne) Asistencia de directiva a arqueos semanales y mensuales.\nf) Suscripción obligatoria de Acta de Producción con pesaje exacto."
      },
      {
        id: 69,
        numero: 69,
        denominacion: "DE LOS EXCEDENTES",
        contenido: "I. Distribución del 60% a los asociados en función de su trabajo efectivo, una vez deducidos:\n  • 10% Reserva Legal.\n  • 5% Fondo de Educación.\n  • 5% Previsión Social y Apoyo a la Colectividad.\n  • 20% Reserva Voluntaria.\nII. Pago mediante planilla foliada con firmas del Consejo y del asociado.\nIII. Control y seguridad integral en todo el proceso de liquidación."
      },
      {
        id: 70,
        numero: 70,
        denominacion: "DE LOS BONOS",
        contenido: "I. Propuesta del Consejo de Administración y fiscalización de Vigilancia.\nII. Bonos de incentivo por producción y trabajo personal según Anexo III.\nIII. Condicionados a rentabilidad efectiva y aprobación de Asamblea."
      }
    ]
  },
  {
    id: 10,
    numero_romano: "X",
    numero: 10,
    titulo: "MEDIDAS DISCIPLINARIAS Y RESPONSABILIDADES",
    descripcion: "Clasificación de Faltas Leves, Graves y Muy Graves; principios y tipos de sanción.",
    articulos: [
      {
        id: 71,
        numero: 71,
        denominacion: "MEDIDAS DISCIPLINARIAS",
        contenido: "Mecanismos de control para asegurar la armonía, orden y cumplimiento en la Cooperativa."
      },
      {
        id: 72,
        numero: 72,
        denominacion: "CATEGORIZACIÓN DE LAS INFRACCIONES Y TIPOS DE SANCIONES",
        contenido: "I. Clasificación: Faltas Leves, Graves y Muy Graves.\n\nII. Faltas Leves: Retrasos, dos faltas semanales, abandono de faena, desinterés en tareas o salir de asamblea tras primer control.\n\nIII. Faltas Graves: Reincidencias, inasistencia a Asambleas, ebriedad en reuniones, altercados en campamento, desacato o no presentar descargos.\n\nIV. Faltas Muy Graves: Robo/hurto de oro, desfalco económico, falsedad documental, agresión física o delitos penales.\n\nV. Sanciones aplicables: Amonestación verbal/escrita, multa económica (Anexo I), suspensión temporal de derechos, exclusión y expulsión definitiva.\n\nVII. Principios: Debido proceso, presunción de inocencia, proporcionalidad, imparcialidad y verdad material."
      },
      {
        id: 73,
        numero: 73,
        denominacion: "PLAZO PARA EL CUMPLIMIENTO DE LAS SANCIONES",
        contenido: "Plazo de quince (15) días calendario desde la notificación formal para pago de multas o descargos."
      },
      {
        id: 74,
        numero: 74,
        denominacion: "RECURSO DE APELACIÓN Y DE REVISIÓN DE LAS SANCIONES Y SUS PLAZOS",
        contenido: "a) Sanción de Jefe de Punta: Apelable ante Coordinador en 24 horas.\nb) Sanción de Coordinador: Apelable ante Consejo de Administración en 48 horas.\nc) Sanción de Consejo: Apelable ante Asamblea General en 15 días hábiles.\nd) Exclusión o Expulsión: Apelable ante Central Local (10 días), Revisión ante FECOMAN L.P. (15 días) y última instancia en Tribunal de Conciliación y Arbitraje de CONCOBOL."
      },
      {
        id: 75,
        numero: 75,
        denominacion: "PRESCRIPCIÓN DE LAS FALTAS DISCIPLINARIAS",
        contenido: "Faltas leves prescriben a los 3 meses; faltas graves al 1 año de tomado conocimiento formal."
      }
    ]
  },
  {
    id: 11,
    numero_romano: "XI",
    numero: 11,
    titulo: "DEL TRIBUNAL DE HONOR Y PROCEDIMIENTO",
    descripcion: "Sumario informativo interno, plazos probatorios (20 días), dictamen y garantías constitucionales.",
    articulos: [
      {
        id: 76,
        numero: 76,
        denominacion: "NOMBRAMIENTO Y FUNCIONES DEL TRIBUNAL DE HONOR",
        contenido: "Elegido en Asamblea Ordinaria por 2 años (Presidente, Secretario, Vocal). Emite dictamen de sanciones o sobreseimiento para ratificación en Asamblea Extraordinaria."
      },
      {
        id: 77,
        numero: 77,
        denominacion: "ATRIBUCIONES DEL TRIBUNAL DE HONOR",
        contenido: "Apertura de sumarios, investigación imparcial, recepción de descargos y emisión de informes fundamentados."
      },
      {
        id: 78,
        numero: 78,
        denominacion: "PROCEDIMIENTO DEL SUMARIO INFORMATIVO",
        contenido: "a) Inicio mediante auto motivado.\nb) Notificación legal de cargos al procesado.\nc) Término probatorio de 20 días calendario para descargos.\nd) Emisión de informe y dictamen en 10 días calendario.\ne) Notificaciones obligatorias en cada etapa procesal."
      }
    ]
  },
  {
    id: 12,
    numero_romano: "XII",
    numero: 12,
    titulo: "DE LA JUNTA DE CONCILIACIÓN Y DEL REGLAMENTO DE CONCILIACIÓN Y ARBITRAJE COOPERATIVO",
    descripcion: "Instancia previa y preferente para solución pacífica de discrepancias internas.",
    articulos: [
      {
        id: 79,
        numero: 79,
        denominacion: "CREACIÓN DE LA JUNTA DE CONCILIACIÓN",
        contenido: "Instancia encargada de promover acuerdos voluntarios y pacíficos entre asociados y directivos."
      },
      {
        id: 80,
        numero: 80,
        denominacion: "REGLAMENTO DE CONCILIACIÓN Y ARBITRAJE COOPERATIVO",
        contenido: "Vía preferente previa a procesos disciplinarios para preservar la unidad institucional."
      }
    ]
  },
  {
    id: 13,
    numero_romano: "XIII",
    numero: 13,
    titulo: "DE LOS BIENES DE LA COOPERATIVA",
    descripcion: "Cuidado, custodia de maquinaria, inventarios anuales y resarcimiento de daños.",
    articulos: [
      {
        id: 81,
        numero: 81,
        denominacion: "DEL CUIDADO Y CONSERVACIÓN DE LOS BIENES DE LA COOPERATIVA",
        contenido: "Obligación de preservar herramientas, maquinaria e inmuebles; deber de resarcimiento ante pérdidas culposas o dolosas."
      },
      {
        id: 82,
        numero: 82,
        denominacion: "USO Y CUSTODIA DE LOS BIENES DE LA COOPERATIVA",
        contenido: "Retiro de bienes solo con vale y registro; uso no autorizado constituye falta muy grave."
      },
      {
        id: 83,
        numero: 83,
        denominacion: "INVENTARIO GENERAL",
        contenido: "Inventario físico anual obligatorio levantado conjuntamente por Administración y Vigilancia."
      },
      {
        id: 84,
        numero: 84,
        denominacion: "RESPONSABILIDAD POR ENTREGA DE BIENES",
        contenido: "Firma obligatoria de formularios de entrega y devolución de herramientas y explosivos."
      }
    ]
  },
  {
    id: 14,
    numero_romano: "XIV",
    numero: 14,
    titulo: "DE LA ENTREGA Y RECEPCIÓN DE CARGO Y DOCUMENTACIÓN DE LA COOPERATIVA",
    descripcion: "Actas formales de transición, inventarios, archivos digitales y responsabilidades individuales.",
    articulos: [
      {
        id: 85,
        numero: 85,
        denominacion: "ENTREGA Y RECEPCIÓN DE CARGO Y DOCUMENTACIÓN DE LA COOPERATIVA",
        contenido: "I. Entrega formal al cesar funciones de todos los bienes, libros y cuentas.\nII. Suscripción de Acta de Entrega y Recepción con presencia del Consejo de Vigilancia.\nIII. Contenido: Libros de actas, balances, contraseñas, archivos digitales, llaves y valores.\nIV. Plazo máximo: 5 días hábiles desde la posesión de nuevas autoridades.\nV. Retención o alteración constituye falta gravísima con responsabilidades civiles y penales."
      }
    ]
  },
  {
    id: 15,
    numero_romano: "XV",
    numero: 15,
    titulo: "LA CONTABILIDAD DE LA COOPERATIVA",
    descripcion: "Contratación de Contador/Auditor, libros obligatorios, custodia de archivos digitales y auditorías.",
    articulos: [
      {
        id: 86,
        numero: 86,
        denominacion: "DE LA CONTABILIDAD",
        contenido: "Llevada conforme a principios contables bajo supervisión del Tesorero mediante Contador Público Autorizado."
      },
      {
        id: 87,
        numero: 87,
        denominacion: "DE LA INFORMACIÓN DIGITAL Y SU RESGUARDO",
        contenido: "Respaldos periódicos de sistemas contables, actas digitales y nóminas bajo custodia de Secretaría y Tesorería."
      },
      {
        id: 88,
        numero: 88,
        denominacion: "LIBROS Y REGISTROS CONTABLES",
        contenido: "Libro Diario, Mayor, Inventarios y Balances, Ingresos/Egresos, Producción y Comercialización de Oro, Activos Fijos y Bancos."
      },
      {
        id: 89,
        numero: 89,
        denominacion: "AUDITORÍA Y FISCALIZACIÓN",
        contenido: "Auditorías internas o externas dispuestas por la Asamblea o el Consejo de Vigilancia."
      }
    ]
  },
  {
    id: 16,
    numero_romano: "XVI",
    numero: 16,
    titulo: "DEL COMITÉ ELECTORAL",
    descripcion: "Comité de 3 miembros y modalidades de sufragio democrático en Asambleas.",
    articulos: [
      {
        id: 90,
        numero: 90,
        denominacion: "NOMBRAMIENTO Y FUNCIONES DEL COMITÉ ELECTORAL",
        contenido: "Conformado por 3 asociados para organizar, fiscalizar el sufragio y suscribir el acta de posesión."
      },
      {
        id: 91,
        numero: 91,
        denominacion: "DE LA ELECCIÓN DE LOS CONSEJOS DE ADMINISTRACIÓN Y VIGILANCIA",
        contenido: "Modalidades: a) Nominal a viva voz; b) Secreto en ánfora con papeleta; c) Aclamación por candidatura única."
      }
    ]
  },
  {
    id: 17,
    numero_romano: "XVII",
    numero: 17,
    titulo: "DE LOS CONSEJOS DE ADMINISTRACIÓN Y VIGILANCIA: DURACIÓN Y OBLIGACIONES",
    descripcion: "Mandato directivo de 2 años, reelección democrática y prohibición de renuncia injustificada.",
    articulos: [
      {
        id: 92,
        numero: 92,
        denominacion: "DURACIÓN DEL MANDATO DE LOS CONSEJOS DE ADMINISTRACIÓN Y VIGILANCIA",
        contenido: "Mandato de 2 años calendario. Reelección consecutiva permitida si cuentan con memorias y balances aprobados."
      },
      {
        id: 93,
        numero: 93,
        denominacion: "OBLIGATORIEDAD EN EL CUMPLIMIENTO DE LAS FUNCIONES ENCOMENDADAS A LAS CONSEJERAS Y CONSEJEROS",
        contenido: "Prohibición de renunciar sin causa grave justificada (sanción según Anexo I); responsabilidad por omisión o daño."
      }
    ]
  },
  {
    id: 18,
    numero_romano: "XVIII",
    numero: 18,
    titulo: "DEL COMITÉ LABORAL",
    descripcion: "Instancia técnica de apoyo operativo para planificación minera y rendimiento de labores.",
    articulos: [
      {
        id: 94,
        numero: 94,
        denominacion: "CONFORMACIÓN Y FUNCIONES DEL COMITÉ LABORAL",
        contenido: "Instancia técnica integrada por Coordinador, mandos operativos y delegados de Consejos para proponer mejoras en socavones, cuadros y seguridad minera."
      }
    ]
  },
  {
    id: 19,
    numero_romano: "XIX",
    numero: 19,
    titulo: "DE LAS ACTIVIDADES CULTURALES Y DEPORTIVAS",
    descripcion: "Participación en campeonatos, fomento deportivo y rendición de cuentas en 15 días.",
    articulos: [
      {
        id: 95,
        numero: 95,
        denominacion: "DE LA PARTICIPACIÓN",
        contenido: "Intervención de la cooperativa en actividades de confraternización deportiva y cultural del rubro."
      },
      {
        id: 96,
        numero: 96,
        denominacion: "DE LA ORGANIZACIÓN",
        contenido: "Programación coordinada por la Secretaría de Deportes con presupuestos y rendición documentada en 15 días."
      },
      {
        id: 97,
        numero: 97,
        denominacion: "DEL USO DE LOS RECURSOS DESTINADOS",
        contenido: "Administración con transparencia y fiscalización estricta por el Consejo de Vigilancia."
      }
    ]
  },
  {
    id: 20,
    numero_romano: "XX",
    numero: 20,
    titulo: "RÉGIMEN DISCIPLINARIO DEL PERSONAL DE APOYO",
    descripcion: "Marco aplicable a trabajadores asalariados dependientes de la Cooperativa.",
    articulos: [
      {
        id: 98,
        numero: 98,
        denominacion: "RÉGIMEN DISCIPLINARIO",
        contenido: "Sujeto a contratos individuales y Ley General del Trabajo: amonestaciones, suspensión temporal o despido justificado."
      },
      {
        id: 99,
        numero: 99,
        denominacion: "RETIRO DE LA RELACIÓN LABORAL",
        contenido: "Conclusión de relación obrero-patronal sin perjuicio de acciones civiles o penales por daños."
      }
    ]
  },
  {
    id: 21,
    numero_romano: "XXI",
    numero: 21,
    titulo: "DISPOSICIONES FINALES",
    descripcion: "Régimen transitorio de multas en Bs/oro, Fondo de Accidentes, vigencia y reforma por 2/3.",
    articulos: [
      {
        id: 100,
        numero: 100,
        denominacion: "DISPOSICIÓN TRANSITORIA SOBRE LA APLICACIÓN DE LAS SANCIONES PECUNIARIAS",
        contenido: "Mientras no se alcance producción regular, multas pagaderas en bolivianos (Bs.); una vez en producción, la Asamblea podrá actualizar o convertir sanciones a su equivalente en gramos de oro físico."
      },
      {
        id: 101,
        numero: 101,
        denominacion: "DISPOSICIÓN TRANSITORIA SOBRE EL FINANCIAMIENTO DEL FONDO DE ACCIDENTES",
        contenido: "Financiado provisionalmente mediante aportes del Anexo II hasta la regularización de excedentes mineros."
      },
      {
        id: 102,
        numero: 102,
        denominacion: "DISPOSICIONES LEGALES APLICABLES",
        contenido: "Normas de prelación: Constitución Política del Estado, Ley N° 356, D.S. N° 1995, Estatuto Orgánico y este Reglamento Interno."
      },
      {
        id: 103,
        numero: 103,
        denominacion: "APROBACIÓN, CUMPLIMIENTO Y VIGENCIA DEL REGLAMENTO INTERNO",
        contenido: "Aprobado en Asamblea General Extraordinaria de 4 de octubre de 2026 por 2/3 de votos. Compuesto por 105 artículos, 21 capítulos y sus anexos de observancia irrestricta sin poder alegar desconocimiento."
      },
      {
        id: 104,
        numero: 104,
        denominacion: "REFORMA DEL REGLAMENTO INTERNO",
        contenido: "Modificable únicamente por determinación de Asamblea Extraordinaria convocada para el efecto con el voto favorable de dos tercios (2/3) de asociadas y asociados presentes."
      },
      {
        id: 105,
        numero: 105,
        denominacion: "ANEXOS Y DOCUMENTOS OFICIALES",
        contenido: "Los Anexos I y II tienen carácter normativo y vinculante formal. Los formularios y registros constituyen instrumentos administrativos."
      }
    ]
  }
];

export const ANEXOS_DATA = [
  {
    id: 1,
    numero_romano: "I",
    titulo: "ESCALA DE MULTAS Y MEDIDAS DISCIPLINARIAS",
    nota: "Nota: Los montos consignados en este Anexo son una propuesta técnica sujeta a validación por el Consejo de Administración y aprobación final de la Asamblea General, conforme al Art. 100 (Disposición Transitoria) del Reglamento Interno. Mientras la Cooperativa no alcance producción regular, todas las sanciones pecuniarias se fijan y pagan en bolivianos (Bs.); una vez iniciada la producción regular, la Asamblea General podrá resolver su conversión a un equivalente en gramos de oro físico.",
    articulos: [
      {
        numero: 1,
        denominacion: "Objeto",
        contenido: "El presente Anexo establece la escala de multas y las medidas disciplinarias aplicables por el incumplimiento de las obligaciones previstas en el Estatuto Orgánico y el Reglamento Interno."
      },
      {
        numero: 2,
        denominacion: "Actualización",
        contenido: "La Asamblea General podrá modificar los montos establecidos en el presente Anexo mediante Resolución expresa, sin necesidad de modificar el articulado del Reglamento Interno."
      }
    ],
    tablas: [
      {
        id: "cuadro-1",
        nombre: "Cuadro N.º 1. Clasificación de Faltas y Escala General de Sanciones",
        columnas: ["Categoría", "Descripción / Alcance", "Referencia", "Multa (Bs.)"],
        filas: [
          {
            categoria: "Falta Leve",
            descripcion: "Conductas del Art. 72.II, incisos a) al h).",
            referencia: "Art. 72. II",
            multa: "1ª vez: Amonestación escrita | 2ª vez: Bs. 100.- | 3ª vez: Bs. 150.-"
          },
          {
            categoria: "Falta Grave",
            descripcion: "Conductas del Art. 72.III, incisos a) al n).",
            referencia: "Art. 72.III",
            multa: "Bs. 300.-"
          },
          {
            categoria: "Falta Muy Grave",
            descripcion: "Conductas del Art. 72.IV, incisos a) al f). Remisión obligatoria al Tribunal de Honor conforme al Art. 75; puede derivar en exclusión o expulsión.",
            referencia: "Art. 72. IV",
            multa: "Multa máxima de Bs. 500.- como sanción complementaria, sin perjuicio de la exclusión/expulsión y denuncia penal"
          },
          {
            categoria: "Reincidencia general",
            descripcion: "Comisión de una nueva falta de igual o mayor categoría dentro de los doce (12) meses siguientes a una sanción previa.",
            referencia: "Art. 72 / 75",
            multa: "Se aplica el monto máximo de la categoría correspondiente"
          }
        ]
      },
      {
        id: "cuadro-2",
        nombre: "Cuadro N.º 2. Infracciones Específicas, Multas y Medidas Complementarias",
        columnas: ["Infracción", "Artículo", "Multa (Bs.)", "Categoría", "Medida Complementaria"],
        filas: [
          { infraccion: "Inasistencia injustificada al trabajo (por día)", articulo: "Art. 28.I.a)", multa: "150 Bs.", categoria: "Leve", medida: "Pago previo a la reincorporación" },
          { infraccion: "Tres atrasos en un mes", articulo: "Art. 10.c)", multa: "150 Bs.", categoria: "Leve", medida: "Se computa como una inasistencia" },
          { infraccion: "Inasistencia injustificada a Asamblea General Ordinaria", articulo: "Art. 41", multa: "300 Bs.", categoria: "Grave", medida: "—" },
          { infraccion: "Inasistencia injustificada a Asamblea General Extraordinaria", articulo: "Art. 41", multa: "300 Bs.", categoria: "Grave", medida: "—" },
          { infraccion: "Inasistencia injustificada a reunión de Consejo", articulo: "Art. 18.a)", multa: "150 Bs.", categoria: "Consejeros", medida: "Amonestación escrita" },
          { infraccion: "Inasistencia injustificada de consejeros a Asamblea", articulo: "Art. 18.b)", multa: "300 Bs.", categoria: "Consejeros", medida: "Amonestación escrita" },
          { infraccion: "Negativa injustificada a aceptar un cargo o comisión", articulo: "Art. 8.h)", multa: "300 Bs.", categoria: "Grave", medida: "—" },
          { infraccion: "Incumplimiento de comisión oficialmente encomendada", articulo: "Art. 8.g)", multa: "300 Bs.", categoria: "Grave", medida: "Informe al Consejo" },
          { infraccion: "Incumplimiento de normas de seguridad industrial", articulo: "Arts. 20 a 22", multa: "200 Bs.", categoria: "Grave", medida: "Suspensión inmediata si existe riesgo" },
          { infraccion: "Ingreso al trabajo sin EPP obligatorio", articulo: "Art. 21", multa: "150 Bs.", categoria: "Leve", medida: "Prohibición de ingreso hasta regularizar" },
          { infraccion: "Presentarse en estado de ebriedad o bajo sustancias", articulo: "Art. 10.d) y 22.a)", multa: "500 Bs.", categoria: "Muy grave", medida: "Retiro inmediato e informe al Tribunal en reincidencia" },
          { infraccion: "Manipular explosivos o maquinaria sin autorización", articulo: "Art. 22.b)", multa: "500 Bs.", categoria: "Muy grave", medida: "Suspensión preventiva" },
          { infraccion: "Dañar intencionalmente maquinaria o bienes", articulo: "Art. 8.j)", multa: "500 Bs.", categoria: "Muy grave", medida: "Reparación del daño y proceso disciplinario" },
          { infraccion: "Escándalos, peleas o insultos graves (1.ª vez)", articulo: "Art. 10.e)", multa: "300 Bs.", categoria: "Grave", medida: "Amonestación escrita" },
          { infraccion: "Escándalos, peleas o insultos graves (2.ª vez)", articulo: "Art. 10.e)", multa: "500 Bs.", categoria: "Muy grave", medida: "Suspensión preventiva" },
          { infraccion: "Escándalos, peleas o insultos graves (3.ª vez)", articulo: "Art. 10.e)", multa: "1000 Bs.", categoria: "Muy grave", medida: "Remisión obligatoria al Tribunal de Honor" },
          { infraccion: "Agresión verbal a autoridades o asociados (1.ª vez)", articulo: "Art. 10.e)", multa: "250 Bs.", categoria: "Grave", medida: "Amonestación escrita" },
          { infraccion: "Agresión verbal reincidente", articulo: "Art. 10.e)", multa: "500 Bs.", categoria: "Muy grave", medida: "Tribunal de Honor" },
          { infraccion: "Agresión física", articulo: "Arts. 10.e) y 28.II", multa: "1000 Bs.", categoria: "Muy grave", medida: "Suspensión preventiva y Tribunal de Honor" },
          { infraccion: "Divulgación de información confidencial", articulo: "Art. 5", multa: "500 Bs.", categoria: "Muy grave", medida: "Tribunal de Honor" },
          { infraccion: "Utilización indebida de activos digitales", articulo: "Art. 47.V", multa: "500 Bs.", categoria: "Muy grave", medida: "Tribunal de Honor" },
          { infraccion: "Negativa injustificada a entregar bienes/documentos", articulo: "Arts. 46 y 47", multa: "500 Bs.", categoria: "Muy grave", medida: "Tribunal de Honor" },
          { infraccion: "Robo, hurto o apropiación de mineral aurífero", articulo: "Art. 28.II", multa: "—", categoria: "Falta gravísima", medida: "Tribunal de Honor y acciones penales/civiles" },
          { infraccion: "Malversación o desfalco financiero", articulo: "Art. 28.II", multa: "—", categoria: "Falta gravísima", medida: "Tribunal de Honor y acciones legales" },
          { infraccion: "Falsificación o uso de documentos falsificados", articulo: "Art. 31.IV.c)", multa: "1000 Bs.", categoria: "Muy grave", medida: "Tribunal de Honor" },
          { infraccion: "Daños intencionales a la imagen institucional", articulo: "Arts. 5 y 31", multa: "500 Bs.", categoria: "Muy grave", medida: "Tribunal de Honor" }
        ]
      }
    ],
    disposiciones: [
      "El plazo para el pago de toda multa es de quince (15) días calendario desde la notificación, conforme al Art. 73.",
      "La falta de pago dentro del plazo dará lugar a los intereses y medidas de cobro previstas.",
      "Las faltas muy graves serán conocidas obligatoriamente por el Tribunal de Honor mediante sumario informativo (Art. 76)."
    ]
  },
  {
    id: 2,
    numero_romano: "II",
    titulo: "ESCALA DE APORTES AL FONDO DE ACCIDENTES",
    nota: "Nota: Montos propuestos conforme al Art. 13 del Reglamento Interno, sujetos a validación del Consejo de Administración y aprobación de la Asamblea General.",
    tablas: [
      {
        id: "cuadro-aportes",
        nombre: "Escala de Aportes al Fondo de Accidentes",
        columnas: ["Concepto", "Periodicidad / Hecho Generador", "Monto (Bs.)"],
        filas: [
          { concepto: "Aporte Ordinario al Fondo de Accidentes", periodicidad: "Semestral, por cada asociada o asociado activo", monto: "Bs. 50.- Anual" },
          { concepto: "Aporte Ordinario", periodicidad: "Según Resolución de Asamblea", monto: "Bs. 10.- Mensual" },
          { concepto: "Aporte Extraordinario", periodicidad: "Cuando el saldo del Fondo resulte insuficiente para cubrir una contingencia, previa Resolución de Asamblea General (Variable)", monto: "Hasta Bs. 100.- por asociado" },
          { concepto: "Fondo de Mantenimiento", periodicidad: "Mediante Resolución de Asamblea (variable)", monto: "Bs. 100.- Anual" },
          { concepto: "Forma de recaudación", periodicidad: "Descuento directo en la distribución de excedentes o pago en Tesorería dentro de los primeros cinco (5) días de cada mes", monto: "—" },
          { concepto: "Actualización económica", periodicidad: "Revisión anual por la Asamblea General Ordinaria, considerando la inflación y la disponibilidad del Fondo", monto: "—" }
        ]
      }
    ],
    disposiciones: [
      "El Fondo de Accidentes es administrado por Tesorería y fiscalizado por el Consejo de Vigilancia, conforme al Art. 13.",
      "Los recursos del Fondo se destinan exclusivamente a la atención de contingencias derivadas de accidentes de trabajo.",
      "El incumplimiento en el pago del aporte ordinario habilita su descuento directo de la distribución de excedentes."
    ]
  }
];
