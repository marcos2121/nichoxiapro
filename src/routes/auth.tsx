import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso · NIXOIA PRO" },
      { name: "description", content: "Inicia sesión o regístrate en NIXOIA PRO, tu estratega de mercado con IA." },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "register" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión, entra directo
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("¡Cuenta creada! Entrando...");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("¡Bienvenido de vuelta!");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Te enviamos un enlace para restablecer tu contraseña.");
        setMode("login");
      }
    } catch (err: any) {
      toast.error(err?.message || "Algo salió mal");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: "/", replace: true });
    } catch (err: any) {
      toast.error(err?.message || "No se pudo iniciar con Google");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-block rounded-2xl border border-border bg-card/60 px-6 py-4 backdrop-blur">
            <h1 className="text-2xl text-neon-pink animate-flicker md:text-3xl">
              NIXOIA<span className="text-neon-cyan"> PRO</span>
            </h1>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            Tu estratega de mercado, marketing y contenido impulsado por IA
          </p>
        </div>

        <div className="rounded-xl border border-neon-pink bg-card/70 p-6 scanlines">
          <div className="mb-5 flex gap-2 font-mono text-xs">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-md py-2 transition ${mode === "login" ? "bg-arcade-gradient font-bold text-background" : "border border-border text-muted-foreground hover:text-foreground"}`}
            >
              INICIAR SESIÓN
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 rounded-md py-2 transition ${mode === "register" ? "bg-arcade-gradient font-bold text-background" : "border border-border text-muted-foreground hover:text-foreground"}`}
            >
              CREAR CUENTA
            </button>
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-md border border-border bg-input/40 px-3 py-2 font-mono text-sm text-foreground outline-none transition focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/30"
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-border bg-input/40 px-3 py-2 font-mono text-sm text-foreground outline-none transition focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/30"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-arcade-gradient px-4 py-2.5 font-mono text-sm font-bold text-background transition hover:opacity-90 disabled:opacity-50"
            >
              {loading
                ? "PROCESANDO..."
                : mode === "register"
                  ? "⚡ CREAR CUENTA"
                  : mode === "forgot"
                    ? "ENVIAR ENLACE"
                    : "⚡ ENTRAR"}
            </button>
          </form>

          {mode === "login" && (
            <button
              onClick={() => setMode("forgot")}
              className="mt-3 w-full text-center font-mono text-[11px] text-muted-foreground underline-offset-2 hover:text-neon-cyan hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
          {mode === "forgot" && (
            <button
              onClick={() => setMode("login")}
              className="mt-3 w-full text-center font-mono text-[11px] text-muted-foreground hover:text-foreground"
            >
              ← Volver a iniciar sesión
            </button>
          )}

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] text-muted-foreground">O</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card/60 px-4 py-2.5 font-mono text-sm text-foreground transition hover:border-neon-cyan disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </button>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] text-muted-foreground">
          Al continuar aceptas usar NIXOIA PRO de forma responsable.
        </p>
      </div>
    </div>
  );
}
