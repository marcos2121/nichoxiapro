import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useResearch } from "@/lib/research-store";
import { TABS } from "@/lib/tabs-config";
import { AISetup } from "./AISetup";

export function AIAutofill() {
  const { updateField, setAvatars } = useResearch();
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  const run = async () => {
    if (idea.trim().length < 10) {
      setError("Describe tu idea con al menos 10 caracteres");
      return;
    }
    setError(null);
    setLoading(true);
    setStep("🧠 Estratega IA analizando · generando contenido premium · validando profundidad...");

    try {
      const { data, error } = await supabase.functions.invoke("ai-autofill", {
        body: { idea },
      });
      if (error) {
        let noConfig = false;
        try {
          const ctx = (error as any).context;
          if (ctx?.status === 428) noConfig = true;
          else if (ctx && typeof ctx.json === "function") {
            const j = await ctx.json();
            if (j?.error === "no_config") noConfig = true;
          }
        } catch {}
        if (noConfig) {
          setShowSetup(true);
          throw new Error("Configura tu motor de IA para empezar.");
        }
        throw error;
      }
      if (data?.error === "no_config") {
        setShowSetup(true);
        throw new Error("Configura tu motor de IA para empezar.");
      }
      if (data?.error) throw new Error(data.error);

      const payload = data.data as Record<string, any>;
      const weak = data.weak_remaining ?? 0;
      const sections = TABS.filter((t) => t.id !== "resumen" && t.id !== "buyer");

      for (const t of sections) {
        const sec = payload[t.id];
        if (!sec) continue;
        setStep(`⚡ Desbloqueando ${t.icon} ${t.label}...`);
        for (const f of t.fields) {
          const v = sec[f.id];
          if (v) updateField(t.id, f.id, v);
        }
        await new Promise((r) => setTimeout(r, 350));
      }

      if (payload.avatars?.length) {
        setStep(`🎯 Generando ${payload.avatars.length} buyer personas...`);
        setAvatars(payload.avatars);
        await new Promise((r) => setTimeout(r, 500));
      }

      setStep(weak > 0 ? `🏆 Investigación lista (${weak} campos con fallback)` : "🏆 ¡Investigación premium completa!");
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
      }, 1400);
    } catch (e: any) {
      setError(e.message || "Error al generar");
      setLoading(false);
      setStep("");
    }
  };

  if (!open) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="mb-6 w-full rounded-xl border-neon-cyan bg-card/60 p-4 text-center font-mono text-sm text-neon-cyan transition hover:bg-[var(--neon-cyan)]/10"
        >
          🤖 Generar otra investigación con IA
        </button>
        <AISetup open={showSetup} onClose={() => setShowSetup(false)} />
      </>
    );
  }

  return (
    <>
    <div className="mb-6 rounded-xl border-neon-pink bg-card/70 p-5 scanlines">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">🤖</span>
        <h3 className="text-neon-pink text-sm">MODO AUTOPILOTO IA · ESTRATEGA</h3>
      </div>
      <p className="mb-3 font-mono text-xs text-muted-foreground">
        Describe tu producto en una frase. La IA llenará TODA la investigación + 3 buyer personas distintos.
      </p>
      <button
        type="button"
        onClick={() => setShowSetup(true)}
        className="mb-3 inline-flex items-center gap-1 rounded-md border border-neon-cyan/60 px-3 py-1.5 font-mono text-[11px] text-neon-cyan transition hover:bg-[var(--neon-cyan)]/10"
      >
        🔌 Conectar mi propia IA (ChatGPT, Claude, Gemini, Grok...)
      </button>
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Ej: Una app de meditación para emprendedores latinoamericanos estresados..."
        rows={2}
        disabled={loading}
        className="w-full resize-none rounded-md border border-border bg-input/40 px-3 py-2 font-mono text-sm text-foreground outline-none transition focus:border-[var(--neon-pink)] focus:ring-2 focus:ring-[var(--neon-pink)]/30 disabled:opacity-50"
      />
      {error && <p className="mt-2 font-mono text-xs text-destructive">⚠ {error}</p>}
      {loading && step && <p className="text-neon-cyan mt-3 font-mono text-xs animate-flicker">{step}</p>}
      <div className="mt-3 flex gap-2">
        <button
          onClick={run}
          disabled={loading}
          className="flex-1 rounded-md bg-arcade-gradient px-4 py-2 font-mono text-sm font-bold text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "GENERANDO..." : "⚡ INICIAR AUTOPILOTO"}
        </button>
        <button
          onClick={() => setOpen(false)}
          disabled={loading}
          className="rounded-md border border-border px-4 py-2 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>
    </div>
    <AISetup open={showSetup} onClose={() => setShowSetup(false)} />
    </>
  );
}
