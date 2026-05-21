# 🌱 InnovaEdu — Asistente de Innovación con IA

App web interactiva que aplica las metodologías del **Curso de Innovación** usando Inteligencia Artificial (Claude de Anthropic).

## ✨ Módulos incluidos

| Módulo | Sesión | Descripción |
|--------|--------|-------------|
| 🌍 Megatendencias | 3 | Analiza tendencias globales y oportunidades en contexto colombiano |
| 🎯 Jobs To Be Done | 2 | Aplica la teoría de Christensen & Ulwick a tu usuario |
| 🗂️ Canvas Generator | 12 | Genera Business Model Canvas o Lean Canvas con IA |
| 💡 Design Thinking | 9 | Guía paso a paso por las 5 etapas aplicadas a tu proyecto |
| 🌊 Océanos Azules | 10 | Genera la Matriz ERRC (Eliminar, Reducir, Aumentar, Crear) |
| 🎤 Pitch Builder | 14 | Construye tu pitch con estructura Hero's Journey |

## 🚀 Cómo usar

### Opción 1 — GitHub Pages (recomendada)
1. Haz fork de este repositorio
2. Ve a **Settings → Pages**
3. En "Source" selecciona `main` / `root`
4. Accede a `https://TU_USUARIO.github.io/innovaedu`

### Opción 2 — Local
1. Clona el repo: `git clone https://github.com/TU_USUARIO/innovaedu.git`
2. Abre `index.html` en tu navegador

## 🔑 Configurar API Key

1. Obtén tu API Key en [console.anthropic.com](https://console.anthropic.com)
2. En la app, haz clic en **"API Key"** (esquina superior derecha)
3. Ingresa tu key (empieza con `sk-ant-...`)
4. ¡Listo! La key se guarda solo en tu navegador

> **Seguridad:** Tu API Key nunca sale de tu navegador. Se almacena en `localStorage` y las llamadas van directo a Anthropic.

## 🏗️ Estructura del proyecto

```
innovaedu/
├── index.html          # Aplicación principal
├── css/
│   └── style.css       # Estilos
├── js/
│   └── app.js          # Lógica e integración con IA
└── README.md
```

## 🛠️ Tecnologías

- HTML5 + CSS3 + JavaScript vanilla (sin frameworks)
- [Anthropic API](https://docs.anthropic.com) — Claude Sonnet 4
- [Tabler Icons](https://tabler.io/icons) — iconografía
- [DM Sans + DM Mono](https://fonts.google.com) — tipografía

## 📚 Basado en el Curso de Innovación

Este software integra metodologías de las 16 sesiones del curso:
- Fundamentos de Innovación (Aulet, Christensen, Ulwick)
- Megatendencias y Consumer Trend Canvas
- QFD, Design Thinking, Océanos Azules
- Business Model Canvas, Lean Canvas
- Técnicas de Storytelling para innovación

---

Desarrollado como proyecto final del Curso de Innovación.
