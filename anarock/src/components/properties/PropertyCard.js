"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, ArrowUpRight } from "lucide-react";
import { usePreferences } from "@/lib/preferences";
import { useWishlist } from "@/lib/wishlist";
import { formatArea } from "@/lib/format";

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
    filename
  )}`;
}

function normalizeFieldName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getFirstValue(property, fields, fallback = "-") {
  if (!property || typeof property !== "object") {
    return fallback;
  }

  const normalizedProperty = Object.keys(property).reduce(
    (acc, key) => {
      acc[normalizeFieldName(key)] = property[key];
      return acc;
    },
    {}
  );

  for (const field of fields) {
    const normalizedField = normalizeFieldName(field);
    const value = normalizedProperty[normalizedField];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return fallback;
}

export default function PropertyCard({
  property,
  isCompared = false,
  onCompareToggle,
}) {
  const { unit } = usePreferences();
  const { ids, toggle } = useWishlist();

  const propertyId = String(property?.id || "");
  const isWishlisted = ids.includes(propertyId);

  const propertyName = String(property?.name || "Property");
  const propertySlug = createSlug(propertyName);

  const propertyUrl = `/properties/${encodeURIComponent(
    propertyId
  )}/${encodeURIComponent(propertySlug)}`;

  const imageUrl = getStratusImageUrl(
    property?.imageFolderPath,
    "Project_Picture_1.jpg"
  );

  const city = property?.city || "";
  const micromarket = property?.micromarket || "";

  const location = [city, micromarket]
    .filter(Boolean)
    .join(" • ");

  // ================= PROPERTY TYPE =================

  const propertyType = String(
    getFirstValue(
      property,
      [
        "officeType",
        "OfficeType",
        "type",
        "propertyType",
      ],
      ""
    )
  )
    .trim()
    .toLowerCase();

  const isCoworking =
    propertyType.includes("cowork") ||
    propertyType.includes("managed office");

  const developer = getFirstValue(
    property,
    [
      "developer",
      "Developer",
      "developerName",
      "Developer Name",
    ],
    "-"
  );

  // ================= AREA =================

  const areaValue = Number(property?.areaSqft);

  const hasArea =
    property?.areaSqft !== null &&
    property?.areaSqft !== undefined &&
    property?.areaSqft !== "" &&
    Number.isFinite(areaValue);

  // ================= SEATS OFFERED =================

  const seatsOffered = getFirstValue(
    property,
    [
      "seatsOffered",
      "NoOfSeatsOffered",
      "noOfSeatsOffered",
      "noofseatsoffered",
    ],
    "-"
  );

  // ================= OPERATOR =================

  const operator = getFirstValue(
    property,
    [
      "operator",
      "Operator",
      "operatorName",
      "OperatorName",
      "Operator Name",
    ],
    "-"
  );

  return (
    <Link
      href={propertyUrl}
      className="group block h-full"
      aria-label={`View details of ${propertyName}`}
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E8E3DC] bg-white shadow-[0_4px_20px_rgba(39,29,23,0.04)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(39,29,23,0.10)]">

        <div className="relative overflow-hidden bg-[#F8F7F5] p-2.5 sm:p-3">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F3F1EE]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={propertyName}
                fill
                priority
                unoptimized
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-[#9B948C]">
                Image unavailable
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.08] to-transparent" />
            <div
              className="absolute left-3 top-3 z-20"
              onClick={(event) => event.stopPropagation()}
            >
              <label
                className={`flex min-h-[32px] cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[10px] font-medium tracking-wide shadow-sm backdrop-blur-md transition-all duration-300 ${isCompared
                  ? "border-[#A054A0] bg-[#A054A0] text-white"
                  : "border-white/70 bg-white/95 text-[#403744] hover:border-[#A054A0]"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={isCompared}
                  onChange={(event) => {
                    event.stopPropagation();
                    onCompareToggle?.(property);
                  }}
                  onClick={(event) => event.stopPropagation()}
                  className="h-3.5 w-3.5 cursor-pointer accent-[#A054A0]"
                  aria-label={`Compare ${propertyName}`}
                />

                <span>Compare</span>
              </label>
            </div>

            {/* ================= SHORTLIST ================= */}

            <button
              type="button"
              aria-label={
                isWishlisted
                  ? "Remove from shortlist"
                  : "Add to shortlist"
              }
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggle(property);
              }}
              className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm backdrop-blur-md transition-all duration-300 ${isWishlisted
                ? "border-[#A054A0] bg-[#A054A0] text-white"
                : "border-white/70 bg-white/95 text-[#403744] hover:border-[#A054A0] hover:bg-[#A054A0] hover:text-white"
                }`}
            >
              <Heart
                className="h-[17px] w-[17px]"
                strokeWidth={1.7}
                fill={isWishlisted ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>

        {/* ================= CONTENT SECTION ================= */}

        <div className="flex flex-1 flex-col px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A054A0]">
              {isCoworking
                ? "Managed Office/Co-working Property"
                : "Conventional Property"}
            </span>
          </div>

          {/* ================= PROPERTY NAME ================= */}

          <h3
            className="line-clamp-2 min-h-[50px] text-[21px] font-bold leading-[1.2] tracking-[-0.025em] text-[#241B2B] transition-colors duration-300 group-hover:text-[#A054A0] sm:text-[23px]"
            title={propertyName}
          >
            {propertyName}
          </h3>

          {/* ================= LOCATION ================= */}

          <div className="flex min-w-0 items-center gap-1.5">
            <MapPin
              className="h-3.5 w-3.5 shrink-0 text-[#A054A0]"
              strokeWidth={1.7}
            />

            <p className="line-clamp-2 min-w-0 text-[11px] leading-[1.65] text-[#7D7482] sm:text-base">
              {location || "Location unavailable"}
            </p>
          </div>

          {/* ================= DIVIDER ================= */}

          <div className="my-4 h-px bg-[#EEE9E4]" />

          {/* ================= DYNAMIC PROPERTY DETAILS ================= */}

          <div className="grid grid-cols-2 gap-3">
            {isCoworking ? (
              <>
                {/* OPERATOR */}
                <div className="min-w-0 border-l border-[#EEE9E4] pl-3 sm:pl-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A69BAA]">Operator</p>
                  <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-[1.6] text-[#302538] sm:text-[13px]" title={String(operator)}>{operator}</p>
                </div>
                {/* SEATS OFFERED */}
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A69BAA]">Seats Offered</p>
                  <p className="mt-1.5 truncate text-xs font-semibold leading-[1.6] text-[#302538] sm:text-[13px]">{seatsOffered}</p>
                </div>
              </>
            ) : (
              <>
                {/* DEVELOPER */}
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A69BAA]">Developer</p>
                  <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-[1.6] text-[#302538] sm:text-[13px]" title={String(developer)}>{developer}</p>
                </div>
                {/* AREA */}
                <div className="min-w-0 border-l border-[#EEE9E4] pl-3 sm:pl-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A69BAA]">Area</p>
                  <p className="mt-1.5 truncate text-xs font-semibold leading-[1.6] text-[#302538] sm:text-[13px]">{hasArea ? formatArea(areaValue, unit) : "-"}</p>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-[#EDE5F0] bg-[#FBF8FC] p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#302538] sm:text-[13px]">Price on Request</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="h-px w-4 bg-[#DCCBE2]" />
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9A88A5] transition-colors duration-300 group-hover:text-[#A054A0]">
              View Property Details
            </p>
            <span className="h-px w-4 bg-[#DCCBE2]" />
          </div>
        </div>
      </article>
    </Link>
  );
}