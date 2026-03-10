import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { getAllArticles, getArticleBySlug, getRelatedArticles } from "@/lib/articles";
import { formatDate } from "@/lib/format";
import { markdownToHtml } from "@/lib/markdown";
import { siteConfig, toAbsoluteUrl } from "@/lib/site";

type ArticlePageProps = {
  params: {
    slug: string;
  };
};

export const revalidate = 120;

export async function generateStaticParams() {
  const articles = await getAllArticles();

  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "Articolo non trovato",
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      images: [{ url: toAbsoluteUrl(article.image), width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [toAbsoluteUrl(article.image)],
    },
    alternates: {
      canonical: `/articoli/${article.slug}`,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlug(params.slug);

  if (!article) notFound();

  const htmlContent = await markdownToHtml(article.content);
  const relatedArticles = await getRelatedArticles(article.slug, article.category, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: toAbsoluteUrl(article.image),
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: toAbsoluteUrl(siteConfig.brandLogoPath),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/articoli/${article.slug}`,
    },
  };

  return (
    <>
      <section className="section-shell py-10">
        <div className="mx-auto max-w-reading">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {article.category}
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-ink sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-5 text-sm text-slate-500">
            {article.author} · {formatDate(article.date)} · {article.readingTime} min lettura
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          <div className="relative h-[240px] sm:h-[360px] lg:h-[500px]">
            <Image
              src={article.image}
              alt={article.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1100px"
            />
          </div>
        </div>

        <article
          className="article-prose mx-auto mt-12"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </section>

      {relatedArticles.length > 0 ? (
        <section className="section-shell pb-14">
          <h2 className="font-serif text-3xl text-ink">Articoli correlati</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((relatedArticle) => (
              <ArticleCard key={relatedArticle.slug} article={relatedArticle} />
            ))}
          </div>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
    </>
  );
}
