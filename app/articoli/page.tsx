import type { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { PageIntro } from "@/components/PageIntro";
import { getAllArticles } from "@/lib/articles";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Articoli",
  description:
    "Tutti gli articoli di CD - Cronache d'Impresa su economia, innovazione, management e scenari di mercato.",
};

export default async function ArticoliPage() {
  const articles = await getAllArticles();

  return (
    <>
      <PageIntro
        eyebrow="Archivio"
        title="Articoli e analisi per capire dove sta andando il business"
        description="Una raccolta editoriale completa con approfondimenti su impresa, economia, strategia e innovazione."
      />

      <section className="section-shell pb-14">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>
    </>
  );
}
