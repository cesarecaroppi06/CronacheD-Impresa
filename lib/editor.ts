export const editorialCategories = [
  "Interviste",
  "Imprese",
  "Insights",
  "Economia",
  "Innovazione",
  "Management",
] as const;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 96);
}

export function normalizeArticleDate(dateValue?: string): string {
  if (!dateValue) return new Date().toISOString();

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();

  return parsed.toISOString();
}
