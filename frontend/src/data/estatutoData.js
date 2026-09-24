/**
 * Dataset Oficial: Estatuto Orgánico de la Cooperativa Minera Aurífera
 * "Nevado Chachacomani" R.L.
 *
 * Alcance: CAPÍTULO I al CAPÍTULO VIII (Artículos 1 al 99) + DISPOSICIONES
 * FINALES (Primera, Segunda y Tercera). Estructura idéntica a la de
 * `reglamentoData.js` para que el Lector de Normativa lo consuma del mismo modo.
 */

export const ESTATUTO_METADATA = {
  nombre: "Cooperativa Minera 'Aurífera Nevado Chachacomani' R.L.",
  tipo: "Estatuto Orgánico",
  subtitulo: "Marco legal fundamental que rige la constitución, estructura orgánica, funcionamiento, patrimonio y vida institucional de la Cooperativa, conforme a la Ley General de Cooperativas N° 356 y su Decreto Supremo Reglamentario N° 1995.",
  fechaAprobacion: "Conforme a acta fundacional y reformas estatutarias aprobadas en Asamblea General",
  instancia: "Asamblea General",
  marcoLegal: "Constitución Política del Estado, Ley General de Cooperativas N° 356 y D.S. Reglamentario N° 1995",
  totalCapitulos: 8,
  totalArticulos: 99,
  totalDisposiciones: 3
};

export const ESTATUTO_CAPITULOS = [
  {
    id: 1,
    numero_romano: "I",
    numero: 1,
    titulo: "DISPOSICIONES GENERALES",
    descripcion: "Naturaleza jurídica, marco legal, denominación, domicilio, objeto social, actividades y régimen de responsabilidad de la Cooperativa.",
    articulos: [
      {
        id: 1,
        numero: 1,
        denominacion: "NATURALEZA JURÍDICA",
        contenido: "Conforme al Art. 55 y 310 de la Constitución Política del Estado y Arts. 4, 6 y 12 de la Ley General de Cooperativas, la Cooperativa Minera “Aurífera Nevado Chachacomani” R.L., es una asociación sin fines de lucro, de personas que se asocian voluntariamente, fundada en el trabajo solidario y de cooperación, para satisfacer las necesidades productivas de sus asociados, con estructura y funcionamiento autónomo democrático."
      },
      {
        id: 2,
        numero: 2,
        denominacion: "MARCO LEGAL",
        contenido: "El Estado reconoce y protege a las cooperativas como formas de trabajo solidario y de cooperación, sin fines de lucro; en tal sentido, el presente Estatuto Orgánico regula la estructura organizativa y funcionamiento de la Cooperativa Minera “Aurífera Nevado Chachacomani” R.L., en el marco de la Constitución Política del Estado Plurinacional de Bolivia, la Ley General de Cooperativas, el Decreto Supremo Reglamentario, las normas complementarias y regulatorias de la materia, las disposiciones emanadas del ente regulador de cooperativas, el presente Estatuto Orgánico, la reglamentación interna y las disposiciones legales conexas."
      },
      {
        id: 3,
        numero: 3,
        denominacion: "DENOMINACIÓN",
        contenido: "La cooperativa de primer grado se denomina Cooperativa Minera “Aurífera Nevado Chachacomani” R.L., pertenece al sector de producción y su clase es minera, está integrada por personas dedicadas a la actividad minera y se regirá por este Estatuto Orgánico, el Reglamento de la Ley General de Cooperativas, la Ley General de Cooperativas y las demás disposiciones legales que le sean aplicables."
      },
      {
        id: 4,
        numero: 4,
        denominacion: "UBICACIÓN GEOGRÁFICA Y DOMICILIO LEGAL",
        contenido: "Se encuentra ubicada en la Comunidad Chachacomani, Municipio de la Tercera Sección Batallas, Provincia Los Andes del Departamento de La Paz, lugar que a la vez se constituye en el domicilio legal de la Cooperativa."
      },
      {
        id: 5,
        numero: 5,
        denominacion: "DURACIÓN",
        contenido: "El tiempo de duración es indefinido, pudiendo disolverse en los casos previstos por la Ley General de Cooperativas."
      },
      {
        id: 6,
        numero: 6,
        denominacion: "OBJETO SOCIAL",
        contenido: "La Cooperativa Minera “Aurífera Nevado Chachacomani” R.L. tiene como objeto social la realización de actividades en toda la cadena productiva minera autorizada; consiguientemente, tendrá como actividad principal el cateo, prospección, exploración y explotación de oro."
      },
      {
        id: 7,
        numero: 7,
        denominacion: "ACTIVIDADES",
        contenido: "Para el cumplimiento de su objeto social, la Cooperativa, sin que la enumeración tenga carácter limitativo, podrá realizar las siguientes actividades:"
      },
      {
        id: 8,
        numero: 8,
        denominacion: "ESPECIFICACIONES DE ACTIVIDADES",
        contenido: "a) Todas aquellas que formen parte de la cadena productiva minera autorizada.\nb) Obtener créditos nacionales y/o extranjeros para cumplir y mejorar las actividades de producción y servicios en la cooperativa, destinadas a la adquisición de maquinarias, herramientas, medios de transporte y otros necesarios.\nc) Propiciar y difundir entre sus asociados una adecuada orientación y práctica del cooperativismo, así como de las técnicas de administración, producción y comercialización, en forma permanente y en beneficio de la cooperativa.\nd) Buscar la integración con las demás cooperativas de su clase, locales, regionales, departamentales y nacionales, con el objeto de mejorar la producción y comercialización de minerales, estableciendo relaciones sociales y económicas con otras.\ne) Obtener asistencia técnica para el logro de las actividades propuestas.\nf) Suscribir contratos de bienes y servicios con empresas de carácter público y privado, nacionales y/o internacionales, que no afecten su cualidad cooperativa.\ng) Realizar cualquier otra actividad compatible con los fines que se propone, acorde al presente Estatuto y su reglamentación."
      },
      {
        id: 9,
        numero: 9,
        denominacion: "RÉGIMEN DE RESPONSABILIDAD",
        contenido: "La responsabilidad de la Cooperativa es limitada, entendiéndose por tal que es responsable ante sus obligaciones con el fondo social."
      }
    ]
  },
  {
    id: 2,
    numero_romano: "II",
    numero: 2,
    titulo: "DE LAS ASOCIADAS Y ASOCIADOS",
    descripcion: "Admisión, requisitos, derechos, obligaciones, restricciones y formas de pérdida de la calidad de asociada y asociado.",
    articulos: [
      {
        id: 10,
        numero: 10,
        denominacion: "NÚMERO DE ASOCIADAS Y ASOCIADOS",
        contenido: "El número de asociadas y asociados es ilimitado; sin embargo, deberá ajustarse a las actividades y necesidades de la cooperativa."
      },
      {
        id: 11,
        numero: 11,
        denominacion: "REQUISITOS DE ADMISIÓN",
        contenido: "Para ser asociada o asociado de la Cooperativa, además de reunir los requisitos exigidos por la Ley General de Cooperativas, deberán cumplir con los siguientes: a) Ser mayor de 18 años. b) Suscribir y pagar un certificado de aportación. c) No pertenecer a otra cooperativa de producción. d) Ser aceptado en Asamblea General Extraordinaria. e) Cumplir con el trabajo personal en la cooperativa."
      },
      {
        id: 12,
        numero: 12,
        denominacion: "PROCEDIMIENTO PARA SER ASOCIADA Y ASOCIADO",
        contenido: "Solicitar por escrito al Consejo de Administración su inclusión y habilitación; esta instancia elevará informe detallado a la Asamblea General Extraordinaria para su aceptación o rechazo. En caso de aceptación, se mencionarán en el Acta los nombres y apellidos de las y los nuevos asociados."
      },
      {
        id: 13,
        numero: 13,
        denominacion: "OBLIGACIONES",
        contenido: "Son obligaciones de las asociadas y asociados: a) Cumplir y velar por el cumplimiento de la Ley General de Cooperativas, su Decreto Supremo Reglamentario, las disposiciones del ente regulador de Cooperativas, el presente Estatuto, el Reglamento Interno y las resoluciones de la Asamblea General, así como las disposiciones del Consejo de Administración. b) Pagar el valor del certificado de aportación y las obligaciones económicas contraídas con la cooperativa, dentro de los plazos fijados. c) Participar en forma efectiva en las actividades planificadas por la cooperativa, las que se normarán de acuerdo al Reglamento Interno. d) Asistir a las asambleas generales y reuniones que se convoquen, así como desempeñar los cargos y comisiones que les sean encomendados. e) La asociada o el asociado de nuevo ingreso compartirá plenamente las responsabilidades de todas las obligaciones anteriormente contraídas por la Cooperativa. f) Serán directamente responsables ante la cooperativa la asociada y/o el asociado que, con sus actos u omisiones, lesionen los intereses de la cooperativa."
      },
      {
        id: 14,
        numero: 14,
        denominacion: "DERECHOS",
        contenido: "I. Son derechos de las asociadas y los asociados: a) Manifestarse con libertad y ejercer el derecho de voz y voto en las asambleas, conforme al Art. 37 numeral 1 de la Ley N° 356. b) Ser elector y elegido para ocupar cargos dentro de los Consejos, comisiones o comités que establezca el presente Estatuto Orgánico o las asambleas generales. c) Proponer al Consejo de Administración cualquier asunto de interés para la cooperativa. d) Observar y fiscalizar el movimiento económico, equipo, maquinaria y auditorías específicas de anteriores gestiones de la cooperativa. e) Solicitar por escrito al Consejo de Administración la convocatoria a la Asamblea General Ordinaria o Extraordinaria, con el apoyo de la mayoría de las asociadas y asociados inscritos legalmente. f) Recibir su cuota parte de los excedentes de percepción, de acuerdo al trabajo y actividades realizadas y/o servicios prestados en la cooperativa. g) Solicitar y recibir información del funcionamiento, administración y actividades de la cooperativa. h) Recibir educación, capacitación e información en materia cooperativa. i) Recibir cuanto beneficio otorgue la cooperativa a sus asociadas y asociados. II. Los derechos descritos en el presente Estatuto no se entenderán como restrictivos de los establecidos en la Ley N° 356, su Decreto Supremo N° 1995 y otros que puedan surgir de disposiciones legales en materia de cooperativas."
      },
      {
        id: 15,
        numero: 15,
        denominacion: "RESTRICCIONES",
        contenido: "Según dispone el Artículo 37 de la Ley General de Cooperativas, ninguna asociada o asociado de la Cooperativa podrá: 1. Pertenecer a otra cooperativa de producción; 2. Pertenecer a un sindicato laboral; 3. Pertenecer a los Consejos de Administración o Vigilancia de otra cooperativa simultáneamente, en cualquier parte del país."
      },
      {
        id: 16,
        numero: 16,
        denominacion: "PÉRDIDA DE CALIDAD DE ASOCIADA Y ASOCIADO",
        contenido: "La calidad de las asociadas y asociados se pierde por las siguientes causas: 1) Por renuncia voluntaria. 2) Por exclusión. 3) Por expulsión. 4) Por abandono. 5) Por extinción de la personalidad jurídica. 6) Por muerte."
      },
      {
        id: 17,
        numero: 17,
        denominacion: "RETIRO VOLUNTARIO",
        contenido: "El retiro voluntario se regirá por las siguientes reglas: 1. Debe ser comunicado mediante nota dirigida al Consejo de Administración y aprobado mediante Asamblea General Extraordinaria. 2. En caso de que la renuncia voluntaria de uno o varios asociados a la vez ocasione impedimentos para la continuidad del funcionamiento de la Cooperativa, la Asamblea General Extraordinaria, de forma fundamentada, aplazará excepcionalmente la consideración de las mencionadas renuncias."
      },
      {
        id: 18,
        numero: 18,
        denominacion: "EXCLUSIÓN DE ASOCIADAS Y ASOCIADOS",
        contenido: "La exclusión de una asociada o asociado será determinada en los siguientes casos: a) Por actuar en forma contraria a los intereses de la cooperativa o cometer actos que repercutan en contra del buen prestigio de la cooperativa y de los asociados. b) Por negarse a cumplir con sus aportaciones u obligaciones contraídas con la cooperativa, así como prestar sus servicios conforme disponga la Asamblea General y los Consejos directivos, salvo casos justificados. c) Por incumplimiento reiterado de las disposiciones estatutarias y de los Consejos directivos."
      },
      {
        id: 19,
        numero: 19,
        denominacion: "EXPULSIÓN",
        contenido: "La expulsión procederá por las siguientes causales: a) Por dedicarse al rescate y desvío clandestino de minerales y ocultación de la producción. b) Por negociar, sin conocimiento de la cooperativa, los artículos, insumos, herramientas y otros bienes que adquiera la cooperativa. c) Por usar los recursos económicos de la cooperativa en fondos no autorizados por la Asamblea General y el presente Estatuto, salvo casos excepcionales de extrema necesidad. d) Por realizar actividades que causen daño al patrimonio social, a la honorabilidad de los Consejos, de los asociados y al prestigio de la cooperativa. e) Por acciones divisionistas o que violenten la unidad de la cooperativa, antes de manifestarse sobre cualquier problema en la Asamblea General. f) Por ingresar a otro tipo de sociedad y/o cooperativa minera de la misma actividad."
      },
      {
        id: 20,
        numero: 20,
        denominacion: "ABANDONO",
        contenido: "Cuando sea necesario, el Consejo de Administración convocará a Asamblea General Extraordinaria para que defina sobre la pérdida de calidad de asociado de quienes hayan abandonado por más de 90 días sin que medie causa justificada."
      },
      {
        id: 21,
        numero: 21,
        denominacion: "MUERTE DE ASOCIADA O ASOCIADO",
        contenido: "En caso de fallecimiento de una asociada o asociado, los aportes y excedentes de percepción que pudieran corresponderle pasarán a sus sucesores, quienes deberán designar a uno de ellos para asumir la titularidad del Certificado de Aportación, previa presentación de la aceptación de herencia, requisito con el cual la Cooperativa procederá al cambio de nombre del titular del Certificado de Aportación, de acuerdo al presente Estatuto Orgánico."
      },
      {
        id: 22,
        numero: 22,
        denominacion: "OBLIGACIÓN DE REGISTRO",
        contenido: "En los casos de retiro o renuncia voluntaria, expulsión, exclusión, abandono y muerte, el Consejo de Administración remitirá los antecedentes o la resolución, según corresponda, a conocimiento de la Autoridad de Fiscalización y Control de Cooperativas (AFCOOP), a efectos de su registro."
      },
      {
        id: 23,
        numero: 23,
        denominacion: "DERECHO A LA DEVOLUCIÓN DEL VALOR DEL CERTIFICADO DE APORTACIÓN",
        contenido: "I. La pérdida de la calidad de asociado por renuncia voluntaria, expulsión, abandono o extinción de la personalidad jurídica dará lugar a la devolución obligatoria del certificado de aportación que hubiera pagado, más los excedentes si los hubiera, previo descuento de toda deuda que tuviera la asociada o asociado con la cooperativa. En caso de muerte, si el o los herederos decidieran la no permanencia en la cooperativa, se procederá a la devolución referida. II. Si transcurridos dos años, computables a partir de la desvinculación de la Cooperativa, las asociadas o asociados no reclaman la devolución del valor del certificado de aportación, este prescribirá a favor del Fondo Social de la Cooperativa. III. El procedimiento para la devolución del Certificado de Aportación comenzará con la nota de solicitud al presidente del Consejo de Administración, quien instruirá al Tesorero un informe pormenorizado de activos y pasivos, informe que será elevado a la Asamblea General."
      },
      {
        id: 24,
        numero: 24,
        denominacion: "REINCORPORACIÓN",
        contenido: "La asociada o asociado que voluntariamente deje de pertenecer a la cooperativa y desee reincorporarse deberá cumplir los mismos requisitos exigidos a las nuevas asociadas y asociados, y ser aceptado mediante resolución de la Asamblea General Extraordinaria."
      }
    ]
  },
  {
    id: 3,
    numero_romano: "III",
    numero: 3,
    titulo: "DEL FONDO SOCIAL Y PATRIMONIO DE LA COOPERATIVA",
    descripcion: "Fondo social, Certificados de Aportación y Participación, clases de aportaciones, reservas, fondos y distribución de excedentes.",
    articulos: [
      {
        id: 25,
        numero: 25,
        denominacion: "DEL FONDO SOCIAL",
        contenido: "El fondo social de la cooperativa es variable e ilimitado, constituido por certificados de aportación nominativos y transferibles conforme a la Ley General de Cooperativas y su Decreto Supremo Reglamentario, con un valor unitario de Bs. 10.000.- (monto consignado en el Certificado de Aportación de la Cooperativa), el cual además será incrementado por: a. El valor de los certificados de aportación suscritos y pagados. b. El valor del inventario de bienes muebles, inmuebles y otros sujetos a registro. c. Los créditos, subvenciones y donativos que se hagan a favor de la cooperativa. d. Los fondos de reserva y otros utilizados para los fines creados, con el porcentaje de los excedentes que se destinen para este objetivo."
      },
      {
        id: 26,
        numero: 26,
        denominacion: "CERTIFICADO DE APORTACIÓN",
        contenido: "I. Los certificados de aportación son nominativos, indivisibles y solo transferibles en las condiciones que determina la Ley General de Cooperativas, su Decreto Supremo Reglamentario, el presente Estatuto y el Reglamento Interno. Pueden ser pagados en dinero efectivo, en bienes negociables y en trabajo personal. II. El valor de los certificados de aportación podrá ser modificado de acuerdo a la reglamentación interna y aprobado por Asamblea General Ordinaria. El nuevo valor será aplicado a las nuevas incorporaciones de asociadas y asociados a partir de la aprobación de su inclusión en la Asamblea General Extraordinaria."
      },
      {
        id: 27,
        numero: 27,
        denominacion: "CLASES DE APORTACIONES",
        contenido: "Las aportaciones que no son en dinero, sino en especie y fuerza de trabajo, serán valuadas conforme a una escala de costos del sector cooperativo, tomando en cuenta los valores comerciales y del mercado laboral, hasta cubrir el monto del Certificado de Aportación."
      },
      {
        id: 28,
        numero: 28,
        denominacion: "CARACTERÍSTICAS, ALCANCE Y CONTENIDO DEL CERTIFICADO DE APORTACIÓN",
        contenido: "El certificado de aportación deberá consignar mínimamente las siguientes especificaciones: 1. Denominación; 2. Número de registro de la Cooperativa en la AFCOOP; 3. Clase y domicilio de la Cooperativa; 4. Fecha de su constitución; 5. Nombre de la asociada o asociado; 6. Numeración correlativa; 7. Valor del certificado; 8. Fecha de su otorgamiento; 9. Firmas del presidente, secretario y tesorero del Consejo de Administración; 10. Aquellas dispuestas por la Autoridad de regulación sectorial correspondiente."
      },
      {
        id: 29,
        numero: 29,
        denominacion: "CERTIFICADOS DE PARTICIPACIÓN",
        contenido: "Con el objeto de incrementar recursos para el financiamiento de las operaciones, se emitirán certificados de participación, que pueden ser cubiertos por los asociados o por personas ajenas a la cooperativa, los cuales devengarán un interés no superior al legal."
      },
      {
        id: 30,
        numero: 30,
        denominacion: "REGLAS DE LOS CERTIFICADOS DE PARTICIPACIÓN",
        contenido: "a. Devengar un interés en favor de su tenedor, establecido en el Reglamento Interno. b. No podrán ser emitidos con plazo superior a diez (10) años. c. Tendrán calidad de documento ejecutivo. d. Los casos de mora en su devolución y pago de intereses se contemplarán en el Reglamento Interno."
      },
      {
        id: 31,
        numero: 31,
        denominacion: "TRANSFERENCIA DEL CERTIFICADO DE APORTACIÓN",
        contenido: "I. Las transferencias de los certificados de aportación se harán mediante solicitud escrita al Consejo de Administración, firmada por los interesados. II. Una vez aceptada, la solicitud debe ser aprobada por la Asamblea General Extraordinaria y asentada en acta, procediéndose a su registro correspondiente en la cooperativa y posterior inscripción ante la Autoridad de Fiscalización y Control de Cooperativas (AFCOOP)."
      },
      {
        id: 32,
        numero: 32,
        denominacion: "PROPIEDAD COLECTIVA E INDIVIDUAL",
        contenido: "I. La propiedad colectiva —los recursos provenientes de las aportaciones de las asociadas y asociados, así como los bienes inmuebles, muebles, donaciones, reservas, fondos y ahorros de la Cooperativa— es de propiedad conjunta y colectiva de todas sus asociadas y asociados. No podrá ser afectada por ninguna clase de deudas, obligaciones y compromisos de carácter personal o unilateral que contraigan sus asociadas, asociados, consejeras y consejeros. II. La propiedad individual es todo instrumento de trabajo que pasa a formar parte del patrimonio personal de cada asociada y/o asociado."
      },
      {
        id: 33,
        numero: 33,
        denominacion: "EXCEDENTES DE PERCEPCIÓN",
        contenido: "I. Son los recursos resultantes de las actividades de la cooperativa, una vez deducida la totalidad de los gastos, costos, tributos, fondos, reservas legales y estatutarias, y otras reservas, previsiones o provisiones determinadas en Asamblea General. II. En aplicación del principio de equidad en la distribución, los excedentes de percepción se repartirán entre las asociadas y los asociados en razón a su participación en el trabajo, y de acuerdo al Estatuto Orgánico y Reglamento."
      },
      {
        id: 34,
        numero: 34,
        denominacion: "CONSTITUCIÓN DE RESERVA Y FONDOS",
        contenido: "La Cooperativa está obligada a constituir los siguientes fondos no repartibles, con la siguiente forma de distribución: 1. Reserva Legal: se conformará con un mínimo del diez por ciento (10%) de los Estados Financieros. 2. Fondo de Educación: se destinará el cinco por ciento (5%) de los Estados Financieros. 3. Fondo de Previsión Social y Apoyo a la Colectividad: se constituirá con el cinco por ciento (5%) de los Estados Financieros. 4. 20% de reserva voluntaria, que servirá para fortalecer el patrimonio y/o afrontar las pérdidas que hubiere como resultado de futuros ejercicios económicos. 5. 60% para la distribución entre las asociadas y asociados y/o previsiones que resuelva la Asamblea General Ordinaria, a propuesta del Consejo de Administración."
      },
      {
        id: 35,
        numero: 35,
        denominacion: "USO DE LA RESERVA Y FONDOS OBLIGATORIOS",
        contenido: "La forma de organizar y utilizar la reserva y los fondos obligatorios señalados en el Artículo anterior deberá fijarse tomando en cuenta: 1. La necesidad de incrementar la Reserva Legal hasta alcanzar, por lo menos, el veinticinco por ciento (25%) del Fondo Social. 2. La necesidad de ampliación de los Fondos de Educación y de Previsión Social y Apoyo a la Colectividad, como medio para aumentar la capacidad de servicios de la cooperativa hacia sus asociadas y asociados y hacia la colectividad. En caso de superarse el porcentaje de la Reserva Legal, el excedente se destinará a incrementar estos fondos."
      },
      {
        id: 36,
        numero: 36,
        denominacion: "RESERVA LEGAL",
        contenido: "La Reserva Legal se constituye para prevenir riesgos y afrontar las pérdidas y/o siniestros que hubiere. Los recursos utilizados de esta reserva se reconstituirán en los términos de la Ley General de Cooperativas, su Decreto Supremo Reglamentario y el Estatuto Orgánico y/o Reglamento."
      },
      {
        id: 37,
        numero: 37,
        denominacion: "FONDO DE PREVISIÓN SOCIAL Y APOYO A LA COLECTIVIDAD",
        contenido: "El Fondo de Previsión Social y Apoyo a la Colectividad tendrá por objeto proporcionar el mayor bienestar social a las asociadas y los asociados, sus beneficiarios y la colectividad, en el marco de la Ley General de Cooperativas, el Decreto Supremo Reglamentario, el Estatuto Orgánico y sus Reglamentos."
      },
      {
        id: 38,
        numero: 38,
        denominacion: "ADMINISTRACIÓN DEL FONDO DE EDUCACIÓN",
        contenido: "I. La realización de las actividades señaladas en el Art. 46 de la Ley N° 356, de 11 de abril de 2013, Ley General de Cooperativas, estará a cargo de la Cooperativa, que será la encargada de administrar los recursos del Fondo de Educación Cooperativo. Estas actividades son obligatorias para la Cooperativa. II. La Cooperativa podrá suscribir convenios con instituciones nacionales e internacionales legalmente reconocidas, para la realización de las actividades educativas, en conformidad con el Estatuto Orgánico y los Reglamentos de la Cooperativa. III. La Cooperativa, de forma individual o mediante convenios entre cooperativas, podrá establecer unidades o departamentos especializados en Educación Cooperativa. IV. El importe de este Fondo que no se haya aplicado en una gestión deberá materializarse necesariamente dentro del ejercicio económico de la siguiente gestión. De no procederse en este sentido, serán pasibles de las sanciones dispuestas por la AFCOOP."
      },
    ]
  },
  {
    id: 4,
    numero_romano: "IV",
    numero: 4,
    titulo: "FUNCIONAMIENTO Y LA ADMINISTRACIÓN",
    descripcion: "Asamblea General, Consejo de Administración, Consejo de Vigilancia, Comités, Gerencia y reglas de funcionamiento de la Cooperativa.",
    articulos: [
      {
        id: 39,
        numero: 39,
        denominacion: "ESTRUCTURA",
        contenido: "La estructura organizativa de la cooperativa (Artículo 50 de la Ley General de Cooperativas) estará compuesta por: a) La Asamblea General. b) El Consejo de Administración. c) El Consejo de Vigilancia. d) El Tribunal de Honor. e) La Junta de Conciliación. f) Comisiones o Comités que establezcan las asambleas generales de acuerdo a la necesidad emergente."
      },
      {
        id: 40,
        numero: 40,
        denominacion: "ASAMBLEA GENERAL",
        contenido: "La Asamblea General es soberana y suprema, y sus resoluciones tendrán carácter obligatorio para todas las asociadas y asociados, presentes y ausentes, conforme establece el presente Estatuto, mientras no contraríen las disposiciones legales de la Ley General de Cooperativas, su Decreto Supremo Reglamentario y las disposiciones del ente regulador de cooperativas."
      },
      {
        id: 41,
        numero: 41,
        denominacion: "CLASES DE ASAMBLEAS",
        contenido: "Las asambleas generales podrán ser ordinarias y extraordinarias. Las asambleas ordinarias se realizarán por lo menos una vez al año; las extraordinarias se realizarán cuantas veces sea necesario para la buena marcha de la cooperativa."
      },
      {
        id: 42,
        numero: 42,
        denominacion: "CONVOCATORIA",
        contenido: "I. Corresponde al Consejo de Administración convocar a las Asambleas Generales Ordinarias y Extraordinarias, bajo responsabilidad y sanción; la convocatoria debe estar firmada por el Consejo de Administración y emitida con 10 días de anticipación. II. Toda convocatoria a Asamblea General Ordinaria o Extraordinaria será por escrito, dando a conocer el orden del día a considerarse y fijando el lugar, fecha y hora. III. De no darse cumplimiento a lo establecido anteriormente, corresponderá la aplicación de lo dispuesto por el Art. 55 de la Ley General de Cooperativas y el Art. 36, parágrafo V, del Decreto Supremo Reglamentario."
      },
      {
        id: 43,
        numero: 43,
        denominacion: "QUÓRUM",
        contenido: "La Asamblea General Ordinaria o Extraordinaria se efectuará con la asistencia del 50% más uno de las asociadas y asociados legalmente registrados. Si a la fecha y hora señaladas no se hubiera alcanzado el quórum correspondiente, se llevará a cabo después de 30 minutos con el número de asociadas y asociados asistentes, previsión que será dada a conocer en la convocatoria."
      },
      {
        id: 44,
        numero: 44,
        denominacion: "DECISIONES Y NÚMERO DE VOTOS",
        contenido: "I. Los acuerdos y resoluciones de las Asambleas Generales Ordinarias y Extraordinarias se tomarán por simple mayoría de votos, salvo en los casos que se requieran dos tercios, haciéndose constar en el Libro de Actas con la firma del Consejo de Administración y del Consejo de Vigilancia. II. Los miembros de los Consejos de Administración, Vigilancia, Tribunal de Honor, comisiones y comités no podrán votar en las asambleas generales en las que se considere la aprobación de los Estados Financieros y otros temas relacionados con la responsabilidad de los miembros del Consejo de Administración, Vigilancia, comités y Tribunal de Honor."
      },
      {
        id: 45,
        numero: 45,
        denominacion: "ATRIBUCIONES DE LAS ASAMBLEAS",
        contenido: "Son atribuciones de la Asamblea: 1. Ordinaria: Conocer y pronunciarse sobre las cuentas, la memoria anual, los informes de actividades de ambos Consejos, gerencia y comités. a. Conocer y pronunciarse sobre los estados financieros de la gestión económica, previo pronunciamiento del Consejo de Vigilancia y de auditoría, cuando corresponda. b. Considerar y pronunciarse sobre las políticas y planes de trabajo, programas y proyectos que presente el Consejo de Administración. c. Considerar y aprobar el Plan de Operaciones y Presupuesto de la siguiente gestión. d. Elegir a los miembros de los Consejos de Administración y Vigilancia, comités o comisiones, Tribunal de Honor y Junta de Conciliación. e. Remover a los miembros de los Consejos de Administración y Vigilancia, comités o comisiones y Tribunal de Honor, conforme establece el presente Estatuto. f. Determinar el destino de los excedentes de percepción y el porcentaje del mismo, de acuerdo a las normas establecidas en la Ley General de Cooperativas y el presente Estatuto. g. Deliberar y resolver sobre las propuestas que presenten el Consejo de Administración, el Consejo de Vigilancia, los comités o las asociadas y asociados ante la Asamblea. h. Conocer y aprobar la valorización de los certificados de aportación. i. Aprobar, cuando corresponda, las asignaciones para las consejeras y los consejeros, los integrantes del Tribunal de Honor y los integrantes de los diferentes comités y comisiones. j. Analizar y aprobar resoluciones, conclusiones, recomendaciones y tareas en ejercicio de su mandato. k. Fijar aportes y contribuciones económicas ordinarias y extraordinarias. l. Determinar por resolución la aprobación o rechazo de las actividades de gestión de los Consejos. m. Conocer y resolver todos los asuntos que no estén dentro de las competencias de los otros órganos de gobierno de la cooperativa. n. Otras establecidas en la Ley General de Cooperativas y su Decreto Supremo Reglamentario. 2. Extraordinaria: a. Autorizar la enajenación de bienes de la Cooperativa, la realización de inversiones y el endeudamiento de la Cooperativa que estén por encima de los límites establecidos para el Consejo de Administración, conforme al Reglamento Interno. b. Aprobar emprendimientos asociativos, convenios, contratos y acuerdos que cuenten con estudios y/o justificaciones que demuestren su viabilidad social y económica. c. Considerar y resolver los actos de los integrantes de los Consejos de Administración y Vigilancia contrapuestos al Estatuto Orgánico, la Ley General de Cooperativas y disposiciones conexas y complementarias. d. Remover a los miembros de los Consejos de Administración y Vigilancia, conforme establece el presente Estatuto. e. Aprobar la inclusión de asociadas y asociados, cuando corresponda. f. Ejercer la función de instancia de apelación en última instancia respecto de las resoluciones sancionatorias emitidas por el Tribunal de Honor, revocando, anulando, modificando o confirmando las mismas, en el marco de los principios del debido proceso, la Ley N° 356 y su Reglamento; emitiendo a tal fin la resolución correspondiente. g. Aprobar la exclusión o expulsión de asociadas y asociados, cuando corresponda. h. Aprobar la fusión, disolución, escisión, cambio de nombre u otro cambio sustancial de la Cooperativa, por dos tercios de votos de las asociadas y asociados asistentes a la Asamblea. i. Considerar las modificaciones o reformas al Estatuto Orgánico, con la aprobación de dos tercios de votos de las asociadas y asociados asistentes en la Asamblea. j. Dictar resoluciones relativas a cualquier problema establecido en el temario. k. Determinar por resolución la ampliación de las actividades de la cooperativa. l. Crear nuevas secciones de acuerdo a las disposiciones de la Asamblea General y a las disponibilidades y posibilidades de trabajo. m. Elegir a los delegados a los congresos. n. Considerar y tratar temas de carácter orgánico, disciplinario, o cualquier otro asunto para la buena marcha de la Cooperativa, que no sea de competencia de la Asamblea Ordinaria. o. Otras atribuciones establecidas en la Ley General de Cooperativas y su Decreto Supremo Reglamentario."
      },
      {
        id: 46,
        numero: 46,
        denominacion: "DE LOS CONSEJOS DE ADMINISTRACIÓN Y VIGILANCIA",
        contenido: "La elección para el Consejo de Administración y Vigilancia será por simple mayoría de votos, conforme a la reglamentación específica para el acto eleccionario."
      },
      {
        id: 47,
        numero: 47,
        denominacion: "ASIGNACIONES ECONÓMICAS",
        contenido: "Los miembros titulares del Consejo de Administración y del Consejo de Vigilancia podrán gozar de una asignación o compensación económica por su dedicación y desempeño de funciones, de acuerdo a la realidad económica de la cooperativa, incorporada en el presupuesto anual."
      },
      {
        id: 48,
        numero: 48,
        denominacion: "INDEPENDENCIA DE GESTIÓN",
        contenido: "La gestión de los Consejos de Administración y Vigilancia de la Cooperativa debe respetar la independencia, coordinación y cooperación en el desarrollo de las funciones de ambos consejos, en el ámbito de sus atribuciones y competencias establecidas en la Ley N° 356, su Decreto Supremo Reglamentario, el Estatuto Orgánico y el Reglamento Interno."
      },
      {
        id: 49,
        numero: 49,
        denominacion: "REQUISITOS",
        contenido: "Para ser elegido miembro del Consejo de Administración o Vigilancia, la asociada o asociado deberá cumplir los siguientes requisitos: a) Ser asociada o asociado en pleno desempeño de su trabajo personal en la cooperativa. b) Estar al día en el cumplimiento de las obligaciones con la cooperativa. c) Ser ciudadana o ciudadano boliviano, residente en el país, y estar en pleno ejercicio de los derechos constitucionales. d) No desempeñar cargos directivos en partidos políticos ni ocupar cargos jerárquicos en entidades públicas o privadas incompatibles con el cooperativismo. e) No ser trabajador en relación de dependencia laboral con la cooperativa. f) No ser cónyuge ni pariente de alguno de los miembros de los Consejos de Administración y Vigilancia, ni de cargos ejecutivos, hasta el segundo grado de consanguinidad y afinidad. g) No haber participado en acciones contrarias a los valores, principios e intereses de alguna cooperativa. h) No tener sentencia ejecutoriada en materia penal. i) Contar con conocimientos en cooperativismo debidamente acreditados. j) Tener 2 años de antigüedad como mínimo. k) No tener conflicto de intereses, asuntos litigiosos o deudas en mora con la cooperativa. l) No estar suspendido mediante resolución emitida por el Tribunal de Honor."
      },
      {
        id: 50,
        numero: 50,
        denominacion: "REMOCIÓN",
        contenido: "Los miembros del Consejo de Administración y Vigilancia podrán ser removidos de sus cargos por Asamblea General Ordinaria o Extraordinaria, por dos terceras partes de los votos de las asociadas y asociados presentes, previo sumario convocado para tal objeto, por las siguientes causas: Para ambos Consejos: a. Por inasistencia a 3 reuniones continuas o 6 discontinuas sin la licencia respectiva. b. Por retrasar intencionalmente la convocatoria a Asamblea General Ordinaria. c. Por daños económicos y sociales causados a la Cooperativa. d. Por incumplimiento de la Ley General de Cooperativas, el presente Estatuto, el Reglamento Interno y las resoluciones tomadas en Asamblea General. e. Por negligencia, irresponsabilidad o abuso en el cumplimiento de sus funciones y obligaciones. f. Por contar con sentencia ejecutoriada resultado de un proceso civil o penal, en cuyo caso se aplicará la remoción tácita. g. Otras establecidas en la Ley General de Cooperativas y su Reglamento. Para el Consejo de Administración, adicionalmente: a. Por resistencia a rendir cuentas del manejo de los fondos de la Cooperativa. b. Por conducir la administración de la Cooperativa en forma irresponsable, debidamente comprobada. Para el Consejo de Vigilancia, adicionalmente: Por no observar las resoluciones del Consejo de Administración que sean perjudiciales a los intereses de la Cooperativa, en forma escrita."
      },
      {
        id: 51,
        numero: 51,
        denominacion: "PROHIBICIONES",
        contenido: "Las prohibiciones para ser consejera o consejero son: 1. Tener conflicto de intereses, asuntos litigiosos o deudas en mora con la Cooperativa. 2. Encontrarse suspendida o suspendido mediante resolución emitida por el Tribunal de Honor correspondiente, y agotadas todas las instancias previstas en su Estatuto Orgánico. 3. Incumplir lo establecido por el Artículo 65 de la Ley N° 356 y la normativa sectorial correspondiente."
      },
      {
        id: 52,
        numero: 52,
        denominacion: "CONSEJO DE ADMINISTRACIÓN Y SU CONFORMACIÓN",
        contenido: "El Consejo de Administración es el órgano ejecutivo y representativo de la Cooperativa, en número impar, y estará conformado por Presidencia, Secretaría General, Tesorería y dos Vocales."
      },
      {
        id: 53,
        numero: 53,
        denominacion: "DURACIÓN DEL MANDATO",
        contenido: "La gestión administrativa tendrá una duración de 2 años calendario, pudiendo ser reelectos por un periodo consecutivo como máximo, pudiendo reasumir nuevamente en otras gestiones, pasando como mínimo un periodo desde la dejación del cargo."
      },
      {
        id: 54,
        numero: 54,
        denominacion: "REUNIONES DE LOS CONSEJEROS",
        contenido: "I. El Consejo de Administración se reunirá una vez al mes y, de manera extraordinaria, cuantas veces sea necesario, a convocatoria del Presidente o a solicitud de la mitad más uno de sus miembros. II. El quórum legal estará constituido por la mitad más uno de sus miembros, y sus acuerdos constarán en un libro de actas con la firma de todos los asistentes a la reunión."
      },
      {
        id: 55,
        numero: 55,
        denominacion: "ATRIBUCIONES DEL CONSEJO DE ADMINISTRACIÓN",
        contenido: "a. Cumplir la Ley General de Cooperativas, su Decreto Supremo Reglamentario, el presente Estatuto y las disposiciones legales respecto al funcionamiento de la cooperativa. b. Ejercer la administración y representación legal de la cooperativa. c. Convocar a Asambleas Generales Ordinarias y Extraordinarias. d. Ejecutar las determinaciones aprobadas por las Asambleas Generales. e. Ejecutar las recomendaciones de las auditorías internas y externas, así como del ente regulador de cooperativas. f. Aprobar la estructura administrativa de la cooperativa y definir los niveles salariales de los empleados administrativos, si los hubiere. g. Definir las políticas económicas, administrativas y financieras en el marco de los lineamientos establecidos por la Asamblea General y las normas de regulación. h. Definir el plan operacional anual de la cooperativa y ponerlo en consideración de la Asamblea General Ordinaria de Asociados para su aprobación. i. Proponer a la Asamblea General Ordinaria la aprobación del valor o la revaloración de los certificados de aportación, así como el valor de los certificados de aportación que no sean en efectivo. j. Decidir, conforme a los límites establecidos en el Reglamento Interno, sobre la compra-venta, permuta, donaciones y la contracción de préstamos por sumas que no comprometan la estabilidad económica de la cooperativa, poniendo el hecho en conocimiento de la Asamblea General (incluye decidir sobre gastos de equipos, insumos, materiales, transporte, adquisición de bienes muebles y otros necesarios para mejorar el funcionamiento administrativo). k. Delegar funciones para la gestión administrativa al gerente. l. Presentar anualmente ante la Asamblea General Ordinaria los Estados Financieros, la Memoria Anual y el Plan Operativo correspondiente, para su consideración y aprobación. m. Llevar un Registro de asociadas y asociados. n. Planificar y organizar el funcionamiento de cada una de las secciones de la Cooperativa, para su aprobación en la Asamblea General. o. Hacer cumplir las sanciones a las asociadas y asociados que infrinjan el Estatuto y otras disposiciones, de acuerdo al Reglamento Interno de la Cooperativa. p. Llevar un inventario y custodiar todos los bienes de la Cooperativa. q. Inscribir todas las actas registrables de la Cooperativa ante el ente regulador de cooperativas. r. Elevar ante la Asamblea General Extraordinaria las solicitudes de admisión e inclusión, y los procesos de exclusión y expulsión de asociados, para su consideración. s. Presentar, a requerimiento del Consejo de Vigilancia, toda la información documentada generada por la administración de la cooperativa. t. Elevar informe y convocar al Tribunal de Honor para el procesamiento disciplinario por contravenciones. u. Otras establecidas por la Ley General de Cooperativas y su Decreto Supremo Reglamentario."
      },
      {
        id: 56,
        numero: 56,
        denominacion: "RESPONSABILIDAD",
        contenido: "Los miembros del Consejo de Administración son solidariamente responsables de: a. El manejo de fondos y el destino de los mismos. b. La efectividad de las aportaciones de los asociados. c. La existencia de los libros, registros contables y otros que se hallan establecidos en el presente Estatuto. d. La veracidad de los saldos de los diferentes fondos y cuentas de los excedentes obtenidos y de las pérdidas sufridas. e. El cumplimiento de las obligaciones que imponen las disposiciones legales que rigen a las cooperativas. f. Los trabajos autorizados por la Asamblea General."
      },
      {
        id: 57,
        numero: 57,
        denominacion: "PRESIDENTE",
        contenido: "Son atribuciones del Presidente: a) Ejercer la representación legal de la cooperativa en todos los actos cooperativos, administrativos y legales, de carácter público y privado. b) Presidir y dirigir las Asambleas Generales, las reuniones del Consejo de Administración y cualquier otro acto oficial de la Cooperativa. c) Firmar con la Tesorera o Tesorero todos los documentos que importen obligaciones y contratos comerciales, bancarios y otros inherentes a las actividades económicas de la Cooperativa. d) Supervisar que los libros contables de la Cooperativa sean llevados correctamente. e) Nombrar, promover y cesar a los trabajadores y/o empleados administrativos, con arreglo a las leyes sociales. f) Elaborar los informes solicitados por los Consejos y Comités, así como asistir a las reuniones y Asambleas. g) Elaborar el plan anual operativo para su consideración en el Consejo de Administración. h) Firmar con la Secretaria o Secretario General la correspondencia general y cualquier otro documento que así se requiera. i) Poner en conocimiento del Consejo de Vigilancia las disposiciones, acuerdos y resoluciones emitidas."
      },
      {
        id: 58,
        numero: 58,
        denominacion: "DE LA SECRETARIA O SECRETARIO GENERAL",
        contenido: "Podrá ejercer las funciones del presidente en ausencia de este. Sus atribuciones son: a) Redactar y firmar con el presidente las actas, los registros, memorias, informes, resoluciones y convocatorias a asambleas generales, reuniones del Consejo de Administración y reuniones conjuntas de ambos Consejos. b) Llevar en orden correlativo los archivos de la documentación oficial de la cooperativa. c) Tener al día los libros de actas, registros de asociadas y asociados, y otros."
      },
      {
        id: 59,
        numero: 59,
        denominacion: "TESORERO",
        contenido: "Se constituye en responsable del manejo de los recursos económicos y de llevar correctamente los libros de contabilidad y la documentación de las operaciones que realice la cooperativa, así como de presentar rendición de cuentas en cualquier momento que lo solicite la Asamblea General y/o los Consejos. Tiene las siguientes funciones: a) Velar por la correcta inversión de los fondos conforme al presupuesto anual. b) Informar, cuando lo requiera el Consejo de Administración, sobre el estado económico de la cooperativa. c) Llevar el control de los libros de contabilidad, de caja y la respectiva documentación contable. d) Coordinar y hacer seguimiento de la elaboración de los Estados Financieros cuando finalice la gestión económica. e) Proporcionar información al Consejo de Administración y de Vigilancia para los arqueos de caja que se le practiquen. f) Depositar en la cuenta bancaria de la cooperativa, o tenerlos bajo custodia documentada, los fondos recaudados. g) Firmar cheques y comprobantes con el presidente de la Cooperativa. h) Recaudar los ingresos de la Cooperativa, cobrar los adeudos y, en su caso, efectuar los pagos que correspondan. i) Tener en su custodia y bajo su responsabilidad todos los bienes de la Cooperativa, bajo minucioso inventario valorado."
      },
      {
        id: 60,
        numero: 60,
        denominacion: "VOCAL",
        contenido: "Son atribuciones de los Vocales: a) Reemplazar o cubrir las acefalías que se produjeran por alguna causa dentro del Consejo, exceptuando al Presidente, hasta que en Asamblea General Ordinaria se elija al titular. b) Cumplir con las asignaciones que se les delegue."
      },
      {
        id: 61,
        numero: 61,
        denominacion: "GERENCIA",
        contenido: "I. El Consejo de Administración podrá contar con un Gerente o Gerenta, quien dirigirá las actividades operativas de la institución, velando por los intereses de la misma. El Gerente podrá concurrir a las reuniones que celebre el Consejo de Administración y a la Asamblea General, únicamente con voz y sin voto. II. El gerente se constituirá en instancia operativa del Consejo de Administración, de acuerdo con las disposiciones, instrucciones, deberes y atribuciones que le señale el presente Estatuto y le delegue el Consejo de Administración. III. Para ser gerente debe acreditar suficiente capacidad profesional y técnica para el desempeño del cargo, siendo sus atribuciones, deberes y responsabilidades los establecidos en el Reglamento Interno correspondiente. IV. Ni el gerente ni los empleados administrativos de la cooperativa podrán dedicarse, por cuenta propia ni ajena, a trabajo o negocio similar que tenga relación con el giro de la cooperativa."
      },
      {
        id: 62,
        numero: 62,
        denominacion: "CONSEJO DE VIGILANCIA Y SU CONFORMACIÓN",
        contenido: "El Consejo de Vigilancia es el órgano de control y fiscalización del manejo económico-financiero, legal y del funcionamiento de la cooperativa; vela porque el Consejo de Administración y las asociadas y asociados cumplan con la normativa vigente y el presente Estatuto. El número de miembros debe ser impar y estará integrado por un Presidente, un Secretario y un Vocal, elegidos en Asamblea General por un periodo de 2 años, pudiendo ser reelegidos por un solo periodo consecutivo."
      },
      {
        id: 63,
        numero: 63,
        denominacion: "REUNIONES",
        contenido: "I. El Consejo de Vigilancia se reunirá una vez al mes y, de manera extraordinaria, cuantas veces sea necesario, a convocatoria del Presidente o a solicitud de la mitad más uno de sus miembros. II. El quórum legal estará constituido por la mitad más uno de sus miembros, y sus acuerdos constarán en un libro de actas con la firma de todos los asistentes a la reunión."
      },
      {
        id: 64,
        numero: 64,
        denominacion: "ATRIBUCIONES DEL CONSEJO DE VIGILANCIA",
        contenido: "a. Ejercer el control y fiscalización del manejo económico-financiero, legal y de funcionamiento de la cooperativa. b. Tener acceso a toda la información documentada generada por la administración de la cooperativa, a través del Consejo de Administración. c. Vigilar y verificar que el patrimonio de la cooperativa sea debidamente registrado, valorado y salvaguardado. d. Vigilar que la información contable generada sea transparente, completa, oportuna y veraz. e. Vigilar que el Consejo de Administración y los comités cumplan con las funciones establecidas en el Estatuto Orgánico, los reglamentos internos y las resoluciones de la Asamblea General. f. Convocar a la Asamblea General Ordinaria cuando el Consejo de Administración no lo haga en los plazos y formas establecidos por el Artículo 55 de la Ley N° 356 y el presente Estatuto. g. Seleccionar al auditor interno y/o externo, de acuerdo al Estatuto Orgánico y la normativa vigente. h. Hacer seguimiento al cumplimiento de las recomendaciones de los informes de auditoría interna y/o externa. i. Supervisar el trabajo de la auditoría interna de la cooperativa, aprobando su plan anual de trabajo, cuando corresponda. j. Practicar arqueos de caja de forma sorpresiva, cuantas veces sea necesario. k. Verificar los saldos de las cuentas, los inventarios de existencias y los Activos Fijos valorados. l. Emitir informes y dictámenes sobre las actividades y decisiones del Consejo de Administración, que serán puestos en conocimiento de la Asamblea General para la toma de decisiones. m. Reportar oportunamente a la Asamblea General sobre las infracciones que no hayan sido absueltas o resueltas por el Consejo de Administración. n. Cumplir otras atribuciones establecidas en la Ley General de Cooperativas, su Reglamento, el presente Estatuto, los reglamentos internos y las que le señale la Asamblea General. o. Elevar informe y convocar al Tribunal de Honor para el procesamiento disciplinario por contravenciones. p. Otras establecidas en la Ley General de Cooperativas, su Decreto Reglamentario y el presente Estatuto."
      },
      {
        id: 65,
        numero: 65,
        denominacion: "RESPONSABILIDAD",
        contenido: "Los miembros del Consejo de Vigilancia, en caso de incumplimiento de sus funciones y atribuciones, son responsables conjunta y solidariamente de la gestión administrativa, legal, económica, financiera y contable del Consejo de Administración."
      },
      {
        id: 66,
        numero: 66,
        denominacion: "RESTRICCIÓN",
        contenido: "Las consejeras o consejeros de vigilancia no podrán realizar actos ni actividades, ni ejercer facultades establecidas para el Consejo de Administración."
      },
      {
        id: 67,
        numero: 67,
        denominacion: "COMITÉ DE EDUCACIÓN",
        contenido: "El Comité de Educación es el encargado de realizar gestiones para lograr la capacitación cooperativa y técnica de las asociadas y asociados, y estará integrado por 2 miembros elegidos en Asamblea General Ordinaria. Su mandato tendrá una duración de 2 años."
      },
      {
        id: 68,
        numero: 68,
        denominacion: "ATRIBUCIONES DEL COMITÉ DE EDUCACIÓN",
        contenido: "Son atribuciones y funciones del Comité de Educación, sin perjuicio de las demás establecidas por la ley: a) Organizar y desarrollar programas de educación, capacitación e información en el ámbito cooperativo, y difundir los principios y valores del cooperativismo. b) Gestionar programas de capacitación técnica, administrativa, económica, financiera, contable y otras. c) Elaborar anualmente un plan de trabajo que deberá ser presentado al Consejo de Administración, y rendir al final de su gestión un informe de las labores desarrolladas a la Asamblea General. d) Presentar mensualmente informe de actividades al Consejo de Administración. e) Utilizar los recursos asignados por el Consejo de Administración. f) Presentar al Consejo de Administración el informe de las labores realizadas, al finalizar la gestión económica. g) Otras, de acuerdo a las necesidades de la Cooperativa."
      },
      {
        id: 69,
        numero: 69,
        denominacion: "COMITÉ DE PREVISIÓN SOCIAL Y APOYO A LA COLECTIVIDAD",
        contenido: "Es el encargado de realizar gestiones para la consolidación de los programas de bienestar social de las asociadas, asociados y de la colectividad."
      },
      {
        id: 70,
        numero: 70,
        denominacion: "ATRIBUCIONES DEL COMITÉ DE PREVISIÓN SOCIAL Y APOYO A LA COLECTIVIDAD",
        contenido: "El Comité de Previsión Social y Apoyo a la Colectividad estará compuesto por 2 miembros, designados por 2 años. Sus atribuciones son: a) Preparar y desarrollar programas de bienestar social en beneficio de los asociados y sus familiares, conforme a lo dispuesto por la Ley General de Cooperativas. b) Utilizar los recursos asignados por el Consejo de Administración, de conformidad a lo dispuesto por el Artículo 45 de la Ley General de Cooperativas. c) Presentar al Consejo de Administración el informe de las labores realizadas, al finalizar la gestión económica. d) Otras, de acuerdo a las necesidades de la Cooperativa."
      },
      {
        id: 71,
        numero: 71,
        denominacion: "REGLAS APLICABLES A LAS COMISIONES O COMITÉS",
        contenido: "Todos los comités tienen la obligación de entregar sus informes ante el Consejo de Administración, para que este los eleve a conocimiento y consideración de la Asamblea General."
      },
      {
        id: 72,
        numero: 72,
        denominacion: "COMISIONES O COMITÉS",
        contenido: "La Asamblea General podrá conformar otras comisiones o comités que sean necesarios para el funcionamiento y operatividad de la cooperativa."
      }
    ]
  },
  {
    id: 5,
    numero_romano: "V",
    numero: 5,
    titulo: "DE LA INTEGRACIÓN COOPERATIVA",
    descripcion: "Integración de la Cooperativa con el movimiento cooperativo y régimen de afiliación.",
    articulos: [
      {
        id: 73,
        numero: 73,
        denominacion: "INTEGRACIÓN DE LA COOPERATIVA",
        contenido: "En el marco del Derecho Cooperativo, es la unión de las cooperativas para formar parte del Sistema Cooperativo y ser representadas a nivel regional, departamental, nacional e internacional, con la finalidad de fortalecerse económica, técnica, tecnológica, financiera y administrativamente, además de mejorar las condiciones sociales, deportivas y culturales de la Cooperativa."
      },
      {
        id: 74,
        numero: 74,
        denominacion: "DE LA AFILIACIÓN",
        contenido: "La afiliación será al siguiente nivel superior existente, según corresponda y conforme a lo establecido en el Art. 81 de la Ley General de Cooperativas."
      }
    ]
  },
  {
    id: 6,
    numero_romano: "VI",
    numero: 6,
    titulo: "REGLAMENTOS ESPECÍFICOS",
    descripcion: "Régimen disciplinario, conciliación y arbitraje cooperativo y régimen electoral de la Cooperativa.",
    articulos: [
      {
        id: 75,
        numero: 75,
        denominacion: "REGLAMENTOS ESPECÍFICOS",
        contenido: "Para el funcionamiento interno de la Cooperativa, tendrá como mínimo los siguientes Reglamentos Específicos: a. Reglamento Disciplinario. b. Reglamento de Conciliación y Arbitraje. c. Reglamento Electoral. d. Reglamento Interno. e. Otros, de acuerdo a la necesidad de la Cooperativa."
      },
      {
        id: 76,
        numero: 76,
        denominacion: "TRIBUNAL DE HONOR",
        contenido: "El Tribunal de Honor estará constituido por un presidente, un secretario y un Vocal como titulares, designados por la Asamblea General Ordinaria por el periodo de 2 años.",
        subseccion: "SUBSECCIÓN I — RÉGIMEN DISCIPLINARIO"
      },
      {
        id: 77,
        numero: 77,
        denominacion: "REQUISITOS",
        contenido: "Para ser miembro del Tribunal de Honor se requiere: a) Tener amplio conocimiento de la cooperativa y una antigüedad mínima de 2 años como asociada o asociado. b) Ser cooperativista minero meritorio y reconocido por su intachable conducta."
      },
      {
        id: 78,
        numero: 78,
        denominacion: "LUGAR DE SESIONES",
        contenido: "El Tribunal de Honor deberá realizar sus sesiones y actuados en el domicilio legal de la cooperativa."
      },
      {
        id: 79,
        numero: 79,
        denominacion: "ATRIBUCIÓN DEL TRIBUNAL DE HONOR",
        contenido: "a. Realizar procesos investigativos y sumariales, previo informe y a convocatoria del Consejo de Administración y/o Vigilancia, a consejeros, asociadas y asociados que infrinjan las normas cooperativas, el presente Estatuto y el Reglamento Interno. b. Recibir denuncias y solicitar a los Consejos los antecedentes de las asociadas y asociados denunciados. c. Presentar ante los Consejos y la Asamblea General Extraordinaria el informe de los procesos sumariales y su dictamen, debiendo la Asamblea General Extraordinaria emitir la resolución final en caso de expulsión, y en grado de apelación para el caso de exclusión."
      },
      {
        id: 80,
        numero: 80,
        denominacion: "DE LAS INFRACCIONES Y SANCIONES",
        contenido: "I. Las infracciones cometidas por las asociadas y asociados, según su gravedad, serán: a. Leves. b. Graves. c. Gravísimas. II. Las sanciones impuestas de acuerdo a la gravedad serán: a. Amonestación. b. Multa. c. Exclusión. d. Expulsión. III. El Reglamento Interno de la Cooperativa dispondrá los procesos, la tipificación de infracciones y el procedimiento."
      },
      {
        id: 81,
        numero: 81,
        denominacion: "PROCEDIMIENTO SANCIONADOR DE EXCLUSIÓN Y EXPULSIÓN",
        contenido: "La exclusión y expulsión de asociadas y asociados será realizada previo proceso sumario ante el Tribunal de Honor, bajo el siguiente procedimiento: 1. Etapa de Iniciación: se formalizará con la notificación al o los asociados presuntos infractores, con los cargos que se les atribuyen, advirtiéndoles que de no presentar pruebas de descargo o alegaciones en el término previsto en el siguiente numeral, se emitirá la resolución correspondiente. 2. Etapa de Tramitación: los presuntos infractores, en el plazo de veinte (20) días calendario a partir de su notificación, podrán presentar todas las pruebas, alegaciones, documentos e información que crean convenientes a sus intereses. 3. Etapa de Terminación: vencido el término de prueba, el Tribunal de Honor, en el plazo de diez (10) días calendario, emitirá resolución que imponga o desestime la sanción de exclusión o expulsión de la asociada o asociado. 4. En caso de imponerse sanción, esta deberá consignar básicamente la causal atribuida, el nombre y apellido completo y la cédula de identidad; se remitirán los actuados en el término de diez (10) días calendario a conocimiento del Consejo de Administración y Vigilancia, quien los elevará ante la Asamblea General Extraordinaria como instancia de apelación para el caso de exclusión, y para el caso de expulsión, para su correspondiente aprobación por la Asamblea General Extraordinaria. En ambos casos, la decisión final será tomada por dos terceras partes de las asociadas y asociados presentes."
      },
      {
        id: 82,
        numero: 82,
        denominacion: "INFORMES Y DICTÁMENES",
        contenido: "Los informes y dictámenes emitidos por el Tribunal de Honor deberán contar con el voto favorable de la mitad más uno de sus miembros."
      },
      {
        id: 83,
        numero: 83,
        denominacion: "DE LA CONFORMACIÓN DE LA JUNTA DE CONCILIACIÓN",
        contenido: "I. Para la solución de controversias al interior de la cooperativa, se conformará la Junta de Conciliación. II. Estará conformada por 2 asociadas y asociados elegidos en Asamblea General Ordinaria, y durarán en sus funciones 2 años.",
        subseccion: "SUBSECCIÓN II — CONCILIACIÓN Y ARBITRAJE COOPERATIVO"
      },
      {
        id: 84,
        numero: 84,
        denominacion: "ACEPTACIÓN DE LAS ASOCIADAS Y ASOCIADOS AL PROCEDIMIENTO DE SOLUCIÓN DE CONTROVERSIAS",
        contenido: "Las asociadas y asociados, a tiempo de afiliarse a la cooperativa, en el marco de la Ley General de Cooperativas, su Decreto Reglamentario, el presente Estatuto y los reglamentos internos, aceptan sujetarse al procedimiento de solución de controversias a cargo de la Junta de Conciliación."
      },
      {
        id: 85,
        numero: 85,
        denominacion: "ARBITRAJE COOPERATIVO",
        contenido: "I. Los mecanismos de arbitraje estarán contemplados en el Reglamento Especial aprobado por la Asamblea de la CONCOBOL, y se regirán por las normas de conciliación y arbitraje vigentes. II. Las resoluciones y actas emitidas por el Tribunal de Arbitraje o Conciliación serán definitivas e inapelables."
      },
      {
        id: 86,
        numero: 86,
        denominacion: "COMITÉ ELECTORAL",
        contenido: "El Comité Electoral es el órgano encargado de coordinar, supervisar y coadyuvar el proceso electoral del Consejo de Administración, Consejo de Vigilancia y demás comités. I. Mediante Asamblea General Ordinaria se procederá a la elección del Comité Electoral, compuesto por 3 asociadas y asociados, quienes durarán en su mandato desde su elección hasta la culminación del proceso electoral.",
        subseccion: "SUBSECCIÓN III — RÉGIMEN ELECTORAL"
      },
      {
        id: 87,
        numero: 87,
        denominacion: "ELECCIÓN DE CONSEJEROS",
        contenido: "I. Las disposiciones respecto a la forma y el procedimiento de elecciones, así como el tipo y modalidad de votación, se definirán en el Reglamento Interno de Régimen Electoral aprobado por la Asamblea General. II. La emisión del voto en las elecciones o en las asambleas es personal. No podrá ser delegado a terceras personas."
      }
    ]
  },
  {
    id: 7,
    numero_romano: "VII",
    numero: 7,
    titulo: "ESTADOS FINANCIEROS Y DISTRIBUCIÓN DE EXCEDENTES",
    descripcion: "Cierre de gestión, aprobación de estados financieros, memoria anual, registros contables y libros de la Cooperativa.",
    articulos: [
      {
        id: 88,
        numero: 88,
        denominacion: "CIERRE DE GESTIÓN",
        contenido: "Concluido el ejercicio económico, se elaborarán los Estados Financieros aplicando normas de contabilidad generalmente aceptadas. Dichos estados financieros estarán compuestos mínimamente por: a. Balance General con todos sus anexos. b. Estado de Resultados. c. Balance de Comprobación de Sumas y Saldos. d. Estado de Resultados Acumulados. e. Estado de Cambios en la Situación Financiera. Todos estos trabajos estarán bajo la responsabilidad del Tesorero del Consejo de Administración, con la participación de un(a) profesional del área contable."
      },
      {
        id: 89,
        numero: 89,
        denominacion: "APROBACIÓN DE LOS ESTADOS FINANCIEROS",
        contenido: "Previo pronunciamiento del Consejo de Vigilancia, los Estados Financieros serán presentados por el Consejo de Administración a la Asamblea General Ordinaria para su consideración y aprobación."
      },
      {
        id: 90,
        numero: 90,
        denominacion: "MEMORIA ANUAL",
        contenido: "Los Consejos de Administración, de Vigilancia y los Comités elaborarán la Memoria Anual para su presentación a la Asamblea General Ordinaria, para su consiguiente revisión y aprobación."
      },
      {
        id: 91,
        numero: 91,
        denominacion: "PRESENTACIÓN PARA REGISTRO",
        contenido: "El Consejo de Administración elevará a la Autoridad de Fiscalización y Control de Cooperativas (AFCOOP), para su registro, los Estados Financieros y la Memoria Anual aprobados por la Asamblea General."
      },
      {
        id: 92,
        numero: 92,
        denominacion: "LIBROS DE REGISTRO",
        contenido: "La Cooperativa dispondrá, para el registro de sus actos y actividades, de los siguientes libros: a. De Actas para Asambleas Generales. b. Registro de asociadas y asociados. c. De actas para cada Consejo y Comités. d. De Contabilidad, Caja, Diario y Mayor. En todos los libros citados queda terminantemente prohibido: a) Alterar los asientos y el orden progresivo de las fechas. b) Dejar espacios en blanco o efectuar raspaduras. c) Arrancar hojas o mutilar alguna parte del libro."
      },
      {
        id: 93,
        numero: 93,
        denominacion: "APERTURA DE LIBROS",
        contenido: "La apertura de libros se hará obligatoriamente por medio de un Notario de Fe Pública. Los registros realizados en libros no autorizados carecen de valor legal."
      },
      {
        id: 94,
        numero: 94,
        denominacion: "NUEVOS LIBROS",
        contenido: "Para la apertura de nuevos libros será requisito indispensable haber llenado los libros anteriores y haber procedido con el cierre del mismo."
      }
    ]
  },
  {
    id: 8,
    numero_romano: "VIII",
    numero: 8,
    titulo: "DISOLUCIÓN SIN LIQUIDACIÓN Y CON LIQUIDACIÓN",
    descripcion: "Disolución, fusión, escisión, absorción y destino del remanente patrimonial de la Cooperativa.",
    articulos: [
      {
        id: 95,
        numero: 95,
        denominacion: "DISOLUCIÓN Y LIQUIDACIÓN",
        contenido: "La cooperativa se disolverá conforme a las causales establecidas en el Art. 71 de la Ley General de Cooperativas, y para la liquidación se seguirá el procedimiento establecido en la Ley General de Cooperativas, el Decreto Supremo Reglamentario y los reglamentos dispuestos por la Autoridad de Fiscalización y Control de Cooperativas (AFCOOP)."
      },
      {
        id: 96,
        numero: 96,
        denominacion: "FUSIÓN",
        contenido: "Procede cuando dos o más cooperativas se disuelven sin liquidarse para constituir una nueva."
      },
      {
        id: 97,
        numero: 97,
        denominacion: "ESCISIÓN",
        contenido: "Procede cuando una cooperativa destina una parte del Fondo Social para constituir una nueva cooperativa."
      },
      {
        id: 98,
        numero: 98,
        denominacion: "ABSORCIÓN",
        contenido: "Procede cuando una cooperativa incorpora a otra u otras que se disuelven sin liquidarse."
      },
      {
        id: 99,
        numero: 99,
        denominacion: "DESTINO DEL REMANENTE",
        contenido: "Una vez ordenada su liquidación por las autoridades competentes, se pagarán las deudas y se devolverá el valor nominal actualizado del certificado de aportación; el remanente se entregará a la cooperativa de grado superior a la que está afiliada o, en su defecto, a otra cooperativa del lugar, con destino a educación y fomento cooperativo."
      }
    ]
  },
  {
    id: 9,
    numero_romano: "D.F.",
    numero: 9,
    titulo: "DISPOSICIONES FINALES",
    descripcion: "Disposiciones finales del Estatuto Orgánico de la Cooperativa.",
    articulos: [
      {
        id: 100,
        numero: "Primera",
        denominacion: "NORMAS DE DESARROLLO",
        contenido: "Quedan facultadas la Asamblea General y el Consejo de Administración para dictar los reglamentos internos, resoluciones y disposiciones complementarias que resulten necesarios para la aplicación y cumplimiento del presente Estatuto Orgánico, dentro del marco de la Ley General de Cooperativas Nº 356.",
        esDisposicion: true
      },
      {
        id: 101,
        numero: "Segunda",
        denominacion: "CASOS NO PREVISTOS",
        contenido: "Los casos no previstos en el presente Estatuto Orgánico serán resueltos por la Asamblea General Extraordinaria, con sujeción a lo dispuesto por la Constitución Política del Estado, la Ley General de Cooperativas Nº 356, su Decreto Supremo Reglamentario Nº 1995 y las disposiciones emitidas por la Autoridad de Fiscalización y Control de Cooperativas (AFCOOP).",
        esDisposicion: true
      },
      {
        id: 102,
        numero: "Tercera",
        denominacion: "VIGENCIA",
        contenido: "El presente Estatuto Orgánico entra en vigencia a partir de su aprobación por la Asamblea General y de su registro ante la Autoridad de Fiscalización y Control de Cooperativas (AFCOOP).\n\nToda disposición estatutaria anterior que contravenga el presente Estatuto queda sin efecto.",
        esDisposicion: true
      }
    ]
  }
];