// Resolver de proveedor de IA por usuario (compartido entre edge functions)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type ProviderCfg = {
  id: string;
  url: string;
  key: string;
  model: string;
  needsKey: boolean;
  extraHeaders?: Record<string, string>;
};

const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY") || "";

export function resolveProvider(provider: string, apiKey: string | null, model: string | null): ProviderCfg {
  const m = (model || "").trim();
  switch (provider) {
    case "openai":
      return { id: provider, url: "https://api.openai.com/v1/chat/completions", key: apiKey || "", model: m || "gpt-4.1-mini", needsKey: true };
    case "anthropic":
      return { id: provider, url: "https://api.anthropic.com/v1/messages", key: apiKey || "", model: m || "claude-sonnet-4-5", needsKey: true };
    case "gemini":
      return { id: provider, url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", key: apiKey || "", model: m || "gemini-2.5-flash", needsKey: true };
    case "grok":
      return { id: provider, url: "https://api.x.ai/v1/chat/completions", key: apiKey || "", model: m || "grok-4-latest", needsKey: true };
    case "groq":
      return { id: provider, url: "https://api.groq.com/openai/v1/chat/completions", key: apiKey || "", model: m || "llama-3.3-70b-versatile", needsKey: true };
    case "mistral":
      return { id: provider, url: "https://api.mistral.ai/v1/chat/completions", key: apiKey || "", model: m || "mistral-large-latest", needsKey: true };
    case "openrouter":
      return {
        id: provider,
        url: "https://openrouter.ai/api/v1/chat/completions",
        key: apiKey || "",
        model: m || "openai/gpt-4o-mini",
        needsKey: true,
        extraHeaders: { "HTTP-Referer": "https://nichoxiapro.lovable.app", "X-Title": "NIXOIA PRO" },
      };
    case "cohere":
      return { id: provider, url: "https://api.cohere.ai/compatibility/v1/chat/completions", key: apiKey || "", model: m || "command-r-08-2024", needsKey: true };
    case "cerebras":
      return { id: provider, url: "https://api.cerebras.ai/v1/chat/completions", key: apiKey || "", model: m || "llama-3.3-70b", needsKey: true };
    case "together":
      return { id: provider, url: "https://api.together.xyz/v1/chat/completions", key: apiKey || "", model: m || "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", needsKey: true };
    case "github":
      return { id: provider, url: "https://models.inference.ai.azure.com/chat/completions", key: apiKey || "", model: m || "gpt-4o-mini", needsKey: true };
    case "perplexity":
      return { id: provider, url: "https://api.perplexity.ai/chat/completions", key: apiKey || "", model: m || "sonar", needsKey: true };
    case "deepseek":
      return { id: provider, url: "https://api.deepseek.com/chat/completions", key: apiKey || "", model: m || "deepseek-chat", needsKey: true };
    case "fireworks":
      return { id: provider, url: "https://api.fireworks.ai/inference/v1/chat/completions", key: apiKey || "", model: m || "accounts/fireworks/models/llama-v3p3-70b-instruct", needsKey: true };
    case "qwen":
      return { id: provider, url: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions", key: apiKey || "", model: m || "qwen-plus", needsKey: true };
    default:
      return { id: "nixoia", url: "https://ai.gateway.lovable.dev/v1/chat/completions", key: LOVABLE_KEY, model: m || "google/gemini-2.5-pro", needsKey: false };
  }
}

// ---- Llamada de chat unificada (normaliza Anthropic a formato OpenAI) ----
type ChatResult = { ok: true; data: any } | { ok: false; status: number; text: string };

function toAnthropicBody(payload: any, model: string) {
  const messages: any[] = [];
  let system = "";
  for (const msg of payload.messages || []) {
    if (msg.role === "system") system += (system ? "\n\n" : "") + msg.content;
    else messages.push({ role: msg.role, content: msg.content });
  }
  const body: any = {
    model,
    max_tokens: payload.max_tokens ?? (payload.tools ? 8000 : 2000),
    messages,
  };
  if (system) body.system = system;
  if (payload.tools) {
    body.tools = payload.tools.map((t: any) => ({
      name: t.function.name,
      description: t.function.description ?? "",
      input_schema: t.function.parameters,
    }));
    const forced = payload.tool_choice?.function?.name;
    if (forced) body.tool_choice = { type: "tool", name: forced };
  }
  return body;
}

function fromAnthropic(json: any) {
  let text = "";
  let toolCall: any = null;
  for (const block of json.content || []) {
    if (block.type === "text") text += block.text;
    if (block.type === "tool_use") {
      toolCall = { function: { name: block.name, arguments: JSON.stringify(block.input || {}) } };
    }
  }
  const message: any = { content: text };
  if (toolCall) message.tool_calls = [toolCall];
  return { choices: [{ message }] };
}

export async function providerChat(cfg: ProviderCfg, payload: any): Promise<ChatResult> {
  if (cfg.id === "anthropic") {
    const r = await fetch(cfg.url, {
      method: "POST",
      headers: {
        "x-api-key": cfg.key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        ...(cfg.extraHeaders || {}),
      },
      body: JSON.stringify(toAnthropicBody(payload, cfg.model)),
    });
    if (!r.ok) return { ok: false, status: r.status, text: await r.text() };
    return { ok: true, data: fromAnthropic(await r.json()) };
  }

  const r = await fetch(cfg.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json", ...(cfg.extraHeaders || {}) },
    body: JSON.stringify({ ...payload, model: cfg.model }),
  });
  if (!r.ok) return { ok: false, status: r.status, text: await r.text() };
  return { ok: true, data: await r.json() };
}

// Lee la conexión principal del usuario a partir del header Authorization.
export async function getUserProvider(req: Request): Promise<ProviderCfg> {
  const authHeader = req.headers.get("Authorization");
  let provider = "nixoia";
  let apiKey: string | null = null;
  let model: string | null = null;

  if (authHeader) {
    try {
      const sb = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } },
      );
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data } = await sb
          .from("ai_connections")
          .select("provider, api_key, model")
          .eq("user_id", user.id)
          .eq("is_primary", true)
          .maybeSingle();
        if (data) {
          provider = data.provider || "nixoia";
          apiKey = data.api_key;
          model = data.model;
        }
      }
    } catch (e) {
      console.error("getUserProvider error", e);
    }
  }

  return resolveProvider(provider, apiKey, model);
}

export class NoConfigError extends Error {
  constructor() {
    super("no_config");
    this.name = "NoConfigError";
  }
}

export function assertConfigured(cfg: ProviderCfg) {
  if (cfg.needsKey && !cfg.key) throw new NoConfigError();
  if (cfg.id === "nixoia" && !cfg.key) throw new Error("LOVABLE_API_KEY no configurada");
}
