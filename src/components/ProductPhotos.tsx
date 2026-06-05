import { useRef, useState } from "react";
import { useResearch, MAX_PHOTOS } from "@/lib/research-store";

// Redimensiona y comprime una imagen a base64 para que quepa en el navegador
function compressImage(file: File, maxSize = 1000, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No se pudo procesar la imagen"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Imagen inválida"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

export function ProductPhotos() {
  const { photos, addPhotos, removePhoto } = useResearch();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX_PHOTOS - photos.length;

  const onFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setError(null);
    if (remaining <= 0) {
      setError(`Máximo ${MAX_PHOTOS} fotos por investigación`);
      return;
    }
    setBusy(true);
    try {
      const toAdd = Array.from(files).slice(0, remaining);
      const encoded: string[] = [];
      for (const f of toAdd) {
        if (!f.type.startsWith("image/")) continue;
        encoded.push(await compressImage(f));
      }
      if (encoded.length) addPhotos(encoded);
      if (files.length > remaining) {
        setError(`Solo se agregaron ${remaining}: alcanzaste el límite de ${MAX_PHOTOS}`);
      }
    } catch (e: any) {
      setError(e.message || "Error al subir las fotos");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="mb-6 rounded-xl border-neon-cyan bg-card/70 p-4 sm:p-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="text-2xl">📸</span>
          <span className="text-neon-cyan text-xs sm:text-sm">FOTOS REALES DEL PRODUCTO / SERVICIO</span>
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {photos.length}/{MAX_PHOTOS} {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="mt-4">
          <p className="mb-3 font-mono text-xs text-muted-foreground">
            Sube hasta {MAX_PHOTOS} fotos reales de tu producto, servicio o local. Se guardan en este
            navegador junto a tu investigación.
          </p>

          {photos.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {photos.map((src, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                  <img src={src} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-xs text-destructive opacity-0 transition group-hover:opacity-100"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy || remaining <= 0}
            className="w-full rounded-md border border-dashed border-neon-cyan/60 px-4 py-3 font-mono text-xs text-neon-cyan transition hover:bg-[var(--neon-cyan)]/10 disabled:opacity-50"
          >
            {busy
              ? "Procesando..."
              : remaining <= 0
                ? `Límite de ${MAX_PHOTOS} fotos alcanzado`
                : `➕ Agregar fotos (${remaining} disponibles)`}
          </button>
          {error && <p className="mt-2 font-mono text-xs text-destructive">⚠ {error}</p>}
        </div>
      )}
    </div>
  );
}
