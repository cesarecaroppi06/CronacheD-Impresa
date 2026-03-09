export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function categoryToPath(category: string): string {
  const normalized = category.toLowerCase();

  if (normalized.includes("interviste")) return "/interviste";
  if (normalized.includes("imprese")) return "/imprese";
  if (normalized.includes("insights")) return "/insights";
  return "/articoli";
}
