/* ============================================
   InnovaEdu — Lógica principal (Groq API)
   ============================================ */

const state = {
  apiKey: localStorage.getItem('innovaedu_api_key') || '',
  selectedTendencia: '',
  selectedDTStep: 1,
  selectedDTName: 'Empatizar',
};

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initAPIModal();
  initTagCards();
  initDTSteps();
  initButtons();
  updateAPIStatus();
});

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
    if (!key) {
      alert('Ingresa una API Key válida de Groq.');
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
    text.textContent = 'Groq conectado';
  } else {
    dot.classList.remove('connected');
    text.textContent = 'Sin API Key';
  }
}

function initTagCards() {
  document.querySelectorAll('.tag-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.tag-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedTendencia = card.dataset.value;
    });
  });
}

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

function initButtons() {
  document.getElementById('tend-btn').addEventListener('click', runTendencias);
  document.getElementById('jtbd-btn').addEventListener('click', runJTBD);
  document.getElementById('canvas-btn').addEventListener('click', runCanvas);
  document.getElementById('dt-btn').addEventListener('click', runDesignThinking);
  document.getElementById('ocean-btn').addEventListener('click', runOcean);
  document.getElementById('pitch-btn').addEventListener('click', runPitch);
}

// ─── Llamada a Groq API (GRATIS) ─────────────
async function callGroq(prompt) {
  if (!state.apiKey) {
    alert('Primero configura tu Groq API Key haciendo clic en "API Key" arriba a la derecha.\n\nObtén una gratis en: console.groq.com');
    return null;
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en innovación, emprendimiento y metodologías de diseño, con profundo conocimiento del contexto colombiano y latinoamericano. Responde siempre en español, de forma clara, práctica y bien estructurada. Usa listas y secciones cuando aporte claridad.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Error HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function showLoading(boxId, msg = 'Analizando con IA...') {
  const box = document.getElementById(boxId);
  box.classList.remove('hidden');
  box.innerHTML = `<span class="loading">${msg}</span>`;
  return box;
}

function setButtonLoading(btnId, loading) {
  document.getElementById(btnId).disabled = loading;
}

// ─── MÓDULO 1: MEGATENDENCIAS ─────────────────
async function runTendencias() {
  if (!state.selectedTendencia) { alert('Selecciona una megatendencia primero.'); return; }
  const industria = document.getElementById('tend-industria').value.trim() || 'sector educativo colombiano';
  setButtonLoading('tend-btn', true);
  const box = showLoading('tend-result', 'Analizando megatendencia...');
  try {
    const prompt = `Analiza la megatendencia "${state.selectedTendencia}" aplicada al contexto colombiano: "${industria}".

Estructura tu respuesta así:
1. 🌍 ¿Por qué esta tendencia es relevante para ese contexto? (2-3 párrafos)
2. 💡 3 oportunidades concretas de innovación (nombre, descripción y público objetivo)
3. 🇨🇴 Ejemplo inspirador de Colombia o Latinoamérica
4. ⚡ Próximo paso recomendado para explorar esta oportunidad`;
    const result = await callGroq(prompt);
    if (result) box.innerHTML = result.replace(/\n/g, '<br>');
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
  if (!user || !problema) { alert('Completa todos los campos.'); return; }
  setButtonLoading('jtbd-btn', true);
  const box = showLoading('jtbd-result', 'Aplicando teoría Jobs To Be Done...');
  try {
    const prompt = `Aplica la metodología Jobs To Be Done (Christensen & Ulwick) para:

Usuario: ${user}
Situación: ${problema}

Estructura:
1. 🔧 Job Funcional Principal
2. ❤️ Jobs Emocionales
3. 👥 Jobs Sociales
4. 📏 Métricas de Resultado (Outcome-Driven)
5. 🚀 Oportunidad de Innovación
6. 💬 Enunciado JTBD: "Cuando [situación], quiero [motivación], para [resultado]"`;
    const result = await callGroq(prompt);
    if (result) box.innerHTML = result.replace(/\n/g, '<br>');
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
  if (!idea) { alert('Describe tu idea de negocio.'); return; }
  setButtonLoading('canvas-btn', true);
  const grid = document.getElementById('canvas-result');
  grid.classList.remove('hidden');
  grid.innerHTML = `<div style="grid-column:1/-1;padding:1rem;color:#888;font-size:13px;font-style:italic;">Generando ${tipo}...</div>`;
  try {
    const isBMC = tipo.includes('Business Model');
    const bloques = isBMC
      ? ['Segmentos de Clientes','Propuesta de Valor','Canales','Relación con Clientes','Fuentes de Ingresos','Recursos Clave','Actividades Clave','Socios Clave','Estructura de Costos']
      : ['Problema','Segmentos de Clientes','Propuesta de Valor Única','Solución','Canales','Flujos de Ingresos','Estructura de Costos','Métricas Clave','Ventaja Injusta'];

    const prompt = `Genera un ${tipo} para: "${idea}".
Responde ÚNICAMENTE con JSON válido, sin texto adicional, sin backticks, sin markdown:
{"bloques":[{"titulo":"nombre del bloque","contenido":"descripción concisa de 2-3 líneas"}]}
Bloques en orden: ${bloques.join(', ')}`;

    const result = await callGroq(prompt);
    if (!result) return;
    const clean = result.replace(/```json|```/g, '').trim();
    const data  = JSON.parse(clean);
    grid.innerHTML = data.bloques.map(b => `
      <div class="canvas-block">
        <h4>${b.titulo}</h4>
        <p>${b.contenido}</p>
      </div>`).join('');
  } catch (e) {
    grid.innerHTML = `<div style="grid-column:1/-1;padding:1rem;color:#D85A30;font-size:13px;">❌ Error: ${e.message}. Intenta de nuevo.</div>`;
  } finally {
    setButtonLoading('canvas-btn', false);
  }
}

// ─── MÓDULO 4: DESIGN THINKING ────────────────
async function runDesignThinking() {
  const contexto = document.getElementById('dt-contexto').value.trim();
  if (!contexto) { alert('Describe tu proyecto.'); return; }
  setButtonLoading('dt-btn', true);
  const box = showLoading('dt-result', `Guiando en etapa: ${state.selectedDTName}...`);
  try {
    const prompt = `Soy estudiante de innovación. Mi proyecto: "${contexto}". Estoy en la etapa "${state.selectedDTName}" (${state.selectedDTStep}/5) del Design Thinking.

Dame una guía práctica con:
1. 🎯 Objetivo de esta etapa en mi proyecto
2. 🛠️ 3 actividades concretas paso a paso
3. ❓ Preguntas clave a responder
4. 📋 Entregable esperado al terminar
5. ⚠️ Errores comunes a evitar

Adapta todo específicamente a mi proyecto.`;
    const result = await callGroq(prompt);
    if (result) box.innerHTML = result.replace(/\n/g, '<br>');
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
  if (!producto || !comp) { alert('Completa todos los campos.'); return; }
  setButtonLoading('ocean-btn', true);
  const grid = document.getElementById('ocean-result');
  grid.classList.remove('hidden');
  ['errc-e-text','errc-r-text','errc-a-text','errc-c-text'].forEach(id => {
    document.getElementById(id).innerHTML = '<em style="color:#aaa">Generando...</em>';
  });
  try {
    const prompt = `Matriz ERRC de Océanos Azules para:
Producto: "${producto}"
Competencia: "${comp}"

Responde ÚNICAMENTE con JSON válido sin backticks ni markdown:
{"eliminar":"factor1\\nfactor2","reducir":"factor1\\nfactor2","aumentar":"factor1\\nfactor2","crear":"factor1\\nfactor2"}`;

    const result = await callGroq(prompt);
    if (!result) return;
    const clean = result.replace(/```json|```/g, '').trim();
    const d = JSON.parse(clean);
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
  if (!nombre || !problema || !solucion) { alert('Completa todos los campos.'); return; }
  setButtonLoading('pitch-btn', true);
  const box = showLoading('pitch-result', "Construyendo pitch con Hero's Journey...");
  try {
    const prompt = `Construye un pitch de innovación con estructura Hero's Journey para Demo Day universitario.

Proyecto: "${nombre}"
Problema: "${problema}"
Solución: "${solucion}"

Estructura:
1. 🌎 El Mundo Ordinario — situación actual del usuario
2. ⚡ El Llamado a la Aventura — el problema con datos
3. 🗺️ El Mentor y la Solución — cómo funciona ${nombre}
4. 🔄 La Transformación — resultados concretos
5. 🌟 El Nuevo Mundo — visión de impacto
6. 🎯 Call to Action para el panel evaluador

Al final agrega un One-liner de 1 sola oración que resuma el proyecto.`;
    const result = await callGroq(prompt);
    if (result) box.innerHTML = result.replace(/\n/g, '<br>');
  } catch (e) {
    box.innerHTML = `❌ Error: ${e.message}`;
  } finally {
    setButtonLoading('pitch-btn', false);
  }
}
