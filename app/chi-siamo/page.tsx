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

      <section className="section-shell pb-16">
        <div className="mb-8">
          <h2 className="font-serif text-3xl">La redazione</h2>
          <p className="mt-2 text-sm text-slate-600">
            Profili professionali e contatti dei co-founder di CD - Cronache d&apos;Impresa.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <header className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Co-founder</p>
              <h3 className="font-serif text-2xl">Cesare Caroppi</h3>
              <p className="text-sm text-slate-600">
                Studente presso Sapienza Universit&agrave; di Roma, Co-founder di CD CRONACHE D&apos;IMPRESA
              </p>
              <p className="text-sm text-slate-500">Roma, Lazio, Italia</p>
            </header>

            <div className="mt-6 grid gap-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-700">Email:</span> cesarecaroppi06@gmail.com
              </p>
              <p>
                <span className="font-medium text-slate-700">LinkedIn:</span>{" "}
                <a
                  href="https://www.linkedin.com/in/cesare-caroppi-69a272385/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-accent hover:underline"
                >
                  linkedin.com/in/cesare-caroppi-69a272385
                </a>
              </p>
            </div>

            <div className="mt-6">
              <h4 className="font-serif text-lg">Esperienza</h4>
              <ul className="mt-3 grid gap-4 text-sm text-slate-600">
                <li>
                  <p className="font-medium text-slate-700">CD cronache d&apos;impresa &middot; Amministratore</p>
                  <p>marzo 2026 - Present (1 mese) &middot; Roma</p>
                </li>
                <li>
                  <p className="font-medium text-slate-700">Master Studio &middot; Exchange student</p>
                  <p>gennaio 2024 - giugno 2024 (6 mesi) &middot; Irlanda</p>
                  <p className="mt-2">
                    International exchange experience that strengthened my adaptability, communication skills,
                    and ability to work in multicultural environments while improving my English.
                  </p>
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <h4 className="font-serif text-lg">Formazione</h4>
              <ul className="mt-3 grid gap-3 text-sm text-slate-600">
                <li>
                  <p className="font-medium text-slate-700">Sapienza Universit&agrave; di Roma</p>
                </li>
                <li>
                  <p className="font-medium text-slate-700">Liceo scientifico Temistocle Calzecchi Onesti</p>
                  <p>Diploma</p>
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <h4 className="font-serif text-lg">Competenze principali</h4>
              <ul className="mt-3 grid gap-2 text-sm text-slate-600">
                <li>Start-up</li>
                <li>Assicurazioni</li>
                <li>Amministrazione</li>
              </ul>
            </div>

            <div className="mt-6">
              <h4 className="font-serif text-lg">Certificazioni</h4>
              <ul className="mt-3 grid gap-2 text-sm text-slate-600">
                <li>J.P. Morgan Investment Banking Job Simulation</li>
              </ul>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <header className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Co-founder</p>
              <h3 className="font-serif text-2xl">Giulio D&apos;Aprile</h3>
              <p className="text-sm text-slate-600">
                Junior Business Development Consultant presso JESAP Consulting | BSc in &quot;Scienze Aziendali&quot;,
                Sapienza Universit&agrave; di Roma | FITP Istruttore di Tennis e Pickleball | Writer and Co-founder
                CD - Cronache D&apos;Impresa
              </p>
              <p className="text-sm text-slate-500">Roma, Lazio, Italia</p>
            </header>

            <div className="mt-6 grid gap-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-700">Email:</span> giulio.daprile@icloud.com
              </p>
              <p>
                <span className="font-medium text-slate-700">LinkedIn:</span>{" "}
                <a
                  href="https://www.linkedin.com/in/giulio-d-aprile-54389038a/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-accent hover:underline"
                >
                  linkedin.com/in/giulio-d-aprile-54389038a
                </a>
              </p>
            </div>

            <div className="mt-6">
              <h4 className="font-serif text-lg">Esperienza</h4>
              <ul className="mt-3 grid gap-4 text-sm text-slate-600">
                <li>
                  <p className="font-medium text-slate-700">JESAP Consulting &middot; Junior BD consultant</p>
                  <p>dicembre 2025 - Present (4 mesi) &middot; Rome, Latium, Italie</p>
                </li>
                <li>
                  <p className="font-medium text-slate-700">
                    Federazione Italiana Tennis e Padel &middot; Istruttore di tennis
                  </p>
                  <p>settembre 2024 - Present (1 anno 7 mesi) &middot; Fermo, Marche, Italia</p>
                  <p className="mt-2">
                    A settembre 2024 ho conseguito l&apos;abilitazione da Istruttore di tennis di 1&deg; grado.
                    Sin da subito ho avuto la possibilit&agrave; di collaborare con l&apos;ASD tennis Sporting Club di
                    Lido di Fermo, dopo aver partecipato all&apos;organizzazione di una Scuola Tennis in
                    Bretagna, dove ho vissuto per 6 mesi. L&igrave; ho anche appreso ad insegnare in francese,
                    dunque ho deciso di proseguire e qualificarmi come Istruttore di tennis una volta tornato
                    in Italia. Attualmente sono a Roma e cerco di integrare al meglio la mia passione per il
                    tennis con lo studio in facolt&agrave;.
                  </p>
                </li>
                <li>
                  <p className="font-medium text-slate-700">
                    Federazione Italiana Tennis e Padel &middot; Giocatore di tennis
                  </p>
                  <p>febbraio 2025 - giugno 2025 (5 mesi) &middot; Lido di Fermo</p>
                  <p className="mt-2">
                    Durante la stagione FITP del 2025 ho avuto la possibilit&agrave; di essere parte integrante
                    della squadra di Serie C del mio tennis club. Nel corso di questa esperienza ho
                    incontrato giocatori classificati nel ranking ATP... grazie all&apos;unione della squadra
                    siamo riusciti a portare a termine il campionato, costruendo solidi rapporti con i
                    compagni e gli allenatori. Ho anche ottenuto la mia miglior classifica, raggiungendo la
                    2&ordf; categoria.
                  </p>
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <h4 className="font-serif text-lg">Formazione</h4>
              <ul className="mt-3 grid gap-3 text-sm text-slate-600">
                <li>
                  <p className="font-medium text-slate-700">
                    Sapienza Universit&agrave; di Roma &middot; Laurea triennale, Scienze aziendali, gestione
                    d&apos;impresa
                  </p>
                  <p>settembre 2025 - giugno 2028</p>
                </li>
                <li>
                  <p className="font-medium text-slate-700">
                    Liceo Scientifico - Linguistico T.C.Onesti &middot; High School Diploma
                  </p>
                  <p>settembre 2020 - luglio 2025</p>
                </li>
                <li>
                  <p className="font-medium text-slate-700">
                    Lyc&eacute;e Ren&eacute; Cassin &middot; Scuola Superiore, Studi francesi
                  </p>
                  <p>settembre 2023 - febbraio 2024</p>
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <h4 className="font-serif text-lg">Competenze principali</h4>
              <ul className="mt-3 grid gap-2 text-sm text-slate-600">
                <li>Consulenza strategica</li>
                <li>Economia</li>
                <li>Competenze analitiche</li>
              </ul>
            </div>

            <div className="mt-6">
              <h4 className="font-serif text-lg">Lingue</h4>
              <ul className="mt-3 grid gap-2 text-sm text-slate-600">
                <li>Inglese (Full Professional)</li>
                <li>Spagnolo (Professional Working)</li>
                <li>Francese</li>
                <li>Italiano (Native or Bilingual)</li>
              </ul>
            </div>

            <div className="mt-6">
              <h4 className="font-serif text-lg">Certificazioni</h4>
              <ul className="mt-3 grid gap-2 text-sm text-slate-600">
                <li>J.P. Morgan Investment Banking Job Simulation</li>
              </ul>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
