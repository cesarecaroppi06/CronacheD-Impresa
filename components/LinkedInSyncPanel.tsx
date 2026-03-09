"use client";

import { useState } from "react";

type SyncItem = {
  id: string;
  slug: string;
  path: string;
  title: string;
};

type SyncResponse = {
  ok: boolean;
  message?: string;
  imported?: number;
  skipped?: number;
  items?: SyncItem[];
  syncedAt?: string;
};

type LinkedInSyncPanelProps = {
  editorKey?: string;
};

export function LinkedInSyncPanel({ editorKey }: LinkedInSyncPanelProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<SyncResponse | null>(null);
  const [limit, setLimit] = useState("10");

  async function handleSync() {
    setIsSyncing(true);
    setResult(null);

    try {
      const parsedLimit = Number.parseInt(limit, 10);
      const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 50) : 10;

      const response = await fetch("/api/integrations/linkedin/sync", {
        method: "POST",
        headers: editorKey
          ? {
              "Content-Type": "application/json",
              "x-editor-key": editorKey,
            }
          : {
              "Content-Type": "application/json",
            },
        body: JSON.stringify({ limit: safeLimit }),
      });

      const data = (await response.json()) as SyncResponse;
      setResult(data);
    } catch {
      setResult({ ok: false, message: "Connessione non disponibile" });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-soft sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">LinkedIn</p>
      <h2 className="mt-3 font-serif text-3xl text-ink">Importa post dalla Pagina aziendale</h2>
      <p className="mt-3 text-sm text-slate-600">
        Sincronizza automaticamente gli ultimi post pubblicati su LinkedIn e crea articoli nel sito.
      </p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="block text-sm text-slate-600">
          Numero post da leggere
          <input
            type="number"
            min={1}
            max={50}
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            className="mt-2 h-11 w-40 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-accent"
          />
        </label>

        <button
          type="button"
          onClick={handleSync}
          disabled={isSyncing}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSyncing ? "Sincronizzazione..." : "Sincronizza da LinkedIn"}
        </button>
      </div>

      {result ? (
        <div
          className={`mt-6 rounded-lg border px-4 py-3 text-sm ${
            result.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {result.ok ? (
            <>
              Importati: {result.imported ?? 0} · Saltati: {result.skipped ?? 0}
              {result.syncedAt ? ` · Sync: ${new Date(result.syncedAt).toLocaleString("it-IT")}` : ""}
            </>
          ) : (
            result.message || "Errore"
          )}
        </div>
      ) : null}

      {result?.ok && result.items && result.items.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {result.items.slice(0, 8).map((item) => (
            <li key={item.id} className="text-sm text-slate-700">
              <a href={item.path} target="_blank" rel="noreferrer" className="underline">
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
