import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { maybeAutoSyncLinkedInToSanity } from "@/lib/linkedin";
import { articleBySlugQuery, allArticlesQuery } from "@/lib/sanity.queries";
import { isSanityConfigured, sanityFetch } from "@/lib/sanity";

export type Article = {
  title: string;
  slug: string;
  author: string;
  date: string;
  category: string;
  image: string;
  excerpt: string;
  content: string;
  readingTime: number;
  source: "sanity" | "markdown";
};

type SanityArticle = {
  title?: string;
  slug?: string;
  author?: string;
  date?: string;
  category?: string;
  image?: string;
  excerpt?: string;
  content?: string;
};

const articlesDirectory = path.join(process.cwd(), "content", "articles");
const defaultImage = "/images/hero-governance.svg";

function normalizeDate(value: string | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);

  return parsed.toISOString().slice(0, 10);
}

function getReadingTime(content: string): number {
  const words = content
    .replace(/[\n#>*_`-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(3, Math.ceil(words / 220));
}

function normalizeContent(raw: string | undefined): string {
  if (!raw) return "";
  return raw.trim();
}

function normalizeExcerpt(content: string, fallback: string | undefined): string {
  if (fallback && fallback.trim()) return fallback.trim();

  const compactContent = content.replace(/\s+/g, " ").trim();
  if (!compactContent) return "Approfondimento editoriale da CD - Cronache d'Impresa.";

  return `${compactContent.slice(0, 155)}${compactContent.length > 155 ? "..." : ""}`;
}

function normalizeImage(image: string | undefined): string {
  if (!image || !image.trim()) return defaultImage;
  return image.trim();
}

function mapSanityArticle(article: SanityArticle): Article | null {
  if (!article.slug || !article.title) return null;

  const content = normalizeContent(article.content);

  return {
    title: article.title,
    slug: article.slug,
    author: article.author?.trim() || "Redazione CD",
    date: normalizeDate(article.date),
    category: article.category?.trim() || "Insights",
    image: normalizeImage(article.image),
    excerpt: normalizeExcerpt(content, article.excerpt),
    content,
    readingTime: getReadingTime(content),
    source: "sanity",
  };
}

function parseArticleFile(fileName: string): Article {
  const fullPath = path.join(articlesDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const slug = String(data.slug ?? fileName.replace(/\.md$/, ""));
  const normalizedContent = normalizeContent(content);

  return {
    title: String(data.title),
    slug,
    author: String(data.author),
    date: normalizeDate(String(data.date)),
    category: String(data.category),
    image: normalizeImage(String(data.image)),
    excerpt: normalizeExcerpt(normalizedContent, String(data.excerpt)),
    content: normalizedContent,
    readingTime: getReadingTime(normalizedContent),
    source: "markdown",
  };
}

function getMarkdownArticles(): Article[] {
  if (!fs.existsSync(articlesDirectory)) return [];

  const fileNames = fs
    .readdirSync(articlesDirectory)
    .filter((fileName) => fileName.endsWith(".md"));

  return fileNames
    .map(parseArticleFile)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

async function fetchAllArticlesFromSource(): Promise<Article[]> {
  if (isSanityConfigured()) {
    const sanityArticlesRaw = await sanityFetch<SanityArticle[]>(allArticlesQuery);

    if (sanityArticlesRaw && sanityArticlesRaw.length > 0) {
      return sanityArticlesRaw
        .map(mapSanityArticle)
        .filter((article): article is Article => Boolean(article))
        .sort((a, b) => +new Date(b.date) - +new Date(a.date));
    }
  }

  return getMarkdownArticles();
}

const getAllArticlesCached = cache(fetchAllArticlesFromSource);

export async function getAllArticles(): Promise<Article[]> {
  const autoSyncResult = await maybeAutoSyncLinkedInToSanity();

  if (autoSyncResult.triggered && autoSyncResult.imported && autoSyncResult.imported > 0) {
    // Bypass cache right after a successful import, so the current request sees fresh content.
    return fetchAllArticlesFromSource();
  }

  return getAllArticlesCached();
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (isSanityConfigured()) {
    const sanityArticleRaw = await sanityFetch<SanityArticle>(articleBySlugQuery, { slug });

    if (sanityArticleRaw) {
      const article = mapSanityArticle(sanityArticleRaw);
      if (article) return article;
    }
  }

  const directFile = path.join(articlesDirectory, `${slug}.md`);

  if (fs.existsSync(directFile)) {
    return parseArticleFile(`${slug}.md`);
  }

  const article = getMarkdownArticles().find((item) => item.slug === slug);
  return article ?? null;
}

export async function getArticlesByCategory(category: string): Promise<Article[]> {
  const allArticles = await getAllArticles();

  return allArticles.filter((article) =>
    article.category.toLowerCase().includes(category.toLowerCase()),
  );
}

export async function getRelatedArticles(
  slug: string,
  category: string,
  limit = 3,
): Promise<Article[]> {
  const allArticles = await getAllArticles();

  return allArticles
    .filter((article) => article.slug !== slug && article.category === category)
    .slice(0, limit);
}
