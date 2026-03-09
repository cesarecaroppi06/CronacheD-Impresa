import { ArticleCard } from "@/components/ArticleCard";
import { CategorySection } from "@/components/CategorySection";
import { FeaturedArticle } from "@/components/FeaturedArticle";
import { HeroSection } from "@/components/HeroSection";
import { NewsletterSection } from "@/components/NewsletterSection";
import { getAllArticles, getArticlesByCategory } from "@/lib/articles";

export const revalidate = 120;

export default async function HomePage() {
  const articles = await getAllArticles();
  const [heroArticle, focusArticle, ...latestArticles] = articles;
  const interviews = (await getArticlesByCategory("interviste")).slice(0, 3);
  const companies = (await getArticlesByCategory("imprese")).slice(0, 3);

  if (!heroArticle) {
    return (
      <section className="section-shell py-16">
        <h1 className="font-serif text-4xl">Nessun articolo disponibile</h1>
      </section>
    );
  }

  return (
    <>
      <HeroSection article={heroArticle} />

      {focusArticle ? (
        <section className="section-shell py-12">
          <FeaturedArticle article={focusArticle} />
        </section>
      ) : null}

      <section className="section-shell py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl text-ink">Ultimi articoli</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Analisi e prospettive aggiornate dal mondo impresa, economia e
              management.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestArticles.slice(0, 6).map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      <CategorySection
        title="Interviste"
        description="Conversazioni con CEO, founder e manager che guidano la trasformazione delle imprese italiane."
        articles={interviews}
        href="/interviste"
      />

      <CategorySection
        title="Storie di imprese"
        description="Case history, percorsi di crescita e strategie concrete raccontate dai protagonisti del mercato."
        articles={companies}
        href="/imprese"
      />

      <NewsletterSection />
    </>
  );
}
