import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EditorialPublisher } from "@/components/EditorialPublisher";
import { getAdminSessionFromCookiesStore } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Nuovo articolo",
  description: "Strumento interno per strutturare, scrivere e pubblicare articoli direttamente sul sito.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NuovoArticoloPage() {
  const session = getAdminSessionFromCookiesStore();
  if (!session) {
    redirect("/login?next=/nuovo-articolo");
  }

  return <EditorialPublisher />;
}
