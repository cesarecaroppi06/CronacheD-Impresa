import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/articles";
import { formatDate } from "@/lib/format";

type FeaturedArticleProps = {
  article: Article;
};

export function FeaturedArticle({ article }: FeaturedArticleProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative min-h-[280px]">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>
        <div className="flex flex-col justify-center p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Focus della settimana
          </p>
          <h3 className="mt-4 font-serif text-3xl leading-tight text-ink">{article.title}</h3>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{article.excerpt}</p>
          <p className="mt-6 text-xs text-slate-500">
            {article.author} · {formatDate(article.date)} · {article.readingTime} min
          </p>
          <div className="mt-6">
            <Link href={`/articoli/${article.slug}`} className="btn-secondary">
              Approfondisci
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
