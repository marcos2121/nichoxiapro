import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AI_PROVIDERS, FREE_PROVIDERS, PREMIUM_PROVIDERS, getProvider, type AIProvider } from "@/lib/ai-providers";
import { toast } from "sonner";

type Conn = { provider: string; model: string | null; is_primary: boolean; last4: string | null };

export function AISetup({
  open,
  onClose,
  forced,
}: {
  open: boolean;
  onClose: () => void;
  forced?: boolean;
}) {
  const [conns, setConns] = useState<Conn[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [active, setActive] = useState<AIProvider | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testOk, setTestOk] = useState<null | boolean>(null);

  const load = useCallback(async () => {
    setLoadingList(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("ai_connections")
        .select("provider, model, is_primary, last4")
        .eq("user_id", user.id);
      setConns(data || []);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const connOf = (id: string) => conns.find((c) => c.provider === id);
  const hasPrimary = conns.some((c) => c.is_primary);
  // motor activo: la conexión principal, o nixoia si no hay ninguna
  const activeId = conns.find((c) => c.is_primary)?.provider || "nixoia";

  const openConnect = (p: AIProvider) => {
    setActive(p);
    setApiKey("");
    setModel(connOf(p.id)?.model || p.defaultModel || "");
    setTestOk(null);
  };

  const verifyAndSave = async () => {
    if (!active) return;
    if (!apiKey.trim()) return toast.error("Pega tu API key primero");
    setTesting(true);
    setTestOk(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-test", {
        body: { provider: active.id, apiKey: apiKey.trim(), model: model.trim() || null },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTestOk(true);

      // guardar la conexión (encriptada/protegida por RLS)
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión");
      const key = apiKey.trim();
      const makePrimary = conns.length === 0; // primera conexión = principal
      const { error: upErr } = await supabase.from("ai_connections").upsert(
        {
          user_id: user.id,
          provider: active.id,
          api_key: key,
          model: model.trim() || null,
          last4: key.slice(-4),
          ...(makePrimary ? { is_primary: true } : {}),
        },
        { onConflict: "user_id,provider" },
      );
      if (upErr) throw upErr;

      toast.success(`✅ ${active.name} conectado`);
      setActive(null);
      await load();
    } catch (e: any) {
      setTestOk(false);
      toast.error("❌ " + (e?.message || "No se pudo conectar"));
    } finally {
      setTesting(false);
      setSaving(false);
    }
  };

  const setPrimary = async (id: string | null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // limpiar todas, luego marcar la elegida (índice único de una sola principal)
    await supabase.from("ai_connections").update({ is_primary: false }).eq("user_id", user.id);
    if (id) {
      await supabase.from("ai_connections").update({ is_primary: true }).eq("user_id", user.id).eq("provider", id);
    }
    toast.success(id ? `${getProvider(id).name} es ahora tu IA principal` : "Usando Nixoia IA incluida");
    await load();
  };

  const remove = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("ai_connections").delete().eq("user_id", user.id).eq("provider", id);
    toast.success("Conexión eliminada");
    await load();
  };

  const renderCard = (p: AIProvider) => {
    const c = connOf(p.id);
    const connected = !!c;
    const isActive = activeId === p.id;
    return (
      <div
        key={p.id}
        className={`flex flex-col rounded-lg border p-4 transition ${
          isActive ? "border-neon-lime glow-lime" : connected ? "border-neon-cyan/60" : "border-border"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl" style={{ filter: `drop-shadow(0 0 6px ${p.color})` }}>{p.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-foreground">{p.name}</span>
              <span
                className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${
                  p.free ? "bg-[var(--neon-lime)]/15 text-neon-lime" : "bg-[var(--neon-yellow)]/15 text-neon-yellow"
                }`}
              >
                {p.free ? "GRATIS" : "PREMIUM"}
              </span>
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">{p.brand}</div>
          </div>
          {connected && <span className="font-mono text-[10px] font-bold text-neon-lime">✅ CONECTADO</span>}
        </div>

        {connected && (
          <div className="mt-2 font-mono text-[10px] text-muted-foreground">
            Clave: ••••{c?.last4 || "????"}
            {isActive && <span className="ml-2 font-bold text-neon-lime">● PRINCIPAL</span>}
          </div>
        )}

        <p className="mt-2 font-mono text-[10px] leading-snug text-muted-foreground">{p.help}</p>

        {p.keyUrl && (
          <a
            href={p.keyUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 self-start rounded-md border border-neon-cyan/50 px-2.5 py-1 font-mono text-[10px] text-neon-cyan transition hover:bg-[var(--neon-cyan)]/10"
          >
            🔗 Iniciar sesión / Obtener API en {p.keyUrlLabel}
          </a>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => openConnect(p)}
            className="rounded-md bg-arcade-gradient px-3 py-1.5 font-mono text-[10px] font-bold text-background transition hover:opacity-90"
          >
            {connected ? "🔁 Reconectar" : "🔌 Pegar mi API key"}
          </button>
          {connected && !isActive && (
            <button
              onClick={() => setPrimary(p.id)}
              className="rounded-md bg-arcade-gradient px-3 py-1.5 font-mono text-[10px] font-bold text-background transition hover:opacity-90"
            >
              Usar como principal
            </button>
          )}
          {connected && (
            <button
              onClick={() => remove(p.id)}
              className="ml-auto rounded-md border border-border px-3 py-1.5 font-mono text-[10px] text-muted-foreground transition hover:border-destructive hover:text-destructive"
            >
              Quitar
            </button>
          )}
        </div>
      </div>
    );
  };

  if (!open) return null;


  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/85 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl rounded-xl border border-neon-cyan bg-card p-6 scanlines">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm text-neon-cyan">🔌 Conecta tus IAs</h2>
          {!forced && (
            <button onClick={onClose} className="font-mono text-xs text-muted-foreground hover:text-foreground">
              ✕
            </button>
          )}
        </div>
        <p className="mb-4 font-mono text-[11px] text-muted-foreground">
          Usa el autopiloto con tu propia cuenta de IA. Conecta una o varias y elige cuál usar como principal.
          Tu clave se guarda protegida y solo se muestran los últimos 4 caracteres.
        </p>

        {forced && (
          <p className="mb-4 rounded-md border border-neon-yellow/40 bg-[var(--neon-yellow)]/5 p-3 font-mono text-xs text-neon-yellow">
            ⚠ Elige una IA para empezar a generar. La opción <b>Nixoia IA</b> es gratis y ya está lista.
          </p>
        )}




        <p className="mb-4 font-mono text-[11px] text-neon-cyan">
          {AI_PROVIDERS.length} IAs disponibles para conectar · elige las que quieras
        </p>

        {/* Sección GRATIS */}
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded px-2 py-0.5 font-mono text-[10px] font-bold bg-[var(--neon-lime)]/15 text-neon-lime">
            GRATIS
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {FREE_PROVIDERS.length} opciones · API key sin costo o con créditos gratis
          </span>
        </div>
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {FREE_PROVIDERS.map(renderCard)}
        </div>

        {/* Sección PREMIUM */}
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded px-2 py-0.5 font-mono text-[10px] font-bold bg-[var(--neon-yellow)]/15 text-neon-yellow">
            PREMIUM
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {PREMIUM_PROVIDERS.length} opciones · requieren saldo de pago
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {PREMIUM_PROVIDERS.map(renderCard)}
        </div>

        {loadingList && <p className="mt-4 font-mono text-[10px] text-muted-foreground">Cargando conexiones...</p>}

        {/* Modal de conexión por proveedor */}
        {active && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-neon-lime bg-card p-6 scanlines">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{active.icon}</span>
                  <div>
                    <div className="font-mono text-sm font-bold text-foreground">{active.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{active.brand}</div>
                  </div>
                </div>
                <button onClick={() => setActive(null)} className="font-mono text-xs text-muted-foreground hover:text-foreground">✕</button>
              </div>

              <p className="mb-2 font-mono text-[11px] text-muted-foreground">{active.help}</p>
              {active.keyUrl && (
                <a
                  href={active.keyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-3 inline-block rounded-md border border-neon-cyan/50 px-3 py-1.5 font-mono text-[10px] text-neon-cyan transition hover:bg-[var(--neon-cyan)]/10"
                >
                  → Obtener API key en {active.keyUrlLabel}
                </a>
              )}

              <label className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setTestOk(null); }}
                placeholder="Pega aquí tu API key..."
                className="mb-3 w-full rounded-md border border-border bg-input/40 px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-[var(--neon-lime)]"
              />

              <label className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">Modelo (opcional)</label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={active.defaultModel}
                className="mb-4 w-full rounded-md border border-border bg-input/40 px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-[var(--neon-lime)]"
              />

              <div className="flex items-center gap-2">
                {testOk === true && <span className="font-mono text-xs text-neon-lime">✓ Conexión válida</span>}
                {testOk === false && <span className="font-mono text-xs text-destructive">✕ Falló</span>}
                <button
                  onClick={verifyAndSave}
                  disabled={testing || saving || !apiKey.trim()}
                  className="ml-auto rounded-md bg-arcade-gradient px-5 py-2 font-mono text-xs font-bold text-background transition hover:opacity-90 disabled:opacity-50"
                >
                  {testing ? "VERIFICANDO..." : saving ? "GUARDANDO..." : "🔌 Verificar y conectar"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-border px-5 py-2 font-mono text-xs text-foreground transition hover:border-neon-cyan"
          >
            {forced ? "Empezar" : "Listo"}
          </button>
        </div>
      </div>
    </div>
  );
}
