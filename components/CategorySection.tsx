import Link from "next/link";
import type { Article } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";

type CategorySectionProps = {
  title: string;
  description: string;
  articles: Article[];
  href: string;
};

export function CategorySection({
  title,
  description,
  articles,
  href,
}: CategorySectionProps) {
  return (
    <section className="section-shell py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-ink">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">{description}</p>
        </div>
        <Link href={href} className="text-sm font-semibold text-accent hover:text-ink">
          Vedi tutti
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
