"use client";

import TurndownService from "turndown";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { editorialCategories, slugify } from "@/lib/editor";
import { LinkedInSyncPanel } from "@/components/LinkedInSyncPanel";

type PublishResponse = {
  ok: boolean;
  message?: string;
  slug?: string;
  path?: string;
  publishedAt?: string;
  updatedAt?: string;
};

type UploadResponse = {
  ok: boolean;
  message?: string;
  url?: string;
};

type ArticlesListResponse = {
  ok?: boolean;
  message?: string;
  articles?: ManagedArticleSummary[];
};

type ArticleDetailResponse = {
  ok?: boolean;
  message?: string;
  article?: ManagedArticleDetail;
};

type ManagedArticleSummary = {
  slug: string;
  title: string;
  author?: string;
  category?: string;
  date?: string;
};

type ManagedArticleDetail = ManagedArticleSummary & {
  excerpt?: string;
  imageUrl?: string;
  content?: string;
};

type FormState = {
  title: string;
  author: string;
  date: string;
  category: string;
  imageUrl: string;
  excerpt: string;
  content: string;
};

type EditorialTemplate = {
  id: string;
  label: string;
  category: FormState["category"];
  title: string;
  excerpt: string;
  content: string;
};

type DraftStoragePayload = {
  form?: Partial<FormState>;
  editingSlug?: string | null;
};

const DRAFT_STORAGE_KEY = "cd_editor_draft_v2";

function getNowLocalDateTime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function toDateTimeLocal(value?: string): string {
  if (!value) return getNowLocalDateTime();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return getNowLocalDateTime();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function formatDateForList(value?: string): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const initialState: FormState = {
  title: "",
  author: "",
  date: getNowLocalDateTime(),
  category: "Insights",
  imageUrl: "",
  excerpt: "",
  content: "",
};

const editorialTemplates: EditorialTemplate[] = [
  {
    id: "analisi",
    label: "Analisi di mercato",
    category: "Insights",
    title: "Titolo analisi: trend e impatti per le imprese",
    excerpt: "Sintesi in 2 righe del punto chiave e del valore per il lettore.",
    content: `## Contesto
Descrivi il quadro di partenza e i numeri principali.

## Cosa sta cambiando
- Trend 1
- Trend 2
- Trend 3

## Impatto pratico per aziende e manager
Spiega conseguenze operative e decisioni consigliate.

## Conclusione
Chiudi con take-away chiari e prossimi passi.`,
  },
  {
    id: "intervista",
    label: "Intervista",
    category: "Interviste",
    title: "Intervista a [Nome]: visione, strategia e risultati",
    excerpt: "Tre insight chiave emersi dall'intervista.",
    content: `## Profilo dell'ospite
Breve introduzione con ruolo e contesto.

## Domande e risposte
### Domanda 1
> Risposta

### Domanda 2
> Risposta

### Domanda 3
> Risposta

## Cosa imparare da questa intervista
- Insight 1
- Insight 2
- Insight 3`,
  },
  {
    id: "case-study",
    label: "Case study impresa",
    category: "Imprese",
    title: "Case study: come [Azienda] ha migliorato [Risultato]",
    excerpt: "Problema iniziale, soluzione adottata e risultati misurabili.",
    content: `## Problema iniziale
Descrivi il problema in modo concreto.

## Strategia adottata
Spiega il piano d'azione.

## Esecuzione
Racconta step, strumenti, persone coinvolte.

## Risultati
- KPI 1
- KPI 2
- KPI 3

## Lezioni utili per altre imprese
Riassumi cosa replicare e cosa evitare.`,
  },
];

export function EditorialPublisher() {
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const inlineInputRef = useRef<HTMLInputElement | null>(null);
  const draftReadyRef = useRef(false);

  const [form, setForm] = useState<FormState>(initialState);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingInline, setIsUploadingInline] = useState(false);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [loadingArticleSlug, setLoadingArticleSlug] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [articles, setArticles] = useState<ManagedArticleSummary[]>([]);
  const [uploadMessage, setUploadMessage] = useState<{ ok: boolean; message: string } | null>(null);
  const [result, setResult] = useState<PublishResponse | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const generatedSlug = useMemo(() => slugify(form.title), [form.title]);

  const turndownService = useMemo(() => {
    const service = new TurndownService({
      headingStyle: "atx",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
      emDelimiter: "*",
      strongDelimiter: "**",
    });

    service.addRule("stripSpans", {
      filter: "span",
      replacement: (content) => content,
    });

    return service;
  }, []);

  const loadArticles = useCallback(async () => {
    setIsLoadingArticles(true);

    try {
      const response = await fetch("/api/editor/articles", {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json().catch(() => ({}))) as ArticlesListResponse;

      if (!response.ok || !payload.ok) {
        setUploadMessage({ ok: false, message: payload.message || "Impossibile caricare elenco articoli." });
        return;
      }

      setArticles(payload.articles || []);
    } catch {
      setUploadMessage({ ok: false, message: "Connessione non disponibile durante caricamento articoli." });
    } finally {
      setIsLoadingArticles(false);
    }
  }, []);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) {
        draftReadyRef.current = true;
        return;
      }

      const saved = JSON.parse(raw) as DraftStoragePayload;
      if (saved.form) {
        const savedForm = saved.form;
        setForm((previous) => ({
          ...previous,
          ...savedForm,
          date: toDateTimeLocal(savedForm.date),
        }));
      }

      if (saved.editingSlug) {
        setEditingSlug(saved.editingSlug);
      }

      setUploadMessage({ ok: true, message: "Bozza ripristinata automaticamente dalla memoria locale." });
    } catch {
      // ignore corrupted local draft
    } finally {
      draftReadyRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!draftReadyRef.current) return;

    const payload: DraftStoragePayload = {
      form,
      editingSlug,
    };

    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    setLastSavedAt(
      new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );
  }, [form, editingSlug]);

  function resetComposer() {
    setForm({ ...initialState, author: form.author });
    setEditingSlug(null);
    setResult(null);
    setUploadMessage({ ok: true, message: "Nuova bozza pronta." });
  }

  function clearLocalDraft() {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    setLastSavedAt(null);
    setUploadMessage({ ok: true, message: "Memoria locale bozza azzerata." });
  }

  function applyTemplate(template: EditorialTemplate) {
    const hasDraft = Boolean(form.title.trim() || form.excerpt.trim() || form.content.trim());
    if (hasDraft && !window.confirm("Sostituire la bozza attuale con questo template?")) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      category: template.category,
      title: template.title,
      excerpt: template.excerpt,
      content: template.content,
    }));

    setResult(null);
    setUploadMessage({ ok: true, message: `Template "${template.label}" caricato.` });
  }

  function replaceSelection(
    builder: (context: { selected: string; before: string; after: string }) => {
      text: string;
      selectFrom?: number;
      selectTo?: number;
    },
  ) {
    const textarea = contentRef.current;
    const start = textarea?.selectionStart ?? form.content.length;
    const end = textarea?.selectionEnd ?? form.content.length;

    setForm((previous) => {
      const before = previous.content.slice(0, start);
      const selected = previous.content.slice(start, end);
      const after = previous.content.slice(end);
      const next = builder({ selected, before, after });
      const nextContent = `${before}${next.text}${after}`;
      const nextSelectionStart = start + (next.selectFrom ?? next.text.length);
      const nextSelectionEnd = start + (next.selectTo ?? next.selectFrom ?? next.text.length);

      requestAnimationFrame(() => {
        const current = contentRef.current;
        if (!current) return;
        current.focus();
        current.setSelectionRange(nextSelectionStart, nextSelectionEnd);
      });

      return {
        ...previous,
        content: nextContent,
      };
    });
  }

  function wrapInline(before: string, after: string, placeholder: string) {
    replaceSelection(({ selected }) => {
      const textBody = selected || placeholder;
      const text = `${before}${textBody}${after}`;
      return {
        text,
        selectFrom: before.length,
        selectTo: before.length + textBody.length,
      };
    });
  }

  function insertBlock(snippet: string) {
    replaceSelection(({ selected, before, after }) => {
      const block = selected || snippet;
      const leadingBreak = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
      const trailingBreak = after.length > 0 && !after.startsWith("\n") ? "\n" : "";
      const text = `${leadingBreak}${block}${trailingBreak}`;
      const cursorPosition = text.length - trailingBreak.length;
      return {
        text,
        selectFrom: cursorPosition,
        selectTo: cursorPosition,
      };
    });
  }

  function insertLink() {
    replaceSelection(({ selected }) => {
      const label = selected || "testo link";
      const prefix = `[${label}](`;
      const url = "https://";
      const text = `${prefix}${url})`;
      return {
        text,
        selectFrom: prefix.length,
        selectTo: prefix.length + url.length,
      };
    });
  }

  async function uploadImage(file: File): Promise<UploadResponse> {
    const payload = new FormData();
    payload.append("image", file);

    const response = await fetch("/api/editor/upload-image", {
      method: "POST",
      body: payload,
    });

    const data = (await response.json().catch(() => ({}))) as UploadResponse;

    if (!response.ok) {
      throw new Error(data.message || "Upload immagine non riuscito");
    }

    return data;
  }

  async function insertInlineImageFromFile(file: File) {
    const uploaded = await uploadImage(file);
    if (!uploaded.url) {
      throw new Error("URL immagine non disponibile");
    }

    const baseAlt = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
    const altText = baseAlt || "Immagine articolo";
    insertBlock(`![${altText}](${uploaded.url})`);
  }

  async function handleCoverUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadMessage(null);
    setIsUploadingCover(true);

    try {
      const uploaded = await uploadImage(file);
      if (!uploaded.url) {
        throw new Error("URL immagine non disponibile");
      }

      setForm((previous) => ({ ...previous, imageUrl: uploaded.url || previous.imageUrl }));
      setUploadMessage({ ok: true, message: "Immagine copertina caricata con successo." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Errore durante upload immagine";
      setUploadMessage({ ok: false, message });
    } finally {
      setIsUploadingCover(false);
    }
  }

  async function handleInlineUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadMessage(null);
    setIsUploadingInline(true);

    try {
      await insertInlineImageFromFile(file);
      setUploadMessage({ ok: true, message: "Immagine inserita nel contenuto." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Errore durante upload immagine";
      setUploadMessage({ ok: false, message });
    } finally {
      setIsUploadingInline(false);
    }
  }

  async function handleContentPaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const clipboard = event.clipboardData;
    const html = clipboard.getData("text/html");
    const plain = clipboard.getData("text/plain");
    const imageFiles = Array.from(clipboard.files).filter((file) => file.type.startsWith("image/"));

    const hasHtml = Boolean(html && /<[^>]+>/.test(html));
    if (!hasHtml && imageFiles.length === 0) {
      return;
    }

    event.preventDefault();

    if (hasHtml) {
      const markdown = turndownService.turndown(html).replace(/\n{3,}/g, "\n\n").trim();
      if (markdown) {
        insertBlock(markdown);
        setUploadMessage({
          ok: true,
          message: "Incolla LinkedIn convertito con formattazione mantenuta (grassetti, liste, titoli, link).",
        });
      } else if (plain) {
        insertBlock(plain);
      }
    }

    if (imageFiles.length > 0) {
      setIsUploadingInline(true);
      try {
        for (const image of imageFiles) {
          await insertInlineImageFromFile(image);
        }
        setUploadMessage({ ok: true, message: "Immagini incollate e caricate nel contenuto." });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Errore durante gestione immagini incollate";
        setUploadMessage({ ok: false, message });
      } finally {
        setIsUploadingInline(false);
      }
    }
  }

  async function startEditArticle(slug: string) {
    setLoadingArticleSlug(slug);
    setResult(null);

    try {
      const response = await fetch(`/api/editor/articles/${encodeURIComponent(slug)}`, {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json().catch(() => ({}))) as ArticleDetailResponse;

      if (!response.ok || !payload.ok || !payload.article) {
        setUploadMessage({ ok: false, message: payload.message || "Impossibile aprire articolo." });
        return;
      }

      const article = payload.article;
      setEditingSlug(article.slug);
      setForm((previous) => ({
        ...previous,
        title: article.title || "",
        author: article.author || "",
        date: toDateTimeLocal(article.date),
        category: article.category || "Insights",
        imageUrl: article.imageUrl || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
      }));
      setUploadMessage({ ok: true, message: `Articolo "${article.title}" aperto in modifica.` });
    } catch {
      setUploadMessage({ ok: false, message: "Connessione non disponibile durante apertura articolo." });
    } finally {
      setLoadingArticleSlug(null);
    }
  }

  async function deleteArticle(slug: string) {
    if (!window.confirm(`Confermi eliminazione articolo "${slug}"?`)) {
      return;
    }

    setDeletingSlug(slug);
    setResult(null);

    try {
      const response = await fetch(`/api/editor/articles/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });

      const payload = (await response.json().catch(() => ({}))) as PublishResponse;

      if (!response.ok || !payload.ok) {
        setUploadMessage({ ok: false, message: payload.message || "Eliminazione non riuscita." });
        return;
      }

      if (editingSlug === slug) {
        resetComposer();
      }

      setUploadMessage({ ok: true, message: `Articolo "${slug}" eliminato.` });
      await loadArticles();
    } catch {
      setUploadMessage({ ok: false, message: "Connessione non disponibile durante eliminazione." });
    } finally {
      setDeletingSlug(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    const isEditMode = Boolean(editingSlug);
    const endpoint = isEditMode
      ? `/api/editor/articles/${encodeURIComponent(editingSlug || "")}`
      : "/api/editor/articles";

    try {
      const response = await fetch(endpoint, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          author: form.author,
          date: form.date,
          category: form.category,
          imageUrl: form.imageUrl,
          excerpt: form.excerpt,
          content: form.content,
        }),
      });

      const data = (await response.json()) as PublishResponse;

      if (!response.ok || !data.ok) {
        setResult({ ok: false, message: data.message || "Errore in pubblicazione" });
        return;
      }

      if (data.slug) {
        setEditingSlug(data.slug);
      }

      setResult({
        ok: true,
        slug: data.slug,
        path: data.path,
        message: isEditMode ? "Articolo aggiornato con successo." : "Articolo pubblicato con successo.",
      });

      setUploadMessage({
        ok: true,
        message: isEditMode
          ? "Modifiche salvate in tempo reale nel CMS."
          : "Nuovo articolo salvato e pubblicato.",
      });

      await loadArticles();
    } catch {
      setResult({ ok: false, message: "Connessione non disponibile" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section-shell pb-16 pt-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-soft sm:p-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Redazione</p>
          <h1 className="mt-3 font-serif text-4xl text-ink">Nuovo articolo</h1>
          <p className="mt-3 text-sm text-slate-600">
            Editor interno con incolla da LinkedIn (con conversione formato), immagini da file e gestione completa
            articoli per amministratori.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Modalita: <span className="font-semibold text-ink">{editingSlug ? `Modifica (${editingSlug})` : "Nuovo"}</span>
            {lastSavedAt ? <span> · Bozza autosalvata alle {lastSavedAt}</span> : null}
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Gestione articoli</p>
              <p className="mt-1 text-sm text-slate-600">Apri, modifica o elimina articoli pubblicati.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={resetComposer} className="btn-secondary !px-3 !py-2 text-xs">
                Nuova bozza
              </button>
              <button type="button" onClick={clearLocalDraft} className="btn-secondary !px-3 !py-2 text-xs">
                Svuota memoria locale
              </button>
            </div>
          </div>

          <div className="mt-4 max-h-52 overflow-auto rounded-md border border-slate-200 bg-white p-2">
            {isLoadingArticles ? (
              <p className="px-2 py-2 text-xs text-slate-500">Caricamento articoli...</p>
            ) : articles.length === 0 ? (
              <p className="px-2 py-2 text-xs text-slate-500">Nessun articolo presente.</p>
            ) : (
              <ul className="space-y-2">
                {articles.map((article) => (
                  <li
                    key={article.slug}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-100 px-2 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{article.title}</p>
                      <p className="text-xs text-slate-500">
                        {article.category || "Insights"} · {formatDateForList(article.date)} · {article.slug}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void startEditArticle(article.slug)}
                        disabled={loadingArticleSlug === article.slug}
                        className="btn-secondary !px-3 !py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loadingArticleSlug === article.slug ? "Apertura..." : "Modifica"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteArticle(article.slug)}
                        disabled={deletingSlug === article.slug}
                        className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingSlug === article.slug ? "Eliminazione..." : "Elimina"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Struttura guidata</p>
          <p className="mt-2 text-sm text-slate-600">
            Scegli un modello pronto e parti con la struttura gia impostata.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {editorialTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template)}
                className="btn-secondary !px-3 !py-2 text-xs"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-600 sm:col-span-2">
              Titolo
              <input
                type="text"
                required
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-accent"
              />
            </label>

            <label className="block text-sm text-slate-600">
              Autore
              <input
                type="text"
                value={form.author}
                onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
                className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-accent"
              />
            </label>

            <label className="block text-sm text-slate-600">
              Data
              <input
                type="datetime-local"
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-accent"
              />
            </label>

            <label className="block text-sm text-slate-600">
              Categoria
              <select
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-accent"
              >
                {editorialCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-slate-600">
              URL immagine copertina (opzionale)
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  className="h-11 min-w-[240px] flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="btn-secondary !px-3 !py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploadingCover ? "Caricamento..." : "Carica copertina"}
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </div>
            </label>

            <label className="block text-sm text-slate-600 sm:col-span-2">
              Excerpt
              <textarea
                rows={3}
                value={form.excerpt}
                onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-accent"
              />
            </label>

            <label className="block text-sm text-slate-600 sm:col-span-2">
              Contenuto articolo (incolla da LinkedIn supportato)
              <div className="mt-2 flex flex-wrap gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
                <button
                  type="button"
                  onClick={() => wrapInline("**", "**", "testo in evidenza")}
                  className="btn-secondary !px-3 !py-2 text-xs"
                >
                  Grassetto
                </button>
                <button
                  type="button"
                  onClick={() => wrapInline("*", "*", "testo in corsivo")}
                  className="btn-secondary !px-3 !py-2 text-xs"
                >
                  Corsivo
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock("## Titolo sezione")}
                  className="btn-secondary !px-3 !py-2 text-xs"
                >
                  Titolo H2
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock("### Titolo secondario")}
                  className="btn-secondary !px-3 !py-2 text-xs"
                >
                  Titolo H3
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock("- Primo punto\n- Secondo punto")}
                  className="btn-secondary !px-3 !py-2 text-xs"
                >
                  Lista
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock("1. Primo punto\n2. Secondo punto")}
                  className="btn-secondary !px-3 !py-2 text-xs"
                >
                  Lista numerata
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock("> Citazione")}
                  className="btn-secondary !px-3 !py-2 text-xs"
                >
                  Citazione
                </button>
                <button type="button" onClick={insertLink} className="btn-secondary !px-3 !py-2 text-xs">
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => wrapInline("`", "`", "codice")}
                  className="btn-secondary !px-3 !py-2 text-xs"
                >
                  Codice inline
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock("```\nblocco codice\n```")}
                  className="btn-secondary !px-3 !py-2 text-xs"
                >
                  Blocco codice
                </button>
                <button
                  type="button"
                  onClick={() => insertBlock("---")}
                  className="btn-secondary !px-3 !py-2 text-xs"
                >
                  Separatore
                </button>
                <button
                  type="button"
                  onClick={() => inlineInputRef.current?.click()}
                  disabled={isUploadingInline}
                  className="btn-secondary !px-3 !py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploadingInline ? "Upload immagine..." : "Inserisci immagine"}
                </button>
                <input
                  ref={inlineInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={handleInlineUpload}
                  className="hidden"
                />
              </div>
              <textarea
                ref={contentRef}
                rows={16}
                required
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                onPaste={(event) => void handleContentPaste(event)}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-3 text-sm outline-none focus:border-accent"
              />
              <p className="mt-2 text-xs text-slate-500">
                Suggerimento: copia da LinkedIn e incolla qui. Il sistema converte HTML in Markdown mantenendo
                formattazione principale, liste e immagini.
              </p>
            </label>
          </div>

          {uploadMessage ? (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                uploadMessage.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {uploadMessage.message}
            </div>
          ) : null}

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Slug: <span className="font-semibold text-ink">{editingSlug || generatedSlug || "-"}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? editingSlug
                ? "Aggiornamento in corso..."
                : "Pubblicazione in corso..."
              : editingSlug
                ? "Salva modifiche articolo"
                : "Pubblica articolo"}
          </button>
        </form>

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
                {result.message || "Operazione completata."} {result.path ? (
                  <a href={result.path} className="font-semibold underline" target="_blank" rel="noreferrer">
                    Apri {result.path}
                  </a>
                ) : null}
              </>
            ) : (
              result.message || "Errore"
            )}
          </div>
        ) : null}
      </div>

      <div className="mx-auto mt-6 max-w-5xl">
        <LinkedInSyncPanel />
      </div>
    </section>
  );
}
