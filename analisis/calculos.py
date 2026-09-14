# -*- coding: utf-8 -*-
"""Modelo de calculo del Caso 2. Toda cifra del documento sale de aqui."""

J = 8.0          # jornada nominal (h)
J_EF = 6.5       # jornada efectiva (h) descontando descansos/reuniones/interrupciones

# ---------- DATO DEL CASO ----------
CORREOS_DIA = 500

# ---------- SUPUESTO 1: composicion del buzon ----------
p_nuevos, p_seguim, p_ruido = 0.60, 0.25, 0.15
nuevos  = CORREOS_DIA * p_nuevos
seguim  = CORREOS_DIA * p_seguim
ruido   = CORREOS_DIA * p_ruido

# ---------- SUPUESTO 2: tiempo de triage por tipo (min) ----------
t_nuevo, t_seg, t_ruido = 2.5, 1.5, 0.25
min_triage = nuevos*t_nuevo + seguim*t_seg + ruido*t_ruido
h_triage   = min_triage/60
fte_triage = h_triage / J_EF
t_prom_correo = min_triage / CORREOS_DIA

print("=== CARGA DE TRIAGE (AS-IS) ===")
print(f"casos nuevos/dia      : {nuevos:.0f}")
print(f"seguimientos/dia      : {seguim:.0f}")
print(f"ruido/dia             : {ruido:.0f}")
print(f"minutos de triage/dia : {min_triage:.0f} min = {h_triage:.1f} h")
print(f"FTE solo en triage    : {fte_triage:.2f}")
print(f"tiempo prom. x correo : {t_prom_correo:.1f} min")

# ---------- AS-IS: etapas (trabajo min / espera h) ----------
asis = [
    ("Recepcion en buzon compartido",      0.0,  4.00),
    ("Lectura y clasificacion manual",     2.5,  0.00),
    ("Reenvio al area responsable",        0.0,  0.00),
    ("Espera en la bandeja del area",      0.0, 12.00),
    ("Resolucion por el area",            25.0,  0.00),
    ("Redaccion y envio de la respuesta",  8.0,  1.00),
]
trab_asis = sum(t for _,t,_ in asis)
esp_asis  = sum(e for _,_,e in asis)
lt_base   = esp_asis + trab_asis/60

# reproceso por mal enrutamiento
p_error, pen_error = 0.12, 12.0     # 12% de los casos, +12 h hab.
lt_asis   = lt_base + p_error*pen_error
tt_asis   = trab_asis + p_error*2.5
pct_asis  = tt_asis / (lt_asis*60) * 100

print("\n=== AS-IS ===")
print(f"trabajo total      : {trab_asis:.1f} min")
print(f"espera total       : {esp_asis:.1f} h")
print(f"lead time (base)   : {lt_base:.1f} h")
print(f"lead time (pond.)  : {lt_asis:.1f} h = {lt_asis/J:.1f} dias habiles")
print(f"touch time         : {tt_asis:.1f} min")
print(f"% trabajo real     : {pct_asis:.1f} %")

print("\n--- distribucion del lead time AS-IS ---")
for n,t,e in asis:
    tot = e + t/60
    if tot: print(f"  {n:38s} {tot:5.2f} h  {tot/lt_asis*100:5.1f} %")
rep = p_error*pen_error
print(f"  {'Espera por reproceso (promediada)':38s} {rep:5.2f} h  {rep/lt_asis*100:5.1f} %")

# ---------- ESCENARIOS: que pasa si ataco cada cosa por separado ----------
print("\n=== ESCENARIOS (prueba de cual es el cuello de botella) ===")
# 1) solo automatizar la clasificacion
lt1 = (0.05 + 0.0 + 12.0 + 1.0) + (0.15+25+8)/60 + p_error*pen_error
print(f"1. Solo clasificacion automatica      : {lt1:5.1f} h  ({(1-lt1/lt_asis)*100:4.1f} % mejor)")
# 2) solo acelerar la resolucion tecnica (25 -> 15 min)
lt2 = esp_asis + (2.5+15+8)/60 + p_error*pen_error
print(f"2. Solo resolver mas rapido (25->15m) : {lt2:5.1f} h  ({(1-lt2/lt_asis)*100:4.1f} % mejor)")
# 3) solo asignacion con dueno, prioridad y SLA (espera area 12 -> 4 h)
lt3 = (4.0 + 4.0 + 1.0) + trab_asis/60 + p_error*pen_error
print(f"3. Solo asignacion con dueno y SLA    : {lt3:5.1f} h  ({(1-lt3/lt_asis)*100:4.1f} % mejor)")

# ---------- TO-BE ----------
tobe = [
    ("Ingesta automatica: el correo se vuelve caso", 0.00, 0.05),
    ("Clasificacion por reglas + modelo",            0.15, 0.00),
    ("Asignacion con area, prioridad y SLA",         0.00, 0.00),
    ("Cola priorizada del area",                     0.00, 4.00),
    ("Resolucion por el area",                      22.00, 0.00),
    ("Respuesta desde el sistema",                   5.00, 0.30),
]
trab_tobe = sum(t for _,t,_ in tobe)
esp_tobe  = sum(e for _,_,e in tobe)
p_err_t, pen_err_t = 0.04, 4.0
lt_tobe  = esp_tobe + trab_tobe/60 + p_err_t*pen_err_t
tt_tobe  = trab_tobe
pct_tobe = tt_tobe/(lt_tobe*60)*100

# carga de triage TO-BE: 15% de baja confianza revisado a mano (1 min)
p_baja = 0.15
min_triage_t = nuevos*p_baja*1.0 + seguim*0.1*1.0
fte_triage_t = (min_triage_t/60)/J_EF

print("\n=== TO-BE ===")
print(f"lead time      : {lt_tobe:.1f} h = {lt_tobe/J:.1f} dias habiles   ({(1-lt_tobe/lt_asis)*100:.0f} % mejor)")
print(f"touch time     : {tt_tobe:.1f} min                     ({(1-tt_tobe/tt_asis)*100:.0f} % mejor)")
print(f"% trabajo real : {pct_tobe:.1f} %   (AS-IS {pct_asis:.1f} %)  x{pct_tobe/pct_asis:.1f}")
print(f"triage: {min_triage_t:.0f} min/dia = {fte_triage_t:.2f} FTE  (libera {fte_triage-fte_triage_t:.1f} FTE)")
