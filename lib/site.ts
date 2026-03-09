export const siteConfig = {
  name: "CD - Cronache d'Impresa",
  shortName: "CD",
  description:
    "Piattaforma editoriale indipendente dedicata a impresa, economia, innovazione e management.",
  url: "https://www.cdcronachedimpresa.it",
  ogImage: "/images/hero-governance.svg",
  email: "redazione@cdcronachedimpresa.it",
  social: {
    linkedin: "https://www.linkedin.com",
    twitter: "https://twitter.com",
    youtube: "https://www.youtube.com",
  },
};

export function toAbsoluteUrl(urlOrPath: string): string {
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;

  if (urlOrPath.startsWith("/")) {
    return `${siteConfig.url}${urlOrPath}`;
  }

  return `${siteConfig.url}/${urlOrPath}`;
}

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/articoli", label: "Articoli" },
  { href: "/interviste", label: "Interviste" },
  { href: "/imprese", label: "Imprese" },
  { href: "/insights", label: "Insights" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/contatti", label: "Contatti" },
] as const;
