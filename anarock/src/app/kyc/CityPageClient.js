"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import PropertyCard from "@/components/properties/PropertyCard";
import {
  ArrowRight,
  Building2,
  GitCompare,
  X,
  Plus,
  Minus,
} from "lucide-react";

const COMPARE_STORAGE_KEY = "anarock_compare_properties";

const MAX_COMPARE_PROPERTIES = 3;
const MIN_COMPARE_PROPERTIES = 2;

function getPropertyId(property) {
  return String(
    property?.ROWID ||
    property?.rowId ||
    property?.rowid ||
    property?.id ||
    property?.ID ||
    property?.propertyId ||
    "",
  ).trim();
}

export default function CityPageClient({ city, slug }) {
  const router = useRouter();

  const [compareSelection, setCompareSelection] = useState([]);
  const [kyc, setKyc] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loadingKyc, setLoadingKyc] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [kycError, setKycError] = useState("");
  const [propertyError, setPropertyError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadKyc() {
      try {
        setLoadingKyc(true);
        setKycError("");

        const response = await fetch(
          `/api/kyc?city=${encodeURIComponent(city)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const json = await response.json();

        if (cancelled) return;

        if (!response.ok || !json?.success) {
          throw new Error(
            json?.error || "Unable to load FAQs for this city.",
          );
        }

        setKyc(json.data || null);
      } catch (error) {
        if (cancelled) return;

        console.error("[CityPage] FAQ data error:", error);

        setKycError(
          error?.message || "Unable to load FAQs for this city.",
        );
      } finally {
        if (!cancelled) {
          setLoadingKyc(false);
        }
      }
    }

    loadKyc();

    return () => {
      cancelled = true;
    };
  }, [city]);

  useEffect(() => {
    let cancelled = false;

    async function loadProperties() {
      try {
        setLoadingProperties(true);
        setPropertyError("");

        const response = await fetch(
          `/api/properties?city=${encodeURIComponent(city)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const json = await response.json();

        if (cancelled) return;

        if (!response.ok || !json?.success) {
          throw new Error(
            json?.error || "Unable to load properties.",
          );
        }

        const propertyData = Array.isArray(json?.data)
          ? json.data
          : [];

        setProperties(propertyData);
      } catch (error) {
        if (cancelled) return;

        console.error("[CityPage] Properties error:", error);

        setPropertyError(
          error?.message || "Unable to load properties.",
        );
      } finally {
        if (!cancelled) {
          setLoadingProperties(false);
        }
      }
    }

    loadProperties();

    return () => {
      cancelled = true;
    };
  }, [city]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COMPARE_STORAGE_KEY);

      if (!saved) {
        setCompareSelection([]);
        return;
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        setCompareSelection([]);
        return;
      }

      const validSelection = parsed
        .filter((item) => getPropertyId(item))
        .filter(
          (item, index, array) =>
            index ===
            array.findIndex(
              (candidate) =>
                getPropertyId(candidate) === getPropertyId(item),
            ),
        )
        .slice(0, MAX_COMPARE_PROPERTIES);

      setCompareSelection(validSelection);
    } catch (error) {
      console.error(
        "[CityPage] Failed to restore compare selection:",
        error,
      );

      setCompareSelection([]);
    }
  }, []);

  const handleCompareToggle = (property) => {
    const propertyId = getPropertyId(property);

    if (!propertyId) {
      console.warn("[CityPage] Property has no valid ID:", property);
      return;
    }

    setCompareSelection((currentSelection) => {
      const exists = currentSelection.some(
        (item) => getPropertyId(item) === propertyId,
      );

      let updatedSelection;

      if (exists) {
        updatedSelection = currentSelection.filter(
          (item) => getPropertyId(item) !== propertyId,
        );
      } else {
        if (currentSelection.length >= MAX_COMPARE_PROPERTIES) {
          alert(
            `You can compare a maximum of ${MAX_COMPARE_PROPERTIES} properties.`,
          );

          return currentSelection;
        }

        updatedSelection = [...currentSelection, property];
      }

      try {
        localStorage.setItem(
          COMPARE_STORAGE_KEY,
          JSON.stringify(updatedSelection),
        );
      } catch (error) {
        console.error(
          "[CityPage] Failed to save compare selection:",
          error,
        );
      }

      return updatedSelection;
    });
  };

  const clearCompareSelection = () => {
    setCompareSelection([]);

    try {
      localStorage.removeItem(COMPARE_STORAGE_KEY);
    } catch (error) {
      console.error(
        "[CityPage] Failed to clear compare selection:",
        error,
      );
    }
  };

  const openComparePage = () => {
    if (
      compareSelection.length < MIN_COMPARE_PROPERTIES ||
      compareSelection.length > MAX_COMPARE_PROPERTIES
    ) {
      return;
    }

    try {
      localStorage.setItem(
        COMPARE_STORAGE_KEY,
        JSON.stringify(compareSelection),
      );
    } catch (error) {
      console.error(
        "[CityPage] Failed to save compare selection:",
        error,
      );

      return;
    }

    router.push("/compare");
  };

  return (
    <>
      <main className="w-full min-w-0 bg-[#fafafa]">
        <div className="w-full min-w-0">
          <div
            className="
              grid w-full min-w-0 grid-cols-1
              xl:grid-cols-[minmax(0,1fr)_360px]
              2xl:grid-cols-[minmax(0,1fr)_400px]
            "
          >
            {/* LEFT: CITY AND PROPERTIES */}
            <section className="min-w-0 border-r border-gray-200">
              <Breadcrumbs
                items={[
                  {
                    label: "Popular Cities",
                    href: "/#popularCities",
                  },
                  { label: city },
                ]}
              />

              {/* CITY HEADING */}
              <div className="shrink-0 border-b border-gray-200">
                <div
                  className="
                    px-4 py-5
                    sm:px-6 sm:py-6
                    md:px-8
                    lg:px-10
                    xl:px-10
                    2xl:px-14
                  "
                >
                  <div
                    className="
                      flex min-w-0 flex-col gap-4
                      sm:gap-5
                      md:flex-row md:items-end
                      md:justify-between
                    "
                  >
                    <div className="min-w-0">
                      <h1
                        className="
                          break-words text-2xl font-semibold
                          tracking-[-0.03em] text-black
                          sm:text-3xl lg:text-4xl
                        "
                      >
                        {city}
                      </h1>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-black/70">
                        Explore commercial properties and discover
                        opportunities in {city}.
                      </p>
                    </div>

                    <div
                      className="
                        flex w-fit max-w-full shrink-0
                        items-center gap-2 rounded-xl
                        border border-gray-300 px-4 py-2.5
                      "
                    >
                      <Building2
                        size={16}
                        className="shrink-0 text-[#A054A0]"
                      />

                      <span className="text-sm font-semibold text-[#15233c]">
                        {loadingProperties
                          ? "Loading..."
                          : `${properties.length} Properties`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PROPERTIES */}
              <div className="min-w-0 bg-[#fafafa]">
                <div
                  className="
                    px-4 py-6
                    sm:px-6 sm:py-7
                    md:px-8
                    lg:px-10
                    xl:px-10
                    2xl:px-14
                  "
                >
                  {loadingProperties ? (
                    <PropertyGridSkeleton />
                  ) : propertyError ? (
                    <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm leading-6 text-red-600">
                      {propertyError}
                    </div>
                  ) : properties.length === 0 ? (
                    <EmptyProperties city={city} />
                  ) : (
                    <>
                      <div
                        className="
                          grid min-w-0 grid-cols-1 gap-4
                          sm:grid-cols-2
                          lg:gap-5
                          2xl:grid-cols-3
                        "
                      >
                        {properties.slice(0, 9).map((property, index) => (
                          <div
                            key={getPropertyId(property) || index}
                            className="min-w-0"
                          >
                            <PropertyCard
                              property={property}
                              isCompared={compareSelection.some(
                                (item) =>
                                  getPropertyId(item) ===
                                  getPropertyId(property),
                              )}
                              onCompareToggle={() =>
                                handleCompareToggle(property)
                              }
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center py-8">
                        <Link
                          href={`/properties?city=${encodeURIComponent(city)}`}
                          className="
                            group inline-flex max-w-full
                            items-center justify-center gap-3
                            rounded-xl bg-[#A054A0] px-5 py-3.5
                            text-center text-sm font-semibold text-white
                            shadow-lg shadow-[#A054A0]/10
                            transition-all duration-300
                            hover:-translate-y-0.5 hover:shadow-xl
                            sm:px-7
                          "
                        >
                          <span className="break-words">
                            View All Properties in {city}
                          </span>

                          <ArrowRight
                            size={17}
                            className="
                              shrink-0 transition-transform
                              duration-300 group-hover:translate-x-1
                            "
                          />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* RIGHT: DESKTOP CITY FAQS */}
            <aside
              className="
                hidden min-w-0 border-l border-gray-100
                bg-[#fafafa] xl:block
              "
            >
              <div
                className="
                  sticky top-[80px]
                  max-h-[calc(100vh-80px)]
                  w-full overflow-x-hidden overflow-y-auto
                  overscroll-y-contain
                  px-3 py-4
                  [scrollbar-width:thin]
                  [scrollbar-color:#d8c4d8_transparent]
                  2xl:px-4 2xl:py-5
                "
              >
                {loadingKyc ? (
                  <FAQSkeleton />
                ) : kycError ? (
                  <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm leading-6 text-red-600">
                    {kycError}
                  </div>
                ) : (
                  <CityFAQs kyc={kyc} city={city} />
                )}
              </div>
            </aside>
          </div>
        </div>

        {/* MOBILE / TABLET CITY FAQS */}
        <section className="block min-w-0 border-t border-gray-100 bg-[#fafafa] xl:hidden">
          <div
            className="
              mx-auto w-full max-w-5xl min-w-0
              px-4 py-8
              sm:px-6 sm:py-10
              md:px-8
              lg:px-10
            "
          >
            {loadingKyc ? (
              <FAQSkeleton />
            ) : kycError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm leading-6 text-red-600">
                {kycError}
              </div>
            ) : (
              <CityFAQs kyc={kyc} city={city} />
            )}
          </div>
        </section>

        {/* COMPARE BAR */}
        {compareSelection.length > 0 && (
          <div
            className="
              fixed bottom-4 left-1/2 z-[40]
              w-[calc(100%-1.5rem)] max-w-3xl
              -translate-x-1/2 rounded-2xl
              border border-gray-200 bg-white/95 p-3
              shadow-[0_20px_60px_rgba(0,0,0,0.15)]
              backdrop-blur-xl
              sm:bottom-5 sm:w-[calc(100%-2rem)] sm:p-4
              md:p-5
            "
          >
            <div
              className="
                flex flex-col gap-3
                sm:flex-row sm:items-center
                sm:justify-between sm:gap-4
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="
                    flex h-10 w-10 shrink-0 items-center
                    justify-center rounded-xl bg-[#f5d9f1]
                  "
                >
                  <GitCompare className="h-5 w-5 text-[#A054A0]" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-black">
                    {compareSelection.length}{" "}
                    {compareSelection.length === 1
                      ? "property"
                      : "properties"}{" "}
                    selected
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Select 2 or 3 properties to compare
                  </p>
                </div>
              </div>

              <div className="flex w-full items-center gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={clearCompareSelection}
                  className="
                    inline-flex flex-1 items-center justify-center
                    gap-2 rounded-xl border border-gray-200
                    px-3 py-2.5 text-sm font-medium text-gray-600
                    transition hover:bg-gray-50
                    sm:flex-none sm:px-4
                  "
                >
                  <X className="h-4 w-4" />
                  <span>Clear</span>
                </button>

                <button
                  type="button"
                  onClick={openComparePage}
                  disabled={
                    compareSelection.length < MIN_COMPARE_PROPERTIES
                  }
                  className="
                    inline-flex flex-1 items-center justify-center
                    gap-2 rounded-xl bg-[#15233c] px-4 py-2.5
                    text-sm font-semibold text-white transition
                    hover:bg-[#A054A0]
                    disabled:cursor-not-allowed disabled:opacity-40
                    sm:flex-none sm:px-5
                  "
                >
                  <GitCompare className="h-4 w-4" />
                  <span>Compare ({compareSelection.length})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

/* =========================================================
   CITY FAQ ACCORDION
========================================================= */

function CityFAQs({ kyc, city }) {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = Array.from({ length: 5 }, (_, index) => {
    const number = index + 1;

    return {
      question: String(kyc?.[`Question${number}`] ?? "").trim(),
      answer: String(kyc?.[`Answer${number}`] ?? "").trim(),
    };
  }).filter((faq) => faq.question || faq.answer);

  return (
    <section
      className="
        w-full min-w-0 overflow-hidden rounded-2xl
        border border-slate-200 bg-white
        shadow-sm shadow-slate-900/[0.03]
      "
    >
      {/* FAQ HEADER */}
      <div
        className="
          border-b border-slate-100
          bg-gradient-to-br from-white to-[#fcf5fc]
          px-4 py-4 sm:px-5 sm:py-5
        "
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#A054A0]">
          City Guide
        </p>

        <h2
          className="
            mt-1.5 break-words text-lg font-semibold
            leading-6 tracking-tight text-black sm:text-xl
          "
        >
          Frequently Asked Questions
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Helpful information about {city}
        </p>
      </div>

      {/* SINGLE-OPEN FAQ LIST */}
      {faqs.length > 0 ? (
        <div className="divide-y divide-slate-200 px-4 sm:px-5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const answerId = `city-faq-answer-${index}`;

            return (
              <article
                key={`${faq.question}-${index}`}
                className="min-w-0"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  className="
                    group flex w-full min-w-0 items-center
                    gap-3 py-3.5 text-left
                    transition-colors duration-200
                    focus-visible:outline-none
                    focus-visible:ring-2 focus-visible:ring-inset
                    focus-visible:ring-[#A054A0]
                    sm:py-4
                  "
                >
                  {/* PURPLE DOT */}
                  <span
                    className="
                      h-1.5 w-1.5 shrink-0 rounded-full
                      bg-[#A054A0]
                    "
                    aria-hidden="true"
                  />

                  {/* QUESTION */}
                  <span
                    className={`
                      min-w-0 flex-1 break-words
                      text-[13px] font-semibold leading-5
                      transition-colors sm:text-sm sm:leading-6
                      ${isOpen
                        ? "text-[#A054A0]"
                        : "text-black group-hover:text-[#A054A0]"
                      }
                    `}
                  >
                    {faq.question || `Question ${index + 1}`}
                  </span>

                  {/* PLUS / MINUS ICON */}
                  <span
                    className="
                      flex h-7 w-7 shrink-0 items-center
                      justify-center rounded-full
                      text-[#A054A0] transition-colors
                      group-hover:bg-[#f8eafa]
                    "
                    aria-hidden="true"
                  >
                    {isOpen ? (
                      <Minus size={18} strokeWidth={1.8} />
                    ) : (
                      <Plus size={18} strokeWidth={1.8} />
                    )}
                  </span>
                </button>

                {/* ANSWER */}
                {isOpen && (
                  <div
                    id={answerId}
                    className="
                      min-w-0 pb-4 pl-5 pr-1
                      sm:pb-5 sm:pl-6
                    "
                  >
                    <p
                      className="
                        break-words text-[13px] leading-6
                        text-slate-700 sm:text-sm sm:leading-6
                      "
                    >
                      {faq.answer || "Answer not available."}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-5 sm:px-5">
          <p className="text-sm leading-6 text-slate-500">
            No FAQs are available for {city} yet.
          </p>
        </div>
      )}
    </section>
  );
}

function FAQSkeleton() {
  return (
    <div
      className="
        w-full min-w-0 animate-pulse overflow-hidden
        rounded-2xl border border-gray-200 bg-white p-4
        sm:p-5
      "
    >
      <div className="h-3 w-20 rounded bg-gray-100" />
      <div className="mt-3 h-6 w-4/5 rounded bg-gray-100" />
      <div className="mt-2 h-3 w-3/5 rounded bg-gray-100" />

      <div className="mt-5 space-y-0">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="
              flex items-center justify-between gap-3
              border-t border-gray-100 py-4
            "
          >
            <div className="h-4 min-w-0 flex-1 rounded bg-gray-100" />
            <div className="h-7 w-7 shrink-0 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}


function EmptyProperties({ city }) {
  return (
    <div
      className="
        rounded-3xl border border-gray-200 bg-white
        p-8 text-center shadow-sm sm:p-10
      "
    >
      <Building2
        size={30}
        className="mx-auto text-gray-300"
      />

      <h3 className="mt-4 text-lg font-semibold text-[#15233c]">
        No properties found
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        There are currently no properties available in {city}.
      </p>
    </div>
  );
}


function PropertyGridSkeleton() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 2xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className="
            min-w-0 overflow-hidden rounded-3xl
            border border-gray-100 bg-white shadow-sm
          "
        >
          <div className="aspect-square animate-pulse bg-gray-100" />

          <div className="space-y-3 p-5">
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-gray-100" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-gray-100" />
            <div className="h-9 w-full animate-pulse rounded-xl bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
