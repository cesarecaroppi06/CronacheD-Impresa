import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export const metadata: Metadata = {
  title: "Login amministratori",
  description: "Accesso riservato per la gestione contenuti e configurazioni.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <section className="section-shell py-14">
      <Suspense fallback={<div className="mx-auto max-w-md text-sm text-slate-500">Caricamento login...</div>}>
        <AdminLoginForm />
      </Suspense>
    </section>
  );
}
