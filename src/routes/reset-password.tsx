import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Restablecer contraseña · NIXOIA PRO" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // El enlace de recuperación crea una sesión de tipo recovery
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("La contraseña debe tener al menos 6 caracteres");
    if (password !== confirm) return toast.error("Las contraseñas no coinciden");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Contraseña actualizada. ¡Listo!");
      navigate({ to: "/", replace: true });
    } catch (err: any) {
      toast.error(err?.message || "No se pudo actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-xl text-neon-pink animate-flicker">
          NIXOIA<span className="text-neon-cyan"> PRO</span>
        </h1>
        <div className="rounded-xl border border-neon-pink bg-card/70 p-6 scanlines">
          <h2 className="mb-1 text-sm text-foreground">🔐 Nueva contraseña</h2>
          <p className="mb-4 font-mono text-xs text-muted-foreground">
            Escribe tu nueva contraseña para tu cuenta.
          </p>
          {!ready ? (
            <p className="font-mono text-xs text-neon-cyan animate-flicker">Validando enlace de recuperación...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
                className="w-full rounded-md border border-border bg-input/40 px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-[var(--neon-cyan)]"
              />
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirmar contraseña"
                className="w-full rounded-md border border-border bg-input/40 px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-[var(--neon-cyan)]"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-arcade-gradient px-4 py-2.5 font-mono text-sm font-bold text-background transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "GUARDANDO..." : "GUARDAR CONTRASEÑA"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
