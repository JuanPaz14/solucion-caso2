/* ────────────────────────────────────────────────────────────────
   CLASIFICACIÓN CON IA — PROTOTIPO
   Esta página es una maqueta funcional: no llama a un modelo real.
   La respuesta del modelo está guardada como JSON de ejemplo, tal
   como lo permite el enunciado del caso. Todo lo demás —el prompt,
   la validación, el umbral de confianza y la red de seguridad— es
   la lógica que se usaría en producción, sin cambios.
──────────────────────────────────────────────────────────────── */

const CATEGORIAS = {
  reclamo:        {nombre:"Reclamo",              area:"Atención al Cliente"},
  tecnica:        {nombre:"Consulta técnica",     area:"Soporte Técnico"},
  comercial:      {nombre:"Solicitud comercial",  area:"Comercial"},
  operativo:      {nombre:"Soporte operativo",    area:"Operaciones"},
  administrativa: {nombre:"Solicitud de cliente", area:"Servicio al Cliente"}
};

const URGENCIAS = {
  alta:  {nombre:"Alta",  slaHoras:4,  orden:0},
  media: {nombre:"Media", slaHoras:8,  orden:1},
  baja:  {nombre:"Baja",  slaHoras:24, orden:2}
};

/* Por debajo de esta confianza el caso NO se asigna: va a revisión humana. */
const UMBRAL_CONFIANZA = 0.45;

/* Lotes de 10 para que el progreso sea visible y las respuestas más fiables. */
const LOTE = 10;

/* ── EL PROMPT ──────────────────────────────────────────────────
   Es el corazón de la solución. Define las categorías, los criterios
   de urgencia y —lo más importante— autoriza al modelo a declararse
   inseguro en lugar de adivinar.                                   */
function construirPrompt(correos){
  return `Eres un clasificador de solicitudes para una empresa mediana de servicios en Colombia.
Clasifica cada correo en UNA categoría, asígnale urgencia y declara tu confianza.

CATEGORÍAS (usa exactamente estos códigos):
- reclamo: el cliente está inconforme, reporta un cobro indebido, reclama por incumplimiento
  o lleva tiempo sin respuesta.
- tecnica: fallas, errores, caídas del sistema, integraciones, instalación de software,
  configuración o rendimiento.
- comercial: cotizaciones, precios, renovación de contrato, nuevos servicios, cupos de
  crédito, interés en planes.
- operativo: despachos, entregas, bodegas, agendamiento o reprogramación de visitas
  e instalaciones, cambios de dirección.
- administrativa: certificados, paz y salvo, copias de factura, actualización de datos
  de facturación o de contacto.

URGENCIA:
- alta: la operación del cliente está detenida, el servicio está caído, hay riesgo de
  perder al cliente o se mencionan acciones legales u organismos de control.
- media: afecta al cliente pero no detiene su operación.
- baja: consulta o trámite sin apremio.

CONFIANZA (número de 0 a 1):
Usa un valor menor a ${UMBRAL_CONFIANZA} cuando el texto NO alcance para decidir: asuntos vacíos
o genéricos ("Consulta", "Tema pendiente"), seguimientos que no dicen a qué caso se refieren,
o reenvíos sin contexto. NO ADIVINES: es preferible marcar confianza baja y que lo revise una
persona, a asignar mal el caso.

Devuelve ÚNICAMENTE un arreglo JSON, un objeto por correo, en el mismo orden en que llegan:
[{"id":"C-1001","categoria":"reclamo","urgencia":"alta","confianza":0.95,"motivo":"frase corta"}]

"motivo" es una sola frase explicando en qué te basaste, dirigida a la persona que va a
atender el caso.

CORREOS A CLASIFICAR:
${correos.map(c => `---
id: ${c.id}
de: ${c.de}${c.clienteClave ? " (cliente clave)" : ""}
asunto: ${c.asunto}
mensaje: ${c.cuerpo}`).join("\n")}`;
}

/* ── REGLAS DE SEGURIDAD ────────────────────────────────────────
   Corren POR ENCIMA del modelo. Solo suben la urgencia, nunca la bajan.
   Existen porque el error más caro del sistema es que un reclamo grave
   se clasifique como consulta rutinaria (ver análisis, punto 4).     */
const REGLAS_DURAS = [
  {id:"RD-1", patron:/cancelar el contrato|cancelo el contrato|cancelar el servicio/i,
   etiqueta:"Amenaza de cancelación de contrato"},
  {id:"RD-2", patron:/\babogado\b|\bdemanda\b|acciones legales|acciones que correspondan/i,
   etiqueta:"Mención de acciones legales"},
  {id:"RD-3", patron:/\btutela\b|superintendencia|ente de control/i,
   etiqueta:"Mención de organismo de control"}
];

/* ── RESPUESTA DEL MODELO ───────────────────────────────────────
   Guardada como JSON de ejemplo para esta maqueta. Es exactamente la
   forma que devolvería el modelo con el prompt de arriba: un objeto
   por correo, con categoría, urgencia, confianza y el motivo.
   Ojo con C-1029: el modelo lo marcó «media» y la regla de seguridad
   lo corrige a «alta». Es el caso que demuestra para qué sirve la red. */
const RESPUESTA_DEL_MODELO = [
 {id:"C-1001", categoria:"reclamo",        urgencia:"alta",  confianza:0.96, motivo:"Lleva tres días sin servicio, la operación de la sede está detenida y ya reclamó cuatro veces sin respuesta."},
 {id:"C-1002", categoria:"comercial",      urgencia:"baja",  confianza:0.95, motivo:"Pide una cotización formal por volumen con condiciones de pago; tiene plazo hasta el viernes."},
 {id:"C-1003", categoria:"tecnica",        urgencia:"media", confianza:0.94, motivo:"Reporta un error 504 reproducible en los tres ambientes y adjunta el log del servidor."},
 {id:"C-1004", categoria:"reclamo",        urgencia:"media", confianza:0.91, motivo:"Detectó dos cargos idénticos en la misma factura y pide la nota crédito."},
 {id:"C-1005", categoria:"reclamo",        urgencia:"alta",  confianza:0.97, motivo:"Tercera vez que escribe sin respuesta; anuncia cancelación del contrato y menciona a su abogado."},
 {id:"C-1006", categoria:"tecnica",        urgencia:"media", confianza:0.89, motivo:"Consulta el procedimiento para dar acceso remoto a un usuario nuevo; no hay falla reportada."},
 {id:"C-1007", categoria:"administrativa", urgencia:"baja",  confianza:0.93, motivo:"Trámite documental: pide el certificado de paz y salvo para un banco."},
 {id:"C-1008", categoria:"tecnica",        urgencia:"media", confianza:0.92, motivo:"La integración del cliente responde 401 desde ayer aunque el token sigue vigente."},
 {id:"C-1009", categoria:"operativo",      urgencia:"media", confianza:0.90, motivo:"Necesita confirmar la franja horaria del despacho para organizar el personal de descargue."},
 {id:"C-1010", categoria:"operativo",      urgencia:"media", confianza:0.62, motivo:"Pide reprogramar la visita, pero también reclama porque el técnico no llegó ni avisó. Podría tratarse como reclamo."},
 {id:"C-1011", categoria:"comercial",      urgencia:"baja",  confianza:0.88, motivo:"Pregunta qué incluye el plan empresarial y si hay descuento por pago anual."},
 {id:"C-1012", categoria:"administrativa", urgencia:"media", confianza:0.91, motivo:"Pide reenvío de una factura que extravió, para su cierre contable."},
 {id:"C-1013", categoria:"tecnica",        urgencia:"alta",  confianza:0.98, motivo:"Servidor de producción caído desde las 8:40: ningún cliente puede ingresar al sistema."},
 {id:"C-1014", categoria:"administrativa", urgencia:"media", confianza:0.90, motivo:"Cambio de razón social: adjunta el RUT para actualizar los datos de facturación."},
 {id:"C-1015", categoria:"comercial",      urgencia:"media", confianza:0.93, motivo:"El contrato vence este mes y quiere revisar condiciones de renovación. Es cliente clave."},
 {id:"C-1016", categoria:"reclamo",        urgencia:"media", confianza:0.87, motivo:"Queja formal por la atención recibida en sucursal; pide dejar constancia."},
 {id:"C-1017", categoria:"operativo",      urgencia:"media", confianza:0.92, motivo:"Solicita mover la instalación a la semana siguiente por un retraso de obra civil."},
 {id:"C-1018", categoria:"tecnica",        urgencia:"media", confianza:0.94, motivo:"El instalador falla y se cierra solo; ya descartó antivirus y reinicio."},
 {id:"C-1019", categoria:"operativo",      urgencia:"media", confianza:0.91, motivo:"Cambio de sede: hay que actualizar la dirección de entrega desde el próximo despacho."},
 {id:"C-1020", categoria:"comercial",      urgencia:"baja",  confianza:0.90, motivo:"Evalúa ampliar el servicio a dos sedes más y pide visita de un asesor."},
 {id:"C-1021", categoria:"tecnica",        urgencia:"baja",  confianza:0.18, motivo:"El asunto es «Consulta» y el mensaje remite a una conversación previa que no se cita. No hay con qué decidir."},
 {id:"C-1022", categoria:"reclamo",        urgencia:"media", confianza:0.24, motivo:"Hace seguimiento a un caso anterior pero no dice cuál ni de qué se trataba."},
 {id:"C-1023", categoria:"tecnica",        urgencia:"alta",  confianza:0.31, motivo:"Insiste en que es urgente, pero «lo de ayer» no identifica ningún asunto. Conviene que lo vea una persona."},
 {id:"C-1024", categoria:"administrativa", urgencia:"media", confianza:0.92, motivo:"Pide actualizar el correo de contacto de la cuenta."},
 {id:"C-1025", categoria:"administrativa", urgencia:"baja",  confianza:0.15, motivo:"Asunto «Tema pendiente» y dos líneas de cortesía. No hay información para clasificar."},
 {id:"C-1026", categoria:"reclamo",        urgencia:"alta",  confianza:0.95, motivo:"Le facturan un servicio cancelado en agosto por segundo mes seguido y pide devolución. Es cliente clave."},
 {id:"C-1027", categoria:"tecnica",        urgencia:"media", confianza:0.90, motivo:"El sistema quedó lento tras la actualización del fin de semana: consultas de segundos pasaron a un minuto."},
 {id:"C-1028", categoria:"administrativa", urgencia:"media", confianza:0.12, motivo:"Es un reenvío encadenado sin texto propio; el contenido está en un hilo que no se incluye."},
 {id:"C-1029", categoria:"reclamo",        urgencia:"media", confianza:0.93, motivo:"Lleva un mes con el mismo problema y anuncia queja ante la Superintendencia si no hay respuesta en 48 horas."},
 {id:"C-1030", categoria:"comercial",      urgencia:"media", confianza:0.89, motivo:"Solicita ampliación de cupo de crédito por aumento del volumen de compras."}
];

/* ── VALIDACIÓN ─────────────────────────────────────────────────
   Un modelo devuelve texto y el texto puede venir mal. Nada de lo que
   llega se usa sin verificar, ni siquiera en la maqueta: esta es la
   lógica real que protegería a la aplicación en producción.          */
const CATS_VALIDAS = Object.keys(CATEGORIAS);
const URGS_VALIDAS = Object.keys(URGENCIAS);

function validar(fila){
  if(!fila || typeof fila !== "object") return null;
  const categoria = CATS_VALIDAS.includes(fila.categoria) ? fila.categoria : null;
  const urgencia  = URGS_VALIDAS.includes(fila.urgencia)  ? fila.urgencia  : null;
  let confianza = Number(fila.confianza);
  if(!isFinite(confianza)) confianza = 0;
  return {categoria, urgencia, confianza: Math.max(0, Math.min(1, confianza)),
          motivo: String(fila.motivo || "").slice(0, 260)};
}

function aplicarRedDeSeguridad(caso, correo){
  const texto = correo.asunto + " \n " + correo.cuerpo;
  for(const r of REGLAS_DURAS){
    if(r.patron.test(texto)){
      const corrigio = caso.urgencia !== "alta";
      return {...caso, categoria: caso.categoria || "reclamo", urgencia:"alta",
              area: CATEGORIAS[caso.categoria || "reclamo"].area,
              revisar:false, reglaDura:r.etiqueta, redCorrigio:corrigio};
    }
  }
  return caso;
}

function armar(correo, v){
  if(!v || !v.categoria || !v.urgencia)
    return {...correo, categoria:null, area:null, urgencia:null, confianza:v ? v.confianza : 0,
            revisar:true, motivo:v ? v.motivo : "El modelo no devolvió una clasificación válida para este correo.",
            reglaDura:null};
  const revisar = v.confianza < UMBRAL_CONFIANZA;
  const base = {...correo,
    categoria: revisar ? null : v.categoria,
    area:      revisar ? null : CATEGORIAS[v.categoria].area,
    urgencia:  revisar ? null : v.urgencia,
    confianza: v.confianza, revisar, motivo: v.motivo, reglaDura:null};
  return aplicarRedDeSeguridad(base, correo);
}

/* Recorre los lotes como lo haría con el modelo real, con una pausa
   por lote para que el progreso se vea. Cambiar esta función por la
   llamada al modelo es lo único que haría falta para pasar a producción. */
async function clasificar(correos, onProgreso){
  const salida = [];
  for(let i = 0; i < correos.length; i += LOTE){
    const lote = correos.slice(i, i + LOTE);
    await new Promise(r => setTimeout(r, 700));          // aquí iría la llamada al modelo
    const porId = {};
    RESPUESTA_DEL_MODELO.forEach(f => { porId[f.id] = validar(f); });
    lote.forEach(c => salida.push(armar(c, porId[c.id])));
    if(onProgreso) onProgreso(salida.length, correos.length, Math.ceil((i + LOTE) / LOTE));
  }
  return salida;
}
