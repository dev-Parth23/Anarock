"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import PropertyCard from "@/components/properties/PropertyCard";
import { usePreferences } from "@/lib/preferences";
import {
  formatPrice,
  formatArea,
  convertCurrency,
  convertArea,
} from "@/lib/format";
import {
  Sparkles,
  SlidersHorizontal,
  X,
  Search,
  MapPin,
  ChevronDown,
  Check,
} from "lucide-react";

const OFFICE_TYPES = [
  "Conventional",
  "Managed Office/Co-working",
  "Consulting",
  "Others",
];

export default function PropertiesClient() {
  const { currency, unit, exchangeRates } = usePreferences();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const [micromarkets, setMicromarkets] = useState([]);
  const [micromarketsLoading, setMicromarketsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMicromarkets, setShowMicromarkets] = useState(false);
  const filters = useMemo(
    () => ({
      city: searchParams.get("city") || "",
      micromarket: searchParams.get("micromarket") || "",
      type: searchParams.get("type") || "",
      budget: searchParams.get("budget") || "",
      area: searchParams.get("area") || "",
      prompt: searchParams.get("prompt") || "",
      isAi: searchParams.get("type") === "ai" || searchParams.has("prompt"),
    }),
    [searchParams],
  );

  useEffect(() => {
    fetch("/api/cities")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setCities(d.cities || []);
        }
      })
      .catch(() => {
        setCities([]);
      });
  }, []);

  useEffect(() => {
    if (!filters.city) {
      setMicromarkets([]);
      setShowMicromarkets(false);
      return;
    }

    let cancelled = false;

    setMicromarketsLoading(true);

    fetch(`/api/micromarkets?city=${encodeURIComponent(filters.city)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;

        if (d.success && Array.isArray(d.micromarkets)) {
          setMicromarkets(d.micromarkets);
        } else {
          setMicromarkets([]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMicromarkets([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setMicromarketsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters.city]);

  const selectedMicromarkets = useMemo(() => {
    if (!filters.micromarket || micromarkets.length === 0) {
      return [];
    }

    const selectedNames = filters.micromarket
      .split(",")
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean);

    return micromarkets
      .filter((market) =>
        selectedNames.includes(String(market.name).trim().toLowerCase()),
      )
      .map((market) => String(market.id));
  }, [filters.micromarket, micromarkets]);
  const selectedMicromarketNames = useMemo(() => {
    if (selectedMicromarkets.length === 0) {
      return [];
    }

    return selectedMicromarkets
      .map((id) => {
        const market = micromarkets.find(
          (item) => String(item.id) === String(id),
        );

        return market?.name || "";
      })
      .filter(Boolean);
  }, [selectedMicromarkets, micromarkets]);

  useEffect(() => {
    let cancelled = false;

    async function fetchProperties() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams(searchParams.toString());
        if (filters.budget !== "") {
          const enteredBudget = Number(filters.budget);

          if (Number.isFinite(enteredBudget)) {
            const budgetInINR = convertCurrency(
              enteredBudget,
              currency,
              "INR",
              exchangeRates,
            );

            params.set("budget", String(Math.round(budgetInINR)));
          }
        }

        if (filters.area !== "") {
          const enteredArea = Number(filters.area);

          if (Number.isFinite(enteredArea)) {
            const areaInSqft = convertArea(enteredArea, unit, "sqft");

            params.set("area", String(Math.round(areaInSqft)));
          }
        }

        const query = params.toString();

        const response = await fetch(
          `/api/properties${query ? `?${query}` : ""}`,
          {
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch properties");
        }

        if (!cancelled) {
          setProperties(data.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Failed to fetch properties");

          setProperties([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProperties();

    return () => {
      cancelled = true;
    };
  }, [
    searchParams,
    currency,
    unit,
    exchangeRates,
    filters.budget,
    filters.area,
  ]);
  useEffect(() => {
    if (!filters.city && !filters.micromarket) {
      return;
    }

    try {
      const searchLocationObj = {
        city: filters.city || "",

        micromarket:
          selectedMicromarketNames.length > 0
            ? selectedMicromarketNames.join(", ")
            : filters.micromarket || "",

        state: "",
      };

      localStorage.setItem(
        "anarock_last_searched_location",
        JSON.stringify(searchLocationObj),
      );
    } catch (error) {
      console.error("Unable to save last searched location:", error);
    }
  }, [filters.city, filters.micromarket, selectedMicromarketNames]);
  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`,
    );
  };
  const handleCityChange = (city) => {
    const params = new URLSearchParams(searchParams.toString());

    if (city) {
      params.set("city", city);
    } else {
      params.delete("city");
    }
    params.delete("micromarket");

    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`,
    );

    setShowMicromarkets(false);
  };

  const toggleMicromarket = (micromarketId) => {
    const id = String(micromarketId);

    let nextSelected;

    if (selectedMicromarkets.includes(id)) {
      nextSelected = selectedMicromarkets.filter(
        (selectedId) => selectedId !== id,
      );
    } else {
      nextSelected = [...selectedMicromarkets, id];
    }

    const selectedNames = nextSelected
      .map((selectedId) => {
        const market = micromarkets.find(
          (item) => String(item.id) === String(selectedId),
        );

        return market?.name || "";
      })
      .filter(Boolean);

    const params = new URLSearchParams(searchParams.toString());

    if (selectedNames.length > 0) {
      params.set("micromarket", selectedNames.join(","));
    } else {
      params.delete("micromarket");
    }

    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`,
    );
  };

  const selectAllMicromarkets = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("micromarket");

    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`,
    );

    setShowMicromarkets(false);
  };

  const clearFilter = (key) => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete(key);

    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`,
    );
  };

  const clearAll = () => {
    router.push("/properties");
    setShowMicromarkets(false);
  };

  const activeChips = [
    filters.city && {
      label: `City: ${filters.city}`,
      key: "city",
    },

    filters.micromarket && {
      label: `Micromarkets: ${
        selectedMicromarketNames.length > 0
          ? selectedMicromarketNames.join(", ")
          : filters.micromarket
      }`,
      key: "micromarket",
    },

    filters.type &&
      filters.type !== "ai" && {
        label: `Type: ${filters.type}`,
        key: "type",
      },

    filters.budget && {
      label: `Budget: ${formatPrice(
        convertCurrency(Number(filters.budget), currency, "INR", exchangeRates),
        currency,
        exchangeRates,
      )}`,
      key: "budget",
    },
    filters.area && {
      label: `Min Area: ${formatArea(
        convertArea(Number(filters.area), unit, "sqft"),
        unit,
      )}`,
      key: "area",
    },

    filters.prompt && {
      label: `AI: ${filters.prompt.slice(0, 40)}${
        filters.prompt.length > 40 ? "..." : ""
      }`,
      key: "prompt",
    },
  ].filter(Boolean);

  const breadcrumbs = [
    {
      label: "Properties",
      href: "/properties",
    },
    ...(filters.city ? [{ label: filters.city }] : []),
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className=" justify-evenly px-4 py-4 ">
        <Breadcrumbs items={breadcrumbs} />

        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {filters.isAi ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-amber-500" />
                  AI Recommended Properties
                </span>
              ) : filters.city ? (
                `Commercial Properties in ${filters.city}`
              ) : (
                "All Commercial Properties"
              )}
            </h1>

            <p className="text-sm text-slate-600 mt-1">
              {loading
                ? "Searching..."
                : `${properties.length} properties found`}
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => clearFilter(chip.key)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full hover:bg-amber-200"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            ))}

            <button
              onClick={clearAll}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside
            className={`${
              showFilters
                ? "fixed inset-0 z-40 bg-slate-950/50 lg:relative lg:bg-transparent"
                : "hidden lg:block"
            }`}
          >
            <div
              className={`bg-white border border-slate-200 rounded-xl p-4 lg:sticky lg:top-20 ${
                showFilters
                  ? "absolute right-0 top-0 h-full w-80 max-w-full overflow-y-auto rounded-none lg:rounded-xl lg:relative lg:w-auto lg:h-auto"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Filters</h3>

                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    City
                  </label>

                  <select
                    value={filters.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">All Cities</option>

                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MICROMARKET */}
                <div className="relative">
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Micromarket
                  </label>

                  <button
                    type="button"
                    disabled={!filters.city || micromarketsLoading}
                    onClick={() => setShowMicromarkets(!showMicromarkets)}
                    className={`w-full flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm text-left transition-colors ${
                      !filters.city
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        : "bg-white text-slate-900 border-slate-300 hover:border-amber-500"
                    }`}
                  >
                    <span className="truncate">
                      {micromarketsLoading
                        ? "Loading micromarkets..."
                        : selectedMicromarkets.length === 0
                          ? "All Micromarkets"
                          : `${selectedMicromarkets.length} selected`}
                    </span>

                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        showMicromarkets ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {showMicromarkets && filters.city && !micromarketsLoading && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                      {/* ALL MICROMARKETS */}
                      <button
                        type="button"
                        onClick={selectAllMicromarkets}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-slate-50 border-b border-slate-100"
                      >
                        <span
                          className={`h-4 w-4 rounded border flex items-center justify-center ${
                            selectedMicromarkets.length === 0
                              ? "bg-amber-500 border-amber-500"
                              : "border-slate-300"
                          }`}
                        >
                          {selectedMicromarkets.length === 0 && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </span>

                        <span className="font-medium text-slate-800">
                          All Micromarkets
                        </span>
                      </button>

                      {/* MICROMARKETS */}
                      <div className="max-h-64 overflow-y-auto">
                        {micromarkets.length === 0 ? (
                          <div className="px-3 py-3 text-sm text-slate-500">
                            No micromarkets found
                          </div>
                        ) : (
                          micromarkets.map((market) => {
                            const id = String(market.id);

                            const selected = selectedMicromarkets.includes(id);

                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => toggleMicromarket(id)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-slate-50"
                              >
                                <span
                                  className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                                    selected
                                      ? "bg-amber-500 border-amber-500"
                                      : "border-slate-300"
                                  }`}
                                >
                                  {selected && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </span>

                                <span
                                  className={`truncate ${
                                    selected
                                      ? "font-medium text-slate-900"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {market.name}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* DONE */}
                      <div className="border-t border-slate-100 p-2">
                        <button
                          type="button"
                          onClick={() => setShowMicromarkets(false)}
                          className="w-full py-2 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* OFFICE TYPE */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Office Type
                  </label>

                  <select
                    value={filters.type === "ai" ? "" : filters.type}
                    onChange={(e) => updateFilter("type", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">All Types</option>

                    {OFFICE_TYPES.map((t) => (
                      <option key={t} value={t.toLowerCase()}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* BUDGET */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Max Budget ({currency})
                  </label>

                  <input
                    type="number"
                    value={filters.budget}
                    onChange={(e) => updateFilter("budget", e.target.value)}
                    placeholder={
                      currency === "INR" ? "e.g. 5000000" : "Enter amount"
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* AREA */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Min Area ({unit === "sqm" ? "sq.m" : "sq.ft"})
                  </label>

                  <input
                    type="number"
                    value={filters.area}
                    onChange={(e) => updateFilter("area", e.target.value)}
                    placeholder={unit === "sqft" ? "e.g. 2000" : "Enter area"}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* AI */}
                {filters.isAi && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      AI Query
                    </label>

                    <textarea
                      value={filters.prompt}
                      onChange={(e) => updateFilter("prompt", e.target.value)}
                      rows={3}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                <button
                  onClick={clearAll}
                  className="w-full py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  Clear All
                </button>
              </div>
            </div>
          </aside>
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[4/3] bg-slate-200" />

                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white rounded-xl border border-red-200">
                <Search className="h-12 w-12 text-red-300 mx-auto mb-3" />

                <h3 className="text-lg font-semibold text-slate-900">
                  Unable to load properties
                </h3>

                <p className="text-slate-500 text-sm mt-1 max-w-2xl mx-auto">
                  {error}
                </p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />

                <h3 className="text-lg font-semibold text-slate-900">
                  No properties found
                </h3>

                <p className="text-slate-500 text-sm mt-1">
                  Try adjusting your filters or clear them to see all listings.
                </p>

                <button
                  onClick={clearAll}
                  className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 rounded-lg text-sm font-medium"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 p-3 flex gap-2 z-30">
        <button
          onClick={() => setShowFilters(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </button>

        <button
          onClick={() => router.push("/wishlist")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-slate-950 rounded-lg text-sm font-medium"
        >
          <MapPin className="h-4 w-4" />
          Wishlist
        </button>
      </div>
    </div>
  );
}
