import { useRef, useState } from "react";
import { TABS, TOTAL_XP, BUYER_FIELDS } from "@/lib/tabs-config";
import { tabProgress, avatarsProgress, useResearch } from "@/lib/research-store";
import { AchievementsInfo } from "./AchievementsInfo";
import { ExternalReportPanel } from "./ExternalReport";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PptxGenJS from "pptxgenjs";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

export function SummaryPanel({ onJump }: { onJump: (id: any) => void }) {
  const { data, avatars, project } = useResearch();
  const sections = TABS.filter((t) => t.id !== "resumen");
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const buildSections = () =>
    sections.flatMap((t) => {
      if (t.id === "buyer") {
        return avatars.map((a, i) => ({
          title: `Buyer Persona #${i + 1}: ${a.nombre || "Sin nombre"}`,
          icon: t.icon,
          rows: BUYER_FIELDS.map((f) => ({ label: f.label, value: a[f.id] || "—" })),
        }));
      }
      const td = data[t.id] || {};
      return [{
        title: t.label,
        icon: t.icon,
        rows: t.fields.map((f) => ({ label: f.label, value: td[f.id] || "—" })),
      }];
    });

  const projectSlug = (project?.name || "investigacion").toLowerCase().replace(/\s+/g, "-");

  const exportPNG = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, { backgroundColor: "#0a0418", scale: 2 });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `nixoia-${projectSlug}-${Date.now()}.png`;
    a.click();
  };

  const exportPPTX = async () => {
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE";
    // Cover
    const cover = pptx.addSlide();
    cover.background = { color: "0F0A1E" };
    cover.addText("NIXOIA PRO", { x: 0.5, y: 2.6, w: 12.3, h: 1, fontSize: 60, bold: true, color: "FF3CB4", align: "center", fontFace: "Arial" });
    cover.addText("Investigación Estratégica de Mercado", { x: 0.5, y: 3.7, w: 12.3, h: 0.5, fontSize: 22, color: "00E6FF", align: "center" });
    cover.addText(project?.name || "Investigación", { x: 0.5, y: 4.4, w: 12.3, h: 0.6, fontSize: 28, bold: true, color: "FFFFFF", align: "center" });
    cover.addText(new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }), { x: 0.5, y: 5.2, w: 12.3, h: 0.4, fontSize: 14, color: "B4B4C8", align: "center" });

    buildSections().forEach((s) => {
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };
      slide.addText(`${s.icon}  ${s.title}`, { x: 0.5, y: 0.3, w: 12.3, h: 0.7, fontSize: 24, bold: true, color: "7800A0" });
      const rowsPerSlide = 6;
      for (let i = 0; i < s.rows.length; i += rowsPerSlide) {
        const chunk = s.rows.slice(i, i + rowsPerSlide);
        const target = i === 0 ? slide : (() => { const ns = pptx.addSlide(); ns.background = { color: "FFFFFF" }; ns.addText(`${s.icon}  ${s.title} (cont.)`, { x: 0.5, y: 0.3, w: 12.3, h: 0.7, fontSize: 20, bold: true, color: "7800A0" }); return ns; })();
        const text = chunk.map((r) => [
          { text: `${r.label}\n`, options: { bold: true, color: "3C3C50", fontSize: 12 } },
          { text: `${r.value}\n\n`, options: { color: "1E1E28", fontSize: 11 } },
        ]).flat();
        target.addText(text, { x: 0.5, y: 1.2, w: 12.3, h: 5.8, valign: "top" });
      }
    });

    await pptx.writeFile({ fileName: `nixoia-${projectSlug}-${Date.now()}.pptx` });
  };

  const exportDOCX = async () => {
    const children: any[] = [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NIXOIA PRO", bold: true, size: 56, color: "FF3CB4" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Investigación Estratégica de Mercado", size: 28, color: "00B4D8" })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: project?.name || "Investigación", bold: true, size: 32 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: new Date().toLocaleDateString("es-ES"), size: 20, color: "808090" })] }),
      new Paragraph({ children: [new TextRun("")] }),
    ];
    buildSections().forEach((s) => {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: `${s.icon}  ${s.title}`, bold: true, color: "7800A0" })] }));
      s.rows.forEach((r) => {
        children.push(new Paragraph({ children: [new TextRun({ text: r.label, bold: true, size: 22 })] }));
        children.push(new Paragraph({ children: [new TextRun({ text: r.value || "—", size: 22 })] }));
        children.push(new Paragraph({ children: [new TextRun("")] }));
      });
    });
    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nixoia-${projectSlug}-${Date.now()}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const earnedXp = sections.reduce((sum, t) => {
    if (t.id === "buyer") {
      const p = avatarsProgress(avatars, BUYER_FIELDS.length);
      return sum + Math.round((t.xp * p) / 100);
    }
    const p = tabProgress(data[t.id], t.fields.length || 1);
    return sum + Math.round((t.xp * p) / 100);
  }, 0);
  const overall = Math.round((earnedXp / TOTAL_XP) * 100);

  // Gamification: compute badges
  const tabProgresses = sections.map((t) => {
    if (t.id === "buyer") return { id: t.id, pct: avatarsProgress(avatars, BUYER_FIELDS.length) };
    return { id: t.id, pct: tabProgress(data[t.id], t.fields.length || 1) };
  });
  const completedTabs = tabProgresses.filter((t) => t.pct === 100).length;

  const badges = [
    { id: "primer_campo", label: "Primer Campo", icon: "🌱", unlocked: earnedXp > 0, color: "text-neon-lime" },
    { id: "investigador", label: "Investigador", icon: "🔍", unlocked: completedTabs >= 2, color: "text-neon-cyan" },
    { id: "estratega", label: "Estratega", icon: "⚔️", unlocked: completedTabs >= 4, color: "text-neon-yellow" },
    { id: "maestro", label: "Maestro", icon: "🏅", unlocked: completedTabs >= 6, color: "text-neon-pink" },
    { id: "leyenda", label: "Leyenda", icon: "👑", unlocked: overall === 100, color: "text-[var(--neon-purple)]" },
    { id: "avatar", label: "Psicólogo", icon: "🧠", unlocked: avatars.length >= 3, color: "text-neon-cyan" },
    { id: "exportador", label: "Exportador", icon: "📤", unlocked: overall >= 80, color: "text-neon-lime" },
    { id: "speedrun", label: "Speedrun", icon: "⚡", unlocked: completedTabs >= 3 && overall < 100, color: "text-neon-yellow" },
  ];

  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 48;
    let y = margin;

    const ensureSpace = (need: number) => {
      if (y + need > pageH - margin) {
        doc.addPage();
        y = margin;
      }
    };

    // Cover
    doc.setFillColor(15, 10, 30);
    doc.rect(0, 0, pageW, pageH, "F");
    doc.setTextColor(255, 60, 180);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(34);
    doc.text("NIXOIA PRO", pageW / 2, pageH / 2 - 60, { align: "center" });
    doc.setTextColor(0, 230, 255);
    doc.setFontSize(14);
    doc.text("Investigación Estratégica de Mercado", pageW / 2, pageH / 2 - 30, { align: "center" });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(project?.name || "Investigación", pageW / 2, pageH / 2 + 5, { align: "center" });
    doc.setTextColor(180, 180, 200);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(
      new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
      pageW / 2,
      pageH / 2 + 35,
      { align: "center" },
    );
    doc.text(`Progreso: ${overall}%  ·  ${earnedXp} / ${TOTAL_XP} XP`, pageW / 2, pageH / 2 + 55, { align: "center" });

    const writeSection = (title: string, icon: string, rows: { label: string; value: string }[]) => {
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageW, pageH, "F");
      y = margin;
      doc.setTextColor(120, 0, 160);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`${icon}  ${title.toUpperCase()}`, margin, y);
      y += 22;
      rows.forEach((r) => {
        const v = (r.value || "—").trim();
        ensureSpace(40);
        doc.setTextColor(60, 60, 80);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(r.label, margin, y);
        y += 13;
        doc.setTextColor(30, 30, 40);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(v, pageW - margin * 2);
        lines.forEach((line: string) => {
          ensureSpace(13);
          doc.text(line, margin, y);
          y += 12;
        });
        y += 5;
      });
    };

    sections.forEach((t) => {
      if (t.id === "buyer") {
        if (!avatars.length) return;
        avatars.forEach((a, i) => {
          writeSection(
            `Buyer Persona #${i + 1}: ${a.nombre || "Sin nombre"}`,
            t.icon,
            BUYER_FIELDS.map((f) => ({ label: f.label, value: a[f.id] || "" })),
          );
        });
      } else {
        const tabData = data[t.id] || {};
        writeSection(t.label, t.icon, t.fields.map((f) => ({ label: f.label, value: tabData[f.id] || "" })));
      }
    });

    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 170);
      doc.text(`NIXOIA PRO · página ${i} / ${total}`, pageW / 2, pageH - 20, { align: "center" });
    }
    doc.save(`nixoia-${(project?.name || "investigacion").toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ project: project?.name, data, avatars }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nixoia-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="animate-fade-in" ref={dashboardRef}>
      <div className="relative mb-6 overflow-hidden rounded-xl border-neon-yellow bg-card/70 p-6 scanlines text-center">
        <div className="text-5xl">🏆</div>
        <h2 className="text-neon-yellow mt-3 text-xl">DASHBOARD ESTRATÉGICO</h2>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          {project?.name} — {overall}% · {earnedXp} / {TOTAL_XP} XP · {avatars.length} avatares
        </p>
        <div className="mx-auto mt-4 h-3 max-w-md overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-arcade-gradient transition-all duration-700" style={{ width: `${overall}%` }} />
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button onClick={exportPDF} className="rounded-md border-neon-pink bg-card px-4 py-2 font-mono text-xs text-neon-pink transition hover:bg-[var(--neon-pink)] hover:text-background">
            📄 PDF
          </button>
          <button onClick={exportPPTX} className="rounded-md border-neon-yellow bg-card px-4 py-2 font-mono text-xs text-neon-yellow transition hover:bg-[var(--neon-yellow)] hover:text-background">
            📊 PPTX
          </button>
          <button onClick={exportDOCX} className="rounded-md border border-blue-400 bg-card px-4 py-2 font-mono text-xs text-blue-300 transition hover:bg-blue-400 hover:text-background">
            📝 WORD
          </button>
          <button onClick={exportPNG} className="rounded-md border border-purple-400 bg-card px-4 py-2 font-mono text-xs text-purple-300 transition hover:bg-purple-400 hover:text-background">
            🖼️ PNG
          </button>
          <button onClick={exportJSON} className="rounded-md border-neon-lime bg-card px-4 py-2 font-mono text-xs text-neon-lime transition hover:bg-[var(--neon-lime)] hover:text-background">
            💾 JSON
          </button>
        </div>

        {/* Badges / Achievements */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Logros Desbloqueados</span>
            <button
              onClick={() => setInfoOpen(true)}
              className="rounded-full border border-border px-2 py-0.5 font-mono text-[9px] text-neon-cyan transition hover:bg-[var(--neon-cyan)]/10"
            >
              ⓘ ¿Cómo se consiguen?
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-2 transition-all ${
                  b.unlocked
                    ? "border-border bg-card/80 hover:scale-105"
                    : "border-border/30 bg-card/30 opacity-40 grayscale"
                }`}
                title={b.unlocked ? b.label : "Bloqueado"}
              >
                <span className={`text-xl ${b.unlocked ? b.color : ""}`}>{b.icon}</span>
                <span className={`font-mono text-[9px] ${b.unlocked ? b.color : "text-muted-foreground"}`}>{b.label}</span>
                {b.unlocked && <span className="h-1 w-1 rounded-full bg-neon-lime" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ExternalReportPanel />


      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((t) => {
          const pct =
            t.id === "buyer"
              ? avatarsProgress(avatars, BUYER_FIELDS.length)
              : tabProgress(data[t.id], t.fields.length);
          return (
            <button
              key={t.id}
              onClick={() => onJump(t.id)}
              className="rounded-lg border border-border bg-card/60 p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--neon-pink)]"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 font-mono text-sm">
                  <span className="text-2xl">{t.icon}</span>
                  {t.label}
                </span>
                <span className={`font-mono text-xs ${pct === 100 ? "text-neon-lime" : "text-muted-foreground"}`}>
                  {pct}%
                </span>
              </div>
              <div className="mb-3 h-1.5 overflow-hidden rounded bg-secondary">
                <div
                  className={`h-full ${pct === 100 ? "bg-[var(--neon-lime)]" : "bg-[var(--neon-pink)]"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="space-y-1 font-mono text-xs text-muted-foreground">
                {t.id === "buyer" ? (
                  avatars.length ? (
                    avatars.slice(0, 3).map((a, i) => (
                      <div key={i} className="truncate">
                        👤 {a.nombre || `Avatar ${i + 1}`} — {a.ocupacion || "—"}
                      </div>
                    ))
                  ) : (
                    <div className="italic">sin avatares aún</div>
                  )
                ) : (
                  t.fields.slice(0, 2).map((f) => {
                    const v = data[t.id]?.[f.id];
                    return (
                      <div key={f.id} className="truncate">
                        <span className="text-foreground/70">{f.label}:</span>{" "}
                        {v || <span className="italic">sin completar</span>}
                      </div>
                    );
                  })
                )}
              </div>
            </button>
          );
        })}
      </div>
      <AchievementsInfo open={infoOpen} onClose={() => setInfoOpen(false)} />
    </section>
  );
}
