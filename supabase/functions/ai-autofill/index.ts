// Edge function: auto-fill the full strategic market research from a brief idea
// PREMIUM MODE: strict schema, minimum length validation, automatic fill-in of empty/short fields
// MULTI-PROVEEDOR: usa la API key y proveedor configurados por el usuario
import { getUserProvider, assertConfigured, NoConfigError, providerChat, type ProviderCfg } from "../_shared/ai-provider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stringField = { type: "string" };

const SCHEMA = {
  name: "fill_market_research",
  description: "Investigación de mercado estratégica COMPLETA, profunda y humana en español",
  parameters: {
    type: "object",
    properties: {
      producto: {
        type: "object",
        properties: {
          nombre: stringField, que_es: stringField, mecanismo_unico: stringField, promesa: stringField,
          resultado_tangible: stringField, resultado_emocional: stringField, resultado_social: stringField,
          resultado_economico: stringField, tiempo_transformacion: stringField, tipo_mercado: stringField,
          nivel_consciencia: stringField, categoria_psicologica: stringField, diferencial: stringField,
        },
        required: ["nombre","que_es","mecanismo_unico","promesa","resultado_tangible","resultado_emocional","resultado_social","resultado_economico","tiempo_transformacion","tipo_mercado","nivel_consciencia","categoria_psicologica","diferencial"],
      },
      avatars: {
        type: "array",
        description: "EXACTAMENTE 3 buyer personas distintos y complementarios, profundos y humanos",
        items: {
          type: "object",
          properties: {
            nombre: stringField, ocupacion: stringField, nivel_consciencia: stringField,
            personalidad: stringField, frustraciones: stringField, inseguridades: stringField, aspiraciones: stringField,
            influencers: stringField, plataformas: stringField, contenido: stringField, lenguaje: stringField,
            ingresos: stringField, ticket: stringField, objecion_dinero: stringField,
            miedo_oculto: stringField, deseo_secreto: stringField, pensamiento_nocturno: stringField,
            estilo_compra: stringField, que_lo_hace_confiar: stringField,
          },
          required: ["nombre","ocupacion","nivel_consciencia","personalidad","frustraciones","inseguridades","aspiraciones","influencers","plataformas","contenido","lenguaje","ingresos","ticket","objecion_dinero","miedo_oculto","deseo_secreto","pensamiento_nocturno","estilo_compra","que_lo_hace_confiar"],
        },
      },
      geografia: {
        type: "object",
        properties: {
          pais: stringField, ciudades: stringField, micro_geografia: stringField, poder_adquisitivo: stringField,
          velocidad_compra: stringField, confianza_online: stringField, adopcion_tech: stringField,
          horarios_ads: stringField, horarios_tiktok: stringField, horarios_webinar: stringField,
          lugares_fisicos: stringField, diferencias_culturales: stringField, idioma: stringField,
        },
        required: ["pais","ciudades","micro_geografia","poder_adquisitivo","velocidad_compra","confianza_online","adopcion_tech","horarios_ads","horarios_tiktok","horarios_webinar","lugares_fisicos","diferencias_culturales","idioma"],
      },
      edad: {
        type: "object",
        properties: {
          rango: stringField, genero: stringField,
          mentalidad_18_24: stringField, mentalidad_25_34: stringField, mentalidad_35_44: stringField,
          gatillos_emocionales: stringField, diferencias_genero: stringField,
          ingresos: stringField, estilo_vida: stringField,
        },
        required: ["rango","genero","mentalidad_18_24","mentalidad_25_34","mentalidad_35_44","gatillos_emocionales","diferencias_genero","ingresos","estilo_vida"],
      },
      fomo: {
        type: "object",
        properties: {
          tendencia: stringField, urgencia: stringField, si_actua: stringField, si_no_actua: stringField,
          social_proof: stringField, escasez: stringField,
          fortalezas: stringField, oportunidades: stringField, debilidades: stringField, amenazas: stringField,
          saturacion: stringField, barrera_entrada: stringField, potencial_economico: stringField,
        },
        required: ["tendencia","urgencia","si_actua","si_no_actua","social_proof","escasez","fortalezas","oportunidades","debilidades","amenazas","saturacion","barrera_entrada","potencial_economico"],
      },
      competencia: {
        type: "object",
        properties: {
          directos: stringField, indirectos: stringField, influencers: stringField, contenido_gratis: stringField,
          hooks_usados: stringField, promesas_repetidas: stringField, estilo_visual: stringField,
          precios: stringField, comentarios_positivos: stringField, comentarios_negativos: stringField,
          debilidades: stringField, angulo_no_saturado: stringField,
        },
        required: ["directos","indirectos","influencers","contenido_gratis","hooks_usados","promesas_repetidas","estilo_visual","precios","comentarios_positivos","comentarios_negativos","debilidades","angulo_no_saturado"],
      },
      dolores: {
        type: "object",
        properties: {
          dolor_visible: stringField, dolor_invisible: stringField, dolor_emocional: stringField,
          dolor_financiero: stringField, dolor_social: stringField, dolor_interno: stringField,
          frases_reales: stringField, pensamiento_3am: stringField,
          objeciones_racionales: stringField, objeciones_emocionales: stringField, objeciones_ocultas: stringField,
          respuestas: stringField,
        },
        required: ["dolor_visible","dolor_invisible","dolor_emocional","dolor_financiero","dolor_social","dolor_interno","frases_reales","pensamiento_3am","objeciones_racionales","objeciones_emocionales","objeciones_ocultas","respuestas"],
      },
    },
    required: ["producto", "avatars", "geografia", "edad", "fomo", "competencia", "dolores"],
  },
};

const SYSTEM = `Eres un equipo combinado de: estratega de marketing senior, investigador de mercado, analista psicológico de consumidor y consultor de negocios para LATAM y mercados hispanos.

REGLAS CRÍTICAS DE CALIDAD PREMIUM:
- Respondes SIEMPRE en español neutro de negocios.
- TODOS los campos son OBLIGATORIOS. Ninguno puede quedar vacío. Si no tienes info, INFIERES con criterio profesional usando hipótesis razonables.
- Cada campo debe tener MÍNIMO 3-5 frases sustanciosas, ESPECÍFICAS, con datos plausibles, ejemplos concretos, nombres reales (plataformas, marcas, zonas, influencers).
- PROHIBIDO responder cosas tipo "Vergüenza, miedo, ansiedad" en una lista plana. SIEMPRE explica el contexto emocional, da un ejemplo de situación real, describe cómo se manifiesta.
- PROHIBIDO genérico tipo "depende del mercado", "varía según el caso". Si no sabes, INFIERES con datos plausibles.
- COHERENCIA TOTAL: el buyer encaja con el producto, los dolores con las objeciones, la competencia con el ángulo no saturado, geografía con horarios, edad con plataformas. Mismo avatar central conecta todo.
- Para 'avatars' genera EXACTAMENTE 3 personas DISTINTAS: principal, secundaria, y variante (ej. escéptico o impulsivo). Cada campo del avatar también requiere 3-5 frases ricas y humanas.
- Tono PREMIUM: profundo, humano, estratégico. Como si lo escribiera un consultor de US$10k.`;

async function callAI(cfg: ProviderCfg, payload: any) {
  const res = await providerChat(cfg, payload);
  if (!res.ok) {
    console.error("AI error", cfg.id, res.status, res.text);
    if (res.status === 429) throw new Error("rate_limit");
    if (res.status === 402) throw new Error("no_credits");
    if (res.status === 401 || res.status === 403) throw new Error("invalid_key");
    throw new Error("ai_error");
  }
  return res.data;
}

const MIN_LEN = 80;

function findWeakFields(payload: any): { path: string; section: string; field: string }[] {
  const weak: { path: string; section: string; field: string }[] = [];
  for (const [section, val] of Object.entries(payload)) {
    if (section === "avatars") {
      const avs = val as any[];
      avs?.forEach((a, i) => {
        for (const [k, v] of Object.entries(a || {})) {
          if (!v || typeof v !== "string" || v.trim().length < MIN_LEN) {
            weak.push({ path: `avatars[${i}].${k}`, section: `avatar_${i}`, field: k });
          }
        }
      });
    } else if (val && typeof val === "object") {
      for (const [k, v] of Object.entries(val as any)) {
        if (!v || typeof v !== "string" || (v as string).trim().length < MIN_LEN) {
          weak.push({ path: `${section}.${k}`, section, field: k });
        }
      }
    }
  }
  return weak;
}

async function regenerateField(cfg: ProviderCfg, idea: string, fullContext: any, section: string, field: string): Promise<string> {
  const data = await callAI(cfg, {
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Investigación en curso para: "${idea}"\n\nCONTEXTO PARCIAL:\n${JSON.stringify(fullContext).slice(0, 4000)}\n\nGenera SOLO el contenido para el campo "${field}" de la sección "${section}". Mínimo 3-5 frases ricas, humanas, específicas, con ejemplos concretos. Coherente con el resto del contexto. Responde SOLO el texto del campo, sin comillas, sin prefacio, sin etiquetas.`,
      },
    ],
  });
  return data.choices?.[0]?.message?.content?.trim() || "";
}

function setByPath(obj: any, path: string, value: string) {
  const m = path.match(/^avatars\[(\d+)\]\.(.+)$/);
  if (m) {
    const i = parseInt(m[1]);
    if (!obj.avatars[i]) obj.avatars[i] = {};
    obj.avatars[i][m[2]] = value;
    return;
  }
  const [s, f] = path.split(".");
  if (!obj[s]) obj[s] = {};
  obj[s][f] = value;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const cfg = await getUserProvider(req);
    assertConfigured(cfg);

    const { idea } = await req.json();
    if (!idea || typeof idea !== "string") {
      return new Response(JSON.stringify({ error: "Falta 'idea'" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PASO 1: generación principal
    const data = await callAI(cfg, {
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Genera la investigación de mercado COMPLETA y PREMIUM para esta idea / negocio:\n\n"${idea}"\n\nLlena TODOS los campos con información estratégica, profunda, humana y específica. Mínimo 3-5 frases por campo. NUNCA dejes campos vacíos.` },
      ],
      tools: [{ type: "function", function: SCHEMA }],
      tool_choice: { type: "function", function: { name: "fill_market_research" } },
    });

    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("Respuesta sin tool_call");
    const args = JSON.parse(call.function.arguments);

    // PASO 2: validar y regenerar campos débiles (en paralelo)
    let weak = findWeakFields(args);
    let attempts = 0;
    while (weak.length > 0 && attempts < 2) {
      attempts++;
      const batch = weak.slice(0, 12);
      console.log(`Regenerando ${batch.length} campos débiles (intento ${attempts})`);
      const results = await Promise.all(
        batch.map(async (w) => {
          try {
            const text = await regenerateField(cfg, idea, args, w.section, w.field);
            return { path: w.path, text };
          } catch (e) {
            console.error("regen fail", w.path, e);
            return { path: w.path, text: "" };
          }
        }),
      );
      results.forEach((r) => {
        if (r.text && r.text.length >= 40) setByPath(args, r.path, r.text);
      });
      weak = findWeakFields(args);
    }

    return new Response(JSON.stringify({ data: args, weak_remaining: weak.length, provider: cfg.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof NoConfigError) {
      return new Response(JSON.stringify({ error: "no_config", message: "Configura tu motor de IA para continuar." }), {
        status: 428, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const msg = e instanceof Error ? e.message : "Error desconocido";
    const status = msg === "rate_limit" ? 429 : msg === "no_credits" ? 402 : msg === "invalid_key" ? 401 : 500;
    const userMsg =
      msg === "rate_limit" ? "Demasiadas solicitudes. Espera un momento." :
      msg === "no_credits" ? "Sin créditos de IA en tu proveedor." :
      msg === "invalid_key" ? "Tu API key parece inválida. Revísala en tu perfil." : msg;
    console.error("ai-autofill error", e);
    return new Response(JSON.stringify({ error: userMsg }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
