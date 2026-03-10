import { createClient, type QueryParams, type SanityClient } from "@sanity/client";

type SanityEnv = {
  projectId?: string;
  dataset?: string;
  apiVersion: string;
  readToken?: string;
  writeToken?: string;
  nodeEnv: string;
};

function readSanityEnv(): SanityEnv {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-02-01";
  const readToken = process.env.SANITY_API_READ_TOKEN;
  const writeToken = process.env.SANITY_API_WRITE_TOKEN ?? readToken;
  const nodeEnv = process.env.NODE_ENV ?? "development";

  return { projectId, dataset, apiVersion, readToken, writeToken, nodeEnv };
}

export function isSanityConfigured(): boolean {
  const { projectId, dataset } = readSanityEnv();
  return Boolean(projectId && dataset);
}

export function isSanityWriteConfigured(): boolean {
  const { projectId, dataset, writeToken } = readSanityEnv();
  return Boolean(projectId && dataset && writeToken);
}

let cachedReadClient: { key: string; client: SanityClient } | null = null;
let cachedWriteClient: { key: string; client: SanityClient } | null = null;

function getSanityReadClient(): SanityClient | null {
  const env = readSanityEnv();
  if (!env.projectId || !env.dataset) return null;

  const key = `${env.projectId}|${env.dataset}|${env.apiVersion}|${env.readToken ?? ""}|${env.nodeEnv}`;
  if (cachedReadClient?.key === key) return cachedReadClient.client;

  const client = createClient({
    projectId: env.projectId,
    dataset: env.dataset,
    apiVersion: env.apiVersion,
    useCdn: !env.readToken && env.nodeEnv === "production",
    perspective: "published",
    token: env.readToken,
  });

  cachedReadClient = { key, client };
  return client;
}

export function getSanityWriteClient(): SanityClient | null {
  const env = readSanityEnv();
  if (!env.projectId || !env.dataset || !env.writeToken) return null;

  const key = `${env.projectId}|${env.dataset}|${env.apiVersion}|${env.writeToken}`;
  if (cachedWriteClient?.key === key) return cachedWriteClient.client;

  const client = createClient({
    projectId: env.projectId,
    dataset: env.dataset,
    apiVersion: env.apiVersion,
    useCdn: false,
    perspective: "published",
    token: env.writeToken,
  });

  cachedWriteClient = { key, client };
  return client;
}

export async function sanityFetch<T>(query: string, params: QueryParams = {}): Promise<T | null> {
  const sanityReadClient = getSanityReadClient();
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
