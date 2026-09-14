/* Caso 2 · Entrega B — interfaz */
const $ = s => document.querySelector(s);
let CASOS = [], filtro = {area:"todas", urgencia:"todas", texto:""}, msProceso = 0, lotes = 0;

const horas = m => m < 60 ? `${m} min` : `${(m/60).toFixed(m<600?1:0)} h`;
const esc = t => String(t).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));

function sla(c){
  if(c.revisar) return null;
  const restante = URGENCIAS[c.urgencia].slaHoras * 60 - c.haceMin;
  return {restante, vencido: restante < 0};
}

/* ── bandeja sin procesar ── */
function pintarCruda(){
  $("#listaCruda").innerHTML = window.CORREOS.map(c => `
    <div class="caso">
      <div class="caso-top"><div>
        <div class="caso-asunto">${esc(c.asunto)}</div>
        <div class="caso-de">${esc(c.de)} · ${esc(c.correo)}</div>
      </div><div class="sla">hace ${horas(c.haceMin)}</div></div>
      <div class="caso-meta"><span class="eti">sin clasificar</span></div>
    </div>`).join("");
}

/* ── indicadores ── */
const kpi = (v, k, n, oro) =>
  `<div class="kpi${oro?" oro":""}"><div class="v">${v}</div><div class="k">${k}</div><div class="n">${n}</div></div>`;

function pintarKpis(){
  const total = CASOS.length;
  const rev   = CASOS.filter(c => c.revisar).length;
  const urg   = CASOS.filter(c => c.urgencia === "alta").length;
  const venc  = CASOS.filter(c => { const s = sla(c); return s && s.vencido; }).length;
  const corr  = CASOS.filter(c => c.correccionManual).length;
  const red   = CASOS.filter(c => c.redCorrigio).length;

  $("#kpis").innerHTML = `
    ${kpi(total, "Correos procesados", `Enviados al modelo en ${lotes} llamadas`)}
    ${kpi((total-rev) + " · " + Math.round((total-rev)/total*100) + "%", "Asignados solos", "Sin que nadie los leyera")}
    ${kpi(rev, "A revisión humana", "El modelo declaró baja confianza", true)}
    ${kpi(urg, "Urgencia alta", "Con SLA de 4 horas")}
    ${kpi((msProceso/1000).toFixed(1) + " s", "Tiempo de asignación", "Antes: 4 h de espera en el buzón")}
    ${kpi(venc, "Fuera de SLA", "Ya venían atrasados del buzón")}
    ${red  ? kpi(red,  red===1?"Corregido por regla":"Corregidos por regla", "El modelo subestimó la urgencia") : ""}
    ${corr ? kpi(corr, corr===1?"Corregido a mano":"Corregidos a mano", "Proxy de la precisión del modelo") : ""}`;
}

function barras(destino, datos, resaltar){
  const max = Math.max(...Object.values(datos), 1);
  $(destino).innerHTML = Object.entries(datos).sort((a,b)=>b[1]-a[1]).map(([k,v]) => `
    <div class="barra-fila">
      <span>${esc(k)}</span>
      <span class="barra-pista"><span class="barra-val${k===resaltar?" oro":""}" style="width:${v/max*100}%"></span></span>
      <span class="cifra">${v}</span>
    </div>`).join("");
}

function pintarGraficos(){
  const cuenta = fn => CASOS.reduce((a,c) => { const k = fn(c); if(k) a[k] = (a[k]||0)+1; return a; }, {});
  barras("#gCategoria", cuenta(c => c.revisar ? "Sin clasificar" : CATEGORIAS[c.categoria].nombre), "Sin clasificar");
  barras("#gArea",      cuenta(c => c.revisar ? "Revisión humana" : c.area), "Revisión humana");
  barras("#gUrgencia",  cuenta(c => c.revisar ? "Sin definir" : URGENCIAS[c.urgencia].nombre), "Alta");
}

/* ── filtros ── */
function pintarFiltros(){
  const areas = [...new Set(CASOS.filter(c=>!c.revisar).map(c=>c.area))].sort();
  $("#filtros").innerHTML =
    `<button class="chip${filtro.area==="todas"?" on":""}" data-a="todas">Todas</button>` +
    areas.map(a => `<button class="chip${filtro.area===a?" on":""}" data-a="${esc(a)}">${esc(a)}</button>`).join("") +
    `<button class="chip${filtro.area==="revisar"?" on":""}" data-a="revisar">Revisión humana</button>` +
    `<button class="chip${filtro.urgencia==="alta"?" on":""}" data-u="alta">Solo urgentes</button>` +
    `<input class="buscar" id="buscar" placeholder="Buscar…" value="${esc(filtro.texto)}">`;

  $("#filtros").querySelectorAll("[data-a]").forEach(b =>
    b.onclick = () => { filtro.area = b.dataset.a; pintarFiltros(); pintarCasos(); });
  $("#filtros").querySelector("[data-u]").onclick =
    () => { filtro.urgencia = filtro.urgencia === "alta" ? "todas" : "alta"; pintarFiltros(); pintarCasos(); };
  const inp = $("#buscar");
  inp.oninput = () => { filtro.texto = inp.value; pintarCasos(); };
}

function visibles(){
  return CASOS.filter(c => {
    if(filtro.area === "revisar" && !c.revisar) return false;
    if(filtro.area !== "todas" && filtro.area !== "revisar" && c.area !== filtro.area) return false;
    if(filtro.urgencia === "alta" && c.urgencia !== "alta") return false;
    if(filtro.texto && !(c.asunto + c.cuerpo + c.de).toLowerCase().includes(filtro.texto.toLowerCase())) return false;
    return true;
  }).sort((a,b) => {
    if(a.revisar !== b.revisar) return a.revisar ? -1 : 1;           // lo dudoso, primero
    const oa = a.urgencia ? URGENCIAS[a.urgencia].orden : -1;
    const ob = b.urgencia ? URGENCIAS[b.urgencia].orden : -1;
    return oa - ob || b.haceMin - a.haceMin;                          // urgencia, luego antigüedad
  });
}

function pintarCasos(){
  const lista = visibles();
  if(!lista.length){ $("#listaCasos").innerHTML = `<div class="vacio">Ningún caso coincide con el filtro.</div>`; return; }
  $("#listaCasos").innerHTML = lista.map(c => {
    const s = sla(c);
    return `<div class="caso ${c.revisar ? "revisar" : "u-" + c.urgencia}" data-id="${c.id}">
      <div class="caso-top"><div>
        <div class="caso-asunto">${esc(c.asunto)}</div>
        <div class="caso-de">${esc(c.de)} · hace ${horas(c.haceMin)}</div>
      </div>
      <div class="sla">${s ? (s.vencido ? "SLA vencido" : "quedan " + horas(s.restante)) : "sin asignar"}</div></div>
      <div class="caso-meta">
        ${c.revisar
          ? `<span class="eti dura">Revisión humana · confianza ${Math.round(c.confianza*100)}%</span>`
          : `<span class="eti area">${esc(c.area)}</span>
             <span class="eti">${esc(CATEGORIAS[c.categoria].nombre)}</span>
             <span class="eti${c.urgencia==="alta"?" alta":""}">Urgencia ${c.urgencia}</span>
             <span class="eti">confianza ${Math.round(c.confianza*100)}%</span>`}
        ${c.reglaDura ? `<span class="eti dura">Regla de seguridad</span>` : ""}
        ${c.correccionManual ? `<span class="eti dura">Corregido a mano</span>` : ""}
        ${s && s.vencido ? `<span class="eti vencido">Fuera de SLA</span>` : ""}
      </div></div>`;
  }).join("");
  $("#listaCasos").querySelectorAll(".caso").forEach(d => d.onclick = () => abrirFicha(d.dataset.id));
}

/* ── ficha: lo que el modelo respondió ── */
function abrirFicha(id){
  const c = CASOS.find(x => x.id === id);
  $("#ficha").innerHTML = `
    <button class="cerrar" id="cerrar" aria-label="Cerrar">×</button>
    <h2>${esc(c.asunto)}</h2>
    <div class="de">${esc(c.de)} · ${esc(c.correo)} · hace ${horas(c.haceMin)}${c.clienteClave?" · cliente clave":""}</div>
    <div class="cuerpo">${esc(c.cuerpo)}</div>
    <div class="porque">
      <h4>Qué respondió el modelo</h4>
      <div class="regla"><span class="peso">MOTIVO</span><span>${esc(c.motivo || "Sin explicación.")}</span></div>
      <div class="regla"><span class="peso">CONFIANZA</span><span>${Math.round(c.confianza*100)} % · el umbral para asignar es ${UMBRAL_CONFIANZA*100} %</span></div>
      ${c.reglaDura ? `<div class="regla"><span class="peso">SEGURIDAD</span><span>${esc(c.reglaDura)}.
        ${c.redCorrigio
          ? "El modelo no lo había marcado como urgente; la regla subió la urgencia a alta."
          : "Coincide con lo que decidió el modelo."}</span></div>` : ""}
      <div class="regla"><span class="peso">RESULTADO</span><span>${c.revisar
        ? "Confianza por debajo del umbral. El sistema prefiere no adivinar: queda sin asignar."
        : `${CATEGORIAS[c.categoria].nombre} → ${c.area} · urgencia ${c.urgencia} · SLA de ${URGENCIAS[c.urgencia].slaHoras} h`}</span></div>
    </div>
    <div class="reasignar">
      <span class="etq">Corregir a mano:</span>
      <select id="selArea" aria-label="Área">${(c.categoria?"":`<option value="">— elegir área —</option>`) +
        Object.entries(CATEGORIAS).map(([k,v]) =>
        `<option value="${k}"${k===c.categoria?" selected":""}>${v.nombre} → ${v.area}</option>`).join("")}</select>
      <select id="selUrg" aria-label="Urgencia">${(c.urgencia?"":`<option value="">— elegir urgencia —</option>`) +
        Object.entries(URGENCIAS).map(([k,v]) =>
        `<option value="${k}"${k===c.urgencia?" selected":""}>Urgencia ${v.nombre}</option>`).join("")}</select>
      <button class="btn" id="guardar">Asignar</button>
    </div>`;
  abrirVelo();
  $("#guardar").onclick = () => {
    const cat = $("#selArea").value, urg = $("#selUrg").value;
    if(!cat || !urg){ alert("Elige el área y la urgencia antes de asignar."); return; }
    Object.assign(c, {categoria:cat, area:CATEGORIAS[cat].area, urgencia:urg,
                      revisar:false, correccionManual:true});
    cerrarVelo(); pintarTodo();
  };
}

/* ── el prompt, a la vista ── */
function verPrompt(){
  $("#ficha").innerHTML = `
    <button class="cerrar" id="cerrar" aria-label="Cerrar">×</button>
    <h2>El prompt de clasificación</h2>
    <div class="de">Esto es lo que se le envía al modelo junto con cada lote de 10 correos.</div>
    <pre class="prompt">${esc(construirPrompt(window.CORREOS.slice(0,2)))}

… y así con los 10 correos del lote.</pre>`;
  abrirVelo();
}

function abrirVelo(){
  $("#velo").classList.remove("oculto");
  $("#cerrar").onclick = cerrarVelo;
  $("#cerrar").focus();
}
const cerrarVelo = () => $("#velo").classList.add("oculto");
$("#velo").onclick = e => { if(e.target.id === "velo") cerrarVelo(); };
document.addEventListener("keydown", e => { if(e.key === "Escape") cerrarVelo(); });

/* ── orquestación ── */
function pintarTodo(){ pintarKpis(); pintarGraficos(); pintarFiltros(); pintarCasos(); }

$("#btnProcesar").onclick = async () => {
  $("#btnProcesar").disabled = true;
  const t0 = performance.now();
  CASOS = await clasificar(window.CORREOS, (hechos, total, lote) => {
    lotes = lote;
    $("#accionTitulo").textContent = `Clasificando… ${hechos} de ${total} correos`;
    $("#accionNota").textContent = `Lote ${lote} enviado al modelo.`;
  });
  msProceso = performance.now() - t0;
  const rev = CASOS.filter(c => c.revisar).length;
  const red = CASOS.filter(c => c.redCorrigio).length;
  $("#accionTitulo").textContent = `30 correos clasificados por el modelo en ${(msProceso/1000).toFixed(1)} s`;
  $("#accionNota").textContent =
    `${lotes} llamadas · ${CASOS.length - rev} asignados solos · ${rev} a revisión humana`
    + (red ? ` · ${red} ${red===1?"corregido":"corregidos"} por una regla de seguridad` : "");
  $("#vistaCruda").classList.add("oculto");
  $("#vistaProcesada").classList.remove("oculto");
  $("#btnProcesar").classList.add("oculto");
  $("#btnReiniciar").classList.remove("oculto");
  pintarTodo();
};

$("#btnReiniciar").onclick = () => {
  $("#btnProcesar").disabled = false;
  $("#accionTitulo").textContent = "30 correos sin procesar en el buzón común";
  $("#accionNota").textContent = "Ninguno tiene categoría, área responsable ni urgencia. Alguien tiene que abrirlos uno por uno.";
  $("#vistaCruda").classList.remove("oculto");
  $("#vistaProcesada").classList.add("oculto");
  $("#btnProcesar").classList.remove("oculto");
  $("#btnReiniciar").classList.add("oculto");
};

$("#btnPrompt").onclick = verPrompt;

$("#btnTema").onclick = () => {
  const oscuro = document.documentElement.getAttribute("data-theme") === "dark"
    || (!document.documentElement.hasAttribute("data-theme") && matchMedia("(prefers-color-scheme:dark)").matches);
  document.documentElement.setAttribute("data-theme", oscuro ? "light" : "dark");
};

pintarCruda();
