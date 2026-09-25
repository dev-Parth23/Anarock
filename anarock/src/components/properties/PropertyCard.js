"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
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
    filename,
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

  const normalizedProperty = Object.keys(property).reduce((acc, key) => {
    acc[normalizeFieldName(key)] = property[key];
    return acc;
  }, {});

  for (const field of fields) {
    const normalizedField = normalizeFieldName(field);
    const value = normalizedProperty[normalizedField];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return fallback;
}

export default function PropertyCard({
  property,
  isCompared = false,
  onCompareToggle,
  isShortlisted = false,
  onShortlistToggle,
}) {
  const { unit } = usePreferences();
  const { ids, toggle } = useWishlist();
  const getPropertyId = (value) =>
    String(value?.id || value?.rowId || value?.ROWID || value?.ID || "");

  const propertyId = getPropertyId(property);

  const contextWishlisted = ids.some((id) => String(id) === propertyId);

  const isWishlisted = Boolean(isShortlisted) || contextWishlisted;
  const propertyName = String(
    property?.name ||
    property?.Property_Name ||
    property?.propertyName ||
    property?.Name ||
    "Property",
  );

  const propertySlug = createSlug(propertyName);

  const propertyUrl = propertyId
    ? `/properties/${encodeURIComponent(
      propertyId,
    )}/${encodeURIComponent(propertySlug)}`
    : "/properties";

  const imageUrl = getStratusImageUrl(
    property?.imageFolderPath || property?.ImageFolderPath,
    "Project_Picture_1.jpg",
  );

  const city = property?.city || property?.City || "";

  const micromarket =
    property?.micromarket ||
    property?.Micromarket ||
    property?.microMarket ||
    "";

  const location = [city, micromarket].filter(Boolean).join(" • ");

  const propertyType = String(
    getFirstValue(
      property,
      ["officeType", "OfficeType", "type", "propertyType", "PropertyType"],
      "",
    ),
  )
    .trim()
    .toLowerCase();

  const isCoworking =
    propertyType.includes("cowork") || propertyType.includes("managed office");

  const developer = getFirstValue(
    property,
    ["developer", "Developer", "developerName", "Developer Name"],
    "-",
  );

  const areaValue = Number(
    property?.areaSqft ?? property?.AreaSqft ?? property?.area,
  );

  const hasArea = Number.isFinite(areaValue) && areaValue > 0;

  const seatsOffered = getFirstValue(
    property,
    [
      "seatsOffered",
      "NoOfSeatsOffered",
      "noOfSeatsOffered",
      "noofseatsoffered",
      "seats",
      "Seats",
    ],
    "-",
  );

  const operator = getFirstValue(
    property,
    ["operator", "Operator", "operatorName", "OperatorName", "Operator Name"],
    "-",
  );

  const handleCompareClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!propertyId || typeof onCompareToggle !== "function") {
      return;
    }

    onCompareToggle(property);
  };

  const handleShortlistClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!propertyId) {
      return;
    }

    if (typeof onShortlistToggle === "function") {
      onShortlistToggle(property);
      return;
    }

    toggle(propertyId);
  };

  return (
    <article
      className="
        group
        relative
        z-0
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-[#E8E3DC]
        bg-white
        shadow-[0_4px_20px_rgba(39,29,23,0.04)]
        transition-all
        duration-500
        ease-out
        hover:z-20
        hover:-translate-y-1
        hover:shadow-[0_16px_40px_rgba(39,29,23,0.10)]
      "
    >
      <div className="relative overflow-hidden bg-[#F8F7F5] p-2.5 sm:p-3">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F3F1EE]">
          <Link
            href={propertyUrl}
            aria-label={`View details of ${propertyName}`}
            className="absolute inset-0 z-10 block"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={propertyName}
                fill
                priority
                unoptimized
                className="
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-[1.035]
                "
                sizes="
                  (max-width: 640px) 100vw,
                  (max-width: 1024px) 50vw,
                  33vw
                "
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-[#9B948C]">
                Image unavailable
              </div>
            )}
          </Link>

          <div className="pointer-events-none absolute inset-0 z-[11] bg-gradient-to-t from-black/[0.08] to-transparent" />

          <div
            className="absolute left-3 top-3 z-[50]"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={Boolean(isCompared)}
              aria-label={
                isCompared
                  ? `Remove ${propertyName} from comparison`
                  : `Compare ${propertyName}`
              }
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={handleCompareClick}
              className={`
                flex
                min-h-[34px]
                items-center
                gap-2
                rounded-lg
                border
                px-2.5
                py-1.5
                text-[10px]
                font-semibold
                tracking-wide
                shadow-md
                backdrop-blur-md
                transition-all
                duration-200
                ${isCompared
                  ? "border-[#A054A0] bg-[#A054A0] text-white"
                  : "border-white/70 bg-white/95 text-[#403744] hover:border-[#A054A0] hover:text-[#A054A0]"
                }
              `}
            >
              <span
                className={`
                  flex
                  h-3.5
                  w-3.5
                  items-center
                  justify-center
                  rounded-[3px]
                  border
                  text-[9px]
                  leading-none
                  ${isCompared
                    ? "border-white bg-white text-[#A054A0]"
                    : "border-[#A054A0] bg-white"
                  }
                `}
              >
                {isCompared ? "✓" : ""}
              </span>

              <span>Compare</span>
            </button>
          </div>

          <button
            type="button"
            aria-label={
              isWishlisted ? "Remove from shortlist" : "Add to shortlist"
            }
            aria-pressed={isWishlisted}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={handleShortlistClick}
            className={`
              absolute
              right-3
              top-3
              z-[50]
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              border
              shadow-md
              backdrop-blur-md
              transition-all
              duration-200
              ${isWishlisted
                ? "border-[#A054A0] bg-[#A054A0] text-white"
                : "border-white/70 bg-white/95 text-[#403744] hover:border-[#A054A0] hover:bg-[#A054A0] hover:text-white"
              }
            `}
          >
            <Heart
              className="h-[17px] w-[17px]"
              strokeWidth={1.7}
              fill={isWishlisted ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>

      <Link
        href={propertyUrl}
        aria-label={`View details of ${propertyName}`}
        className="flex flex-1 flex-col px-4 pb-4 pt-4 sm:px-5 sm:pb-5"
      >
        {/* PROPERTY TYPE */}

        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A054A0]">
            {isCoworking
              ? "Managed Office/Co-working Property"
              : "Conventional Property"}
          </span>
        </div>

        {/* PROPERTY NAME */}

        <h3
          className="
            line-clamp-2
            min-h-[50px]
            text-[21px]
            font-bold
            leading-[1.2]
            tracking-[-0.025em]
            text-[#241B2B]
            transition-colors
            duration-300
            group-hover:text-[#A054A0]
            sm:text-[23px]
          "
          title={propertyName}
        >
          {propertyName}
        </h3>

        {/* LOCATION */}

        <div className="flex min-w-0 items-center gap-1.5">
          <MapPin
            className="h-3.5 w-3.5 shrink-0 text-[#A054A0]"
            strokeWidth={1.7}
          />

          <p className="line-clamp-2 min-w-0 text-[11px] leading-[1.65] text-[#7D7482] sm:text-base">
            {location || "Location unavailable"}
          </p>
        </div>

        {/* DIVIDER */}

        <div className="my-4 h-px bg-[#EEE9E4]" />

        {/* DYNAMIC PROPERTY DETAILS */}

        <div className="grid grid-cols-2 gap-3">
          {isCoworking ? (
            <>
              {/* OPERATOR */}

              <div className="min-w-0 border-l border-[#EEE9E4] pl-3 sm:pl-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A69BAA]">
                  Operator
                </p>

                <p
                  className="mt-1.5 line-clamp-2 text-xs font-semibold leading-[1.6] text-[#302538] sm:text-[13px]"
                  title={String(operator)}
                >
                  {operator}
                </p>
              </div>

              {/* SEATS */}

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A69BAA]">
                  Seats Offered
                </p>

                <p className="mt-1.5 truncate text-xs font-semibold leading-[1.6] text-[#302538] sm:text-[13px]">
                  {seatsOffered}
                </p>
              </div>
            </>
          ) : (
            <>
              {/* DEVELOPER */}

              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A69BAA]">
                  Developer
                </p>

                <p
                  className="mt-1.5 line-clamp-2 text-xs font-semibold leading-[1.6] text-[#302538] sm:text-[13px]"
                  title={String(developer)}
                >
                  {developer}
                </p>
              </div>

              {/* AREA */}

              <div className="min-w-0 border-l border-[#EEE9E4] pl-3 sm:pl-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A69BAA]">
                  Area
                </p>

                <p className="mt-1.5 truncate text-xs font-semibold leading-[1.6] text-[#302538] sm:text-[13px]">
                  {hasArea ? formatArea(areaValue, unit) : "-"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* VIEW DETAILS */}

        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="h-px w-4 bg-[#DCCBE2]" />

          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9A88A5] transition-colors duration-300 group-hover:text-[#A054A0]">
            View Property Details
          </p>

          <span className="h-px w-4 bg-[#DCCBE2]" />
        </div>
      </Link>
    </article>
  );
}
