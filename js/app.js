/* ============================================
   InnovaEdu — Lógica principal
   ============================================ */

// ─── Estado global ───────────────────────────
const state = {
  apiKey: localStorage.getItem('innovaedu_api_key') || '',
  selectedTendencia: '',
  selectedDTStep: 1,
  selectedDTName: 'Empatizar',
};

// ─── Inicialización ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initAPIModal();
  initTagCards();
  initDTSteps();
  initButtons();
  updateAPIStatus();
});

// ─── Navegación entre módulos ─────────────────
function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const module = btn.dataset.module;
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('mod-' + module).classList.add('active');
    });
  });
}

// ─── Modal de API Key ─────────────────────────
function initAPIModal() {
  const overlay = document.getElementById('api-modal');
  const input   = document.getElementById('api-key-input');

  document.getElementById('api-config-btn').addEventListener('click', () => {
    input.value = state.apiKey;
    overlay.classList.remove('hidden');
  });

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  document.getElementById('modal-save').addEventListener('click', () => {
    const key = input.value.trim();
    if (!key.startsWith('sk-ant-')) {
      alert('La API Key debe empezar con "sk-ant-". Verifica que la copiaste correctamente.');
      return;
    }
    state.apiKey = key;
    localStorage.setItem('innovaedu_api_key', key);
    updateAPIStatus();
    closeModal();
  });
}

function closeModal() {
  document.getElementById('api-modal').classList.add('hidden');
}

function updateAPIStatus() {
  const dot  = document.getElementById('status-dot');
  const text = document.getElementById('status-text');
  if (state.apiKey) {
    dot.classList.add('connected');
    text.textContent = 'API conectada';
  } else {
    dot.classList.remove('connected');
    text.textContent = 'Sin API Key';
  }
}

// ─── Tag cards (Megatendencias) ───────────────
function initTagCards() {
  document.querySelectorAll('.tag-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.tag-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedTendencia = card.dataset.value;
    });
  });
}

// ─── Pasos Design Thinking ────────────────────
function initDTSteps() {
  document.querySelectorAll('.step-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.step-item').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      state.selectedDTStep = parseInt(item.dataset.step);
      state.selectedDTName = item.dataset.name;
    });
  });
}

// ─── Botones de acción ────────────────────────
function initButtons() {
  document.getElementById('tend-btn').addEventListener('click', runTendencias);
  document.getElementById('jtbd-btn').addEventListener('click', runJTBD);
  document.getElementById('canvas-btn').addEventListener('click', runCanvas);
  document.getElementById('dt-btn').addEventListener('click', runDesignThinking);
  document.getElementById('ocean-btn').addEventListener('click', runOcean);
  document.getElementById('pitch-btn').addEventListener('click', runPitch);
}

// ─── Llamada a la API de Anthropic ───────────
async function callClaude(userPrompt, systemPrompt) {
  if (!state.apiKey) {
    alert('Primero configura tu Anthropic API Key haciendo clic en el botón "API Key" arriba a la derecha.');
    return null;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': state.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: systemPrompt || 'Eres un experto en innovación, emprendimiento y metodologías de diseño, con profundo conocimiento del contexto colombiano y latinoamericano. Responde siempre en español, de forma clara, práctica y bien estructurada. Usa listas, emojis moderados y secciones cuando aporte claridad.',
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Error HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

// ─── Helper: mostrar loading en caja ──────────
function showLoading(boxId, msg = 'Analizando con IA...') {
  const box = document.getElementById(boxId);
  box.classList.remove('hidden');
  box.innerHTML = `<span class="loading">${msg}</span>`;
  return box;
}

function setButtonLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  btn.disabled = loading;
}

// ─── MÓDULO 1: MEGATENDENCIAS ─────────────────
async function runTendencias() {
  if (!state.selectedTendencia) {
    alert('Selecciona una megatendencia primero.');
    return;
  }
  const industria = document.getElementById('tend-industria').value.trim()
    || 'sector educativo colombiano';

  setButtonLoading('tend-btn', true);
  const box = showLoading('tend-result', 'Analizando megatendencia...');

  try {
    const prompt = `Analiza la megatendencia **"${state.selectedTendencia}"** aplicada al siguiente contexto colombiano: "${industria}".

Estructura tu respuesta así:
1. 🌍 **¿Por qué esta tendencia es relevante para ese contexto?** (2-3 párrafos concisos)
2. 💡 **3 oportunidades concretas de innovación** (con nombre, descripción breve y público objetivo de cada una)
3. 🇨🇴 **Ejemplo inspirador** de Colombia o Latinoamérica que ya esté aprovechando esta tendencia
4. ⚡ **Próximo paso recomendado** para comenzar a explorar esta oportunidad

Sé específico, práctico y orientado a la acción.`;

    const result = await callClaude(prompt);
    if (result) box.innerHTML = result;
  } catch (e) {
    box.innerHTML = `❌ Error: ${e.message}`;
  } finally {
    setButtonLoading('tend-btn', false);
  }
}

// ─── MÓDULO 2: JTBD ───────────────────────────
async function runJTBD() {
  const user     = document.getElementById('jtbd-user').value.trim();
  const problema = document.getElementById('jtbd-problema').value.trim();

  if (!user || !problema) {
    alert('Completa todos los campos antes de continuar.');
    return;
  }

  setButtonLoading('jtbd-btn', true);
  const box = showLoading('jtbd-result', 'Aplicando teoría Jobs To Be Done...');

  try {
    const prompt = `Aplica la metodología **Jobs To Be Done** (Christensen & Ulwick) para el siguiente caso:

**Usuario:** ${user}
**Situación / Problema:** ${problema}

Estructura tu análisis así:
1. 🔧 **Job Funcional Principal** — ¿Qué tarea concreta intenta completar?
2. ❤️ **Jobs Emocionales** — ¿Cómo quiere sentirse antes, durante y después?
3. 👥 **Jobs Sociales** — ¿Cómo quiere ser percibido por los demás?
4. 📏 **Métricas de Resultado (Outcome-Driven)** — ¿Cómo mide el éxito? (usa el formato: "Minimizar el tiempo para...", "Aumentar la probabilidad de...")
5. 🚀 **Oportunidad de Innovación** — ¿Qué job está sub-atendido y abre una oportunidad?
6. 💬 **Enunciado JTBD** — Formula el job statement completo: "Cuando [situación], quiero [motivación], para [resultado esperado]"`;

    const result = await callClaude(prompt);
    if (result) box.innerHTML = result;
  } catch (e) {
    box.innerHTML = `❌ Error: ${e.message}`;
  } finally {
    setButtonLoading('jtbd-btn', false);
  }
}

// ─── MÓDULO 3: CANVAS GENERATOR ──────────────
async function runCanvas() {
  const tipo = document.getElementById('canvas-tipo').value;
  const idea = document.getElementById('canvas-idea').value.trim();

  if (!idea) {
    alert('Describe tu idea de negocio antes de continuar.');
    return;
  }

  setButtonLoading('canvas-btn', true);
  const grid = document.getElementById('canvas-result');
  grid.classList.remove('hidden');
  grid.innerHTML = `<div style="grid-column:1/-1;padding:1rem;color:#888;font-size:13px;font-style:italic;">Generando ${tipo}...</div>`;

  try {
    const isBMC = tipo.includes('Business Model');
    const bloques = isBMC
      ? ['Segmentos de Clientes', 'Propuesta de Valor', 'Canales', 'Relación con Clientes', 'Fuentes de Ingresos', 'Recursos Clave', 'Actividades Clave', 'Socios Clave', 'Estructura de Costos']
      : ['Problema', 'Segmentos de Clientes', 'Propuesta de Valor Única', 'Solución', 'Canales', 'Flujos de Ingresos', 'Estructura de Costos', 'Métricas Clave', 'Ventaja Injusta'];

    const prompt = `Genera un ${tipo} completo y detallado para la siguiente idea de negocio: "${idea}".

Responde ÚNICAMENTE con un objeto JSON válido. Sin texto adicional, sin explicaciones, sin backticks, sin markdown.

El JSON debe tener esta estructura exacta:
{"bloques":[{"titulo":"Nombre del bloque","contenido":"Descripción concisa y específica de 2-3 líneas"}]}

Los bloques deben ser exactamente estos en este orden: ${bloques.join(', ')}.
Adapta el contenido específicamente a la idea descrita. Sé concreto y accionable.`;

    const result = await callClaude(prompt, 'Eres un experto en modelos de negocio. Responde ÚNICAMENTE con JSON puro y válido. Sin backticks, sin markdown, sin texto adicional.');

    if (!result) return;

    const clean = result.replace(/```json|```/g, '').trim();
    const data  = JSON.parse(clean);

    grid.innerHTML = data.bloques.map(b => `
      <div class="canvas-block">
        <h4>${b.titulo}</h4>
        <p>${b.contenido}</p>
      </div>`).join('');

  } catch (e) {
    grid.innerHTML = `<div style="grid-column:1/-1;padding:1rem;color:#D85A30;font-size:13px;">❌ Error al generar el canvas: ${e.message}. Intenta de nuevo.</div>`;
  } finally {
    setButtonLoading('canvas-btn', false);
  }
}

// ─── MÓDULO 4: DESIGN THINKING ────────────────
async function runDesignThinking() {
  const contexto = document.getElementById('dt-contexto').value.trim();

  if (!contexto) {
    alert('Describe tu proyecto antes de continuar.');
    return;
  }

  setButtonLoading('dt-btn', true);
  const box = showLoading('dt-result', `Guiando en etapa: ${state.selectedDTName}...`);

  try {
    const prompt = `Soy estudiante del curso de Innovación y estoy trabajando en este proyecto:

"${contexto}"

Estoy en la etapa **"${state.selectedDTName}"** (etapa ${state.selectedDTStep} de 5) del Design Thinking.

Dame una guía práctica y detallada para esta etapa específica en mi proyecto, con esta estructura:
1. 🎯 **Objetivo de esta etapa** — ¿Qué debo lograr aquí en el contexto de mi proyecto?
2. 🛠️ **3 actividades concretas** — ¿Qué debo hacer exactamente? (con instrucciones paso a paso para cada una)
3. ❓ **Preguntas clave** — ¿Qué preguntas debo hacerme o hacerle a mis usuarios?
4. 📋 **Entregable esperado** — ¿Qué documento, artefacto o resultado concreto debo tener al terminar esta etapa?
5. ⚠️ **Errores comunes** — ¿Qué errores típicos debo evitar en esta etapa?

Adapta todo específicamente a mi proyecto, no des respuestas genéricas.`;

    const result = await callClaude(prompt);
    if (result) box.innerHTML = result;
  } catch (e) {
    box.innerHTML = `❌ Error: ${e.message}`;
  } finally {
    setButtonLoading('dt-btn', false);
  }
}

// ─── MÓDULO 5: OCÉANOS AZULES ─────────────────
async function runOcean() {
  const producto = document.getElementById('ocean-producto').value.trim();
  const comp     = document.getElementById('ocean-comp').value.trim();

  if (!producto || !comp) {
    alert('Completa todos los campos antes de continuar.');
    return;
  }

  setButtonLoading('ocean-btn', true);
  const grid = document.getElementById('ocean-result');
  grid.classList.remove('hidden');
  ['errc-e-text','errc-r-text','errc-a-text','errc-c-text'].forEach(id => {
    document.getElementById(id).innerHTML = '<em style="color:#aaa">Generando...</em>';
  });

  try {
    const prompt = `Aplica la estrategia de **Océanos Azules** (Kim & Mauborgne) y genera una **Matriz ERRC** para:

Producto/Servicio: "${producto}"
Competencia actual: "${comp}"

Responde ÚNICAMENTE con un objeto JSON válido. Sin texto adicional, sin backticks.

Formato exacto:
{"eliminar":"descripción de 2-3 factores a eliminar del sector, uno por línea con guion","reducir":"descripción de 2-3 factores a reducir por debajo del estándar del sector","aumentar":"descripción de 2-3 factores a aumentar muy por encima del estándar del sector","crear":"descripción de 2-3 factores nuevos que el sector nunca ha ofrecido"}

Sé muy específico para el producto y contexto dado. Cada cuadrante debe tener 2-3 elementos concretos separados por salto de línea (\\n).`;

    const result = await callClaude(prompt, 'Responde ÚNICAMENTE con JSON puro y válido. Sin backticks, sin markdown, sin texto adicional.');

    if (!result) return;

    const clean = result.replace(/```json|```/g, '').trim();
    const d     = JSON.parse(clean);

    document.getElementById('errc-e-text').innerHTML = d.eliminar.replace(/\n/g, '<br>');
    document.getElementById('errc-r-text').innerHTML = d.reducir.replace(/\n/g, '<br>');
    document.getElementById('errc-a-text').innerHTML = d.aumentar.replace(/\n/g, '<br>');
    document.getElementById('errc-c-text').innerHTML = d.crear.replace(/\n/g, '<br>');

  } catch (e) {
    grid.innerHTML = `<div style="grid-column:1/-1;padding:1rem;color:#D85A30;font-size:13px;">❌ Error: ${e.message}. Intenta de nuevo.</div>`;
  } finally {
    setButtonLoading('ocean-btn', false);
  }
}

// ─── MÓDULO 6: PITCH BUILDER ──────────────────
async function runPitch() {
  const nombre   = document.getElementById('pitch-nombre').value.trim();
  const problema = document.getElementById('pitch-problema').value.trim();
  const solucion = document.getElementById('pitch-solucion').value.trim();

  if (!nombre || !problema || !solucion) {
    alert('Completa todos los campos antes de continuar.');
    return;
  }

  setButtonLoading('pitch-btn', true);
  const box = showLoading('pitch-result', "Construyendo tu pitch con estructura Hero's Journey...");

  try {
    const prompt = `Construye un **pitch de innovación** poderoso usando la estructura **Hero's Journey** para presentar ante un panel evaluador en un Demo Day universitario.

Proyecto: "${nombre}"
Problema: "${problema}"
Solución: "${solucion}"

Estructura el pitch con estos 6 bloques narrativos:
1. 🌎 **El Mundo Ordinario** — Describe la situación actual del usuario y el contexto (máximo 3 oraciones impactantes)
2. ⚡ **El Llamado a la Aventura** — El problema específico que disrumpe ese mundo. Incluye datos o estadísticas si aplican.
3. 🗺️ **El Mentor y la Solución** — Presenta "${nombre}" como la guía que resuelve el problema. ¿Qué hace y cómo funciona?
4. 🔄 **La Transformación** — ¿Qué cambia concretamente para el usuario con tu solución? Resultados medibles.
5. 🌟 **El Nuevo Mundo** — Visión de impacto a futuro. ¿Cómo se ve el mundo después de ${nombre}?
6. 🎯 **Call to Action para el Demo Day** — Qué pides al panel: inversión, alianza, retroalimentación, etc.

Hazlo emotivo, convincente y con lenguaje natural. Al final, agrega un **"One-liner"** de 1 sola oración que resuma el proyecto.`;

    const result = await callClaude(prompt);
    if (result) box.innerHTML = result;
  } catch (e) {
    box.innerHTML = `❌ Error: ${e.message}`;
  } finally {
    setButtonLoading('pitch-btn', false);
  }
}
