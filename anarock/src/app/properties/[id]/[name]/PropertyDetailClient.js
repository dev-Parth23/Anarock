"use client";

import { usePreferences } from "@/lib/preferences";
import { formatPrice, formatArea } from "@/lib/format";
import { useEffect, useState } from "react";
import Image from "next/image";
import PropertyCard from "@/components/properties/PropertyCard";

const IMAGE_BASE_URL = "https://property-images.zohostratus.in";

const IMAGE_FILES = [
  {
    key: "project",
    name: "Project Picture 1",
    filename: "Project_Picture_1.jpg",
  },
  {
    key: "floor-plan",
    name: "Floor Plan 1",
    filename: "Floor_Plan_1.jpg",
  },
  {
    key: "property-1",
    name: "Property Photo 1",
    filename: "Property_Photo_1.jpg",
  },
  {
    key: "property-2",
    name: "Property Photo 2",
    filename: "Property_Photo_2.jpg",
  },
  {
    key: "property-3",
    name: "Property Photo 3",
    filename: "Property_Photo_3.jpg",
  },
  {
    key: "property-4",
    name: "Property Photo 4",
    filename: "Property_Photo_4.jpg",
  },
  {
    key: "property-5",
    name: "Property Photo 5",
    filename: "Property_Photo_5.jpg",
  },
  {
    key: "property-6",
    name: "Property Photo 6",
    filename: "Property_Photo_6.jpg",
  },
  {
    key: "property-7",
    name: "Property Photo 7",
    filename: "Property_Photo_7.jpg",
  },
  {
    key: "property-8",
    name: "Property Photo 8",
    filename: "Property_Photo_8.jpg",
  },
  {
    key: "property-9",
    name: "Property Photo 9",
    filename: "Property_Photo_9.jpg",
  },
  {
    key: "property-10",
    name: "Property Photo 10",
    filename: "Property_Photo_10.jpg",
  },
];

export default function PropertyDetailClient({ propertyId }) {
  const [property, setProperty] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [activeImg, setActiveImg] = useState("project");
  const [related, setRelated] = useState([]);
  const { currency, unit, exchangeRates } = usePreferences();
  const [failedImages, setFailedImages] = useState(new Set());

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

        const imageFolderPath = String(
          propertyData.imageFolderPath || "",
        ).replace(/^\/+|\/+$/g, "");

        const images = imageFolderPath
          ? IMAGE_FILES.map((image) => ({
              ...image,
              url: `${IMAGE_BASE_URL}/${imageFolderPath}/${image.filename}`,
            }))
          : [];

        setProperty({
          ...propertyData,
          image: images.find((image) => image.key === "project")?.url || "",
        });

        setGallery(images);
        setActiveImg("project");
        setFailedImages(new Set());

        console.log("Property", propertyData);
        console.log("Image Folder Path", imageFolderPath);
        console.log("Gallery Images", images);

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

  const handleImageError = (imageKey) => {
    setFailedImages((previous) => {
      const updated = new Set(previous);
      updated.add(imageKey);
      return updated;
    });

    if (activeImg === imageKey) {
      const nextImage = gallery.find(
        (image) => image.key !== imageKey && !failedImages.has(image.key),
      );

      if (nextImage) {
        setActiveImg(nextImage.key);
      }
    }
  };

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

  const availableGallery = gallery.filter(
    (image) => !failedImages.has(image.key),
  );

  const activeImage =
    gallery.find((image) => image.key === activeImg)?.url ||
    property.image ||
    "";

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
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

        <section className="mt-6">
          <div className="relative w-full overflow-hidden rounded-[24px] bg-gray-100">
            <div className="relative aspect-[16/9] md:aspect-[21/10]">
              {activeImage ? (
                <Image
                  key={activeImg}
                  src={activeImage}
                  alt={property.name || "Property image"}
                  fill
                  priority
                  className="object-contain transition-opacity duration-300"
                  sizes="(max-width: 768px) 100vw, 1200px"
                  onError={() => handleImageError(activeImg)}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  Image unavailable
                </div>
              )}

              <div className="absolute bottom-4 right-4 rounded-full bg-black/65 px-4 py-2 text-xs font-medium text-white backdrop-blur-md">
                {Math.max(
                  1,
                  availableGallery.findIndex(
                    (image) => image.key === activeImg,
                  ) + 1,
                )}{" "}
                / {availableGallery.length}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div
              className="
        flex
        gap-3
        overflow-x-auto
        pb-3
        scrollbar-thin
        scrollbar-thumb-gray-300
        scrollbar-track-transparent
      "
            >
              {availableGallery.map((image, index) => {
                const isActive = activeImg === image.key;

                return (
                  <button
                    key={image.key}
                    type="button"
                    onClick={() => setActiveImg(image.key)}
                    aria-label={`View ${image.name}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`
              relative
              flex-shrink-0
              overflow-hidden
              rounded-2xl
              border-2
              transition-all
              duration-300
              focus:outline-none
              focus:ring-2
              focus:ring-[#A054A0]
              ${
                isActive
                  ? "border-[#A054A0] scale-95 shadow-lg"
                  : "border-transparent opacity-70 hover:opacity-100"
              }
            `}
                  >
                    <div className="relative h-20 w-28 sm:h-24 sm:w-36">
                      <Image
                        src={image.url}
                        alt={image.name}
                        fill
                        className="object-contain"
                        sizes="144px"
                        onError={() => handleImageError(image.key)}
                      />

                      {/* Active Overlay */}
                      {isActive && (
                        <div className="absolute inset-0 bg-[#A054A0]/10" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {availableGallery.length > 4 && (
              <p className="mt-1 text-xs text-gray-400">
                Swipe or scroll to view all images →
              </p>
            )}
          </div>
        </section>

        {/* Basic Information */}
        <section className="mt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Info
              label="Area"
              value={
                property.areaSqft ? formatArea(property.areaSqft, unit) : "-"
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
                  ? formatPrice(property.quotedRent, currency, exchangeRates)
                  : "-"
              }
            />

            <Info
              label="Achievable Rent"
              value={
                property.achievableRent
                  ? formatPrice(
                      property.achievableRent,
                      currency,
                      exchangeRates,
                    )
                  : "-"
              }
            />

            <Info
              label="CAM"
              value={
                property.quotedCAM
                  ? formatPrice(property.quotedCAM, currency, exchangeRates)
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
