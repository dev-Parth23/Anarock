import PropertyDetailClient from "./PropertyDetailClient";

export const runtime = "nodejs";

export async function generateMetadata({ params }) {
  const { id, name } = params;

  const propertyName = decodeURIComponent(String(name || "Property"));

  return {
    title: propertyName,
  };
}

export default function PropertyDetailPage({ params }) {
  const { id } = params;

  return <PropertyDetailClient propertyId={String(id)} />;
}
