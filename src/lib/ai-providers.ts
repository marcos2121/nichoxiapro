// Catálogo de proveedores de IA disponibles para el usuario (lado cliente)
export type AIProvider = {
  id: string;
  name: string;
  brand: string;
  free: boolean;
  needsKey: boolean;
  defaultModel?: string;
  keyUrl?: string;
  keyUrlLabel?: string;
  help: string;
  icon: string;
  color: string; // var token css
};

// IA incluida (no aparece en el grid principal, se trata aparte)
export const NIXOIA: AIProvider = {
  id: "nixoia",
  name: "Nixoia IA",
  brand: "Incluida · lista para usar",
  free: true,
  needsKey: false,
  icon: "🧠",
  color: "var(--neon-cyan)",
  help: "IA premium incluida. No necesitas configurar nada ni pagar. Lista para usar al instante.",
};

// Los 15 proveedores conectables por el usuario (BYOK), clasificados gratis / premium
export const AI_PROVIDERS: AIProvider[] = [
  // ---------------- GRATIS ----------------
  {
    id: "gemini",
    name: "Gemini",
    brand: "Google",
    free: true,
    needsKey: true,
    defaultModel: "gemini-2.5-flash",
    keyUrl: "https://aistudio.google.com/app/apikey",
    keyUrlLabel: "aistudio.google.com",
    icon: "✨",
    color: "var(--neon-cyan)",
    help: "Consigue tu API key GRATIS en Google AI Studio. Sin tarjeta.",
  },
  {
    id: "grok",
    name: "Grok",
    brand: "xAI",
    free: true,
    needsKey: true,
    defaultModel: "grok-4-latest",
    keyUrl: "https://console.x.ai",
    keyUrlLabel: "console.x.ai",
    icon: "⚡",
    color: "var(--neon-lime)",
    help: "Crea tu API key en la consola de xAI (gratis con límites de uso).",
  },
  {
    id: "groq",
    name: "Meta AI",
    brand: "Llama · Groq",
    free: true,
    needsKey: true,
    defaultModel: "llama-3.3-70b-versatile",
    keyUrl: "https://console.groq.com/keys",
    keyUrlLabel: "console.groq.com",
    icon: "🦙",
    color: "var(--neon-lime)",
    help: "API key GRATIS en Groq, corre modelos Llama de Meta ultrarrápido.",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    brand: "Multi-modelo",
    free: true,
    needsKey: true,
    defaultModel: "openai/gpt-4o-mini",
    keyUrl: "https://openrouter.ai/keys",
    keyUrlLabel: "openrouter.ai",
    icon: "🔀",
    color: "var(--neon-cyan)",
    help: "Una sola key para decenas de modelos. Tiene modelos gratis (sufijo :free).",
  },
  {
    id: "cohere",
    name: "Cohere",
    brand: "Command",
    free: true,
    needsKey: true,
    defaultModel: "command-r-08-2024",
    keyUrl: "https://dashboard.cohere.com/api-keys",
    keyUrlLabel: "dashboard.cohere.com",
    icon: "🔵",
    color: "var(--neon-cyan)",
    help: "API key con nivel gratuito de pruebas en el dashboard de Cohere.",
  },
  {
    id: "cerebras",
    name: "Cerebras",
    brand: "Llama ultrarrápido",
    free: true,
    needsKey: true,
    defaultModel: "llama-3.3-70b",
    keyUrl: "https://cloud.cerebras.ai",
    keyUrlLabel: "cloud.cerebras.ai",
    icon: "🧩",
    color: "var(--neon-lime)",
    help: "API key GRATIS en Cerebras Cloud, inferencia muy veloz.",
  },
  {
    id: "together",
    name: "Together AI",
    brand: "Open models",
    free: true,
    needsKey: true,
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    keyUrl: "https://api.together.xyz/settings/api-keys",
    keyUrlLabel: "together.ai",
    icon: "🤝",
    color: "var(--neon-lime)",
    help: "Créditos gratis al registrarte y modelos open con sufijo Free.",
  },
  {
    id: "github",
    name: "GitHub Models",
    brand: "Azure · OpenAI",
    free: true,
    needsKey: true,
    defaultModel: "gpt-4o-mini",
    keyUrl: "https://github.com/settings/tokens",
    keyUrlLabel: "github.com",
    icon: "🐙",
    color: "var(--neon-cyan)",
    help: "Usa un token de GitHub (PAT) para modelos GPT/Llama gratis con límites.",
  },
  // ---------------- PREMIUM ----------------
  {
    id: "openai",
    name: "ChatGPT",
    brand: "OpenAI",
    free: false,
    needsKey: true,
    defaultModel: "gpt-4.1-mini",
    keyUrl: "https://platform.openai.com/api-keys",
    keyUrlLabel: "platform.openai.com",
    icon: "🤖",
    color: "var(--neon-pink)",
    help: "Crea tu API key en OpenAI Platform (requiere saldo de pago).",
  },
  {
    id: "anthropic",
    name: "Claude",
    brand: "Anthropic",
    free: false,
    needsKey: true,
    defaultModel: "claude-sonnet-4-5",
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyUrlLabel: "console.anthropic.com",
    icon: "🟣",
    color: "var(--neon-purple)",
    help: "Obtén tu API key en Anthropic Console (requiere saldo de pago).",
  },
  {
    id: "mistral",
    name: "Mistral",
    brand: "Mistral AI",
    free: false,
    needsKey: true,
    defaultModel: "mistral-large-latest",
    keyUrl: "https://console.mistral.ai/api-keys",
    keyUrlLabel: "console.mistral.ai",
    icon: "🌬️",
    color: "var(--neon-yellow)",
    help: "Obtén tu API key en la consola de Mistral (requiere saldo de pago).",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    brand: "Sonar",
    free: false,
    needsKey: true,
    defaultModel: "sonar",
    keyUrl: "https://www.perplexity.ai/settings/api",
    keyUrlLabel: "perplexity.ai",
    icon: "🔎",
    color: "var(--neon-cyan)",
    help: "API key con respuestas conectadas a la web (requiere saldo).",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    brand: "DeepSeek",
    free: false,
    needsKey: true,
    defaultModel: "deepseek-chat",
    keyUrl: "https://platform.deepseek.com/api_keys",
    keyUrlLabel: "platform.deepseek.com",
    icon: "🐋",
    color: "var(--neon-purple)",
    help: "API key muy económica con gran capacidad de razonamiento.",
  },
  {
    id: "fireworks",
    name: "Fireworks AI",
    brand: "Open models",
    free: false,
    needsKey: true,
    defaultModel: "accounts/fireworks/models/llama-v3p3-70b-instruct",
    keyUrl: "https://fireworks.ai/account/api-keys",
    keyUrlLabel: "fireworks.ai",
    icon: "🎆",
    color: "var(--neon-pink)",
    help: "API key para modelos open de alto rendimiento (requiere saldo).",
  },
  {
    id: "qwen",
    name: "Qwen",
    brand: "Alibaba",
    free: false,
    needsKey: true,
    defaultModel: "qwen-plus",
    keyUrl: "https://dashscope.console.aliyun.com/apiKey",
    keyUrlLabel: "dashscope (Alibaba)",
    icon: "🟠",
    color: "var(--neon-yellow)",
    help: "API key de Alibaba DashScope para los modelos Qwen.",
  },
];

export const ALL_PROVIDERS: AIProvider[] = [NIXOIA, ...AI_PROVIDERS];

export const FREE_PROVIDERS = AI_PROVIDERS.filter((p) => p.free);
export const PREMIUM_PROVIDERS = AI_PROVIDERS.filter((p) => !p.free);

export function getProvider(id: string): AIProvider {
  return ALL_PROVIDERS.find((p) => p.id === id) || NIXOIA;
}
