import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Chi siamo",
  description:
    "La redazione di CD - Cronache d'Impresa: missione editoriale, metodo e valori.",
};

export default function ChiSiamoPage() {
  return (
    <>
      <PageIntro
        eyebrow="Redazione"
        title="Una media company dedicata all'evoluzione del mondo impresa"
        description="CD - Cronache d'Impresa nasce per offrire contenuti affidabili, analitici e operativi a chi prende decisioni in azienda."
      />

      <section className="section-shell pb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl">La nostra missione</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Trasformare la complessita di economia, management e innovazione in
              contenuti utili, leggibili e orientati all&apos;azione. Ogni articolo nasce
              da fonti verificate, confronto con esperti e una visione editoriale
              indipendente.
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl">Come lavoriamo</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Il team integra giornalismo economico, analisi dati e competenze
              manageriali. Pubblichiamo approfondimenti, interviste e case study per
              aiutare imprenditori, manager e professionisti a leggere il presente e
              pianificare il futuro.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
