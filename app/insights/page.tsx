import type { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { PageIntro } from "@/components/PageIntro";
import { getArticlesByCategory } from "@/lib/articles";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Insights di scenario e letture strategiche su trend economici, tecnologici e manageriali.",
};

export default async function InsightsPage() {
  const insights = await getArticlesByCategory("insights");

  return (
    <>
      <PageIntro
        eyebrow="Insights"
        title="Interpretare i trend per prendere decisioni migliori"
        description="Dati, osservazioni e prospettive per comprendere i cambiamenti che influenzano mercati e organizzazioni."
      />

      <section className="section-shell pb-14">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>
    </>
  );
}
