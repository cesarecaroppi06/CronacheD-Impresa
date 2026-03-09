type PageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="section-shell py-12 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
      <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-tight text-ink sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600">{description}</p>
    </section>
  );
}
