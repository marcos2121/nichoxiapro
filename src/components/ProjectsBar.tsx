import { useResearch } from "@/lib/research-store";
import { useState } from "react";

export function ProjectsBar() {
  const { projects, activeId, createProject, switchProject, renameProject, deleteProject } = useResearch();
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");

  return (
    <div className="mx-auto mb-4 max-w-6xl">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/50 p-3">
        <span className="font-mono text-[10px] uppercase text-muted-foreground">Proyectos:</span>
        {projects.map((p) => {
          const isActive = p.id === activeId;
          if (editing === p.id) {
            return (
              <input
                key={p.id}
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  if (name.trim()) renameProject(p.id, name.trim());
                  setEditing(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  if (e.key === "Escape") setEditing(null);
                }}
                className="rounded border border-[var(--neon-cyan)] bg-input/40 px-2 py-1 font-mono text-xs"
              />
            );
          }
          return (
            <div
              key={p.id}
              className={`group flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-xs transition ${
                isActive
                  ? "border-[var(--neon-pink)] bg-[var(--neon-pink)]/10 text-neon-pink"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <button onClick={() => switchProject(p.id)}>{p.name}</button>
              <button
                onClick={() => {
                  setEditing(p.id);
                  setName(p.name);
                }}
                className="opacity-0 transition group-hover:opacity-100"
                title="Renombrar"
              >
                ✎
              </button>
              {projects.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar "${p.name}"?`)) deleteProject(p.id);
                  }}
                  className="opacity-0 transition hover:text-destructive group-hover:opacity-100"
                  title="Eliminar"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
        <button
          onClick={() => createProject()}
          className="rounded-md border-neon-lime px-2 py-1 font-mono text-xs text-neon-lime hover:bg-[var(--neon-lime)]/10"
        >
          + NUEVA
        </button>
      </div>
    </div>
  );
}
