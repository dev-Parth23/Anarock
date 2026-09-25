const SITE = process.env.NEXT_PUBLIC_BASE_URL || "https://anarock.com";

export default function sitemap() {
  const staticPages = ["", "properties", "services&tools", "list-property"].map(
    (p) => ({
      url: `${SITE}/${p}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: p === "" ? 1 : 0.8,
    }),
  );
  return [...staticPages];
}