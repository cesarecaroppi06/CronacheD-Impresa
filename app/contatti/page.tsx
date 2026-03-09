import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contatti",
  description:
    "Contatta la redazione di CD - Cronache d'Impresa per collaborazioni, media partnership e proposte editoriali.",
};

export default function ContattiPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contatti"
        title="Parliamo della tua prossima storia"
        description="Siamo disponibili per richieste stampa, partnership editoriali e collaborazioni di contenuto."
      />

      <section className="section-shell pb-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <aside className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="font-serif text-2xl">Info redazione</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Email: {siteConfig.email}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Sede editoriale: Milano, Italia
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Orari: Lun - Ven, 9:00 - 18:30
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              LinkedIn:{" "}
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-accent hover:underline"
              >
                Pagina aziendale CD - Cronache d&apos;Impresa
              </a>
            </p>
          </aside>

          <form className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm" action="#" method="post">
            <h2 className="font-serif text-2xl">Invia un messaggio</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-600">
                Nome
                <input
                  type="text"
                  required
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-accent"
                />
              </label>
              <label className="text-sm text-slate-600">
                Cognome
                <input
                  type="text"
                  required
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-accent"
                />
              </label>
              <label className="text-sm text-slate-600 sm:col-span-2">
                Email
                <input
                  type="email"
                  required
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-accent"
                />
              </label>
              <label className="text-sm text-slate-600 sm:col-span-2">
                Messaggio
                <textarea
                  rows={6}
                  required
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-sm text-slate-700 outline-none focus:border-accent"
                />
              </label>
            </div>
            <button type="submit" className="btn-primary mt-6">
              Invia richiesta
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
