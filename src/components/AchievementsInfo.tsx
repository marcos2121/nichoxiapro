import { TOTAL_XP } from "@/lib/tabs-config";

const RANKS = [
  { name: "Novato", icon: "🌱", color: "text-muted-foreground", level: 1 },
  { name: "Recluta", icon: "🔰", color: "text-neon-cyan", level: 2 },
  { name: "Investigador", icon: "🔍", color: "text-neon-lime", level: 3 },
  { name: "Estratega", icon: "⚔️", color: "text-neon-yellow", level: 4 },
  { name: "Maestro", icon: "🏅", color: "text-neon-pink", level: 5 },
  { name: "Leyenda", icon: "👑", color: "text-[var(--neon-purple)]", level: 6 },
  { name: "Oráculo", icon: "🔮", color: "text-neon-cyan", level: 7 },
  { name: "Dios del Mercado", icon: "🌟", color: "text-neon-yellow", level: 8 },
];

const BADGES = [
  { icon: "🌱", label: "Primer Campo", how: "Completa tu primer campo de la investigación." },
  { icon: "🔍", label: "Investigador", how: "Completa al 100% al menos 2 módulos." },
  { icon: "⚔️", label: "Estratega", how: "Completa al 100% al menos 4 módulos." },
  { icon: "🏅", label: "Maestro", how: "Completa al 100% al menos 6 módulos." },
  { icon: "👑", label: "Leyenda", how: "Llega al 100% de la investigación completa." },
  { icon: "🧠", label: "Psicólogo", how: "Crea 3 o más buyer personas." },
  { icon: "📤", label: "Exportador", how: "Alcanza el 80% de avance total." },
  { icon: "⚡", label: "Speedrun", how: "Completa 3 módulos antes de terminar todo." },
];

export function AchievementsInfo({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-neon-pink text-base sm:text-lg">🎮 RANGOS Y LOGROS</h2>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">Cómo subir de nivel y desbloquear medallas</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-border px-3 py-1 font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Cómo se gana XP */}
        <div className="mb-5 rounded-lg border border-neon-cyan/40 bg-secondary/40 p-4">
          <h3 className="text-neon-cyan mb-2 font-mono text-xs uppercase">⚡ ¿Cómo se gana XP?</h3>
          <ul className="space-y-1.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
            <li>• Cada campo que completas en los módulos suma XP automáticamente.</li>
            <li>• Crear buyer personas detallados también suma XP.</li>
            <li>• Mientras más completa la investigación, más XP: hasta <span className="text-neon-lime">{TOTAL_XP} XP</span> en total.</li>
            <li>• Cada <span className="text-neon-yellow">250 XP</span> subes 1 nivel y, con ello, de rango.</li>
          </ul>
        </div>

        {/* Rangos */}
        <h3 className="text-neon-yellow mb-2 font-mono text-xs uppercase">🏆 Rangos por nivel</h3>
        <div className="mb-5 space-y-2">
          {RANKS.map((r) => (
            <div key={r.name} className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-3 py-2">
              <span className="text-xl">{r.icon}</span>
              <div className="flex-1">
                <div className={`font-mono text-xs font-bold ${r.color}`}>{r.name}</div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  Nivel {r.level} · desde {(r.level - 1) * 250} XP
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Logros */}
        <h3 className="text-neon-lime mb-2 font-mono text-xs uppercase">🎖️ Medallas (logros)</h3>
        <div className="space-y-2">
          {BADGES.map((b) => (
            <div key={b.label} className="flex items-start gap-3 rounded-lg border border-border bg-card/60 px-3 py-2">
              <span className="text-xl">{b.icon}</span>
              <div className="flex-1">
                <div className="font-mono text-xs font-bold text-foreground">{b.label}</div>
                <div className="font-mono text-[10px] leading-relaxed text-muted-foreground">{b.how}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
