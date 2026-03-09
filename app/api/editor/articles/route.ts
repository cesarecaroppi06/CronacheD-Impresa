import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { editorialCategories, normalizeArticleDate, slugify } from "@/lib/editor";
import { isEditorAuthorized } from "@/lib/editor-auth";
import { getSanityWriteClient, isSanityConfigured, isSanityWriteConfigured, sanityFetch } from "@/lib/sanity";

type ArticlePayload = {
  title?: string;
  slug?: string;
  author?: string;
  date?: string;
  category?: string;
  excerpt?: string;
  imageUrl?: string;
  content?: string;
};

type EditableArticleListItem = {
  slug: string;
  title: string;
  author?: string;
  category?: string;
  date?: string;
};

type ArticleDocument = {
  _id: string;
  _type: "article";
  title: string;
  slug: {
    _type: "slug";
    current: string;
  };
  author: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
};

const editableArticlesQuery = `*[_type == "article" && defined(slug.current)] | order(date desc) {
  "slug": slug.current,
  title,
  author,
  category,
  date
}`;

function validatePayload(payload: ArticlePayload): string | null {
  if (!payload.title?.trim()) return "Titolo obbligatorio";
  if (!payload.content?.trim()) return "Contenuto obbligatorio";

  if (payload.category && !editorialCategories.includes(payload.category as (typeof editorialCategories)[number])) {
    return "Categoria non valida";
  }

  return null;
}

function buildArticleDocument(payload: ArticlePayload, forcedSlug?: string): ArticleDocument {
  const title = payload.title!.trim();
  const articleSlug = forcedSlug || slugify(payload.slug?.trim() || title);
  const category = payload.category?.trim() || "Insights";
  const content = payload.content!.trim();
  const excerpt = payload.excerpt?.trim() || content.slice(0, 180);

  const doc: ArticleDocument = {
    _id: `article.${articleSlug}`,
    _type: "article",
    title,
    slug: {
      _type: "slug",
      current: articleSlug,
    },
    author: payload.author?.trim() || "Redazione CD",
    date: normalizeArticleDate(payload.date),
    category,
    excerpt,
    content,
  };

  if (payload.imageUrl?.trim()) {
    doc.imageUrl = payload.imageUrl.trim();
  }

  return doc;
}

function revalidateEditorialPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/articoli");
  revalidatePath("/interviste");
  revalidatePath("/imprese");
  revalidatePath("/insights");
  revalidatePath(`/articoli/${slug}`);
}

export async function GET(request: NextRequest) {
  if (!isEditorAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!isSanityConfigured) {
    return NextResponse.json({ ok: true, articles: [] });
  }

  const articles = await sanityFetch<EditableArticleListItem[]>(editableArticlesQuery);
  return NextResponse.json({ ok: true, articles: articles || [] });
}

export async function POST(request: NextRequest) {
  if (!isEditorAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!isSanityWriteConfigured) {
    return NextResponse.json(
      {
        ok: false,
        message: "Sanity write non configurato. Imposta SANITY_API_WRITE_TOKEN.",
      },
      { status: 500 },
    );
  }

  const payload = (await request.json().catch(() => ({}))) as ArticlePayload;
  const validationError = validatePayload(payload);

  if (validationError) {
    return NextResponse.json({ ok: false, message: validationError }, { status: 400 });
  }

  const articleSlug = slugify(payload.slug?.trim() || payload.title!.trim());

  if (!articleSlug) {
    return NextResponse.json({ ok: false, message: "Slug non valido" }, { status: 400 });
  }

  const client = getSanityWriteClient();

  if (!client) {
    return NextResponse.json({ ok: false, message: "Client Sanity non disponibile" }, { status: 500 });
  }

  const doc = buildArticleDocument(payload, articleSlug);

  try {
    await client.createOrReplace(doc);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore Sanity";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }

  revalidateEditorialPaths(articleSlug);

  return NextResponse.json({
    ok: true,
    slug: articleSlug,
    path: `/articoli/${articleSlug}`,
    publishedAt: new Date().toISOString(),
  });
}
