"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { navLinks } from "@/lib/site";

type AdminSessionResponse = {
  authenticated?: boolean;
  email?: string | null;
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const isAdmin = Boolean(adminEmail);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/admin/me", { cache: "no-store" });
        const payload = (await response.json().catch(() => ({}))) as AdminSessionResponse;
        if (cancelled) return;
        if (response.ok && payload.authenticated && payload.email) {
          setAdminEmail(payload.email);
        } else {
          setAdminEmail(null);
        }
      } catch {
        if (!cancelled) setAdminEmail(null);
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    setAdminEmail(null);
    setIsOpen(false);

    if (pathname.startsWith("/nuovo-articolo") || pathname.startsWith("/redazione")) {
      router.push("/");
    }

    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <BrandLogo />

        <button
          type="button"
          className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          aria-label="Apri menu"
        >
          Menu
        </button>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active ? "text-accent" : "text-slate-700 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {isAdmin ? (
            <Link
              href="/nuovo-articolo"
              className={`text-sm font-medium transition-colors ${
                isActivePath(pathname, "/nuovo-articolo") ? "text-accent" : "text-slate-700 hover:text-ink"
              }`}
            >
              Nuovo articolo
            </Link>
          ) : null}

          {isAdmin ? (
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="text-sm font-semibold text-red-700 hover:text-red-800"
            >
              Esci
            </button>
          ) : (
            <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-ink">
              Login admin
            </Link>
          )}
        </nav>
      </div>

      {isOpen ? (
        <nav className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block text-sm font-medium ${
                      active ? "text-accent" : "text-slate-700"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}

            {isAdmin ? (
              <li>
                <Link
                  href="/nuovo-articolo"
                  className={`block text-sm font-medium ${
                    isActivePath(pathname, "/nuovo-articolo") ? "text-accent" : "text-slate-700"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Nuovo articolo
                </Link>
              </li>
            ) : null}

            <li>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="block text-sm font-medium text-red-700"
                >
                  Esci
                </button>
              ) : (
                <Link href="/login" className="block text-sm font-medium text-slate-700" onClick={() => setIsOpen(false)}>
                  Login admin
                </Link>
              )}
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
