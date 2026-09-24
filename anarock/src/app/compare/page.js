"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    MapPin,
    Trash2,
} from "lucide-react";

import {
    formatPrice,
    formatArea,
} from "@/lib/format";

import { usePreferences } from "@/lib/preferences";

const COMPARE_STORAGE_KEY =
    "anarock_compare_properties";

const MAX_COMPARE_PROPERTIES = 3;

/* =========================================================
   CREATE SLUG
========================================================= */

const createSlug = (value) => {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[\/\\]+/g, "-")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

export default function ComparePage() {
    const {
        currency,
        unit,
        exchangeRates,
    } = usePreferences();

    const [properties, setProperties] =
        useState([]);

    /* =========================================================
       LOAD COMPARE PROPERTIES
    ========================================================= */

    useEffect(() => {
        try {
            const stored =
                localStorage.getItem(
                    COMPARE_STORAGE_KEY
                );

            if (!stored) {
                setProperties([]);
                return;
            }

            const parsed =
                JSON.parse(stored);

            if (!Array.isArray(parsed)) {
                setProperties([]);
                return;
            }

            setProperties(
                parsed.slice(
                    -MAX_COMPARE_PROPERTIES
                )
            );
        } catch (error) {
            console.error(
                "Unable to load comparison properties:",
                error
            );

            setProperties([]);
        }
    }, []);

    /* =========================================================
       PROPERTY ID
    ========================================================= */

    const getId = (property) => {
        return String(
            property?.id ||
            property?.rowId ||
            property?.ROWID ||
            property?.ID ||
            ""
        );
    };

    /* =========================================================
       PROPERTY NAME
    ========================================================= */

    const getName = (property) => {
        return (
            property?.name ||
            property?.Property_Name ||
            property?.propertyName ||
            property?.Name ||
            "Property"
        );
    };

    /* =========================================================
       PROPERTY SLUG
    ========================================================= */

    const getPropertySlug = (property) => {
        const existingSlug =
            property?.slug ||
            property?.Slug ||
            property?.propertySlug ||
            property?.Property_Slug;

        if (existingSlug) {
            return String(existingSlug);
        }

        return createSlug(
            getName(property)
        );
    };

    const getPropertyUrl = (property) => {
        const id = getId(property);
        const slug = getPropertySlug(property);

        if (!id) {
            return "/properties";
        }

        return `/properties/${encodeURIComponent(id)}/${encodeURIComponent(slug)}`;
    };
    const getImage = (property) => {
        const folder = String(
            property?.imageFolderPath ||
            property?.ImageFolderPath ||
            ""
        )
            .trim()
            .replace(/^\/+|\/+$/g, "");

        if (!folder) {
            return "";
        }

        return `https://property-images.zohostratus.in/${folder}/Project_Picture_1.jpg`;
    };

    const removeProperty = (id) => {
        const updatedProperties =
            properties.filter(
                (property) =>
                    getId(property) !==
                    String(id)
            );

        setProperties(
            updatedProperties
        );

        if (
            updatedProperties.length === 0
        ) {
            localStorage.removeItem(
                COMPARE_STORAGE_KEY
            );
            return;
        }

        localStorage.setItem(
            COMPARE_STORAGE_KEY,
            JSON.stringify(
                updatedProperties
            )
        );
    };

    /* =========================================================
       COMPARISON ROWS
    ========================================================= */

    const rows = [
        {
            label: "City",
            value: (property) =>
                property?.city ||
                property?.City ||
                "-",
        },

        {
            label: "Micromarket",
            value: (property) =>
                property?.micromarket ||
                property?.Micromarket ||
                property?.microMarket ||
                "-",
        },

        {
            label: "Area",
            value: (property) => {
                const area =
                    property?.areaSqft ??
                    property?.area ??
                    null;

                if (
                    area === null ||
                    area === "" ||
                    area === undefined
                ) {
                    return "-";
                }

                const numericArea =
                    Number(area);

                if (
                    !Number.isFinite(
                        numericArea
                    )
                ) {
                    return "-";
                }

                return formatArea(
                    numericArea,
                    unit
                );
            },
        },

        {
            label: "Seats",
            value: (property) =>
                property?.seats ??
                property?.Seats ??
                "-",
        },

        {
            label: "Type",
            value: (property) =>
                property?.buildingType ||
                property?.officeType ||
                property?.propertyType ||
                "-",
        },

        {
            label: "Price",
            value: (property) => {
                const price =
                    property?.price ??
                    property?.Price ??
                    null;

                if (
                    price === null ||
                    price === "" ||
                    price === undefined
                ) {
                    return "-";
                }

                const numericPrice =
                    Number(price);

                if (
                    !Number.isFinite(
                        numericPrice
                    )
                ) {
                    return "-";
                }

                return formatPrice(
                    numericPrice,
                    currency,
                    exchangeRates
                );
            },
        },
    ];

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 pb-20 sm:px-6 sm:py-8 lg:px-10">
            <div className="mx-auto max-w-7xl">

                {/* =====================================================
            BACK
        ===================================================== */}

                <Link
                    href="/properties"
                    className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-slate-600
            transition
            hover:text-[#A054A0]
          "
                >
                    <ArrowLeft className="h-4 w-4" />

                    Back to Properties
                </Link>

                {/* =====================================================
            HEADER
        ===================================================== */}

                <div className="mt-7 sm:mt-8">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A054A0] sm:text-xs">
                        Property Comparison
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                        Compare Properties
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                        Review the key details of your
                        selected properties side by side.
                    </p>
                </div>

                {/* =====================================================
            EMPTY STATE
        ===================================================== */}

                {properties.length === 0 ? (
                    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:mt-10 sm:p-10">
                        <h2 className="text-xl font-semibold text-slate-900">
                            No properties selected
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Return to the property list and
                            select up to three properties to
                            compare.
                        </p>

                        <Link
                            href="/properties"
                            className="
                mt-5
                inline-flex
                items-center
                rounded-xl
                bg-[#A054A0]
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#864286]
              "
                        >
                            Browse Properties
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-10 sm:rounded-3xl">

                        {/* =================================================
                PROPERTY CARDS

                MOBILE  = 1
                TABLET  = 2
                DESKTOP = 3
            ================================================= */}

                        <section className="p-3 sm:p-5 lg:p-6">
                            <div
                                className={`
                  grid
                  grid-cols-1
                  gap-4

                  ${properties.length >= 2
                                        ? "sm:grid-cols-2"
                                        : ""
                                    }

                  ${properties.length >= 3
                                        ? "lg:grid-cols-3"
                                        : ""
                                    }
                `}
                            >
                                {properties.map(
                                    (property) => {
                                        const propertyId =
                                            getId(property);

                                        const propertyName =
                                            getName(property);

                                        const imageUrl =
                                            getImage(property);

                                        const propertyUrl =
                                            getPropertyUrl(
                                                property
                                            );

                                        return (
                                            <article
                                                key={
                                                    propertyId
                                                }
                                                className="
                          group
                          relative
                          overflow-hidden
                          rounded-2xl
                          border
                          border-slate-200
                          bg-white
                          transition
                          duration-300
                          hover:-translate-y-0.5
                          hover:border-[#A054A0]/30
                          hover:shadow-lg
                        "
                                            >

                                                {/* =====================================
                            CLICKABLE IMAGE
                        ===================================== */}

                                                <Link
                                                    href={
                                                        propertyUrl
                                                    }
                                                    className="
                            relative
                            block
                            overflow-hidden
                            bg-slate-100
                            focus:outline-none
                            focus-visible:ring-2
                            focus-visible:ring-[#A054A0]
                            focus-visible:ring-offset-2
                          "
                                                    aria-label={`View ${propertyName}`}
                                                >
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={
                                                                propertyName
                                                            }
                                                            loading="lazy"
                                                            className="
                                h-48
                                w-full
                                object-cover
                                transition
                                duration-500
                                group-hover:scale-[1.03]
                                sm:h-52
                                lg:h-56
                              "
                                                            onError={(
                                                                event
                                                            ) => {
                                                                event.currentTarget.style.display =
                                                                    "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="flex h-48 items-center justify-center text-sm text-slate-400 sm:h-52 lg:h-56">
                                                            Image unavailable
                                                        </div>
                                                    )}

                                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                                </Link>

                                                {/* =====================================
                            REMOVE
                        ===================================== */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeProperty(
                                                            propertyId
                                                        )
                                                    }
                                                    className="
                            absolute
                            right-3
                            top-3
                            z-20
                            rounded-full
                            bg-white/95
                            p-2
                            text-slate-600
                            shadow-md
                            backdrop-blur
                            transition
                            hover:bg-white
                            hover:text-red-600
                          "
                                                    aria-label={`Remove ${propertyName}`}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>

                                                {/* =====================================
                            PROPERTY DETAILS
                        ===================================== */}

                                                <div className="p-4">
                                                    <Link
                                                        href={
                                                            propertyUrl
                                                        }
                                                        className="block"
                                                    >
                                                        <h2 className="truncate text-lg font-bold text-slate-950 transition group-hover:text-[#A054A0]">
                                                            {
                                                                propertyName
                                                            }
                                                        </h2>
                                                    </Link>

                                                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                                                        <MapPin className="h-3.5 w-3.5 shrink-0" />

                                                        <span className="truncate">
                                                            {property?.city ||
                                                                property?.City ||
                                                                "-"}
                                                        </span>
                                                    </p>

                                                    <Link
                                                        href={
                                                            propertyUrl
                                                        }
                                                        className="
                              mt-3
                              inline-flex
                              text-xs
                              font-semibold
                              text-[#A054A0]
                              transition
                              hover:text-[#864286]
                            "
                                                    >
                                                        View Property
                                                        <span className="ml-1">
                                                            →
                                                        </span>
                                                    </Link>
                                                </div>
                                            </article>
                                        );
                                    }
                                )}
                            </div>
                        </section>

                        {/* =================================================
                COMPARISON TABLE
            ================================================= */}

                        <section className="border-t border-slate-200">

                            {/* Mobile hint */}

                            {properties.length > 1 && (
                                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5 sm:hidden">
                                    <span className="text-[11px] font-medium text-slate-500">
                                        Swipe horizontally to
                                        compare
                                    </span>

                                    <span className="text-[11px] text-slate-400">
                                        {properties.length}{" "}
                                        properties
                                    </span>
                                </div>
                            )}

                            {/* Horizontal scroll on mobile/tablet */}

                            <div className="w-full overflow-x-auto overscroll-x-contain">
                                <div
                                    className={`
                    min-w-[720px]

                    ${properties.length === 1
                                            ? "sm:min-w-0"
                                            : ""
                                        }

                    ${properties.length === 2
                                            ? "lg:min-w-0"
                                            : ""
                                        }

                    ${properties.length === 3
                                            ? "lg:min-w-0"
                                            : ""
                                        }
                  `}
                                >

                                    {/* =========================================
                      TABLE HEADER
                  ========================================= */}

                                    <div
                                        className={`
                      grid
                      border-b
                      border-slate-200
                      bg-white

                      ${properties.length ===
                                                1
                                                ? "grid-cols-[140px_minmax(260px,1fr)]"
                                                : properties.length ===
                                                    2
                                                    ? "grid-cols-[140px_repeat(2,minmax(260px,1fr))]"
                                                    : "grid-cols-[140px_repeat(3,minmax(260px,1fr))]"
                                            }

                      sm:${properties.length ===
                                                1
                                                ? "grid-cols-[180px_minmax(0,1fr)]"
                                                : properties.length ===
                                                    2
                                                    ? "grid-cols-[180px_repeat(2,minmax(0,1fr))]"
                                                    : "grid-cols-[180px_repeat(3,minmax(0,1fr))]"
                                            }
                    `}
                                    >
                                        <div className="bg-slate-50 px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:px-6">
                                            Details
                                        </div>

                                        {properties.map(
                                            (property) => (
                                                <Link
                                                    key={`header-${getId(
                                                        property
                                                    )}`}
                                                    href={getPropertyUrl(
                                                        property
                                                    )}
                                                    className="
                            border-l
                            border-slate-100
                            px-4
                            py-4
                            text-sm
                            font-semibold
                            text-slate-800
                            transition
                            hover:text-[#A054A0]
                            sm:px-6
                          "
                                                >
                                                    <span className="block truncate">
                                                        {getName(
                                                            property
                                                        )}
                                                    </span>
                                                </Link>
                                            )
                                        )}
                                    </div>

                                    {/* =========================================
                      TABLE ROWS
                  ========================================= */}

                                    {rows.map((row) => (
                                        <div
                                            key={row.label}
                                            className={`
                        grid
                        border-b
                        border-slate-100
                        last:border-b-0

                        ${properties.length ===
                                                    1
                                                    ? "grid-cols-[140px_minmax(260px,1fr)]"
                                                    : properties.length ===
                                                        2
                                                        ? "grid-cols-[140px_repeat(2,minmax(260px,1fr))]"
                                                        : "grid-cols-[140px_repeat(3,minmax(260px,1fr))]"
                                                }

                        sm:${properties.length ===
                                                    1
                                                    ? "grid-cols-[180px_minmax(0,1fr)]"
                                                    : properties.length ===
                                                        2
                                                        ? "grid-cols-[180px_repeat(2,minmax(0,1fr))]"
                                                        : "grid-cols-[180px_repeat(3,minmax(0,1fr))]"
                                                }
                      `}
                                        >
                                            {/* LABEL */}

                                            <div
                                                className="
                          sticky
                          left-0
                          z-10
                          flex
                          min-h-[58px]
                          items-center
                          bg-slate-50
                          px-4
                          py-4
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-slate-500
                          sm:px-6
                          sm:text-xs
                        "
                                            >
                                                {
                                                    row.label
                                                }
                                            </div>

                                            {/* VALUES */}

                                            {properties.map(
                                                (property) => (
                                                    <div
                                                        key={`${row.label}-${getId(
                                                            property
                                                        )}`}
                                                        className="
                              flex
                              min-h-[58px]
                              items-center
                              border-l
                              border-slate-100
                              px-4
                              py-4
                              text-sm
                              font-medium
                              text-slate-800
                              sm:px-6
                            "
                                                    >
                                                        {row.value(
                                                            property
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* =====================================================
            MOBILE TABLE HINT
        ===================================================== */}

                {properties.length > 1 && (
                    <p className="mt-3 text-center text-[11px] text-slate-400 sm:hidden">
                        ← Swipe left or right to compare
                        property details →
                    </p>
                )}
            </div>
        </main>
    );
}