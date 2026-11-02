import { getAllProperties } from "@/lib/propertiesCache";
const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || "https://anarock.com").replace(/\/+$/, "");
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const cities = [
  "bengaluru",
  "chennai",
  "delhi",
  "gurugram",
  "hyderabad",
  "kolkata",
  "mumbai",
  "noida",
  "pune",
];

function getPropertyId(property) {
  return String(
    property?.id ?? property?.rowId ?? property?.ROWID ?? "",
  ).trim();
}

function getPropertyName(property) {
  return String(
    property?.name ??
    property?.Name ??
    property?.projectName ??
    property?.Project_Name ??
    "Commercial Property",
  ).trim();
}

function createSlug(value) {
  return (
    String(value || "commercial-property")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100) || "commercial-property"
  );
}

export default async function sitemap() {
  const staticPages = [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/properties`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const cityPages = cities.map((city) => ({
    url: `${SITE_URL}/kyc/city/${city}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  let propertyPages = [];

  try {
    const properties = await getAllProperties();
    const seenUrls = new Set();
    propertyPages = properties.map((property) => {
      const id = getPropertyId(property);
      if (!id) return null;
      const name = getPropertyName(property);
      const slug = createSlug(name);
      const url = `${SITE_URL}/properties/${encodeURIComponent(id)}/${slug}`;
      if (seenUrls.has(url)) return null;
      seenUrls.add(url);
      return { url, changeFrequency: "weekly", priority: 0.7, };
    })
      .filter(Boolean);
  } catch (error) {
    console.error(
      "[Sitemap] Unable to load property URLs:",
      error?.message || error,
    );
  }
  return [...staticPages, ...cityPages, ...propertyPages];
}