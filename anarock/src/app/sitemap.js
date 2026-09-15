const SITE = process.env.NEXT_PUBLIC_BASE_URL || "https://anarock.com";

export default function sitemap() {
  const cities = [
    "Mumbai",
    "Bengaluru",
    "Delhi NCR",
    "Pune",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Ahmedabad",
    "Gurgaon",
    "Noida",
  ];
  const staticPages = [
    "",
    "properties",
    "about",
    "services",
    "tools",
    "list-property",
  ].map((p) => ({
    url: `${SITE}/${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.8,
  }));
  const cityPages = cities.map((c) => ({
    url: `${SITE}/properties?city=${encodeURIComponent(c)}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));
  return [...staticPages, ...cityPages];
}
