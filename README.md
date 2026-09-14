# Caso 2 · Entrega B — Clasificación y asignación de solicitudes

Solución web para el proceso de atención de solicitudes que hoy llega como **500 correos
diarios a un buzón compartido** y se clasifica a mano.

**Enlace publicado:** _(se completa al activar GitHub Pages)_
**Documento de análisis (Entrega A):** [`analisis/analisis-caso2.html`](analisis/analisis-caso2.html)

---

## Qué hace

| Requisito de la entrega | Dónde está |
|---|---|
| Muestra las solicitudes (mínimo 20 casos de ejemplo) | 30 correos en `datos.js`, vista «Bandeja de entrada» |
| Las clasifica sola | `modelo.js` — un modelo de lenguaje con prompt predefinido |
| Las asigna y prioriza | Cada caso recibe área responsable, urgencia y reloj de SLA |
| Muestra indicadores | Volumen, distribución por categoría/área/urgencia y tiempo de asignación |

## Cómo se ejecuta

No necesita servidor ni instalación: **abrir `index.html` en el navegador**.
Todo es HTML, CSS y JavaScript sin dependencias externas.

## Archivos

```
index.html     estructura de la página — este es el que se abre
estilos.css    presentación (tres colores, se adapta a tema claro y oscuro)
datos.js       los 30 correos de ejemplo, en formato JSON
modelo.js      el prompt, la respuesta del modelo, la validación y las reglas de seguridad
app.js         interfaz: indicadores, filtros, fichas y corrección manual
```

```
analisis/      la Entrega A: el documento de análisis en 4 hojas
```

## Cómo clasifica: con un modelo de lenguaje

El enunciado permitía clasificar por reglas o llamando a un modelo. **Usamos un modelo**, que es
el enfoque de *IA aplicada* del seminario: no entrenamos nada, integramos un modelo que ya existe
para resolver un problema concreto.

> **Esta entrega es un prototipo.** La respuesta del modelo está guardada como JSON de ejemplo
> (`RESPUESTA_DEL_MODELO` en `modelo.js`), tal como permite el enunciado. No hay llave de API ni
> llamada a un servicio externo. Todo lo demás —el prompt, la validación, el umbral de confianza
> y las reglas de seguridad— es la lógica que se usaría en producción, sin cambios.
> Para pasar a producción solo habría que reemplazar una función: `clasificar()`, donde está
> marcado el punto exacto con el comentario `// aquí iría la llamada al modelo`.

### El prompt

Está en `construirPrompt()`, dentro de `modelo.js`, y se puede ver desde la misma página con el
enlace «Ver el prompt de clasificación». Define las cinco categorías, los criterios de urgencia y
—lo más importante— **la instrucción explícita de no adivinar**. Los correos se envían en lotes
de 10. Por cada uno, el modelo devuelve:

```json
{"id":"C-1001","categoria":"reclamo","urgencia":"alta","confianza":0.96,
 "motivo":"Lleva tres días sin servicio, la operación está detenida y ya reclamó cuatro veces."}
```

El `motivo` se muestra al abrir cualquier caso: **el sistema explica por qué decidió lo que
decidió**, en lugar de entregar una etiqueta sin justificación.

### Nada de lo que devuelve el modelo se cree sin validar

Un modelo devuelve texto, y el texto puede venir mal. Antes de usar la respuesta:

1. Se verifica que la categoría y la urgencia estén dentro de los valores permitidos.
2. La confianza se fuerza al rango 0–1.
3. Si un correo no vuelve, o vuelve inválido, **no se inventa nada**: ese caso entra a revisión humana.

### Confianza y revisión humana

Lo que el modelo marca con confianza menor al 45 % no se asigna: entra a la cola de revisión
humana, que aparece **de primera** en el listado. Que el sistema aparte lo dudoso en lugar de
adivinar es el comportamiento correcto, no una falla.

### Red de seguridad: tres reglas por encima del modelo

Los modelos se equivocan, y el error más caro de este sistema es tratar un reclamo grave como
consulta rutinaria. Por eso, por encima de lo que diga el modelo corren tres reglas fijas:
mención de **cancelación de contrato**, de **acciones legales** y de **organismos de control**.

Estas reglas **solo suben la urgencia, nunca la bajan**. En la muestra hay un caso que lo
demuestra: en **C-1029** el modelo asignó urgencia media y la regla la subió a alta por la mención
de la Superintendencia. Al abrir ese caso, la ficha lo dice explícitamente.

## Resultados con los 30 correos de ejemplo

| Indicador | Valor |
|---|---|
| Correos enviados al modelo | 30, en 3 lotes |
| Asignados automáticamente | 25 de 30 · 83 % |
| Enviados a revisión humana | 5 · 17 % |
| Urgencia alta detectada | 5 |
| Reglas de seguridad activadas | 2 (una corrigió al modelo) |

Los 5 casos que van a revisión humana tienen asuntos como «Consulta», «Tema pendiente» o
«Re: Re: Fwd: pendiente»: textos donde ningún clasificador —ni humano ni automático— puede
decidir sin abrir el hilo. Que el sistema los aparte en lugar de adivinar **es el
comportamiento correcto**, no una falla.

## Cómo ajustar el clasificador

Todo está en `modelo.js`:

- **El prompt:** `construirPrompt()`. Es lo que hay que mostrar si preguntan cómo se usó la IA.
- **Ser más o menos estricto:** `UMBRAL_CONFIANZA`. Subirlo da más precisión y más trabajo
  manual; bajarlo, lo contrario.
- **Las reglas de seguridad:** `REGLAS_DURAS`.
- **Los SLA por urgencia:** `URGENCIAS`.
- **Conectar un modelo real:** reemplazar la pausa dentro de `clasificar()` por la llamada
  al modelo. Es la única función que cambia.

---

Institución Universitaria Antonio José Camacho · Ingeniería de Sistemas · Seminario de Actualización · 2026-2
Dilann Belalcazar · Kevin Rubio · Alejandro Romero · Juan Camilo Paz · Deiby Camacho
