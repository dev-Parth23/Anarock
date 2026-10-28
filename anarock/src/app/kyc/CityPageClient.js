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
  return String(property?.ROWID || property?.rowId || property?.rowid || property?.id || property?.ID || property?.propertyId || "").trim();
}
function isFeaturedProperty(property) {
  const featured = property?.Featured ?? property?.featured;
  return (featured === true || String(featured).trim().toLowerCase() === "true"
  );
}

export default function CityPageClient({ city, slug }) {
  const router = useRouter();
  const [compareSelection, setCompareSelection] = useState([]);
  const [kyc, setKyc] = useState(null);
  const [allProperties, setAllProperties] = useState([]);
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
        const response = await fetch(`/api/kyc?city=${encodeURIComponent(city)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );
        const json = await response.json();
        if (cancelled) return;
        if (!response.ok || !json?.success) {
          throw new Error(json?.error || "Unable to load FAQs for this city.");
        }
        setKyc(json.data || null);
      } catch (error) {
        if (cancelled) return;
        console.error("[CityPage] FAQ data error:", error);
        setKycError(error?.message || "Unable to load FAQs for this city.");
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
        const response = await fetch(`/api/properties?city=${encodeURIComponent(city)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );
        const json = await response.json();
        if (cancelled) return;
        if (!response.ok || !json?.success) {
          throw new Error(
            json?.error || "Unable to load properties."
          );
        }
        const propertyData = Array.isArray(json?.data)
          ? json.data
          : [];
        setAllProperties(propertyData);
        setProperties(propertyData.filter(isFeaturedProperty));
      } catch (error) {
        if (cancelled) return;
        console.error("[CityPage] Properties error:", error);
        setPropertyError(error?.message || "Unable to load properties.");
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
        .filter((item, index, array) =>
          index === array.findIndex((candidate) => getPropertyId(candidate) === getPropertyId(item)))
        .slice(0, MAX_COMPARE_PROPERTIES);
      setCompareSelection(validSelection);
    } catch (error) {
      console.error("[CityPage] Failed to restore compare selection:",
        error);
      setCompareSelection([]);
    }
  }, []);

  const handleCompareToggle = (property) => {
    const propertyId = getPropertyId(property);

    if (!propertyId) {
      console.warn(
        "[CityPage] Property has no valid ID:",
        property
      );
      return;
    }

    setCompareSelection((currentSelection) => {
      const exists = currentSelection.some(
        (item) => getPropertyId(item) === propertyId
      );

      let updatedSelection;

      if (exists) {
        updatedSelection = currentSelection.filter(
          (item) => getPropertyId(item) !== propertyId
        );
      } else {
        if (currentSelection.length >= MAX_COMPARE_PROPERTIES) {
          alert(
            `You can compare a maximum of ${MAX_COMPARE_PROPERTIES} properties.`
          );
          return currentSelection;
        }

        updatedSelection = [...currentSelection, property];
      }

      try {
        localStorage.setItem(
          COMPARE_STORAGE_KEY,
          JSON.stringify(updatedSelection)
        );
      } catch (error) {
        console.error(
          "[CityPage] Failed to save compare selection:",
          error
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
        error
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
        JSON.stringify(compareSelection)
      );
    } catch (error) {
      console.error(
        "[CityPage] Failed to save compare selection:",
        error
      );
      return;
    }

    router.push("/compare");
  };

  return (
    <main className="min-w-0 w-full bg-[#F8F9FB] text-[#172033]">
      <div
        className="
          grid w-full min-w-0 grid-cols-1
          xl:grid-cols-[minmax(0,1fr)_500px]
          2xl:grid-cols-[minmax(0,1fr)_560px]
        "
      >
        {/* LEFT: CITY AND PROPERTIES */}
        <section className="min-w-0 border-b border-[#E5E7EB] xl:border-b-0 xl:border-r">
          <Breadcrumbs
            items={[
              {
                label: "Popular Cities",
                href: "/#popularCities",
              },
              { label: city },
            ]}
          />

          {/* CITY HEADER */}
          <header className="border-b border-[#E5E7EB] bg-white">
            <div className="px-4 py-7 sm:px-6 sm:py-8 lg:px-10 2xl:px-12">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#A054A0]">
                    Explore Commercial Real Estate
                  </p>

                  <h1 className="break-words text-2xl font-semibold leading-tight tracking-[-0.035em] text-[#15233C] sm:text-3xl lg:text-4xl">
                    {city}
                  </h1>
                </div>

                {/* COUNT ALL PROPERTIES, NOT JUST FEATURED */}
                <div className="inline-flex w-fit max-w-full shrink-0 items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFC] px-4 py-3">
                  <Building2
                    size={18}
                    strokeWidth={1.8}
                    className="shrink-0 text-[#A054A0]"
                  />

                  <span className="text-sm font-semibold tabular-nums text-[#15233C]">
                    {loadingProperties
                      ? "Loading..."
                      : `${allProperties.length} Properties`}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* FEATURED PROPERTIES GRID */}
          <div className="min-w-0 bg-[#F8F9FB]">
            <div className="px-4 py-7 sm:px-6 sm:py-9 lg:px-10 2xl:px-12">
              {loadingProperties ? (
                <PropertyGridSkeleton />
              ) : propertyError ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-white p-5 text-sm leading-6 text-red-600 shadow-sm"
                >
                  <p className="font-semibold">
                    Unable to load properties
                  </p>
                  <p className="mt-1">{propertyError}</p>
                </div>
              ) : properties.length === 0 ? (
                <EmptyProperties city={city} />
              ) : (
                <>
                  <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 2xl:grid-cols-3">
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
                              getPropertyId(property)
                          )}
                          onCompareToggle={() =>
                            handleCompareToggle(property)
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center pt-9 sm:pt-11">
                    <Link
                      href={`/properties?city=${encodeURIComponent(city)}`}
                      className="
                        group inline-flex min-h-12 max-w-full
                        items-center justify-center gap-3
                        rounded-xl bg-[#A054A0] px-5 py-3.5
                        text-center text-sm font-semibold text-white
                        shadow-[0_5px_16px_rgba(160,84,160,0.16)]
                        transition-all duration-200
                        hover:-translate-y-0.5 hover:bg-[#813C81]
                        hover:shadow-[0_8px_22px_rgba(160,84,160,0.22)]
                        focus-visible:outline-none focus-visible:ring-2
                        focus-visible:ring-[#A054A0] focus-visible:ring-offset-2
                        sm:px-7
                      "
                    >
                      <span className="break-words">
                        View All Properties in {city}
                      </span>

                      <ArrowRight
                        size={17}
                        className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT: WIDER DESKTOP FAQ SIDEBAR */}
        <aside
          aria-label={`${city} frequently asked questions`}
          className="hidden min-w-0 border-l border-[#E5E7EB] bg-[#F8F9FB] xl:block"
        >
          <div
            className="
              sticky top-[80px]
              max-h-[calc(100vh-80px)]
              w-full overflow-x-hidden overflow-y-auto
              overscroll-y-contain
              p-5
              [scrollbar-width:thin]
              [scrollbar-color:#D8C4D8_transparent]
              2xl:p-6
            "
          >
            {loadingKyc ? (
              <FAQSkeleton />
            ) : kycError ? (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-white p-5 text-sm leading-6 text-red-600 shadow-sm"
              >
                <p className="font-semibold">
                  Unable to load FAQs
                </p>
                <p className="mt-1">{kycError}</p>
              </div>
            ) : (
              <CityFAQs kyc={kyc} city={city} />
            )}
          </div>
        </aside>
      </div>

      {/* MOBILE AND TABLET FAQ */}
      <section className="min-w-0 border-t border-[#E5E7EB] bg-[#F8F9FB] xl:hidden">
        <div className="mx-auto w-full max-w-5xl min-w-0 px-4 py-8 sm:px-6 sm:py-10 md:px-8">
          {loadingKyc ? (
            <FAQSkeleton />
          ) : kycError ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-white p-5 text-sm leading-6 text-red-600 shadow-sm"
            >
              <p className="font-semibold">
                Unable to load FAQs
              </p>
              <p className="mt-1">{kycError}</p>
            </div>
          ) : (
            <CityFAQs kyc={kyc} city={city} />
          )}
        </div>
      </section>

      {/* FLOATING COMPARE BAR */}
      {compareSelection.length > 0 && (
        <div
          className="
            fixed bottom-4 left-1/2 z-[40]
            w-[calc(100%-1.5rem)] max-w-3xl
            -translate-x-1/2 rounded-2xl
            border border-[#E5E7EB] bg-white/95 p-4
            shadow-[0_12px_40px_rgba(21,35,60,0.14)]
            backdrop-blur-xl
            sm:bottom-6 sm:w-[calc(100%-2rem)] sm:p-5
          "
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EFF8]">
                <GitCompare
                  className="h-5 w-5 text-[#A054A0]"
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#15233C]">
                  {compareSelection.length}{" "}
                  {compareSelection.length === 1
                    ? "property"
                    : "properties"}{" "}
                  selected
                </p>

                <p className="mt-1 text-xs leading-5 text-[#647084]">
                  Select 2 or 3 properties to compare.
                </p>
              </div>
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <button
                type="button"
                onClick={clearCompareSelection}
                className="
                  inline-flex min-h-11 flex-1 items-center
                  justify-center gap-2 rounded-xl
                  border border-[#E5E7EB] bg-white px-4
                  text-sm font-medium text-[#475467]
                  transition-colors duration-200
                  hover:border-[#D1D5DB] hover:bg-[#F8F9FB]
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-[#A054A0] focus-visible:ring-offset-2
                  sm:flex-none
                "
              >
                <X size={16} />
                Clear
              </button>

              <button
                type="button"
                onClick={openComparePage}
                disabled={
                  compareSelection.length < MIN_COMPARE_PROPERTIES
                }
                className="
                  inline-flex min-h-11 flex-1 items-center
                  justify-center gap-2 rounded-xl
                  bg-[#15233C] px-4 text-sm font-semibold
                  text-white transition-colors duration-200
                  hover:bg-[#A054A0]
                  disabled:cursor-not-allowed disabled:opacity-40
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-[#A054A0] focus-visible:ring-offset-2
                  sm:flex-none sm:px-5
                "
              >
                <GitCompare size={16} />
                Compare ({compareSelection.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

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
    <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_4px_18px_rgba(21,35,60,0.045)]">
      <div className="border-b border-[#EEE5EF] bg-gradient-to-br from-white via-white to-[#FAF2FA] px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#A054A0]" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A054A0]">
            City Guide
          </p>
        </div>

        <h2 className="mt-2 text-lg font-semibold leading-6 tracking-tight text-[#15233C] sm:text-xl">
          Frequently Asked Questions
        </h2>
      </div>

      {faqs.length > 0 ? (
        <div className="divide-y divide-[#00000057] px-4 sm:px-5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const answerId = `city-faq-answer-${index}`;
            const buttonId = `city-faq-question-${index}`;

            return (
              <article
                key={`${faq.question}-${index}`}
                className="min-w-0"
              >
                <h3 className="m-0 min-w-0">
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() =>
                      setOpenIndex(isOpen ? null : index)
                    }
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    className="
                      group flex w-full min-w-0 items-center
                      gap-3 rounded-lg py-4 text-left
                      focus-visible:outline-none focus-visible:ring-2
                      focus-visible:ring-inset focus-visible:ring-[#A054A0]
                    "
                  >
                    <span
                      className={`
                        mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full
                        transition-colors duration-200
                        ${isOpen ? "bg-[#A054A0]" : "bg-[#D1D5DB]"}
                      `}
                      aria-hidden="true"
                    />

                    <span
                      className={`
                        min-w-0 flex-1 break-words text-sm
                        font-medium leading-6 transition-colors duration-200
                        ${isOpen
                          ? "text-[#A054A0]"
                          : "text-[#253047] group-hover:text-[#A054A0]"
                        }
                      `}
                    >
                      {faq.question || `Question ${index + 1}`}
                    </span>

                    <span
                      className={`
                        flex h-7 w-7 shrink-0 items-center
                        justify-center rounded-full
                        transition-colors duration-200
                        ${isOpen
                          ? "bg-[#F8EFF8] text-[#A054A0]"
                          : "bg-[#F8F9FB] text-[#647084] group-hover:bg-[#F8EFF8] group-hover:text-[#A054A0]"
                        }
                      `}
                      aria-hidden="true"
                    >
                      {isOpen ? (<Minus size={16} strokeWidth={2} />
                      ) : (
                        <Plus size={16} strokeWidth={2} />
                      )}
                    </span>
                  </button>
                </h3>

                {isOpen && (
                  <div id={answerId} role="region" aria-labelledby={buttonId} className="min-w-0 pb-5 pl-[18px] pr-2">
                    <p className="break-words text-sm leading-6 text-black">
                      {faq.answer || "Answer not available."}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-7 sm:px-6">
          <p className="text-sm leading-6 text-[#647084]">
            No FAQs are available for {city} yet.
          </p>
        </div>
      )}
    </section>
  );
}

function FAQSkeleton() {
  return (
    <div className="w-full min-w-0 animate-pulse overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="border-b border-[#EEF0F4] px-5 py-6 sm:px-6">
        <div className="h-3 w-20 rounded-full bg-[#F0E8F0]" />
        <div className="mt-3 h-6 w-4/5 rounded-md bg-[#EEF0F4]" />
        <div className="mt-3 h-3 w-full max-w-[260px] rounded-full bg-[#EEF0F4]" />
      </div>

      <div className="px-5 sm:px-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3 border-b border-[#EEF0F4] py-5 last:border-b-0">
            <div className="h-4 min-w-0 flex-1 rounded-md bg-[#EEF0F4]" />
            <div className="h-7 w-7 shrink-0 rounded-full bg-[#F8EFF8]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyProperties({ city }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-12 text-center shadow-[0_4px_18px_rgba(21,35,60,0.035)] sm:px-8 sm:py-14">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8EFF8]">
        <Building2 size={25} strokeWidth={1.7} className="text-[#A054A0]" />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-[#15233C]">
        No featured properties found
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#647084]">
        There are currently no featured properties available in {city}.
        Please check back later for new listings.
      </p>
    </div>
  );
}

function PropertyGridSkeleton() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 2xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="min-w-0 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="aspect-square animate-pulse bg-[#EEF0F4]" />
          <div className="space-y-4 p-4 sm:p-5">
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#EEF0F4]" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-[#EEF0F4]" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-[#F3EAF3]" />
          </div>
        </div>
      ))}
    </div>
  );
}