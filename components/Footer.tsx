import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { siteConfig } from "@/lib/site";

const categoryLinks = [
  { href: "/articoli", label: "Articoli" },
  { href: "/interviste", label: "Interviste" },
  { href: "/imprese", label: "Imprese" },
  { href: "/insights", label: "Insights" },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-paper">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 lg:grid-cols-3 lg:px-8">
        <div className="space-y-4">
          <BrandLogo size="md" showSubtitle />
          <p className="max-w-sm text-sm leading-relaxed text-slate-600">
            {siteConfig.description} Un osservatorio editoriale con approfondimenti,
            analisi e storie per manager, imprenditori e professionisti.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Categorie
          </h3>
          <ul className="mt-4 space-y-3">
            {categoryLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-slate-700 hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Social
          </h3>
          <ul className="mt-4 space-y-3">
            <li>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-slate-700 hover:text-accent"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-slate-700 hover:text-accent"
              >
                Twitter
              </a>
            </li>
            <li>
              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-slate-700 hover:text-accent"
              >
                YouTube
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
