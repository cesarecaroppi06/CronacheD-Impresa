"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type LoginResponse = {
  ok?: boolean;
  message?: string;
};

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextPath = useMemo(() => searchParams.get("next") || "/nuovo-articolo", [searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as LoginResponse;

      if (!response.ok || !payload.ok) {
        setError(payload.message || "Accesso non autorizzato");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Connessione non disponibile");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Area riservata</p>
      <h1 className="mt-3 font-serif text-3xl text-ink">Login amministratori</h1>
      <p className="mt-2 text-sm text-slate-600">Solo gli account autorizzati possono gestire contenuti e dati.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm text-slate-600">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-accent"
          />
        </label>

        <label className="block text-sm text-slate-600">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-accent"
          />
        </label>

        {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Accesso in corso..." : "Accedi"}
        </button>
      </form>
    </div>
  );
}
