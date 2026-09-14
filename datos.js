/* ────────────────────────────────────────────────────────────────
   DATOS DE EJEMPLO · 30 correos tal como llegarían al buzón común.
   Ninguno trae categoría, área ni urgencia: eso es justamente lo
   que hoy un humano tiene que deducir leyendo uno por uno.
   `haceMin` = minutos transcurridos desde que llegó el correo.
──────────────────────────────────────────────────────────────── */
window.CORREOS = [
 {id:"C-1001", de:"María Fernanda Osorio", correo:"mf.osorio@distrialimentos.co", clienteClave:true,  haceMin:312,
  asunto:"Llevo tres días sin servicio y nadie me responde",
  cuerpo:"Buenas tardes. Desde el lunes no tenemos servicio en la sede de Yumbo. He llamado cuatro veces y nadie da razón. Esto nos tiene la operación detenida y estamos perdiendo pedidos."},

 {id:"C-1002", de:"Andrés Gutiérrez", correo:"agutierrez@corpovalle.com", clienteClave:false, haceMin:58,
  asunto:"Cotización para 50 licencias del plan empresarial",
  cuerpo:"Cordial saludo. Necesitamos una cotización formal para 50 licencias, con precios por volumen y condiciones de pago a 60 días. Agradezco enviarla antes del viernes."},

 {id:"C-1003", de:"Soporte Interno", correo:"monitoreo@nuestraempresa.co", clienteClave:false, haceMin:22,
  asunto:"Error 504 al generar el reporte mensual de consumo",
  cuerpo:"El módulo de reportes devuelve error 504 cuando se solicita el consolidado del mes. Adjunto el log del servidor. Se reproduce en los tres ambientes."},

 {id:"C-1004", de:"Claudia Restrepo", correo:"crestrepo@textilesdelsur.co", clienteClave:false, haceMin:840,
  asunto:"Cobro duplicado en la factura de octubre",
  cuerpo:"Revisando la factura de octubre encuentro dos cargos idénticos por el mismo servicio. Solicito la corrección y la nota crédito correspondiente."},

 {id:"C-1005", de:"Jorge Iván Mejía", correo:"jimejia@logisticapacifico.com", clienteClave:true, haceMin:95,
  asunto:"Si no me solucionan hoy procedo a cancelar el contrato",
  cuerpo:"Es la tercera vez que escribo por el mismo tema y no obtengo respuesta. Si al cierre de hoy no tengo una solución concreta, voy a cancelar el contrato y evaluar con mi abogado las acciones que correspondan."},

 {id:"C-1006", de:"Paula Andrea Cifuentes", correo:"pcifuentes@grupoandino.co", clienteClave:false, haceMin:175,
  asunto:"¿Cómo configuro el acceso por VPN para un usuario nuevo?",
  cuerpo:"Entró una persona nueva al equipo y necesito darle acceso remoto. ¿Me pueden indicar el procedimiento o enviarme el manual de configuración?"},

 {id:"C-1007", de:"Ricardo Salazar", correo:"rsalazar@inversionesrs.co", clienteClave:false, haceMin:40,
  asunto:"Solicito certificado de paz y salvo",
  cuerpo:"Buenos días. Requiero el certificado de paz y salvo a corte de noviembre para un trámite bancario. Quedo atento."},

 {id:"C-1008", de:"Natalia Ospina", correo:"nospina@farmaciasunidas.co", clienteClave:false, haceMin:19,
  asunto:"La API devuelve 401 desde ayer en la tarde",
  cuerpo:"Nuestra integración dejó de funcionar. Todas las peticiones al endpoint de consulta responden 401 aunque el token no ha cambiado ni ha vencido."},

 {id:"C-1009", de:"Operaciones Bodega Norte", correo:"bodeganorte@nuestraempresa.co", clienteClave:false, haceMin:130,
  asunto:"Confirmación de la entrega programada del jueves",
  cuerpo:"Solicito confirmar si el despacho del jueves llega en la mañana o en la tarde, para organizar el personal de descargue."},

 {id:"C-1010", de:"Luis Eduardo Parra", correo:"leparra@constructoraparra.co", clienteClave:false, haceMin:1440,
  asunto:"El técnico no llegó a la cita programada",
  cuerpo:"Ayer esperamos toda la tarde al técnico y nunca llegó, tampoco avisaron. Necesito reprogramar y saber qué pasó."},

 {id:"C-1011", de:"Sandra Milena Vélez", correo:"smvelez@comercialvelez.co", clienteClave:false, haceMin:66,
  asunto:"Información sobre el plan empresarial",
  cuerpo:"Quisiera conocer qué incluye el plan empresarial y en qué se diferencia del plan que tenemos actualmente. ¿Hay descuento por pago anual?"},

 {id:"C-1012", de:"Héctor Ramírez", correo:"hramirez@agroexportvalle.co", clienteClave:false, haceMin:28,
  asunto:"Necesito copia de la factura de septiembre",
  cuerpo:"Extravié la factura de septiembre y la necesito para el cierre contable. ¿Me la pueden reenviar al mismo correo?"},

 {id:"C-1013", de:"Centro de Monitoreo", correo:"noc@nuestraempresa.co", clienteClave:false, haceMin:8,
  asunto:"Servidor de producción caído — sin acceso al sistema",
  cuerpo:"El servidor de producción no responde desde las 8:40. Ningún cliente puede ingresar al sistema. Se requiere intervención inmediata."},

 {id:"C-1014", de:"Diana Carolina Loaiza", correo:"dcloaiza@serviciosdl.co", clienteClave:false, haceMin:210,
  asunto:"Actualización de datos de facturación",
  cuerpo:"Cambiamos de razón social. Adjunto el RUT actualizado para que modifiquen los datos de facturación a partir del próximo mes."},

 {id:"C-1015", de:"Mauricio Betancourt", correo:"mbetancourt@transcali.co", clienteClave:true, haceMin:52,
  asunto:"Renovación del contrato anual",
  cuerpo:"El contrato vence el 30 de este mes. Quisiera revisar condiciones de renovación y si es posible mejorar las tarifas por el volumen que manejamos."},

 {id:"C-1016", de:"Ana Lucía Trujillo", correo:"altrujillo@clinicasantamaria.co", clienteClave:false, haceMin:300,
  asunto:"Inconforme con la atención recibida en la sucursal",
  cuerpo:"Fui a la sucursal del centro y la atención fue pésima. Me hicieron esperar más de una hora y al final me dijeron que volviera otro día. Quiero dejar constancia de mi queja."},

 {id:"C-1017", de:"Camilo Andrés Ruiz", correo:"caruiz@distribucionesruiz.co", clienteClave:false, haceMin:88,
  asunto:"Reprogramar la instalación del jueves",
  cuerpo:"Por un tema de obra civil no vamos a estar listos el jueves. ¿Podemos mover la instalación para la semana siguiente?"},

 {id:"C-1018", de:"Yesenia Mosquera", correo:"ymosquera@pescaderiadelpacifico.co", clienteClave:false, haceMin:14,
  asunto:"No puedo instalar la actualización en Windows 11",
  cuerpo:"Al ejecutar el instalador aparece un mensaje de error y se cierra solo. Ya reinicié el equipo y desactivé el antivirus, pero sigue igual."},

 {id:"C-1019", de:"Óscar Hernán Cardona", correo:"ohcardona@maderasdelcauca.co", clienteClave:false, haceMin:405,
  asunto:"Cambio de dirección para el próximo despacho",
  cuerpo:"Nos trasladamos de sede. La nueva dirección es Calle 15 # 8-42, Bodega 3. Aplicar desde el próximo despacho."},

 {id:"C-1020", de:"Gloria Esperanza Muñoz", correo:"gemunoz@almacenesgm.co", clienteClave:false, haceMin:1180,
  asunto:"Solicito visita de un asesor comercial",
  cuerpo:"Estamos evaluando ampliar el servicio a dos sedes más. Me gustaría que un asesor nos visite para entender las opciones."},

 {id:"C-1021", de:"Fabián Arteaga", correo:"farteaga@metalmecanicafa.co", clienteClave:false, haceMin:35,
  asunto:"Consulta",
  cuerpo:"Buenas. Tengo una duda sobre lo que hablamos. ¿Me pueden confirmar?"},

 {id:"C-1022", de:"Liliana Bermúdez", correo:"lbermudez@editorialib.co", clienteClave:false, haceMin:72,
  asunto:"Seguimiento al caso anterior",
  cuerpo:"Quedo atenta a la respuesta del tema que reporté la semana pasada. Gracias."},

 {id:"C-1023", de:"Jhon Freddy Caicedo", correo:"jfcaicedo@transportesjc.co", clienteClave:false, haceMin:6,
  asunto:"Necesito ayuda urgente con lo de ayer",
  cuerpo:"Es urgente, por favor. Lo de ayer sigue sin resolverse y lo necesito hoy mismo."},

 {id:"C-1024", de:"Marcela Villegas", correo:"mvillegas@cosmeticosmv.co", clienteClave:false, haceMin:160,
  asunto:"Cambio de correo de contacto",
  cuerpo:"Por favor actualizar el correo de contacto de la cuenta. El nuevo es contacto@cosmeticosmv.co"},

 {id:"C-1025", de:"Esteban Quintero", correo:"equintero@ferreteriaeq.co", clienteClave:false, haceMin:1560,
  asunto:"Tema pendiente",
  cuerpo:"Buenos días, sigo pendiente. Quedo atento."},

 {id:"C-1026", de:"Tatiana Lozano", correo:"tlozano@seguroslozano.co", clienteClave:true, haceMin:48,
  asunto:"Facturaron un servicio que cancelamos en agosto",
  cuerpo:"Cancelamos el servicio adicional en agosto y nos siguen facturando. Es el segundo mes consecutivo. Solicito la devolución de ambos cobros."},

 {id:"C-1027", de:"Germán Alberto Ocampo", correo:"gaocampo@lacteoscauca.co", clienteClave:false, haceMin:26,
  asunto:"Lentitud en el sistema desde la actualización",
  cuerpo:"Después de la actualización del fin de semana el sistema quedó muy lento. Una consulta que tardaba segundos ahora se demora más de un minuto."},

 {id:"C-1028", de:"Viviana Andrade", correo:"vandrade@panaderiava.co", clienteClave:false, haceMin:118,
  asunto:"Re: Re: Fwd: pendiente",
  cuerpo:"Reenvío nuevamente. Ver hilo abajo."},

 {id:"C-1029", de:"Alexander Ceballos", correo:"aceballos@vidriosac.co", clienteClave:false, haceMin:11,
  asunto:"Instauro queja ante la Superintendencia si no hay respuesta",
  cuerpo:"Llevo un mes con el mismo problema sin solución. Si en 48 horas no recibo una respuesta formal, instauro la queja ante la Superintendencia y evalúo una tutela."},

 {id:"C-1030", de:"Carolina Zapata", correo:"czapata@importadoracz.co", clienteClave:false, haceMin:78,
  asunto:"Solicitud de ampliación de cupo de crédito",
  cuerpo:"Queremos solicitar una ampliación del cupo de crédito para el próximo trimestre por aumento en el volumen de compras."}
];
