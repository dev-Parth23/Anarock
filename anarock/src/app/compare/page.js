"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Trash2 } from "lucide-react";
import { formatPrice, formatArea } from "@/lib/format";
import { usePreferences } from "@/lib/preferences";

export default function ComparePage() {
    const { currency, unit, exchangeRates } = usePreferences();

    const [properties, setProperties] = useState([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(
                "anarock_compare_properties",
            );

            const parsed = stored ? JSON.parse(stored) : [];

            setProperties(
                Array.isArray(parsed) ? parsed.slice(-2) : [],
            );
        } catch (error) {
            console.error(
                "Unable to load comparison properties:",
                error,
            );

            setProperties([]);
        }
    }, []);

    const getId = (property) =>
        String(
            property?.id ||
            property?.rowId ||
            property?.ROWID ||
            "",
        );

    const getName = (property) =>
        property?.name ||
        property?.Property_Name ||
        "Property";

    const getImage = (property) => {
        const folder = String(
            property?.imageFolderPath || "",
        ).replace(/^\/+|\/+$/g, "");

        if (!folder) return "";

        return `https://property-images.zohostratus.in/${folder}/Project_Picture_1.jpg`;
    };

    const removeProperty = (id) => {
        const updatedProperties = properties.filter(
            (property) => getId(property) !== String(id),
        );

        setProperties(updatedProperties);

        if (updatedProperties.length === 0) {
            localStorage.removeItem(
                "anarock_compare_properties",
            );
        } else {
            localStorage.setItem(
                "anarock_compare_properties",
                JSON.stringify(updatedProperties),
            );
        }
    };

    const rows = [
        {
            label: "City",
            value: (property) => property?.city || "-",
        },
        {
            label: "Micromarket",
            value: (property) => property?.micromarket || "-",
        },
        {
            label: "Area",
            value: (property) =>
                property?.areaSqft
                    ? formatArea(Number(property.areaSqft), unit)
                    : "-",
        },
        {
            label: "Seats",
            value: (property) => property?.seats || "-",
        },
        {
            label: "Type",
            value: (property) =>
                property?.buildingType ||
                property?.officeType ||
                "-",
        },
        {
            label: "Price",
            value: (property) =>
                property?.price
                    ? formatPrice(
                        Number(property.price),
                        currency,
                        exchangeRates,
                    )
                    : "-",
        },
    ];

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">
                {/* BACK BUTTON */}
                <Link
                    href="/properties"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#A054A0]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Properties
                </Link>

                {/* HEADER */}
                <div className="mt-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A054A0]">
                        Property Comparison
                    </p>

                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                        Compare Properties
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm text-slate-500">
                        Review the key details of your selected properties
                        side by side.
                    </p>
                </div>

                {/* EMPTY STATE */}
                {properties.length === 0 ? (
                    <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-slate-900">
                            No properties selected
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Return to the property list and select up to two
                            properties.
                        </p>

                        <Link
                            href="/properties"
                            className="mt-5 inline-flex rounded-xl bg-[#A054A0] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#864286]"
                        >
                            Browse Properties
                        </Link>
                    </div>
                ) : (
                    <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        {/* PROPERTY CARDS */}
                        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6">
                            {properties.map((property) => (
                                <div
                                    key={getId(property)}
                                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                                >
                                    {getImage(property) ? (
                                        <img
                                            src={getImage(property)}
                                            alt={getName(property)}
                                            className="h-48 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-48 items-center justify-center text-sm text-slate-400">
                                            Image unavailable
                                        </div>
                                    )}

                                    {/* REMOVE BUTTON */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeProperty(getId(property))
                                        }
                                        className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-slate-600 shadow transition hover:text-red-600"
                                        aria-label={`Remove ${getName(property)}`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    <div className="p-4">
                                        <h2 className="truncate text-lg font-bold text-slate-950">
                                            {getName(property)}
                                        </h2>

                                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {property?.city || "-"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* COMPARISON TABLE */}
                        <div className="overflow-x-auto border-t border-slate-200">
                            <div className="min-w-[520px]">
                                {rows.map((row) => (
                                    <div
                                        key={row.label}
                                        className="grid grid-cols-3 border-b border-slate-100 last:border-b-0"
                                    >
                                        <div className="bg-slate-50 px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 sm:px-6">
                                            {row.label}
                                        </div>

                                        {properties.map((property) => (
                                            <div
                                                key={`${row.label}-${getId(property)}`}
                                                className="px-4 py-4 text-sm font-medium text-slate-800 sm:px-6"
                                            >
                                                {row.value(property)}
                                            </div>
                                        ))}

                                        {properties.length === 1 && (
                                            <div className="px-4 py-4 text-sm text-slate-300 sm:px-6">
                                                —
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}