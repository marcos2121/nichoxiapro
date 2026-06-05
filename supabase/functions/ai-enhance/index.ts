// Edge function: enhance individual fields, generate variations, generate more avatars
// MULTI-PROVEEDOR: usa la API key y proveedor configurados por el usuario
import { getUserProvider, assertConfigured, NoConfigError, providerChat, type ProviderCfg } from "../_shared/ai-provider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_BASE = `Eres un estratega senior de marketing, investigador de mercado y analista psicológico para mercados hispanos. Respondes en español neutro, con respuestas específicas, accionables y con ejemplos. Nada genérico.`;

async function callAI(cfg: ProviderCfg, payload: any) {
  const res = await providerChat(cfg, payload);
  if (!res.ok) {
    console.error("AI error", cfg.id, res.status, res.text);
    if (res.status === 429) throw new Error("Rate limit. Espera un momento.");
    if (res.status === 402) throw new Error("Sin créditos de IA en tu proveedor.");
    if (res.status === 401 || res.status === 403) throw new Error("Tu API key parece inválida. Revísala en tu perfil.");
    throw new Error("Error del proveedor de IA");
  }
  return res.data;
}

const STYLES: Record<string, string> = {
  profundizar: "Reescribe MUCHO más profundo, detallado, con ejemplos concretos y nombres reales. 4-6 frases.",
  agresiva: "Reescribe en tono agresivo, directo, confrontacional, polarizador. Que duela y despierte.",
  emocional: "Reescribe en tono emocional, vulnerable, humano, con storytelling. Que conmueva.",
  premium: "Reescribe en tono premium, sofisticado, autoridad de alto nivel, vocabulario elevado.",
  expandir: "Expande con más capas, ángulos no obvios, datos plausibles y matices.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const cfg = await getUserProvider(req);
    assertConfigured(cfg);

    const body = await req.json();
    const { action } = body;

    if (action === "enhance_field") {
      const { fieldLabel, currentValue, style, context } = body;
      const instruction = STYLES[style] || STYLES.profundizar;
      const ctxStr = context ? `\nCONTEXTO de la investigación:\n${JSON.stringify(context).slice(0, 4000)}` : "";
      const data = await callAI(cfg, {
        messages: [
          { role: "system", content: SYSTEM_BASE },
          { role: "user", content: `Campo: "${fieldLabel}"\nValor actual: "${currentValue || "(vacío)"}"\n\n${instruction}${ctxStr}\n\nResponde SOLO el texto reescrito, sin comillas, sin prefacio.` },
        ],
      });
      const text = data.choices?.[0]?.message?.content?.trim() || "";
      return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "fill_field") {
      const { fieldLabel, section, context } = body;
      const data = await callAI(cfg, {
        messages: [
          { role: "system", content: SYSTEM_BASE + " NUNCA dejes campos vacíos. Mínimo 3-5 frases ricas, humanas, con ejemplos concretos." },
          { role: "user", content: `CONTEXTO de la investigación:\n${JSON.stringify(context).slice(0, 5000)}\n\nGenera el contenido del campo "${fieldLabel}" en la sección "${section}". Profundo, coherente con el contexto, con ejemplos. Responde SOLO el texto del campo, sin comillas ni prefacio.` },
        ],
      });
      const text = data.choices?.[0]?.message?.content?.trim() || "";
      return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "generate_avatars") {
      const { count, context } = body;
      const n = Math.max(1, Math.min(10, count || 3));
      const SCHEMA = {
        name: "generate_avatars",
        parameters: {
          type: "object",
          properties: {
            avatars: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  nombre: { type: "string" }, ocupacion: { type: "string" }, nivel_consciencia: { type: "string" },
                  personalidad: { type: "string" }, frustraciones: { type: "string" }, inseguridades: { type: "string" }, aspiraciones: { type: "string" },
                  influencers: { type: "string" }, plataformas: { type: "string" }, contenido: { type: "string" }, lenguaje: { type: "string" },
                  ingresos: { type: "string" }, ticket: { type: "string" }, objecion_dinero: { type: "string" },
                  miedo_oculto: { type: "string" }, deseo_secreto: { type: "string" }, pensamiento_nocturno: { type: "string" },
                  estilo_compra: { type: "string" }, que_lo_hace_confiar: { type: "string" },
                },
              },
            },
          },
          required: ["avatars"],
        },
      };
      const data = await callAI(cfg, {
        messages: [
          { role: "system", content: SYSTEM_BASE + " Cada avatar debe ser DISTINTO entre sí (distinto nivel de consciencia, edad, motivación o contexto)." },
          { role: "user", content: `Genera ${n} buyer personas DISTINTOS para esta investigación:\n\n${JSON.stringify(context).slice(0, 5000)}` },
        ],
        tools: [{ type: "function", function: SCHEMA }],
        tool_choice: { type: "function", function: { name: "generate_avatars" } },
      });
      const call = data.choices?.[0]?.message?.tool_calls?.[0];
      const args = call ? JSON.parse(call.function.arguments) : { avatars: [] };
      return new Response(JSON.stringify(args), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "action inválida" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof NoConfigError) {
      return new Response(JSON.stringify({ error: "no_config", message: "Configura tu motor de IA para continuar." }), {
        status: 428, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("ai-enhance error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
