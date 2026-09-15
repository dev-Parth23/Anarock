export default function robots() {
  const SITE = process.env.NEXT_PUBLIC_BASE_URL || "https://anarock.com";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/wishlist"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
