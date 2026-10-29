import PropertyDetailClient from "./PropertyDetailClient";
export const runtime = "nodejs";
export async function generateMetadata({ params }) {
  const { id, name } = params;
  const propertyName = decodeURIComponent(
    String(name || "Commercial Property"),
  );

  return {
    title: `${propertyName} | Commercial Office Space & Real Estate | Anarock`,
    description: `Explore ${propertyName}, premier commercial property, shared office, and coworking space. Find top real estate listings, office spaces for rent across Mumbai, Bengaluru, Gurugram, Noida, Pune, and Hyderabad.`,
    keywords: [
      "property",
      "real estate",
      "commercial property",
      "commercial office space",
      "shared office",
      "coworking space",
      "managed office space",
      "office space for rent",
      "commercial real estate listings",
      "property for lease",
      "commercial property Mumbai",
      "office space Bengaluru",
      "commercial real estate Gurugram",
      "property for sale Noida",
      "commercial spaces Pune",
      "real estate Hyderabad",
      "commercial property Chennai",
      "office spaces Delhi NCR",
    ],
    alternates: {
      canonical: `/properties/${id}/${name || ""}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: `${propertyName} | Commercial Office Space & Real Estate`,
      description: `Discover details, floor plans, and pricing for ${propertyName}. Premium commercial properties, shared offices, and coworking spaces.`,
      url: `/properties/${id}/${name || ""}`,
      siteName: "Anarock Property Portal",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${propertyName} | Real Estate & Commercial Property`,
      description: `View details, pricing, and availability for ${propertyName} across top commercial hubs.`,
    },
  };
}

export default function PropertyDetailPage({ params }) {
  const { id } = params;
  return <PropertyDetailClient propertyId={String(id)} />;
}
