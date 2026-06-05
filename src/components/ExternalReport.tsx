import { useRef, useState } from "react";
import { useResearch, type ExternalReport } from "@/lib/research-store";

const MAX_FILE_MB = 4;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

function isDriveLink(url: string) {
  return /^https?:\/\/.+/i.test(url.trim());
}

export function ExternalReportPanel() {
  const { report, setReport } = useResearch();
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    const okType = /pdf|word|document|officedocument|msword/i.test(file.type) || /\.(pdf|docx?|odt)$/i.test(file.name);
    if (!okType) {
      setError("Sube un archivo PDF o Word (.pdf, .doc, .docx)");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`El archivo supera ${MAX_FILE_MB} MB. Súbelo a Drive y pega el enlace.`);
      return;
    }
    setBusy(true);
    try {
      const data = await fileToBase64(file);
      const rep: ExternalReport = {
        kind: "file",
        name: file.name,
        mime: file.type || "application/octet-stream",
        data,
        addedAt: Date.now(),
      };
      setReport(rep);
    } catch (e: any) {
      setError(e.message || "Error al subir el archivo");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const saveLink = () => {
    setError(null);
    if (!isDriveLink(link)) {
      setError("Pega un enlace válido (https://...)");
      return;
    }
    setReport({ kind: "link", name: link.trim(), url: link.trim(), addedAt: Date.now() });
    setLink("");
  };

  const openReport = () => {
    if (!report) return;
    if (report.kind === "link" && report.url) {
      window.open(report.url, "_blank", "noopener");
    } else if (report.data) {
      const a = document.createElement("a");
      a.href = report.data;
      a.download = report.name || "informe";
      a.click();
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-blue-400/50 bg-card/60 p-4 text-left">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xl">📎</span>
        <h3 className="font-mono text-xs text-blue-300">INFORME EXTERNO (otra IA)</h3>
      </div>
      <p className="mb-3 font-mono text-[11px] text-muted-foreground">
        ¿Generaste un informe con otra IA? Adjunta el PDF/Word o pega un enlace de Google Drive y quedará
        disponible aquí en el Dashboard Final.
      </p>

      {report ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3">
          <span className="text-lg">{report.kind === "link" ? "🔗" : report.mime?.includes("pdf") ? "📄" : "📝"}</span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-mono text-xs text-foreground">{report.name}</div>
            <div className="font-mono text-[10px] text-muted-foreground">
              {report.kind === "link" ? "Enlace externo" : "Archivo adjunto"}
            </div>
          </div>
          <button
            onClick={openReport}
            className="rounded-md bg-arcade-gradient px-3 py-1.5 font-mono text-[10px] font-bold text-background transition hover:opacity-90"
          >
            {report.kind === "link" ? "Abrir" : "Descargar"}
          </button>
          <button
            onClick={() => setReport(null)}
            className="rounded-md border border-border px-3 py-1.5 font-mono text-[10px] text-muted-foreground transition hover:border-destructive hover:text-destructive"
          >
            Quitar
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.odt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="w-full rounded-md border border-dashed border-blue-400/60 px-4 py-3 font-mono text-xs text-blue-300 transition hover:bg-blue-400/10 disabled:opacity-50"
          >
            {busy ? "Procesando..." : `📄 Subir PDF o Word (máx ${MAX_FILE_MB} MB)`}
          </button>
          <div className="flex gap-2">
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="…o pega un enlace de Google Drive"
              className="flex-1 rounded-md border border-border bg-input/40 px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-blue-400"
            />
            <button
              onClick={saveLink}
              className="rounded-md bg-arcade-gradient px-4 py-2 font-mono text-xs font-bold text-background transition hover:opacity-90"
            >
              Guardar
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-2 font-mono text-xs text-destructive">⚠ {error}</p>}
    </div>
  );
}
