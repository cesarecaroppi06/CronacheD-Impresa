export const articleProjection = `{
  title,
  "slug": slug.current,
  "author": coalesce(author, "Redazione CD"),
  date,
  "category": coalesce(category, "Insights"),
  "image": coalesce(imageUrl, image.asset->url, "/images/hero-governance.svg"),
  "excerpt": coalesce(excerpt, "Approfondimento editoriale da CD - Cronache d'Impresa."),
  "content": coalesce(content, "")
}`;

export const allArticlesQuery = `*[_type == "article" && defined(slug.current)] | order(date desc) ${articleProjection}`;

export const articleBySlugQuery = `*[_type == "article" && slug.current == $slug][0] ${articleProjection}`;
