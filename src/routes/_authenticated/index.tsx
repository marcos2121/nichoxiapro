import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArcadeShell } from "@/components/ArcadeShell";
import { TabPanel } from "@/components/TabPanel";
import { SummaryPanel } from "@/components/SummaryPanel";
import { AIAutofill } from "@/components/AIAutofill";
import { ProductPhotos } from "@/components/ProductPhotos";
import { BuyerPersonaPanel } from "@/components/BuyerPersonaPanel";
import { TABS } from "@/lib/tabs-config";
import type { TabId } from "@/lib/research-store";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "NIXOIA PRO — Sistema de investigación estratégica con IA" },
      {
        name: "description",
        content:
          "NIXOIA PRO: 7 módulos profundos + buyer personas múltiples + Dashboard estratégico. Tu estratega de mercado con IA.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [active, setActive] = useState<TabId>("producto");
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <ArcadeShell active={active} onChange={setActive}>
      <AIAutofill />
      <ProductPhotos />
      {active === "resumen" ? (
        <SummaryPanel onJump={setActive} />
      ) : active === "buyer" ? (
        <BuyerPersonaPanel />
      ) : (
        <TabPanel key={tab.id} tab={tab} />
      )}
    </ArcadeShell>
  );
}
