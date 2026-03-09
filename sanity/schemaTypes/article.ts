export const articleSchema = {
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string", validation: (Rule: any) => Rule.required() },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title", maxLength: 96 }, validation: (Rule: any) => Rule.required() },
    { name: "author", title: "Author", type: "string" },
    { name: "date", title: "Date", type: "datetime", validation: (Rule: any) => Rule.required() },
    {
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: ["Interviste", "Imprese", "Insights", "Economia", "Innovazione", "Management"],
      },
    },
    { name: "image", title: "Main image", type: "image", options: { hotspot: true } },
    { name: "imageUrl", title: "Fallback image URL", type: "url" },
    { name: "excerpt", title: "Excerpt", type: "text", rows: 3 },
    { name: "content", title: "Content (Markdown)", type: "text", rows: 22 },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "image",
    },
  },
};
