"use client";

import Image from "next/image";
import Link from "next/link";

function createSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getStratusImageUrl(imageFolderPath, filename) {
  if (!imageFolderPath || !filename) {
    return "";
  }

  const folder = String(imageFolderPath)
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  if (!folder) {
    return "";
  }

  return `https://property-images.zohostratus.in/${folder}/${encodeURIComponent(
    filename,
  )}`;
}

export default function PropertyCard({ property }) {
  console.log("PROPERTY CARD:", property);

  const propertyId = String(
    property?.id || property?.rowId || property?.ROWID || "",
  );

  const propertyName = String(
    property?.name || property?.Property_Name || "property",
  );

  const propertySlug = createSlug(propertyName);

  const propertyUrl = `/properties/${encodeURIComponent(
    propertyId,
  )}/${encodeURIComponent(propertySlug)}`;

  console.log(property);
  const imageUrl =
    "https://property-images.zohostratus.in/" +
      property?.imageFolderPath +
      "Project_Picture_1.jpg" ||
    "https://property-images.zohostratus.in/" +
      property?.imageFolderPath +
      "Floor_Plan_1.jpg" ||
    "https://property-images.zohostratus.in/" +
      property?.imageFolderPath +
      "Property_Photo_1.jpgpg";

  console.log("PROPERTY IMAGE URL:", imageUrl);

  return (
    <Link href={propertyUrl} className="block group">
      <article className="overflow-hidden rounded-2xl border bg-white hover:shadow-lg transition-shadow">
        <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageUrl}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Image unavailable
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {propertyName}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {property?.city || "-"}
            {property?.micromarket ? ` • ${property.micromarket}` : ""}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
            <div>
              <p className="text-gray-400">Area</p>

              <p className="font-medium">
                {property?.areaSqft
                  ? `${Number(property.areaSqft).toLocaleString()} sq.ft`
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Seats</p>

              <p className="font-medium">{property?.seats || "-"}</p>
            </div>

            <div>
              <p className="text-gray-400">Type</p>

              <p className="font-medium">
                {property?.buildingType || property?.officeType || "-"}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Price</p>

              <p className="font-medium">
                {property?.price
                  ? `₹${Number(property.price).toLocaleString()}`
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
