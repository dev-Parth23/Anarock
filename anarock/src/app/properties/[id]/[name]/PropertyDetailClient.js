"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PropertyCard from "@/components/PropertyCard";

export default function PropertyDetailClient({ propertyId }) {
  const [property, setProperty] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [related, setRelated] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!propertyId) return;

    async function loadProperty() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertyId)}`,
          {
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load property");
        }

        const propertyData = data.data;

        setProperty(propertyData);

        const images = propertyData.gallery || [];

        setGallery(images);
        setActiveImg(0);

        if (propertyData.city) {
          try {
            const relatedResponse = await fetch(
              `/api/properties?city=${encodeURIComponent(propertyData.city)}`,
              {
                cache: "no-store",
              },
            );

            const relatedData = await relatedResponse.json();

            if (relatedData.success) {
              const relatedProperties = relatedData.data
                .filter((item) => String(item.id) !== String(propertyData.id))
                .slice(0, 3);

              setRelated(relatedProperties);
            }
          } catch (relatedError) {
            console.error("Related properties error:", relatedError);
          }
        }
      } catch (err) {
        console.error(err);

        setError(err?.message || "Unable to load property");
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading property...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Property not found</h1>

          <p className="text-gray-500">
            {error || "Unable to load property details."}
          </p>
        </div>
      </div>
    );
  }

  const activeImage = gallery[activeImg]?.url || property.image || "";

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
            {property.city && <span>{property.city}</span>}

            {property.micromarket && (
              <>
                <span>•</span>
                <span>{property.micromarket}</span>
              </>
            )}

            {property.type && (
              <>
                <span>•</span>
                <span>{property.type}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {property.name}
          </h1>

          {property.address && (
            <p className="mt-2 text-gray-500">{property.address}</p>
          )}
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={property.name || "Property image"}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 75vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  Image unavailable
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
            {gallery.slice(0, 5).map((image, index) => (
              <button
                key={image.key || index}
                type="button"
                onClick={() => setActiveImg(index)}
                className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 ${
                  activeImg === index ? "border-black" : "border-transparent"
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.name || `Property image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <section className="mt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Info
              label="Area"
              value={
                property.areaSqft
                  ? `${property.areaSqft.toLocaleString()} sq.ft`
                  : "-"
              }
            />

            <Info
              label="Type"
              value={property.officeType || property.type || "-"}
            />

            <Info
              label="Floor"
              value={property.floor || property.proposedFloor || "-"}
            />

            <Info
              label="Seats"
              value={property.seats ? property.seats.toLocaleString() : "-"}
            />

            <Info label="Parking Ratio" value={property.parkingRatio || "-"} />

            <Info label="Building Type" value={property.buildingType || "-"} />

            <Info label="Availability" value={property.availability || "-"} />

            <Info label="Completion" value={property.yearBuilt || "-"} />
          </div>
        </section>

        {/* Price */}
        <section className="mt-8 rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Info
              label="Quoted Rent"
              value={
                property.quotedRent
                  ? `₹${Number(property.quotedRent).toLocaleString()}`
                  : "-"
              }
            />

            <Info
              label="Achievable Rent"
              value={
                property.achievableRent
                  ? `₹${Number(property.achievableRent).toLocaleString()}`
                  : "-"
              }
            />

            <Info
              label="CAM"
              value={
                property.quotedCAM
                  ? `₹${Number(property.quotedCAM).toLocaleString()}`
                  : "-"
              }
            />
          </div>
        </section>

        {/* Description */}
        {property.description && (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">About the Property</h2>

            <p className="text-gray-600 leading-7 whitespace-pre-line">
              {property.description}
            </p>
          </section>
        )}

        {/* Highlights */}
        {property.projectHighlights && (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Project Highlights</h2>

            <p className="text-gray-600 leading-7 whitespace-pre-line">
              {property.projectHighlights}
            </p>
          </section>
        )}

        {/* Amenities */}
        {property.amenities?.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Amenities</h2>

            <div className="flex flex-wrap gap-3">
              {property.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full bg-gray-100 text-gray-700"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        {property.contact?.name && (
          <section className="mt-10 rounded-2xl bg-gray-50 p-6">
            <h2 className="text-xl font-semibold mb-4">Contact</h2>

            <p className="font-medium">{property.contact.name}</p>

            {property.contact.phone && (
              <p className="text-gray-600 mt-1">{property.contact.phone}</p>
            )}
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-semibold mb-6">Similar Properties</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((item) => (
                <PropertyCard key={item.id} property={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-1 font-semibold text-gray-900">{value}</p>
    </div>
  );
}
