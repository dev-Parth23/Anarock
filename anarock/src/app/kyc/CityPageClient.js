"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PropertyCard from "@/components/properties/PropertyCard";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Home,
  MapPin,
  GitCompare,
  X,
  TrendingUp,
} from "lucide-react";
const COMPARE_STORAGE_KEY = "anarock_compare_properties";
const MAX_COMPARE_PROPERTIES = 3;
const MIN_COMPARE_PROPERTIES = 2;
function getPropertyId(property) {
  return String(
    property?.ROWID ||
      property?.rowId ||
      property?.id ||
      property?.ID ||
      property?.propertyId ||
      "",
  ).trim();
}
function clean(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

function displayValue(value, fallback = "—") {
  const cleaned = clean(value);
  return cleaned || fallback;
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
          { method: "GET", cache: "no-store" },
        );
        const json = await response.json();
        if (cancelled) {
          return;
        }
        if (!response.ok || !json?.success) {
          throw new Error(json?.error || "Unable to load market information.");
        }
        setKyc(json.data || null);
      } catch (error) {
        if (cancelled) {
          return;
        }
        console.error("[CityPage] KYC error:", error);
        setKycError(error?.message || "Unable to load market information.");
      } finally {
        if (!cancelled) {
          setLoadingKyc(false);
        }
      }
    }
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
        if (cancelled) {
          return;
        }
        if (!response.ok || !json?.success) {
          throw new Error(json?.error || "Unable to load properties.");
        }
        const propertyData = Array.isArray(json?.data) ? json.data : [];
        setProperties(propertyData);
      } catch (error) {
        if (cancelled) {
          return;
        }
        console.error("[CityPage] Properties error:", error);
        setPropertyError(error?.message || "Unable to load properties.");
      } finally {
        if (!cancelled) {
          setLoadingProperties(false);
        }
      }
    }
    loadKyc();
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
        .slice(0, MAX_COMPARE_PROPERTIES);

      setCompareSelection(validSelection);
    } catch (error) {
      console.error("Failed to restore compare selection:", error);
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
            `You can compare maximum ${MAX_COMPARE_PROPERTIES} properties.`,
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
        console.error("[CityPage] Failed to save compare selection:", error);
      }
      return updatedSelection;
    });
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMPARE_STORAGE_KEY);

      if (!stored) {
        setCompareSelection([]);
        return;
      }

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        setCompareSelection([]);
        return;
      }

      const cleaned = parsed
        .filter((property) => getPropertyId(property))
        .filter(
          (property, index, array) =>
            index ===
            array.findIndex(
              (item) => getPropertyId(item) === getPropertyId(property),
            ),
        )
        .slice(0, MAX_COMPARE_PROPERTIES);

      setCompareSelection(cleaned);
    } catch (error) {
      console.error("[CityPage] Failed to restore compare selection:", error);

      setCompareSelection([]);
    }
  }, []);

  const clearCompareSelection = () => {
    setCompareSelection([]);

    try {
      localStorage.removeItem(COMPARE_STORAGE_KEY);
    } catch (error) {
      console.error("[CityPage] Failed to clear compare selection:", error);
    }
  };

  const openComparePage = () => {
    if (compareSelection.length < MIN_COMPARE_PROPERTIES) {
      return;
    }

    if (compareSelection.length > MAX_COMPARE_PROPERTIES) {
      return;
    }

    try {
      localStorage.setItem(
        COMPARE_STORAGE_KEY,
        JSON.stringify(compareSelection),
      );
    } catch (error) {
      console.error("[CityPage] Failed to save compare selection:", error);

      return;
    }

    router.push("/compare");
  };

  return (
    <>
      <main className="w-full bg-[#fafafa]">
        <div className="w-full">
          <div className="grid w-full grid-cols-1 xl:grid-cols-[minmax(0,1fr)_410px]">
            <section className="min-w-0 border-r border-gray-100">
              {" "}
              <div className="shrink-0 border-b border-gray-100 bg-white">
                <div className="px-5 py-6 sm:px-8 md:px-10 lg:px-12 xl:px-16">
                  <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="min-w-0">
                      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#15233c] sm:text-3xl lg:text-4xl">
                        {city}
                      </h1>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                        Selected commercial properties and a concise view of the
                        city.
                      </p>
                    </div>
                    <div className="flex w-fit shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-[#fafafa] px-4 py-2.5">
                      <Building2 size={16} className="text-[#9b3c96]" />

                      <span className="text-sm font-semibold text-[#15233c]">
                        {loadingProperties
                          ? "..."
                          : `${properties.length} Properties`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overscroll-contain bg-[#fafafa]">
                <div className="px-5 py-7 sm:px-8 md:px-10 lg:px-12 xl:px-16">
                  {loadingProperties ? (
                    <PropertyGridSkeleton />
                  ) : propertyError ? (
                    <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
                      {propertyError}
                    </div>
                  ) : properties.length === 0 ? (
                    <EmptyProperties city={city} />
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                        {properties.slice(0, 9).map((property, index) => (
                          <div
                            key={
                              property?.ROWID ||
                              property?.rowid ||
                              property?.id ||
                              property?.ID ||
                              property?.propertyId ||
                              index
                            }
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

                      <div
                        className="
                                                    flex
                                                    justify-center
                                                    py-8
                                                "
                      >
                        <Link
                          href={`/properties?city=${encodeURIComponent(city)}`}
                          className="
                                                        group
                                                        inline-flex
                                                        items-center
                                                        justify-center
                                                        gap-3
                                                        rounded-full
                                                        bg-[#15233c]
                                                        px-7
                                                        py-3.5
                                                        text-sm
                                                        font-semibold
                                                        text-white
                                                        shadow-lg
                                                        shadow-[#15233c]/10
                                                        transition-all
                                                        duration-300
                                                        hover:-translate-y-0.5
                                                        hover:bg-[#9b3c96]
                                                        hover:shadow-xl
                                                    "
                        >
                          <span>View All Properties in {city}</span>

                          <ArrowRight
                            size={17}
                            className="
                                                            transition-transform
                                                            duration-300
                                                            group-hover:translate-x-1
                                                        "
                          />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            <aside
              className="
        hidden
        xl:block
        min-w-0
        border-l
        border-gray-100
        bg-white
    "
            >
              <div
                className="
            sticky
            top-[72px]
            max-h-[calc(100vh-72px)]
            overflow-y-auto
            bg-[#fafafa]
            px-5
            py-5
        "
              >
                <div className="space-y-5">
                  {loadingKyc ? (
                    <KycSkeleton />
                  ) : kycError ? (
                    <div
                      className="
                        rounded-[28px]
                        border
                        border-red-100
                        bg-red-50
                        p-6
                        text-sm
                        text-red-600
                    "
                    >
                      {kycError}
                    </div>
                  ) : kyc ? (
                    <>
                      <MarketOverviewCard kyc={kyc} />
                      <MarketPerformanceCard kyc={kyc} />
                    </>
                  ) : (
                    <div
                      className="
                        rounded-[28px]
                        border
                        border-gray-200
                        bg-white
                        p-6
                        text-sm
                        text-gray-500
                        shadow-sm
                    "
                    >
                      No market information available for {city}.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>

        <div
          className="
                        block
                        border-t
                        border-gray-100
                        bg-white
                        xl:hidden
                    "
        >
          <div
            className="
                            px-5
                            py-8
                            sm:px-8
                            md:px-10
                        "
          >
            <div className="mb-5 flex items-center gap-3">
              <div
                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#f5d9f1]
                                "
              >
                <TrendingUp size={18} className="text-[#9b3c96]" />
              </div>

              <div>
                <p
                  className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-[0.15em]
                                        text-[#9b3c96]
                                    "
                >
                  Market Intelligence
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  {city} commercial market
                </p>
              </div>
            </div>

            {loadingKyc ? (
              <KycSkeleton />
            ) : kycError ? (
              <div
                className="
                                    rounded-[28px]
                                    border
                                    border-red-100
                                    bg-red-50
                                    p-6
                                    text-sm
                                    text-red-600
                                "
              >
                {kycError}
              </div>
            ) : kyc ? (
              <div className="grid gap-5 md:grid-cols-2">
                <MarketOverviewCard kyc={kyc} />

                <MarketPerformanceCard kyc={kyc} />
              </div>
            ) : (
              <div
                className="
                                    rounded-[28px]
                                    border
                                    border-gray-200
                                    bg-white
                                    p-6
                                    text-sm
                                    text-gray-500
                                    shadow-sm
                                "
              >
                No market information available for {city}.
              </div>
            )}
          </div>
        </div>
        {compareSelection.length > 0 && (
          <div
            className="
            fixed
            bottom-5
            left-1/2
            z-[40]
            w-[calc(100%-2rem)]
            max-w-3xl
            -translate-x-1/2
            rounded-2xl
            border
            border-gray-200
            bg-white/95
            p-4
            shadow-[0_20px_60px_rgba(0,0,0,0.15)]
            backdrop-blur-xl
            sm:p-5
        "
          >
            <div
              className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
            "
            >
              {/* LEFT */}
              <div className="flex items-center gap-3">
                <div
                  className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#f5d9f1]
                    "
                >
                  <GitCompare className="h-5 w-5 text-[#9b3c96]" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#15233c]">
                    {compareSelection.length}{" "}
                    {compareSelection.length === 1 ? "property" : "properties"}{" "}
                    selected
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Select 2 or 3 properties to compare
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearCompareSelection}
                  className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-gray-200
                        px-4
                        py-2.5
                        text-sm
                        font-medium
                        text-gray-600
                        transition
                        hover:bg-gray-50
                    "
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>

                <button
                  type="button"
                  onClick={openComparePage}
                  disabled={compareSelection.length < MIN_COMPARE_PROPERTIES}
                  className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#15233c]
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-[#9b3c96]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                    "
                >
                  <GitCompare className="h-4 w-4" />
                  Compare
                  {compareSelection.length > 0 &&
                    ` (${compareSelection.length})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function EmptyProperties({ city }) {
  return (
    <div
      className="
                rounded-3xl
                border
                border-gray-200
                bg-white
                p-10
                text-center
                shadow-sm
            "
    >
      <Building2 size={30} className="mx-auto text-gray-300" />

      <h3
        className="
                    mt-4
                    text-lg
                    font-semibold
                    text-[#15233c]
                "
      >
        No properties found
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        There are currently no properties available in {city}.
      </p>
    </div>
  );
}

function MarketOverviewCard({ kyc }) {
  return (
    <article
      className="
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-[#ead6e8]
                bg-gradient-to-br
                from-[#f8def4]
                via-[#f6d9f1]
                to-[#f2d2ee]
                p-6
                shadow-[0_12px_40px_rgba(80,30,80,0.08)]
                sm:p-7
            "
    >
      <div
        className="
                    pointer-events-none
                    absolute
                    -right-16
                    -top-16
                    h-36
                    w-36
                    rounded-full
                    bg-white/30
                    blur-2xl
                "
      />

      <div className="relative">
        {/* TITLE */}

        <h2
          className="
                        text-[11px]
                        font-bold
                        uppercase
                        leading-5
                        tracking-[0.08em]
                        text-[#34313a]
                    "
        >
          {displayValue(kyc?.CityName)} Market Overview ·{" "}
          {displayValue(kyc?.QuarterYear)}
        </h2>

        {/* DESCRIPTION */}

        <p
          className="
                        mt-5
                        text-[13px]
                        leading-[1.5]
                        text-[#35313a]
                    "
        >
          {displayValue(kyc?.OverviewText1)}
        </p>

        <div className="my-5 h-px bg-[#527b8c]/60" />

        {/* MAIN STAT */}

        <div>
          <div
            className="
                            text-4xl
                            font-medium
                            tracking-tight
                            text-[#9b3c96]
                        "
          >
            {displayValue(kyc?.Overview)}
          </div>

          <p
            className="
                            mt-3
                            text-[13px]
                            leading-[1.5]
                            text-[#35313a]
                        "
          >
            {displayValue(kyc?.OverviewText2)}
          </p>
        </div>

        <div className="my-5 h-px bg-[#527b8c]/60" />

        {/* METRICS */}

        <div className="grid grid-cols-3 gap-3">
          <Metric value={kyc?.GrossLeasing} label="Gross leasing" />

          <Metric value={kyc?.GradeAStock} label="Grade A stock" />

          <Metric value={kyc?.Vacancy} label="Vacancy" />
        </div>
      </div>
    </article>
  );
}

function MarketPerformanceCard({ kyc }) {
  return (
    <article
      className="
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-[#ead6e8]
                bg-gradient-to-br
                from-[#f8def4]
                via-[#f6d9f1]
                to-[#f2d2ee]
                p-6
                shadow-[0_12px_40px_rgba(80,30,80,0.08)]
                sm:p-7
            "
    >
      <div
        className="
                    pointer-events-none
                    absolute
                    -bottom-16
                    -left-16
                    h-36
                    w-36
                    rounded-full
                    bg-white/30
                    blur-2xl
                "
      />

      <div className="relative">
        {/* TITLE */}

        <h2
          className="
                        text-[11px]
                        font-bold
                        uppercase
                        leading-5
                        tracking-[0.08em]
                        text-[#34313a]
                    "
        >
          {displayValue(kyc?.CityName)} Market Performance ·{" "}
          {displayValue(kyc?.QuarterYear)}
        </h2>

        <p
          className="
                        mt-5
                        text-[13px]
                        leading-[1.5]
                        text-[#35313a]
                    "
        >
          {displayValue(kyc?.PerformanceText1)}
        </p>

        <div className="my-5 h-px bg-[#527b8c]/60" />
        <div>
          <div className="text-4xl font-medium tracking-tight text-[#9b3c96]">
            {displayValue(kyc?.Performance)}
          </div>

          <p className="mt-3 text-[13px] leading-[1.5] text-[#35313a]">
            {displayValue(kyc?.PerformanceText2)}
          </p>
        </div>

        <div className="my-5 h-px bg-[#527b8c]/60" />
        <div className="grid grid-cols-3 gap-3">
          <Metric value={kyc?.TMT} label="TMT" />
          <Metric value={kyc?.FlexSpace} label="Flex space" />
          <Metric value={kyc?.BFSI} label="BFSI" />
        </div>
        <div className=" mt-4 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-[#55505a]">
          Demand Drivers
        </div>
      </div>
    </article>
  );
}

function Metric({ value, label }) {
  return (
    <div className="min-w-0">
      <div className="truncate text-[16px] font-bold leading-none text-[#161616] sm:text-[17px]">
        {displayValue(value)}
      </div>
      <div className="mt-2 text-[11px] leading-[1.3] text-[#4c4750] sm:text-[12px]">
        {label}
      </div>
    </div>
  );
}

function PropertyGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
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

function KycSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-[350px] animate-pulse rounded-[28px] bg-gray-100" />
      <div className="h-[350px] animate-pulse rounded-[28px] bg-gray-100" />
    </div>
  );
}
