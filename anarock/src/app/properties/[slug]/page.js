import { notFound } from "next/navigation";
import PropertyDetailPage from "@/pages/PropertyDetailPage";
import { getPropertyBySlug } from "@/data/properties";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const property = getPropertyBySlug(slug);

  if (!property) {
    return {
      title: "Property Not Found",
    };
  }

  return {
    title: `${property.title} | ${property.city}`,
    description: property.description,
  };
}

export default async function Page({ params }) {
  const { slug } = await params;

  const property = getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return (
    <PropertyDetailPage
      property={property}
    />
  );
}