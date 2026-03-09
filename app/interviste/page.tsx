import type { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { PageIntro } from "@/components/PageIntro";
import { getArticlesByCategory } from "@/lib/articles";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Interviste",
  description:
    "Interviste esclusive con imprenditori, dirigenti e protagonisti dell'innovazione.",
};

export default async function IntervistePage() {
  const interviews = await getArticlesByCategory("interviste");

  return (
    <>
      <PageIntro
        eyebrow="Interviste"
        title="Le voci che stanno guidando il cambiamento"
        description="Dialoghi con leader e professionisti che raccontano sfide, decisioni e visioni per la crescita aziendale."
      />

      <section className="section-shell pb-14">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {interviews.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>
    </>
  );
}
