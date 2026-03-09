"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/articles";
import { categoryToPath, formatDate } from "@/lib/format";

type ArticleCardProps = {
  article: Article;
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <Link href={`/articoli/${article.slug}`}>
        <div className="relative h-52 overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        </div>
      </Link>
      <div className="space-y-4 px-6 py-6">
        <Link
          href={categoryToPath(article.category)}
          className="text-xs font-semibold uppercase tracking-[0.16em] text-accent"
        >
          {article.category}
        </Link>
        <Link href={`/articoli/${article.slug}`}>
          <h3 className="font-serif text-2xl leading-tight text-ink transition-colors group-hover:text-accent">
            {article.title}
          </h3>
        </Link>
        <p className="text-sm leading-relaxed text-slate-600">{article.excerpt}</p>
        <p className="text-xs text-slate-500">
          {article.author} · {formatDate(article.date)} · {article.readingTime} min
        </p>
      </div>
    </motion.article>
  );
}
