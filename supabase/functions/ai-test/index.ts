// Edge function: prueba la conexión con un proveedor de IA (key opcional en el body)
import { resolveProvider, providerChat } from "../_shared/ai-provider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { provider, apiKey, model } = await req.json();
    const cfg = resolveProvider(provider || "nixoia", apiKey || null, model || null);

    if (cfg.needsKey && !cfg.key) {
      return new Response(JSON.stringify({ error: "Falta la API key para este proveedor." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (cfg.id === "nixoia" && !cfg.key) {
      return new Response(JSON.stringify({ error: "IA incluida no disponible." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await providerChat(cfg, {
      messages: [{ role: "user", content: "Responde solo con: OK" }],
      max_tokens: 5,
    });

    if (!res.ok) {
      console.error("ai-test fail", cfg.id, res.status, res.text);
      const msg =
        res.status === 401 || res.status === 403 ? "API key inválida o sin permisos." :
        res.status === 402 ? "Sin créditos en tu proveedor." :
        res.status === 429 ? "Límite de uso alcanzado, intenta luego." :
        res.status === 404 ? "Modelo no encontrado. Revisa el nombre del modelo." :
        `Error ${res.status} del proveedor.`;
      return new Response(JSON.stringify({ error: msg }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, provider: cfg.id, model: cfg.model }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-test error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
