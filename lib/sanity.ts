import { createClient, type QueryParams, type SanityClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-02-01";
const readToken = process.env.SANITY_API_READ_TOKEN;
const writeToken = process.env.SANITY_API_WRITE_TOKEN ?? readToken;

export const isSanityConfigured = Boolean(projectId && dataset);
export const isSanityWriteConfigured = Boolean(projectId && dataset && writeToken);

const sanityReadClient = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: !readToken && process.env.NODE_ENV === "production",
      perspective: "published",
      token: readToken,
    })
  : null;

const sanityWriteClient = isSanityWriteConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      perspective: "published",
      token: writeToken,
    })
  : null;

export function getSanityWriteClient(): SanityClient | null {
  return sanityWriteClient;
}

export async function sanityFetch<T>(query: string, params: QueryParams = {}): Promise<T | null> {
  if (!sanityReadClient) return null;

  try {
    return await sanityReadClient.fetch<T>(query, params, {
      next: {
        revalidate: 120,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.warn(`Sanity fetch failed: ${message}`);
    return null;
  }
}
