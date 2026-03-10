import { getSanityWriteClient, isSanityWriteConfigured } from "@/lib/sanity";
import { editorialCategories, normalizeArticleDate, slugify } from "@/lib/editor";

export type LinkedInSyncItem = {
  id: string;
  slug: string;
  path: string;
  title: string;
};

export type LinkedInSyncResult = {
  imported: number;
  skipped: number;
  items: LinkedInSyncItem[];
};

export type LinkedInAutoSyncResult = {
  triggered: boolean;
  reason: "disabled" | "not_configured" | "cooldown" | "in_flight" | "ok" | "error";
  imported?: number;
  skipped?: number;
  error?: string;
};

type LinkedInPost = {
  id?: string;
  author?: string;
  commentary?: string | { text?: string };
  publishedAt?: number;
  createdAt?: number;
  lifecycleState?: string;
  visibility?: string;
  content?: {
    article?: {
      source?: string;
      title?: string;
      description?: string;
      thumbnail?: string;
    };
  };
};

type LinkedInPostsResponse = {
  elements?: LinkedInPost[];
};

const linkedinAccessToken = process.env.LINKEDIN_ACCESS_TOKEN;
const linkedinOrganizationUrn = process.env.LINKEDIN_ORGANIZATION_URN;
const linkedinApiVersion = process.env.LINKEDIN_API_VERSION ?? "202602";
const linkedinSyncCategory = process.env.LINKEDIN_SYNC_CATEGORY ?? "Insights";
const linkedinAutoSyncEnabled = parseBooleanFlag(process.env.LINKEDIN_AUTO_SYNC_ENABLED, true);
const linkedinAutoSyncIntervalMinutes = parsePositiveInt(
  process.env.LINKEDIN_AUTO_SYNC_INTERVAL_MINUTES,
  10,
);
const linkedinAutoSyncLimit = parsePositiveInt(process.env.LINKEDIN_AUTO_SYNC_LIMIT, 10);

export const isLinkedInConfigured = Boolean(linkedinAccessToken && linkedinOrganizationUrn);

type LinkedInAutoSyncState = {
  lastRunAt: number;
  inFlight: boolean;
};

declare global {
  var __linkedinAutoSyncState: LinkedInAutoSyncState | undefined;
}

function parseBooleanFlag(value: string | undefined, fallback: boolean): boolean {
  if (!value?.trim()) return fallback;
  return !/^(0|false|off|no)$/i.test(value.trim());
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function getAutoSyncState(): LinkedInAutoSyncState {
  if (!globalThis.__linkedinAutoSyncState) {
    globalThis.__linkedinAutoSyncState = {
      lastRunAt: 0,
      inFlight: false,
    };
  }

  return globalThis.__linkedinAutoSyncState;
}

function resolveCategory(): string {
  if (editorialCategories.includes(linkedinSyncCategory as (typeof editorialCategories)[number])) {
    return linkedinSyncCategory;
  }

  return "Insights";
}

function getLinkedInHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${linkedinAccessToken}`,
    "LinkedIn-Version": linkedinApiVersion,
    "X-Restli-Protocol-Version": "2.0.0",
  };
}

function toLinkedInPostUrl(id: string): string {
  if (id.startsWith("urn:li:")) {
    return `https://www.linkedin.com/feed/update/${id}/`;
  }

  return "https://www.linkedin.com";
}

function getCommentaryText(post: LinkedInPost): string {
  if (!post.commentary) return "";

  if (typeof post.commentary === "string") {
    return post.commentary.trim();
  }

  if (typeof post.commentary.text === "string") {
    return post.commentary.text.trim();
  }

  return "";
}

function getImageUrl(post: LinkedInPost): string | undefined {
  const thumbnail = post.content?.article?.thumbnail;

  if (thumbnail && /^https?:\/\//i.test(thumbnail)) {
    return thumbnail;
  }

  return undefined;
}

function getPublishedDate(post: LinkedInPost): string {
  const timestamp = post.publishedAt ?? post.createdAt;

  if (!timestamp) return normalizeArticleDate();

  return normalizeArticleDate(new Date(timestamp).toISOString());
}

function buildTitle(post: LinkedInPost, commentary: string): string {
  const articleTitle = post.content?.article?.title?.trim();
  if (articleTitle) return articleTitle.slice(0, 110);

  if (commentary) {
    const firstLine = commentary.split("\n").find((line) => line.trim());
    if (firstLine) return firstLine.trim().slice(0, 110);
  }

  return "Aggiornamento LinkedIn aziendale";
}

function buildExcerpt(post: LinkedInPost, commentary: string): string {
  const description = post.content?.article?.description?.trim();
  if (description) return description.slice(0, 180);

  if (commentary) {
    const compact = commentary.replace(/\s+/g, " ").trim();
    return `${compact.slice(0, 180)}${compact.length > 180 ? "..." : ""}`;
  }

  return "Contenuto sincronizzato automaticamente dalla pagina LinkedIn aziendale.";
}

function buildMarkdownContent(post: LinkedInPost, commentary: string): string {
  const source = post.content?.article?.source?.trim();
  const postUrl = post.id ? toLinkedInPostUrl(post.id) : "https://www.linkedin.com";

  const body = commentary || "Contenuto importato da LinkedIn.";

  const sourceLine = source ? `Fonte esterna condivisa: ${source}` : "";

  return [
    "## Post LinkedIn sincronizzato",
    "",
    body,
    "",
    sourceLine,
    "",
    `Post originale: ${postUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function fetchOrganizationPosts(limit: number): Promise<LinkedInPost[]> {
  if (!isLinkedInConfigured) return [];

  const url = new URL("https://api.linkedin.com/rest/posts");
  url.searchParams.set("q", "author");
  url.searchParams.set("author", linkedinOrganizationUrn!);
  url.searchParams.set("count", String(limit));
  url.searchParams.set("sortBy", "LAST_MODIFIED");

  const response = await fetch(url, {
    method: "GET",
    headers: getLinkedInHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LinkedIn fetch failed (${response.status}): ${text.slice(0, 240)}`);
  }

  const data = (await response.json()) as LinkedInPostsResponse;
  return data.elements ?? [];
}

export async function syncLinkedInToSanity(limit = 10): Promise<LinkedInSyncResult> {
  if (!isLinkedInConfigured) {
    throw new Error("LinkedIn non configurato. Imposta LINKEDIN_ACCESS_TOKEN e LINKEDIN_ORGANIZATION_URN.");
  }

  if (!isSanityWriteConfigured()) {
    throw new Error("Sanity write non configurato. Imposta SANITY_API_WRITE_TOKEN.");
  }

  const client = getSanityWriteClient();

  if (!client) {
    throw new Error("Client Sanity non disponibile.");
  }

  const category = resolveCategory();
  const posts = await fetchOrganizationPosts(limit);

  let imported = 0;
  let skipped = 0;

  const items: LinkedInSyncItem[] = [];

  for (const post of posts) {
    if (!post.id) {
      skipped += 1;
      continue;
    }

    if (post.lifecycleState && post.lifecycleState !== "PUBLISHED") {
      skipped += 1;
      continue;
    }

    const commentary = getCommentaryText(post);
    const title = buildTitle(post, commentary);
    const excerpt = buildExcerpt(post, commentary);
    const content = buildMarkdownContent(post, commentary);

    const rawId = post.id.split(":").pop() || post.id;
    const baseSlug = slugify(`linkedin-${rawId}`);
    const slug = baseSlug || `linkedin-${Date.now()}`;

    const docId = `article.linkedin-${rawId}`;
    const imageUrl = getImageUrl(post);

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
      _id: docId,
      _type: "article",
      title,
      slug: {
        _type: "slug",
        current: slug,
      },
      author: "Redazione LinkedIn",
      date: getPublishedDate(post),
      category,
      excerpt,
      content,
    };

    if (imageUrl) {
      doc.imageUrl = imageUrl;
    }

    await client.createOrReplace(doc);

    imported += 1;
    items.push({
      id: post.id,
      slug,
      path: `/articoli/${slug}`,
      title,
    });
  }

  return { imported, skipped, items };
}

export async function maybeAutoSyncLinkedInToSanity(): Promise<LinkedInAutoSyncResult> {
  if (!linkedinAutoSyncEnabled) {
    return { triggered: false, reason: "disabled" };
  }

  if (!isLinkedInConfigured || !isSanityWriteConfigured()) {
    return { triggered: false, reason: "not_configured" };
  }

  const state = getAutoSyncState();
  const now = Date.now();
  const cooldownMs = linkedinAutoSyncIntervalMinutes * 60 * 1000;

  if (state.inFlight) {
    return { triggered: false, reason: "in_flight" };
  }

  if (state.lastRunAt > 0 && now - state.lastRunAt < cooldownMs) {
    return { triggered: false, reason: "cooldown" };
  }

  state.inFlight = true;
  state.lastRunAt = now;

  try {
    const result = await syncLinkedInToSanity(linkedinAutoSyncLimit);
    return {
      triggered: true,
      reason: "ok",
      imported: result.imported,
      skipped: result.skipped,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore auto-sync LinkedIn";
    console.warn(`LinkedIn auto-sync failed: ${message}`);
    return {
      triggered: true,
      reason: "error",
      error: message,
    };
  } finally {
    state.inFlight = false;
  }
}
