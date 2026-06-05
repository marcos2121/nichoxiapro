# 🧠 MarketQuest Insights

> Investigación de mercado estratégica potenciada por IA — para fundadores, marketers y agencias.

MarketQuest Insights es una herramienta de análisis de mercado que combina IA generativa con un framework estratégico profundo: buyer personas, análisis de producto, copywriting, mapas de empatía y más. Funciona con **tu propia API key** de más de 15 proveedores de IA (modelo BYOK).

---

## ✨ Funcionalidades principales

- **AI Autofill** — rellena toda la investigación de mercado desde una idea breve
- **Buyer Personas** — 3 avatares de cliente profundos y diferenciados
- **Análisis de producto** — mecanismo único, promesa, transformación
- **Copywriting estratégico** — lenguaje, objeciones, deseos ocultos
- **15+ proveedores de IA conectables** — Gemini, Claude, GPT-4, Grok, Llama, Mistral y más
- **Modo gratuito** — proveedores sin costo incluidos (Gemini, Groq, OpenRouter, etc.)
- **Autenticación** — login con email vía Supabase Auth
- **Persistencia** — proyectos guardados en tu propia base de datos Supabase

---

## 🛠️ Tech Stack

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + TanStack Router |
| UI | shadcn/ui + Radix UI + Tailwind CSS |
| Backend / Auth | Supabase (Edge Functions + Auth + Postgres) |
| Deploy | Cloudflare Pages / Vercel / cualquier host estático |
| IA | BYOK — el usuario conecta su propia API key |

---

## 🚀 Instalación local

### Requisitos previos

- Node.js 18+ (o Bun)
- Una cuenta en [Supabase](https://supabase.com) (gratis)
- Una API key de cualquier proveedor de IA soportado (opcional — hay proveedores gratuitos)

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/marketquest-insights.git
cd marketquest-insights
```

### 2. Instala dependencias

```bash
npm install
# o con bun:
bun install
```

### 3. Configura las variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus datos de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_anon_key_aqui
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_PUBLISHABLE_KEY=tu_anon_key_aqui
VITE_SUPABASE_PROJECT_ID=tu_project_id
```

> Encuentra estos valores en tu proyecto de Supabase: **Settings → API**

### 4. Ejecuta las migraciones de base de datos

```bash
npx supabase db push
```

O aplica manualmente los archivos en `supabase/migrations/` desde el SQL Editor de Supabase.

### 5. Despliega las Edge Functions

```bash
npx supabase functions deploy ai-autofill
npx supabase functions deploy ai-enhance
npx supabase functions deploy ai-test
```

### 6. Inicia el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 🔑 Conectar un proveedor de IA

Al entrar a la app por primera vez, ve a **Configuración de IA** y elige tu proveedor favorito:

### Proveedores gratuitos (sin tarjeta)

| Proveedor | Dónde obtener la key |
|---|---|
| Gemini | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Grok (xAI) | [console.x.ai](https://console.x.ai) |
| Meta Llama (Groq) | [console.groq.com](https://console.groq.com/keys) |
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) |
| Cohere | [dashboard.cohere.com](https://dashboard.cohere.com/api-keys) |
| Cerebras | [cloud.cerebras.ai](https://cloud.cerebras.ai) |
| Together AI | [api.together.xyz](https://api.together.xyz/settings/api-keys) |
| GitHub Models | [github.com/settings/tokens](https://github.com/settings/tokens) |

### Proveedores premium

| Proveedor | Dónde obtener la key |
|---|---|
| Claude (Anthropic) | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| ChatGPT (OpenAI) | [platform.openai.com](https://platform.openai.com/api-keys) |
| Mistral | [console.mistral.ai](https://console.mistral.ai/api-keys) |
| Perplexity | [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api) |
| DeepSeek | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| Fireworks AI | [fireworks.ai](https://fireworks.ai/account/api-keys) |
| Qwen (Alibaba) | [dashscope.console.aliyun.com](https://dashscope.console.aliyun.com/apiKey) |

> Las API keys se guardan **encriptadas en tu propia base de datos Supabase** y nunca pasan por servidores externos.

---

## ☁️ Deploy en producción

### Cloudflare Pages (recomendado)

```bash
npm run build
# Sube la carpeta dist/ a Cloudflare Pages
```

Configura las variables de entorno desde el dashboard de Cloudflare Pages.

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### Docker (autohospedado)

```bash
docker build -t marketquest-insights .
docker run -p 3000:3000 --env-file .env marketquest-insights
```

---

## 📁 Estructura del proyecto

```
├── src/
│   ├── components/        # Componentes React (UI, paneles, AI setup)
│   ├── integrations/
│   │   └── supabase/      # Cliente y tipos de Supabase
│   ├── lib/
│   │   ├── ai-providers.ts    # Catálogo de 15+ proveedores de IA
│   │   ├── research-store.ts  # Estado global de la investigación
│   │   └── tabs-config.ts     # Configuración de tabs y campos
│   └── routes/            # Páginas (TanStack Router)
├── supabase/
│   ├── functions/         # Edge Functions (ai-autofill, ai-enhance, ai-test)
│   └── migrations/        # SQL migrations
└── .env.example           # Variables de entorno necesarias
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Haz commit de tus cambios: `git commit -m 'feat: agrega nueva funcionalidad'`
4. Haz push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

MIT License — ver [LICENSE](./LICENSE) para detalles.

---

## 🙋 Soporte

¿Tienes preguntas? Abre un [Issue](https://github.com/tu-usuario/marketquest-insights/issues) en GitHub.
