import { useState, useEffect } from "react";
import { TabDef, FieldDef } from "@/lib/tabs-config";
import { tabProgress, useResearch } from "@/lib/research-store";
import { supabase } from "@/integrations/supabase/client";

const colorClass = {
  pink: "text-neon-pink",
  cyan: "text-neon-cyan",
  lime: "text-neon-lime",
  yellow: "text-neon-yellow",
  purple: "text-[var(--neon-purple)]",
};

const STYLES = [
  { key: "profundizar", label: "✨ Profundizar", hint: "más detalle y ejemplos" },
  { key: "expandir", label: "➕ Expandir", hint: "agregar capas" },
  { key: "agresiva", label: "🔥 Agresiva", hint: "tono confrontacional" },
  { key: "emocional", label: "💖 Emocional", hint: "tono humano" },
  { key: "premium", label: "👑 Premium", hint: "tono autoridad" },
];

function FieldRow({
  field,
  value,
  xpPerField,
  onChange,
  onEnhance,
  loading,
}: {
  field: FieldDef;
  value: string;
  xpPerField: number;
  onChange: (v: string) => void;
  onEnhance: (style: string) => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const filled = value.trim().length > 5;
  return (
    <div className="rounded-lg border border-border bg-card/50 p-4 transition hover:border-[var(--neon-cyan)]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 font-mono text-sm">
          <span className="text-foreground">{field.label}</span>
        </label>
        <div className="flex items-center gap-2">
          {filled && <span className="text-neon-lime text-xs">+{xpPerField} XP</span>}
          <button
            onClick={() => setOpen((o) => !o)}
            disabled={loading}
            className="rounded border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground hover:border-[var(--neon-pink)] hover:text-neon-pink disabled:opacity-50"
            title="Acciones IA"
          >
            🤖 IA
          </button>
        </div>
      </div>
      {field.multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full resize-none rounded-md border border-border bg-input/40 px-3 py-2 font-mono text-sm text-foreground outline-none transition focus:border-[var(--neon-pink)] focus:ring-2 focus:ring-[var(--neon-pink)]/30"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-md border border-border bg-input/40 px-3 py-2 font-mono text-sm text-foreground outline-none transition focus:border-[var(--neon-pink)] focus:ring-2 focus:ring-[var(--neon-pink)]/30"
        />
      )}
      {open && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {STYLES.map((s) => (
            <button
              key={s.key}
              disabled={loading}
              onClick={() => {
                onEnhance(s.key);
                setOpen(false);
              }}
              title={s.hint}
              className="rounded-md border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground transition hover:border-[var(--neon-cyan)] hover:text-neon-cyan disabled:opacity-50"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TabPanel({ tab }: { tab: TabDef }) {
  const { data, updateField } = useResearch();
  const tabData = data[tab.id] || {};
  const pct = tabProgress(tabData, tab.fields.length);
  const earnedXp = Math.round((tab.xp * pct) / 100);
  const xpPerField = Math.round(tab.xp / Math.max(1, tab.fields.length));
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (pct === 100 && tab.fields.length > 0) {
      setShowCelebration(true);
      const t = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(t);
    }
  }, [pct, tab.fields.length]);

  const enhance = async (field: FieldDef, style: string) => {
    setError(null);
    setLoadingField(field.id);
    try {
      const { data: res, error } = await supabase.functions.invoke("ai-enhance", {
        body: {
          action: "enhance_field",
          fieldLabel: field.label,
          currentValue: tabData[field.id] || "",
          style,
          context: data,
        },
      });
      if (error) throw error;
      if (res?.error) throw new Error(res.error);
      if (res?.text) updateField(tab.id, field.id, res.text);
    } catch (e: any) {
      setError(e.message || "Error IA");
    } finally {
      setLoadingField(null);
    }
  };

  // group fields if they have group meta
  const groups = tab.fields.reduce<Record<string, FieldDef[]>>((acc, f) => {
    const key = f.group || "_";
    (acc[key] = acc[key] || []).push(f);
    return acc;
  }, {});
  const groupKeys = Object.keys(groups);

  return (
    <section className="animate-fade-in relative">
      {showCelebration && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
          <div className="animate-pop-in text-6xl">🎉</div>
          <div className="animate-pop-in mt-2 text-neon-lime text-lg font-bold">¡MISIÓN COMPLETADA!</div>
          <div className="animate-pop-in text-neon-yellow text-sm font-mono">+{tab.xp} XP desbloqueados</div>
        </div>
      )}
      <div className="relative mb-6 overflow-hidden rounded-xl border border-border bg-card/70 p-6 scanlines">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="text-4xl">{tab.icon}</span>
              <h2 className={`text-xl ${colorClass[tab.color]}`}>{tab.label}</h2>
            </div>
            <p className="font-mono text-sm text-muted-foreground">{tab.description}</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase text-muted-foreground">XP misión</div>
            <div className={`text-2xl font-bold ${colorClass[tab.color]}`}>
              {earnedXp}/{tab.xp}
            </div>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-arcade-gradient transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        {error && <p className="mt-2 font-mono text-xs text-destructive">⚠ {error}</p>}
      </div>

      {groupKeys.map((g) => (
        <div key={g} className="mb-6">
          {g !== "_" && (
            <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">— {g} —</h3>
          )}
          <div className="grid gap-3">
            {groups[g].map((field) => (
              <FieldRow
                key={field.id}
                field={field}
                value={tabData[field.id] || ""}
                xpPerField={xpPerField}
                onChange={(v) => updateField(tab.id, field.id, v)}
                onEnhance={(style) => enhance(field, style)}
                loading={loadingField === field.id}
              />
            ))}
          </div>
        </div>
      ))}

      {pct === 100 && (
        <div className="mt-6 rounded-lg border-neon-lime bg-card/70 p-4 text-center animate-pop-in">
          <p className="text-neon-lime text-sm">🏅 ¡MISIÓN COMPLETADA! +{tab.xp} XP desbloqueados</p>
        </div>
      )}
    </section>
  );
}
