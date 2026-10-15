const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://anarock.com"
).replace(/\/+$/, "");

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

export default function sitemap() {
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

  return [...staticPages, ...cityPages];
}
