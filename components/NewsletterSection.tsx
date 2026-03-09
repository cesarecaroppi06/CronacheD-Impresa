export function NewsletterSection() {
  return (
    <section className="section-shell py-12">
      <div className="rounded-2xl border border-slate-200 bg-white px-8 py-12 shadow-soft sm:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Newsletter
        </p>
        <h2 className="mt-4 max-w-2xl font-serif text-3xl leading-tight text-ink">
          Ricevi ogni settimana analisi su economia, innovazione e leadership.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">
          Una selezione editoriale curata dalla redazione di CD - Cronache d&apos;Impresa,
          pensata per decision maker e professionisti.
        </p>

        <form className="mt-8 flex flex-col gap-4 sm:flex-row" action="#" method="post">
          <label htmlFor="newsletter-email" className="sr-only">
            Email
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            placeholder="Inserisci la tua email"
            className="h-12 w-full rounded-md border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-accent"
          />
          <button type="submit" className="btn-primary h-12 justify-center px-8">
            Iscriviti
          </button>
        </form>
      </div>
    </section>
  );
}
