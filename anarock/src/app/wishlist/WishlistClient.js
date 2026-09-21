"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Breadcrumbs from "@/components/common/Breadcrumbs";
import PropertyCard from "@/components/properties/PropertyCard";
import { useWishlist } from "@/lib/wishlist";
import { usePreferences } from "@/lib/preferences";

import {
  Heart,
  ArrowRight,
  GitCompare,
  X,
} from "lucide-react";

const COMPARE_STORAGE_KEY = "anarock_compare_properties";

export default function WishlistClient() {
  const router = useRouter();

  const { items, count } = useWishlist();
  const { currency, unit } = usePreferences();

  const [compareSelection, setCompareSelection] = useState([]);

  // Get unique property ID
  const getPropertyId = (property) =>
    String(
      property?.id ||
      property?.rowId ||
      property?.ROWID ||
      property?.ID ||
      ""
    );

  // Load comparison properties from localStorage
  useEffect(() => {
    try {
      const savedProperties = localStorage.getItem(
        COMPARE_STORAGE_KEY
      );

      if (savedProperties) {
        const parsedProperties = JSON.parse(savedProperties);

        if (Array.isArray(parsedProperties)) {
          setCompareSelection(parsedProperties.slice(-2));
        }
      }
    } catch (error) {
      console.error(
        "Failed to load comparison properties:",
        error
      );
    }
  }, []);

  // Toggle comparison
  const handleCompareToggle = (property) => {
    const propertyId = getPropertyId(property);

    if (!propertyId) return;

    setCompareSelection((previousSelection) => {
      const alreadySelected = previousSelection.some(
        (item) => getPropertyId(item) === propertyId
      );

      let updatedSelection;

      if (alreadySelected) {
        updatedSelection = previousSelection.filter(
          (item) => getPropertyId(item) !== propertyId
        );
      } else {
        updatedSelection = [
          ...previousSelection,
          property,
        ].slice(-2);
      }

      localStorage.setItem(
        COMPARE_STORAGE_KEY,
        JSON.stringify(updatedSelection)
      );

      return updatedSelection;
    });
  };

  // Clear comparison
  const clearCompareSelection = () => {
    setCompareSelection([]);

    localStorage.removeItem(COMPARE_STORAGE_KEY);
  };

  // Open comparison page
  const openComparePage = () => {
    if (compareSelection.length !== 2) return;

    localStorage.setItem(
      COMPARE_STORAGE_KEY,
      JSON.stringify(compareSelection)
    );

    router.push("/compare");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-6 pb-32 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Properties", href: "/properties" },
            { label: "Shortlisted Properties" },
          ]}
        />

        {/* Header */}
        <section className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Heart className="h-5 w-5 fill-[#A054A0] text-[#A054A0]" />

              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#A054A0]">
                Your Collection
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Shortlisted Properties
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              {count} saved propert{count === 1 ? "y" : "ies"}
            </p>
          </div>

          <Link
            href="/properties"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#A054A0] hover:text-[#A054A0]"
          >
            Explore Properties
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Properties */}
        {items.length > 0 ? (
          <section className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((property) => (
              <PropertyCard
                key={getPropertyId(property)}
                property={property}
                isCompared={compareSelection.some(
                  (item) =>
                    getPropertyId(item) ===
                    getPropertyId(property)
                )}
                onCompareToggle={handleCompareToggle}
              />



            ))}
          </section>
        ) : (
          <section className="mt-12 flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#A054A0]/10">
              <Heart className="h-7 w-7 text-[#A054A0]" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              No shortlisted properties yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Click the heart icon on any property to save it here for later.
            </p>

            <Link
              href="/properties"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#A054A0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#864286]"
            >
              Browse Properties
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        )}

        {/* Compare Bottom Bar */}
        {compareSelection.length > 0 && (
          <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <GitCompare className="h-4 w-4 text-[#A054A0]" />

                  <p className="text-sm font-semibold text-slate-900">
                    {compareSelection.length} of 2 properties selected
                  </p>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {compareSelection.length === 2
                    ? "Ready to compare your selected properties."
                    : "Select one more property to compare."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearCompareSelection}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 sm:px-4 sm:text-sm"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>

                <button
                  type="button"
                  onClick={openComparePage}
                  disabled={compareSelection.length !== 2}
                  className="rounded-xl bg-[#A054A0] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#864286] disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-sm"
                >
                  Compare Properties
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}