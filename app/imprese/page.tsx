import type { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { PageIntro } from "@/components/PageIntro";
import { getArticlesByCategory } from "@/lib/articles";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Imprese",
  description:
    "Storie di imprese italiane e internazionali tra crescita, trasformazione e leadership.",
};

export default async function ImpresePage() {
  const companies = await getArticlesByCategory("imprese");

  return (
    <>
      <PageIntro
        eyebrow="Imprese"
        title="Case study e storie di crescita dal sistema produttivo"
        description="Esperienze concrete da aziende che innovano processi, cultura e modelli operativi."
      />

      <section className="section-shell pb-14">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>
    </>
  );
}
