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
        contenido: "La Cooperativa fomentará la integración cooperativa en sus niveles económico, social y educativo, conforme al artículo 6 de la Ley General de Cooperativas Nº 356.\n\nSin afectar su autonomía de gestión, la Cooperativa podrá integrarse a organizaciones de grado superior del sistema cooperativo, tales como la Federación Departamental de Cooperativas Mineras de La Paz (FECOMAN L.P.), la Federación Nacional de Cooperativas Mineras de Bolivia (FENCOMIN R.L.) y la Confederación Nacional de Cooperativas de Bolivia (CONCOBOL)."
      },
      {
        id: 74,
        numero: 74,
        denominacion: "DE LA AFILIACIÓN",
        contenido: "La afiliación, desafiliación o la modificación de la participación de la Cooperativa en las organizaciones de grado superior se resolverá por la Asamblea General Extraordinaria, mediante votación de dos tercios de las asociadas y asociados presentes.\n\nLos aportes de integración se presupuestarán anualmente y su ejecución será fiscalizada por el Consejo de Vigilancia."
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
        contenido: "La Cooperativa se dotará de Reglamentos Específicos para regular de manera detallada las materias de régimen disciplinario, conciliación y arbitraje cooperativo, y régimen electoral, conforme a las bases establecidas en el presente CAPÍTULO VI, la Ley General de Cooperativas Nº 356 y su Decreto Supremo Reglamentario Nº 1995."
      },
      {
        id: 76,
        numero: 76,
        denominacion: "TRIBUNAL DE HONOR",
        contenido: "El Tribunal de Honor es el órgano encargado de conocer y sustanciar los procesos disciplinarios contra las asociadas, asociados, consejeras y consejeros, integrantes de Comités y personal de apoyo de la Cooperativa.\n\nSerá elegido por la Asamblea General Ordinaria y ejercerá sus funciones con independencia, imparcialidad y respeto al debido proceso.",
        subseccion: "SUBSECCIÓN I — RÉGIMEN DISCIPLINARIO"
      },
      {
        id: 77,
        numero: 77,
        denominacion: "REQUISITOS",
        contenido: "Para ser miembro del Tribunal de Honor se requiere:\na) Ser asociada o asociado en ejercicio pleno de sus derechos.\nb) No registrar sanciones disciplinarias durante la gestión inmediatamente anterior.\nc) No tener vínculo de parentesco con las partes involucradas en los procesos a su cargo.\nd) Acreditar idoneidad moral y compromiso institucional.",
        subseccion: "SUBSECCIÓN I — RÉGIMEN DISCIPLINARIO"
      },
      {
        id: 78,
        numero: 78,
        denominacion: "LUGAR DE SESIONES",
        contenido: "El Tribunal de Honor sesionará en el domicilio de la Cooperativa, o en el lugar que expresamente se señale en la citación, garantizando el acceso y la privacidad necesarios para el adecuado desarrollo del proceso disciplinario.",
        subseccion: "SUBSECCIÓN I — RÉGIMEN DISCIPLINARIO"
      },
      {
        id: 79,
        numero: 79,
        denominacion: "ATRIBUCIÓN",
        contenido: "Es atribución del Tribunal de Honor conocer los casos de presuntas infracciones a la Ley, el Estatuto Orgánico, el Reglamento Interno y las resoluciones sociales, así como proponer a la Asamblea General Extraordinaria las sanciones de exclusión o expulsión, previa sustanciación del proceso.",
        subseccion: "SUBSECCIÓN I — RÉGIMEN DISCIPLINARIO"
      },
      {
        id: 80,
        numero: 80,
        denominacion: "INFRACCIONES Y SANCIONES",
        contenido: "Las infracciones se clasifican en leves, graves y muy graves, conforme a la escala establecida en el Reglamento Específico de Régimen Disciplinario.\n\nLas sanciones aplicables son:\na) Amonestación verbal.\nb) Amonestación escrita.\nc) Multa, conforme a la escala aprobada por la Asamblea General.\nd) Suspensión temporal de derechos (exclusión).\ne) Expulsión, previo proceso y aprobación de dos tercios de la Asamblea General Extraordinaria.",
        subseccion: "SUBSECCIÓN I — RÉGIMEN DISCIPLINARIO"
      },
      {
        id: 81,
        numero: 81,
        denominacion: "PROCEDIMIENTO SANCIONADOR",
        contenido: "El procedimiento sancionador observará las siguientes etapas:\na) Denuncia o informe del Consejo de Administración, del Consejo de Vigilancia o de cualquier asociada o asociado.\nb) Apertura del sumario por el Tribunal de Honor y notificación al presunto infractor.\nc) Etapa probatoria y descargos con pleno respeto al derecho a la defensa.\nd) Informe y dictamen del Tribunal de Honor.\ne) Resolución de la instancia competente y, en su caso, de la Asamblea General Extraordinaria.",
        subseccion: "SUBSECCIÓN I — RÉGIMEN DISCIPLINARIO"
      },
      {
        id: 82,
        numero: 82,
        denominacion: "INFORMES Y DICTÁMENES",
        contenido: "El Tribunal de Honor emitirá informes y dictámenes escritos, fundamentados y oportunos, dentro de los plazos establecidos en el Reglamento Específico de Régimen Disciplinario.\n\nLos dictámenes serán puestos en conocimiento de los Consejos de Administración y Vigilancia y, cuando corresponda, de la Asamblea General Extraordinaria, garantizando la reserva del proceso en lo pertinente.",
        subseccion: "SUBSECCIÓN I — RÉGIMEN DISCIPLINARIO"
      },
      {
        id: 83,
        numero: 83,
        denominacion: "JUNTA DE CONCILIACIÓN",
        contenido: "La Junta de Conciliación es el órgano encargado de promover la solución armónica de los conflictos internos de la Cooperativa, mediante la conciliación y la mediación.\n\nSerá elegida por la Asamblea General Ordinaria y actuará con neutralidad, procurando preservar la unidad y la convivencia cooperativa.",
        subseccion: "SUBSECCIÓN II — CONCILIACIÓN Y ARBITRAJE COOPERATIVO"
      },
      {
        id: 84,
        numero: 84,
        denominacion: "ACEPTACIÓN",
        contenido: "La conciliación es de aplicación voluntaria. Las partes podrán someter sus diferencias a la Junta de Conciliación mediante aceptación escrita, de manera previa o posterior al surgimiento del conflicto.\n\nLos acuerdos conciliatorios constarán en acta y tendrán fuerza obligatoria entre las partes, conforme al Reglamento Específico de Conciliación y Arbitraje.",
        subseccion: "SUBSECCIÓN II — CONCILIACIÓN Y ARBITRAJE COOPERATIVO"
      },
      {
        id: 85,
        numero: 85,
        denominacion: "ARBITRAJE COOPERATIVO",
        contenido: "Los conflictos que no sean resueltos mediante conciliación podrán someterse a arbitraje cooperativo de equidad, según las reglas que fije el Reglamento Específico de Conciliación y Arbitraje, dentro del marco de la Ley General de Cooperativas Nº 356 y la legislación aplicable.",
        subseccion: "SUBSECCIÓN II — CONCILIACIÓN Y ARBITRAJE COOPERATIVO"
      },
      {
        id: 86,
        numero: 86,
        denominacion: "COMITÉ ELECTORAL",
        contenido: "El Comité Electoral es el órgano encargado de conducir los procesos de elección de las consejeras, consejeros y miembros de los Comités de la Cooperativa.\n\nSerá designado por la Asamblea General Ordinaria saliente y garantizará la transparencia, imparcialidad y legalidad del proceso electoral.",
        subseccion: "SUBSECCIÓN III — RÉGIMEN ELECTORAL"
      },
      {
        id: 87,
        numero: 87,
        denominacion: "ELECCIÓN DE CONSEJEROS",
        contenido: "La elección de las consejeras y consejeros y de los miembros de los Comités se realizará en Asamblea General, mediante voto directo, igual, universal y secreto, conforme al Reglamento Específico de Régimen Electoral.\n\nCorresponde a la asociada o asociado elegido o elegida aceptar el cargo conforme a las condiciones que determine la Asamblea General.",
        subseccion: "SUBSECCIÓN III — RÉGIMEN ELECTORAL"
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
        contenido: "La gestión económica de la Cooperativa se computará del uno (1) de enero al treinta y uno (31) de diciembre de cada año, fecha en la que se establecerá el cierre de gestión.\n\nAl cierre, la Tesorería, conjuntamente con el Consejo de Administración, procederá al corte, balance y elaboración de los estados financieros, con la fiscalización del Consejo de Vigilancia."
      },
      {
        id: 89,
        numero: 89,
        denominacion: "APROBACIÓN DE LOS ESTADOS FINANCIEROS",
        contenido: "Los estados financieros, junto con el informe del Consejo de Vigilancia, serán presentados a la Asamblea General Ordinaria para su análisis y aprobación, dentro de los plazos que establezca el Reglamento Interno.\n\nLa aprobación de los estados financieros no libera de responsabilidad a las consejeras y consejeros por los actos de su gestión."
      },
      {
        id: 90,
        numero: 90,
        denominacion: "MEMORIA ANUAL",
        contenido: "El Consejo de Administración presentará a la Asamblea General Ordinaria la Memoria Anual de la gestión, que contendrá la memoria de actividades, los estados financieros, el informe de ejecución del presupuesto, la propuesta de distribución de excedentes y las proyecciones de la siguiente gestión."
      },
      {
        id: 91,
        numero: 91,
        denominacion: "PRESENTACIÓN PARA REGISTRO",
        contenido: "Los estados financieros y la memoria anual aprobados serán remitidos a la Autoridad de Fiscalización y Control de Cooperativas (AFCOOP), en los plazos y formas que disponga la normativa vigente, para fines de registro, control y fiscalización."
      },
      {
        id: 92,
        numero: 92,
        denominacion: "LIBROS DE REGISTRO",
        contenido: "La Cooperativa llevará obligatoriamente, entre otros, los siguientes libros:\na) Libro de Registro de Asociadas y Asociados.\nb) Libro de Actas de Asambleas Generales.\nc) Libro de Actas del Consejo de Administración.\nd) Libro de Actas del Consejo de Vigilancia.\ne) Libro de Actas del Tribunal de Honor, Junta de Conciliación y Comités.\nf) Libro de Contabilidad, Inventarios y de Registro de Aportaciones.\n\nLos libros deberán estar foliados, sellados y habilitados conforme a la normativa vigente."
      },
      {
        id: 93,
        numero: 93,
        denominacion: "APERTURA DE LIBROS",
        contenido: "Los libros contables y de registro serán aperturados y habilitados por la Autoridad de Fiscalización y Control de Cooperativas (AFCOOP) o la autoridad competente, y se custodiarán bajo la responsabilidad de la Secretaría General y la Tesorería, conforme al presente Estatuto y el Reglamento Interno."
      },
      {
        id: 94,
        numero: 94,
        denominacion: "NUEVOS LIBROS",
        contenido: "Cuando se hubiera concluido un libro, se aperturará uno nuevo con la autorización correspondiente, dejándose constancia del cierre del anterior y del número de folios utilizados. La apertura, conservación y custodia de los libros se sujetará a la normativa vigente."
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
        contenido: "La Cooperativa se disolverá por las causas previstas en la Ley General de Cooperativas Nº 356, su Decreto Supremo Reglamentario Nº 1995 y el presente Estatuto, mediante resolución de la Asamblea General Extraordinaria adoptada por dos tercios de los votos de las asociadas y asociados habilitados.\n\nLa disolución podrá ser con liquidación o sin liquidación, conforme a la forma prevista por la Asamblea y la normativa vigente."
      },
      {
        id: 96,
        numero: 96,
        denominacion: "FUSIÓN",
        contenido: "La Cooperativa podrá fusionarse con una o más cooperativas mediante la reunión de sus patrimonios y la integración de sus asociadas y asociados en una nueva cooperativa, previa resolución de fusión adoptada por dos tercios de los votos en Asamblea General Extraordinaria, conforme a la Ley."
      },
      {
        id: 97,
        numero: 97,
        denominacion: "ESCISIÓN",
        contenido: "La Cooperativa podrá escindirse dividiendo su patrimonio y su activo y pasivo en dos o más cooperativas, previa resolución de escisión adoptada por dos tercios de los votos en Asamblea General Extraordinaria, conforme a la Ley General de Cooperativas Nº 356 y su Decreto Supremo Reglamentario Nº 1995."
      },
      {
        id: 98,
        numero: 98,
        denominacion: "ABSORCIÓN",
        contenido: "La Cooperativa podrá ser absorbida por otra cooperativa o absorber a otra u otras, conservando la cooperativa absorbente la personalidad jurídica y asumiendo los derechos y obligaciones de la absorción, previa resolución adoptada por dos tercios de los votos en Asamblea General Extraordinaria."
      },
      {
        id: 99,
        numero: 99,
        denominacion: "DESTINO DEL REMANENTE",
        contenido: "Concluida la liquidación, el remanente del patrimonio social, una vez cubiertas las obligaciones sociales y devuelto el valor del Certificado de Aportación, tendrá como destino:\na) En caso de disolución con liquidación, su entrega a una entidad cooperativa o de economía solidaria designada por la Asamblea General.\nb) En ningún caso, la distribución del remanente entre las asociadas y asociados a título de utilidad.\n\nEl destino del remanente se sujetará a la Ley General de Cooperativas Nº 356 y a la legislación vigente."
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