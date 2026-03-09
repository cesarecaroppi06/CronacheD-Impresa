import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EditorialPublisher } from "@/components/EditorialPublisher";
import { getAdminSessionFromCookiesStore } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Redazione",
  description: "Dashboard editoriale per la pubblicazione diretta di articoli su Sanity.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RedazionePage() {
  const session = getAdminSessionFromCookiesStore();
  if (!session) {
    redirect("/login?next=/nuovo-articolo");
  }

  return <EditorialPublisher />;
}
