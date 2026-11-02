import PropertyDetailClient from "./PropertyDetailClient";
import { getPropertyById } from "@/lib/propertiesCache";
import { notFound } from "next/navigation";

export const runtime = "nodejs";

const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://anarock.com"
).replace(/\/+$/, "");

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

function getPropertyName(property, fallback = "") {
  return String(
    property?.name ||
    property?.Name ||
    property?.projectName ||
    property?.Project_Name ||
    fallback ||
    "Commercial Property",
  ).trim();
}

async function resolveProperty(params) {
  const resolvedParams = await params;
  const id = String(resolvedParams?.id || "").trim();

  if (!id || id.length > 100 || /[\r\n]/.test(id)) {
    return {
      id: "",
      property: null,
      name: "Commercial Property",
    };
  }

  try {
    const property = await getPropertyById(id);

    return {
      id,
      property,
      name: getPropertyName(property, resolvedParams?.name),
    };
  } catch (error) {
    console.error(
      "[Property Detail Page] Property lookup failed:",
      error?.message || error,
    );

    return {
      id,
      property: null,
      name: getPropertyName(null, resolvedParams?.name),
    };
  }
}

export async function generateMetadata({ params }) {
  const { id, property, name } = await resolveProperty(params);

  if (!property) {
    return {
      title: "Property Not Found | Anarock",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const slug = createSlug(name);
  const canonicalUrl = `${SITE_URL}/properties/${encodeURIComponent(id)}/${slug}`;

  const city = property.city || property.City || "";
  const micromarket = property.micromarket || property.Micromarket || "";

  const locationText = [micromarket, city].filter(Boolean).join(", ");

  const description = [
    `Explore ${name}.`,
    locationText ? `Located in ${locationText}.` : "",
    "View property details, commercial office space information, and availability with Anarock.",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title: `${name} | Commercial Property | Anarock`,
    description,
    keywords: [
      name,
      "commercial property",
      "commercial real estate",
      "commercial office space",
      "office space for rent",
      "managed office space",
      "coworking space",
      city,
      micromarket,
    ].filter(Boolean),

    alternates: {
      canonical: canonicalUrl,
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
      title: `${name} | Commercial Property | Anarock`,
      description,
      url: canonicalUrl,
      siteName: "Anarock",
      locale: "en_IN",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: `${name} | Commercial Property | Anarock`,
      description,
    },
  };
}

export default async function PropertyDetailPage({ params }) {
  const { id, property } = await resolveProperty(params);

  if (!property) {
    notFound();
  }

  return <PropertyDetailClient propertyId={id} />;
}
