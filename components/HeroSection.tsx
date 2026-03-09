import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/articles";
import { formatDate } from "@/lib/format";

type HeroSectionProps = {
  article: Article;
};

export function HeroSection({ article }: HeroSectionProps) {
  return (
    <section className="section-shell pt-12">
      <div className="grid gap-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft lg:grid-cols-2">
        <div className="relative min-h-[320px] lg:min-h-[480px]">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col justify-center px-8 py-10 sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Articolo in evidenza
          </p>
          <h1 className="mt-4 font-serif text-3xl leading-tight text-ink sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-600">{article.excerpt}</p>
          <p className="mt-6 text-sm text-slate-500">
            {article.author} · {formatDate(article.date)} · {article.readingTime} min lettura
          </p>
          <div className="mt-8">
            <Link href={`/articoli/${article.slug}`} className="btn-primary">
              Leggi articolo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
