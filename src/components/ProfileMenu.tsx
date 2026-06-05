import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getProvider } from "@/lib/ai-providers";
import { AISetup } from "./AISetup";
import { toast } from "sonner";

export function ProfileMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [providerId, setProviderId] = useState("nixoia");
  const ref = useRef<HTMLDivElement>(null);

  const loadSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setEmail(user?.email || "");
    if (!user) return;
    const { data } = await supabase
      .from("ai_connections")
      .select("provider")
      .eq("user_id", user.id)
      .eq("is_primary", true)
      .maybeSingle();
    setProviderId(data?.provider || "nixoia");
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate({ to: "/auth", replace: true });
  };

  const initial = (email[0] || "?").toUpperCase();
  const providerName = getProvider(providerId).name;

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-neon-cyan bg-arcade-gradient/10 px-2 py-1 pr-3 transition hover:bg-[var(--neon-cyan)]/10"
          title="Perfil"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-arcade-gradient font-mono text-sm font-bold text-background">
            {initial}
          </span>
          <span className="hidden font-mono text-[11px] text-neon-cyan sm:inline">Perfil ▾</span>
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-2 w-[min(16rem,calc(100vw-2rem))] rounded-xl border border-neon-cyan/40 bg-card p-3 shadow-2xl">
            <div className="mb-3 border-b border-border pb-3">
              <div className="font-mono text-[10px] uppercase text-muted-foreground">Conectado como</div>
              <div className="truncate font-mono text-xs text-foreground">{email || "..."}</div>
            </div>
            <div className="mb-3">
              <div className="font-mono text-[10px] uppercase text-muted-foreground">IA principal</div>
              <div className="font-mono text-xs text-neon-cyan">{providerName}</div>
            </div>
            <button
              onClick={() => {
                setOpen(false);
                setSetupOpen(true);
              }}
              className="mb-2 w-full rounded-md border border-border px-3 py-2 text-left font-mono text-xs text-foreground transition hover:border-neon-cyan"
            >
              🔌 Conectar / cambiar IA
            </button>
            <button
              onClick={logout}
              className="w-full rounded-md border border-border px-3 py-2 text-left font-mono text-xs text-muted-foreground transition hover:border-destructive hover:text-destructive"
            >
              🚪 Cerrar sesión
            </button>
          </div>
        )}
      </div>

      <AISetup
        open={setupOpen}
        onClose={() => {
          setSetupOpen(false);
          loadSettings();
        }}
      />
    </>
  );
}
