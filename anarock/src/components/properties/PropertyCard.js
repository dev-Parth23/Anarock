"use client";

import Image from "next/image";
import Link from "next/link";
import { usePreferences } from "@/lib/preferences";
import { formatPrice, formatArea } from "@/lib/format";

function createSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getStratusImageUrl(imageFolderPath, filename) {
  if (!imageFolderPath || !filename) return "";

  const folder = String(imageFolderPath)
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  if (!folder) return "";

  return `https://property-images.zohostratus.in/${folder}/${encodeURIComponent(
    filename,
  )}`;
}

export default function PropertyCard({ property }) {
  const { currency, unit, exchangeRates } = usePreferences();

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

  const imageUrl = getStratusImageUrl(
    property?.imageFolderPath,
    "Project_Picture_1.jpg",
  );

  const areaValue = Number(property?.areaSqft);
  const priceValue = Number(property?.price);

  const hasArea = property?.areaSqft && Number.isFinite(areaValue);
  const hasPrice = property?.price && Number.isFinite(priceValue);

  return (
    <Link href={propertyUrl} className="group block h-full">
      <article className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* IMAGE */}
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={propertyName}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              Image unavailable
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/20 to-transparent" />

          {/* HEART */}
          <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 group-hover:scale-105">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-800"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4">
          {/* PROPERTY NAME */}
          <h3
            className="truncate text-lg font-semibold tracking-tight text-slate-950"
            title={propertyName}
          >
            {propertyName}
          </h3>

          {/* LOCATION */}
          <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0"
            >
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>

            <p className="line-clamp-2 leading-5">
              {property?.city || "-"}
              {property?.micromarket ? ` • ${property.micromarket}` : ""}
            </p>
          </div>

          {/* DETAILS GRID */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {/* AREA */}
            <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Area</span>
              </div>

              <p className="mt-1 truncate text-sm font-medium text-slate-800">
                {hasArea ? formatArea(areaValue, unit) : "-"}
              </p>
            </div>

            {/* SEATS */}
            <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Seats</span>
              </div>

              <p className="mt-1 truncate text-sm font-medium text-slate-800">
                {property?.seats || "-"}
              </p>
            </div>

            {/* TYPE */}
            <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Type</span>
              </div>

              <p
                className="mt-1 truncate text-sm font-medium text-slate-800"
                title={property?.buildingType || property?.officeType || "-"}
              >
                {property?.buildingType || property?.officeType || "-"}
              </p>
            </div>

            {/* PRICE */}
            <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Price</span>
              </div>

              <p className="mt-1 truncate text-sm font-medium text-slate-800">
                {hasPrice
                  ? formatPrice(priceValue, currency, exchangeRates)
                  : "-"}
              </p>
            </div>
          </div>

          {/* BOTTOM PRICE */}
          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400">Property Price</p>

                <p className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-950">
                  {hasPrice
                    ? formatPrice(priceValue, currency, exchangeRates)
                    : "-"}
                </p>
              </div>

              {/* ARROW */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A054A0]/10 text-[#A054A0] transition-all duration-300 group-hover:bg-[#A054A0] group-hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </div>

            <p className="mt-2 text-xs font-medium text-[#A054A0]">
              View Details
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
