import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { editorialCategories, normalizeArticleDate, slugify } from "@/lib/editor";
import { isEditorAuthorized } from "@/lib/editor-auth";
import { getSanityWriteClient, isSanityConfigured, isSanityWriteConfigured, sanityFetch } from "@/lib/sanity";

type RouteParams = {
  params: {
    slug: string;
  };
};

type ArticlePayload = {
  title?: string;
  author?: string;
  date?: string;
  category?: string;
  excerpt?: string;
  imageUrl?: string;
  content?: string;
};

type EditableArticle = {
  _id: string;
  slug: string;
  title: string;
  author?: string;
  date?: string;
  category?: string;
  excerpt?: string;
  imageUrl?: string;
  content?: string;
};

const editableArticleQuery = `*[_type == "article" && slug.current == $slug][0]{
  _id,
  "slug": slug.current,
  title,
  author,
  date,
  category,
  excerpt,
  imageUrl,
  content
}`;
const MAX_EDITOR_BODY_BYTES = 2 * 1024 * 1024;

function validatePayload(payload: ArticlePayload): string | null {
  if (!payload.title?.trim()) return "Titolo obbligatorio";
  if (!payload.content?.trim()) return "Contenuto obbligatorio";

  if (payload.category && !editorialCategories.includes(payload.category as (typeof editorialCategories)[number])) {
    return "Categoria non valida";
  }

  return null;
}

function revalidateEditorialPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/articoli");
  revalidatePath("/interviste");
  revalidatePath("/imprese");
  revalidatePath("/insights");
  revalidatePath(`/articoli/${slug}`);
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  if (!isEditorAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!isSanityConfigured()) {
    return NextResponse.json({ ok: false, message: "Sanity non configurato" }, { status: 500 });
  }

  const slug = slugify(params.slug || "");
  if (!slug) {
    return NextResponse.json({ ok: false, message: "Slug non valido" }, { status: 400 });
  }

  const article = await sanityFetch<EditableArticle>(editableArticleQuery, { slug });

  if (!article) {
    return NextResponse.json({ ok: false, message: "Articolo non trovato" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, article });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  if (!isEditorAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!isSanityWriteConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message: "Sanity write non configurato. Imposta SANITY_API_WRITE_TOKEN.",
      },
      { status: 500 },
    );
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const bytes = Number.parseInt(contentLength, 10);
    if (Number.isFinite(bytes) && bytes > MAX_EDITOR_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, message: "Contenuto troppo grande (max 2 MB)." },
        { status: 413 },
      );
    }
  }

  const slug = slugify(params.slug || "");
  if (!slug) {
    return NextResponse.json({ ok: false, message: "Slug non valido" }, { status: 400 });
  }

  const payload = (await request.json().catch(() => ({}))) as ArticlePayload;
  const validationError = validatePayload(payload);
  if (validationError) {
    return NextResponse.json({ ok: false, message: validationError }, { status: 400 });
  }

  const client = getSanityWriteClient();
  if (!client) {
    return NextResponse.json({ ok: false, message: "Client Sanity non disponibile" }, { status: 500 });
  }

  const existing = await sanityFetch<EditableArticle>(editableArticleQuery, { slug });
  const content = payload.content!.trim();
  const excerpt = payload.excerpt?.trim() || content.slice(0, 180);

  const doc: {
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
  } = {
    _id: existing?._id || `article.${slug}`,
    _type: "article",
    title: payload.title!.trim(),
    slug: {
      _type: "slug",
      current: slug,
    },
    author: payload.author?.trim() || "Redazione CD",
    date: normalizeArticleDate(payload.date),
    category: payload.category?.trim() || "Insights",
    excerpt,
    content,
  };

  if (payload.imageUrl?.trim()) {
    doc.imageUrl = payload.imageUrl.trim();
  }

  try {
    await client.createOrReplace(doc);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore Sanity";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }

  revalidateEditorialPaths(slug);

  return NextResponse.json({
    ok: true,
    slug,
    path: `/articoli/${slug}`,
    updatedAt: new Date().toISOString(),
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  if (!isEditorAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!isSanityWriteConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message: "Sanity write non configurato. Imposta SANITY_API_WRITE_TOKEN.",
      },
      { status: 500 },
    );
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const bytes = Number.parseInt(contentLength, 10);
    if (Number.isFinite(bytes) && bytes > MAX_EDITOR_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, message: "Contenuto troppo grande (max 2 MB)." },
        { status: 413 },
      );
    }
  }

  const slug = slugify(params.slug || "");
  if (!slug) {
    return NextResponse.json({ ok: false, message: "Slug non valido" }, { status: 400 });
  }

  const client = getSanityWriteClient();
  if (!client) {
    return NextResponse.json({ ok: false, message: "Client Sanity non disponibile" }, { status: 500 });
  }

  const existing = await sanityFetch<EditableArticle>(editableArticleQuery, { slug });

  if (!existing?._id) {
    return NextResponse.json({ ok: false, message: "Articolo non trovato" }, { status: 404 });
  }

  try {
    await client.delete(existing._id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore eliminazione";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }

  revalidateEditorialPaths(slug);

  return NextResponse.json({
    ok: true,
    deletedSlug: slug,
    deletedAt: new Date().toISOString(),
  });
}
