import { useState } from "react";
import { BUYER_FIELDS, TABS } from "@/lib/tabs-config";
import { useResearch, avatarsProgress } from "@/lib/research-store";
import { supabase } from "@/integrations/supabase/client";

const groupOrder = ["Identidad", "Psicológico", "Digital", "Económico", "Emocional", "Compra"];

export function BuyerPersonaPanel() {
  const { avatars, updateAvatar, addAvatars, removeAvatar, data } = useResearch();
  const tab = TABS.find((t) => t.id === "buyer")!;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const pct = avatarsProgress(avatars, BUYER_FIELDS.length);

  const generate = async (count: number) => {
    setError(null);
    setLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("ai-enhance", {
        body: { action: "generate_avatars", count, context: data },
      });
      if (error) throw error;
      if (res?.error) throw new Error(res.error);
      if (res?.avatars?.length) {
        addAvatars(res.avatars);
        setActiveIdx(avatars.length); // jump to first new one
      }
    } catch (e: any) {
      setError(e.message || "Error IA");
    } finally {
      setLoading(false);
    }
  };

  const current = avatars[activeIdx];
  const grouped = BUYER_FIELDS.reduce<Record<string, typeof BUYER_FIELDS>>((acc, f) => {
    const k = f.group || "_";
    (acc[k] = acc[k] || []).push(f);
    return acc;
  }, {});

  return (
    <section className="animate-fade-in">
      <div className="mb-6 rounded-xl border border-border bg-card/70 p-6 scanlines">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="text-4xl">{tab.icon}</span>
              <h2 className="text-neon-cyan text-xl">{tab.label}</h2>
            </div>
            <p className="font-mono text-sm text-muted-foreground">{tab.description}</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase text-muted-foreground">Avatares</div>
            <div className="text-neon-cyan text-2xl font-bold">{avatars.length}</div>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-arcade-gradient transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase text-muted-foreground">Generar:</span>
          {[1, 3, 5, 10].map((n) => (
            <button
              key={n}
              disabled={loading}
              onClick={() => generate(n)}
              className="rounded-md border-neon-pink bg-card px-3 py-1 font-mono text-xs text-neon-pink transition hover:bg-[var(--neon-pink)]/10 disabled:opacity-50"
            >
              + {n} avatar{n > 1 ? "es" : ""}
            </button>
          ))}
          {loading && <span className="text-neon-cyan animate-flicker font-mono text-xs">⚡ generando...</span>}
        </div>
        {error && <p className="mt-2 font-mono text-xs text-destructive">⚠ {error}</p>}
      </div>

      {avatars.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/30 p-10 text-center">
          <p className="font-mono text-sm text-muted-foreground">
            Aún no hay buyer personas. Pulsa <span className="text-neon-pink">+ 3 avatares</span> para que la IA los genere a partir de tu producto.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {avatars.map((a, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`group flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-xs transition ${
                  i === activeIdx
                    ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 text-neon-cyan"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>👤 {a.nombre || `Avatar ${i + 1}`}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("¿Eliminar este avatar?")) {
                      removeAvatar(i);
                      setActiveIdx(0);
                    }
                  }}
                  className="opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                >
                  ✕
                </span>
              </button>
            ))}
          </div>

          {current &&
            groupOrder
              .filter((g) => grouped[g])
              .map((g) => (
                <div key={g} className="mb-6">
                  <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">— {g} —</h3>
                  <div className="grid gap-3">
                    {grouped[g].map((f) => {
                      const v = current[f.id] || "";
                      return (
                        <div key={f.id} className="rounded-lg border border-border bg-card/50 p-4">
                          <label className="mb-2 block font-mono text-sm text-foreground">{f.label}</label>
                          {f.multiline ? (
                            <textarea
                              value={v}
                              onChange={(e) => updateAvatar(activeIdx, f.id, e.target.value)}
                              placeholder={f.placeholder}
                              rows={2}
                              className="w-full resize-none rounded-md border border-border bg-input/40 px-3 py-2 font-mono text-sm outline-none focus:border-[var(--neon-cyan)]"
                            />
                          ) : (
                            <input
                              value={v}
                              onChange={(e) => updateAvatar(activeIdx, f.id, e.target.value)}
                              placeholder={f.placeholder}
                              className="w-full rounded-md border border-border bg-input/40 px-3 py-2 font-mono text-sm outline-none focus:border-[var(--neon-cyan)]"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
        </>
      )}
    </section>
  );
}
