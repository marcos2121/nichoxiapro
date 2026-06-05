import { ReactNode, useEffect, useState } from "react";
import { TABS, TOTAL_XP } from "@/lib/tabs-config";
import { tabProgress, avatarsProgress, useResearch, type TabId } from "@/lib/research-store";
import { ProjectsBar } from "./ProjectsBar";
import { ProfileMenu } from "./ProfileMenu";
import { AchievementsInfo } from "./AchievementsInfo";
import { BUYER_FIELDS } from "@/lib/tabs-config";

const colorMap = {
  pink: "text-neon-pink border-[var(--neon-pink)]",
  cyan: "text-neon-cyan border-[var(--neon-cyan)]",
  lime: "text-neon-lime border-[var(--neon-lime)]",
  yellow: "text-neon-yellow border-[var(--neon-yellow)]",
  purple: "text-[var(--neon-purple)] border-[var(--neon-purple)]",
};

const RANKS = [
  { name: "Novato", color: "text-muted-foreground", icon: "🌱" },
  { name: "Recluta", color: "text-neon-cyan", icon: "🔰" },
  { name: "Investigador", color: "text-neon-lime", icon: "🔍" },
  { name: "Estratega", color: "text-neon-yellow", icon: "⚔️" },
  { name: "Maestro", color: "text-neon-pink", icon: "🏅" },
  { name: "Leyenda", color: "text-[var(--neon-purple)]", icon: "👑" },
  { name: "Oráculo", color: "text-neon-cyan", icon: "🔮" },
  { name: "Dios del Mercado", color: "text-neon-yellow", icon: "🌟" },
];

function getRank(level: number) {
  return RANKS[Math.min(level - 1, RANKS.length - 1)];
}

function getNextLevelXP(level: number) {
  return level * 250;
}

function FloatingParticles({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<{ id: number; x: number; delay: number; color: string }[]>([]);
  useEffect(() => {
    if (!active) return;
    const p = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      color: ["#FF3CB4", "#00E6FF", "#73FFB8", "#FFE066"][Math.floor(Math.random() * 4)],
    }));
    setParticles(p);
    const t = setTimeout(() => setParticles([]), 2500);
    return () => clearTimeout(t);
  }, [active]);
  if (!particles.length) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute text-xs animate-float-up"
          style={{ left: `${p.x}%`, bottom: "0", animationDelay: `${p.delay}s`, color: p.color }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

export function ArcadeShell({
  active,
  onChange,
  children,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
  children: ReactNode;
}) {
  const { data, avatars, resetActive, project } = useResearch();
  const [infoOpen, setInfoOpen] = useState(false);

  const earnedXp = TABS.reduce((sum, t) => {
    if (t.id === "buyer") {
      const p = avatarsProgress(avatars, BUYER_FIELDS.length);
      return sum + Math.round((t.xp * p) / 100);
    }
    const p = tabProgress(data[t.id], t.fields.length || 1);
    return sum + Math.round((t.xp * p) / 100);
  }, 0);
  const level = Math.floor(earnedXp / 250) + 1;
  const xpPct = Math.round((earnedXp / TOTAL_XP) * 100);
  const rank = getRank(level);
  const nextLevelXP = getNextLevelXP(level);
  const currentLevelBase = (level - 1) * 250;
  const levelProgress = Math.min(100, Math.round(((earnedXp - currentLevelBase) / 250) * 100));

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <header className="mx-auto mb-4 max-w-6xl">
        <div className="relative flex flex-col gap-4 rounded-xl border border-border bg-card/60 p-4 backdrop-blur sm:p-5 overflow-hidden">
          <FloatingParticles active={xpPct >= 90} />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg text-neon-pink animate-flicker md:text-xl">
                NIXOIA<span className="text-neon-cyan"> PRO</span>
              </h1>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground sm:text-xs">
                Investigación estratégica · IA conectada
              </p>
            </div>
            <ProfileMenu />
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <button
              onClick={() => setInfoOpen(true)}
              className="text-left transition hover:opacity-80"
              title="Ver cómo funcionan rangos y logros"
            >
              <div className="font-mono text-[10px] uppercase text-muted-foreground">Rango ⓘ</div>
              <div className={`text-sm font-bold ${rank.color}`}>{rank.icon} {rank.name}</div>
            </button>
            <button onClick={() => setInfoOpen(true)} className="text-left transition hover:opacity-80">
              <div className="font-mono text-[10px] uppercase text-muted-foreground">Nivel</div>
              <div className="text-neon-yellow text-2xl font-bold leading-none">{level}</div>
            </button>
            <div className="min-w-[140px] flex-1 sm:w-56 sm:flex-none">
              <div className="mb-1 flex justify-between font-mono text-[10px]">
                <span className="text-neon-lime">{earnedXp} XP</span>
                <span className="text-muted-foreground">Lv.{level+1} @ {nextLevelXP} XP</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full border border-border bg-secondary">
                <div
                  className="h-full bg-arcade-gradient transition-all duration-700 relative"
                  style={{ width: `${levelProgress}%` }}
                >
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,rgba(255,255,255,0.15)_4px,rgba(255,255,255,0.15)_8px)]" />
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm(`¿Reiniciar "${project?.name}"? Se borran datos y avatares.`)) resetActive();
              }}
              className="ml-auto rounded border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground transition hover:border-destructive hover:text-destructive"
            >
              RESET
            </button>
          </div>
        </div>
      </header>
      <AchievementsInfo open={infoOpen} onClose={() => setInfoOpen(false)} />

      <ProjectsBar />

      <nav className="mx-auto mb-8 max-w-6xl">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {TABS.map((tab) => {
            const isActive = active === tab.id;
            const pct =
              tab.id === "buyer"
                ? avatarsProgress(avatars, BUYER_FIELDS.length)
                : tabProgress(data[tab.id], tab.fields.length || 1);
            const done = pct === 100 && tab.fields.length > 0;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`group relative flex flex-col items-center gap-1 rounded-lg border bg-card/60 p-3 text-center transition-all hover:-translate-y-0.5 ${
                  isActive ? `${colorMap[tab.color]} animate-pulse-glow` : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-2xl">{tab.icon}</span>
                <span className="font-mono text-[10px] uppercase leading-tight">{tab.label}</span>
                {tab.fields.length > 0 && (
                  <div className="mt-1 h-1 w-full overflow-hidden rounded bg-secondary">
                    <div
                      className={`h-full transition-all ${done ? "bg-[var(--neon-lime)]" : "bg-[var(--neon-pink)]"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
                {done && <span className="absolute -right-1 -top-1 text-neon-lime text-sm animate-bounce">✓</span>}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-4xl">{children}</main>

      <footer className="mx-auto mt-12 max-w-6xl text-center font-mono text-xs text-muted-foreground">
        💾 Tus proyectos se guardan automáticamente en este navegador
      </footer>
    </div>
  );
}
