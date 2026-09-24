
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
  ChevronDown,
  Check,
  Heart,
  Users,
  Maximize2,
  IndianRupee,
  DollarSign,
  Euro,
} from "lucide-react";

const COMPARE_STORAGE_KEY = "anarock_compare_properties";

const OFFICE_TYPES = [
  "Conventional",
  "Managed Office/Co-working",
  "Consulting",
  "Others",
];

const toUrlValue = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[\/\\]+/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const normalizeValue = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

const getOfficeTypeFromUrl = (value) => {
  if (!value) return "";

  const normalized = normalizeValue(value);

  const match = OFFICE_TYPES.find(
    (type) =>
      normalizeValue(type) === normalized ||
      toUrlValue(type) === String(value).toLowerCase()
  );

  return match || value;
};

export default function PropertiesClient() {
  const { currency, unit, exchangeRates } = usePreferences();

  const searchParams = useSearchParams();
  const router = useRouter();

  const [compareSelection, setCompareSelection] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const [micromarkets, setMicromarkets] = useState([]);
  const [micromarketsLoading, setMicromarketsLoading] =
    useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMicromarkets, setShowMicromarkets] =
    useState(false);
  /* =========================================================
    FILTERS FROM URL
 ========================================================= */
  const filters = useMemo(() => {
    const rawType = searchParams.get("type") || "";
    const type =
      rawType === "ai"
        ? "ai"
        : getOfficeTypeFromUrl(rawType);
    return {
      city: searchParams.get("city") || "",
      micromarket:
        searchParams.get("micromarket") || "",
      type,
      minBudget:
        searchParams.get("minBudget") || "",
      maxBudget:
        searchParams.get("maxBudget") || "",
      area:
        searchParams.get("area") || "",
      seats:
        searchParams.get("seats") || "",
      currency:
        searchParams.get("currency") ||
        currency,
      areaUnit:
        searchParams.get("areaUnit") ||
        unit,
      prompt:
        searchParams.get("prompt") || "",
      isAi:
        rawType === "ai" ||
        searchParams.has("prompt"),
    };
  }, [
    searchParams,
    currency,
    unit,
  ]);

  const normalizedOfficeType = normalizeValue(filters.type);
  const isCoworking = normalizedOfficeType ===
    "managed office/co-working";

  const getPropertyId = (property) =>
    String(
      property?.id ||
      property?.rowId ||
      property?.ROWID ||
      ""
    );

  const handleCompareToggle = (property) => {
    const propertyId =
      getPropertyId(property);

    setCompareSelection(
      (previousSelection) => {
        const alreadySelected =
          previousSelection.some(
            (item) =>
              getPropertyId(item) ===
              propertyId
          );

        let updatedSelection;

        if (alreadySelected) {
          updatedSelection =
            previousSelection.filter(
              (item) =>
                getPropertyId(item) !==
                propertyId
            );
        } else {
          updatedSelection = [
            ...previousSelection,
            property,
          ].slice(-2);
        }

        localStorage.setItem(
          COMPARE_STORAGE_KEY,
          JSON.stringify(
            updatedSelection
          )
        );

        return updatedSelection;
      }
    );
  };

  const clearCompareSelection = () => {
    setCompareSelection([]);

    localStorage.removeItem(
      COMPARE_STORAGE_KEY
    );
  };

  const openComparePage = () => {
    if (compareSelection.length !== 2) {
      return;
    }

    localStorage.setItem(
      COMPARE_STORAGE_KEY,
      JSON.stringify(
        compareSelection
      )
    );

    router.push("/compare");
  };

  /* =========================================================
     FETCH CITIES
  ========================================================= */

  useEffect(() => {
    fetch("/api/cities")
      .then((response) =>
        response.json()
      )
      .then((data) => {
        if (data.success) {
          setCities(
            data.cities || []
          );
        }
      })
      .catch(() => {
        setCities([]);
      });
  }, []);

  /* =========================================================
     RESTORE COMPARE
  ========================================================= */

  useEffect(() => {
    try {
      const savedProperties =
        localStorage.getItem(
          COMPARE_STORAGE_KEY
        );

      if (!savedProperties) {
        return;
      }

      const parsedProperties =
        JSON.parse(
          savedProperties
        );

      if (
        Array.isArray(
          parsedProperties
        )
      ) {
        setCompareSelection(
          parsedProperties.slice(-2)
        );
      }
    } catch (error) {
      console.error(
        "Failed to load comparison properties:",
        error
      );
    }
  }, []);

  /* =========================================================
     RESOLVE CITY
  ========================================================= */

  const resolvedCity = useMemo(() => {
    if (!filters.city) {
      return "";
    }

    const match = cities.find(
      (city) =>
        toUrlValue(city) ===
        filters.city.toLowerCase()
    );

    return match || filters.city;
  }, [
    filters.city,
    cities,
  ]);

  /* =========================================================
     FETCH MICROMARKETS
  ========================================================= */

  useEffect(() => {
    if (!resolvedCity) {
      setMicromarkets([]);
      setShowMicromarkets(false);
      return;
    }

    let cancelled = false;

    setMicromarketsLoading(true);

    fetch(
      `/api/micromarkets?city=${encodeURIComponent(
        resolvedCity
      )}`
    )
      .then((response) =>
        response.json()
      )
      .then((data) => {
        if (cancelled) {
          return;
        }

        if (
          data.success &&
          Array.isArray(
            data.micromarkets
          )
        ) {
          setMicromarkets(
            data.micromarkets
          );
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
  }, [resolvedCity]);

  /* =========================================================
     SELECTED MICROMARKETS
  ========================================================= */

  const selectedMicromarkets =
    useMemo(() => {
      if (
        !filters.micromarket ||
        micromarkets.length === 0
      ) {
        return [];
      }

      const selectedNames =
        filters.micromarket
          .split(",")
          .map((name) =>
            name.trim().toLowerCase()
          )
          .filter(Boolean);

      return micromarkets
        .filter((market) => {
          const marketSlug =
            toUrlValue(
              market.name
            );

          return selectedNames.some(
            (selected) =>
              selected ===
              String(
                market.name
              )
                .trim()
                .toLowerCase() ||
              selected === marketSlug
          );
        })
        .map((market) =>
          String(market.id)
        );
    }, [
      filters.micromarket,
      micromarkets,
    ]);

  const selectedMicromarketNames =
    useMemo(() => {
      if (
        selectedMicromarkets.length === 0
      ) {
        return [];
      }

      return selectedMicromarkets
        .map((id) => {
          const market =
            micromarkets.find(
              (item) =>
                String(item.id) ===
                String(id)
            );

          return (
            market?.name || ""
          );
        })
        .filter(Boolean);
    }, [
      selectedMicromarkets,
      micromarkets,
    ]);

  /* =========================================================
     FETCH PROPERTIES
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function fetchProperties() {
      setLoading(true);
      setError("");

      try {
        const params =
          new URLSearchParams(
            searchParams.toString()
          );

        /* -----------------------------------------------------
           CITY
        ----------------------------------------------------- */

        if (resolvedCity) {
          params.set(
            "city",
            resolvedCity
          );
        }

        /* -----------------------------------------------------
           PROPERTY TYPE
        ----------------------------------------------------- */

        if (
          filters.type &&
          filters.type !== "ai"
        ) {
          params.set(
            "type",
            filters.type.toLowerCase()
          );
        }

        /* -----------------------------------------------------
           MIN BUDGET
        ----------------------------------------------------- */

        if (
          filters.minBudget !== ""
        ) {
          const value =
            Number(
              filters.minBudget
            );

          if (
            Number.isFinite(value)
          ) {
            const converted =
              convertCurrency(
                value,
                filters.currency,
                "INR",
                exchangeRates
              );

            params.set(
              "minBudget",
              String(
                Math.round(converted)
              )
            );
          }
        } else {
          params.delete(
            "minBudget"
          );
        }

        if (filters.maxBudget !== "") {
          const value = Number(filters.maxBudget);

          if (Number.isFinite(value)) {
            const converted = convertCurrency(value, filters.currency, "INR", exchangeRates);
            params.set("maxBudget",
              String(Math.round(converted)));
          }
        } else {
          params.delete(
            "maxBudget"
          );
        }

        /* -----------------------------------------------------
           CONVENTIONAL / CONSULTING / OTHERS
           → AREA
        ----------------------------------------------------- */

        if (
          !isCoworking &&
          filters.area !== ""
        ) {
          const enteredArea =
            Number(
              filters.area
            );

          if (
            Number.isFinite(
              enteredArea
            )
          ) {
            const areaInSqft =
              convertArea(
                enteredArea,
                filters.areaUnit,
                "sqft"
              );

            params.set(
              "area",
              String(
                Math.round(
                  areaInSqft
                )
              )
            );
          }
        } else {
          params.delete("area");
        }

        /* -----------------------------------------------------
           MANAGED OFFICE / CO-WORKING
           → SEATS
        ----------------------------------------------------- */

        if (
          isCoworking &&
          filters.seats !== ""
        ) {
          const enteredSeats =
            Number(
              filters.seats
            );

          if (
            Number.isFinite(
              enteredSeats
            )
          ) {
            params.set(
              "seats",
              String(
                Math.round(
                  enteredSeats
                )
              )
            );
          }
        } else {
          params.delete("seats");
        }

        /* -----------------------------------------------------
           MICROMARKETS
        ----------------------------------------------------- */

        if (
          selectedMicromarketNames.length
        ) {
          params.set(
            "micromarket",
            selectedMicromarketNames.join(
              ","
            )
          );
        } else {
          params.delete(
            "micromarket"
          );
        }

        /* -----------------------------------------------------
           CURRENCY / UNIT
        ----------------------------------------------------- */

        if (filters.currency) {
          params.set(
            "currency",
            filters.currency
          );
        }

        if (filters.areaUnit) {
          params.set(
            "areaUnit",
            filters.areaUnit
          );
        }

        /* -----------------------------------------------------
           AI
        ----------------------------------------------------- */

        if (filters.isAi) {
          params.set(
            "type",
            "ai"
          );
        }

        /* -----------------------------------------------------
           FETCH
        ----------------------------------------------------- */

        const query =
          params.toString();

        const response =
          await fetch(
            `/api/properties${query
              ? `?${query}`
              : ""
            }`,
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
            "Failed to fetch properties"
          );
        }

        if (!cancelled) {
          setProperties(
            data.data || []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
            "Failed to fetch properties"
          );

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
    resolvedCity,
    selectedMicromarketNames,
    filters.type,
    filters.minBudget,
    filters.maxBudget,
    filters.area,
    filters.seats,
    filters.currency,
    filters.areaUnit,
    filters.isAi,
    exchangeRates,
    isCoworking,
  ]);

  /* =========================================================
     SAVE LAST SEARCH
  ========================================================= */

  useEffect(() => {
    if (
      !filters.city &&
      !filters.micromarket
    ) {
      return;
    }

    try {
      const searchLocationObj = {
        city:
          resolvedCity ||
          filters.city ||
          "",

        micromarket:
          selectedMicromarketNames.length
            ? selectedMicromarketNames.join(
              ", "
            )
            : filters.micromarket || "",

        propertyType:
          filters.type || "",

        state: "",
      };

      localStorage.setItem(
        "anarock_last_searched_location",
        JSON.stringify(
          searchLocationObj
        )
      );
    } catch (error) {
      console.error(
        "Unable to save last searched location:",
        error
      );
    }
  }, [
    filters.city,
    filters.micromarket,
    filters.type,
    resolvedCity,
    selectedMicromarketNames,
  ]);

  /* =========================================================
     UPDATE FILTER
  ========================================================= */

  const updateFilter = (
    key,
    value
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    /* -------------------------------------------------------
       OFFICE TYPE
       Keep budget values.
       Only remove the incompatible dynamic field.
    ------------------------------------------------------- */

    if (key === "type") {
      if (!value) {
        params.delete("type");
        params.delete("area");
        params.delete("seats");
      } else {
        params.set(
          "type",
          toUrlValue(value)
        );

        const nextIsCoworking =
          normalizeValue(
            value
          ) ===
          "managed office/co-working";

        if (nextIsCoworking) {
          params.delete("area");
        } else {
          params.delete("seats");
        }
      }

      router.push(
        `/properties${params.toString()
          ? `?${params.toString()}`
          : ""
        }`
      );

      return;
    }

    /* -------------------------------------------------------
       NORMAL FILTER
    ------------------------------------------------------- */

    if (value !== "") {
      params.set(
        key,
        value
      );
    } else {
      params.delete(key);
    }

    /* -------------------------------------------------------
       DYNAMIC FIELD SAFETY
    ------------------------------------------------------- */

    if (
      key === "area" &&
      isCoworking
    ) {
      params.delete("area");
    }

    if (
      key === "seats" &&
      !isCoworking
    ) {
      params.delete("seats");
    }

    router.push(
      `/properties${params.toString()
        ? `?${params.toString()}`
        : ""
      }`
    );
  };

  /* =========================================================
     CITY CHANGE
  ========================================================= */

  const handleCityChange = (
    selectedCity
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (selectedCity) {
      params.set(
        "city",
        toUrlValue(
          selectedCity
        )
      );
    } else {
      params.delete("city");
    }

    params.delete(
      "micromarket"
    );

    router.push(
      `/properties${params.toString()
        ? `?${params.toString()}`
        : ""
      }`
    );

    setShowMicromarkets(false);
  };

  /* =========================================================
     MICROMARKET TOGGLE
  ========================================================= */

  const toggleMicromarket = (
    micromarketId
  ) => {
    const id =
      String(micromarketId);

    let nextSelected;

    if (
      selectedMicromarkets.includes(
        id
      )
    ) {
      nextSelected =
        selectedMicromarkets.filter(
          (selectedId) =>
            selectedId !== id
        );
    } else {
      nextSelected = [
        ...selectedMicromarkets,
        id,
      ];
    }

    const selectedNames =
      nextSelected
        .map((selectedId) => {
          const market =
            micromarkets.find(
              (item) =>
                String(
                  item.id
                ) ===
                String(
                  selectedId
                )
            );

          return (
            market?.name || ""
          );
        })
        .filter(Boolean);

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (
      selectedNames.length
    ) {
      params.set(
        "micromarket",
        selectedNames
          .map(toUrlValue)
          .join(",")
      );
    } else {
      params.delete(
        "micromarket"
      );
    }

    router.push(
      `/properties${params.toString()
        ? `?${params.toString()}`
        : ""
      }`
    );
  };

  const selectAllMicromarkets =
    () => {
      const params =
        new URLSearchParams(
          searchParams.toString()
        );

      params.delete(
        "micromarket"
      );

      router.push(
        `/properties${params.toString()
          ? `?${params.toString()}`
          : ""
        }`
      );

      setShowMicromarkets(
        false
      );
    };

  /* =========================================================
     CLEAR FILTER
  ========================================================= */

  const clearFilter = (
    key
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.delete(key);

    router.push(
      `/properties${params.toString()
        ? `?${params.toString()}`
        : ""
      }`
    );
  };

  /* =========================================================
     CLEAR ALL
  ========================================================= */

  const clearAll = () => {
    router.push(
      "/properties"
    );

    setShowMicromarkets(
      false
    );
  };

  /* =========================================================
     CURRENCY ICON
  ========================================================= */

  const renderCurrencyIcon =
    () => {
      switch (
      String(
        filters.currency ||
        currency
      ).toUpperCase()
      ) {
        case "USD":
        case "SGD":
          return (
            <DollarSign className="h-4 w-4 text-[#A054A0]" />
          );

        case "EUR":
          return (
            <Euro className="h-4 w-4 text-[#A054A0]" />
          );

        case "AED":
          return (
            <span className="text-xs font-bold text-[#A054A0]">
              د.إ
            </span>
          );

        default:
          return (
            <IndianRupee className="h-4 w-4 text-[#A054A0]" />
          );
      }
    };

  /* =========================================================
     ACTIVE CHIPS
  ========================================================= */

  const activeChips = [
    filters.city && {
      label: `City: ${resolvedCity ||
        filters.city
        }`,
      key: "city",
    },

    filters.micromarket && {
      label: `Micromarkets: ${selectedMicromarketNames.length
        ? selectedMicromarketNames.join(
          ", "
        )
        : filters.micromarket
        }`,
      key: "micromarket",
    },

    filters.type &&
    filters.type !== "ai" && {
      label: `Type: ${filters.type}`,
      key: "type",
    },

    filters.minBudget && {
      label: `Min ${isCoworking
        ? "Seat Price"
        : "Rent"
        }: ${formatPrice(
          Number(
            filters.minBudget
          ),
          filters.currency,
          exchangeRates
        )}`,
      key: "minBudget",
    },

    filters.maxBudget && {
      label: `Max ${isCoworking
        ? "Seat Price"
        : "Rent"
        }: ${formatPrice(
          Number(
            filters.maxBudget
          ),
          filters.currency,
          exchangeRates
        )}`,
      key: "maxBudget",
    },

    !isCoworking &&
    filters.area && {
      label: `Min Area: ${formatArea(
        Number(filters.area),
        filters.areaUnit
      )}`,
      key: "area",
    },

    isCoworking &&
    filters.seats && {
      label: `Seats: ${Number(
        filters.seats
      ).toLocaleString(
        "en-IN"
      )}`,
      key: "seats",
    },

    filters.prompt && {
      label: `AI: ${filters.prompt.slice(
        0,
        40
      )}${filters.prompt.length >
        40
        ? "..."
        : ""
        }`,
      key: "prompt",
    },
  ].filter(Boolean);

  /* =========================================================
     BREADCRUMBS
  ========================================================= */

  const breadcrumbs = [
    {
      label: "Properties",
      href: "/properties",
    },

    ...(resolvedCity
      ? [
        {
          label:
            resolvedCity,
        },
      ]
      : []),
  ];

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-4">

        <Breadcrumbs
          items={breadcrumbs}
        />

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              {filters.isAi ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-amber-500" />
                  AI Recommended Properties
                </span>
              ) : resolvedCity ? (
                `Commercial Properties in ${resolvedCity}`
              ) : (
                "All Commercial Properties"
              )}
            </h1>

            <p className="mt-1 text-sm text-slate-600">
              {loading
                ? "Searching..."
                : `${properties.length} properties found`}
            </p>
          </div>

          <button
            onClick={() =>
              setShowFilters(
                !showFilters
              )
            }
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* =====================================================
            ACTIVE FILTER CHIPS
        ===================================================== */}

        {activeChips.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {activeChips.map(
              (chip) => (
                <button
                  key={`${chip.key}-${chip.label}`}
                  onClick={() =>
                    clearFilter(
                      chip.key
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200"
                >
                  {chip.label}
                  <X className="h-3 w-3" />
                </button>
              )
            )}

            <button
              onClick={clearAll}
              className="text-xs text-slate-500 underline hover:text-slate-800"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">

          {/* ===================================================
              FILTER SIDEBAR
          =================================================== */}

          <aside
            className={
              showFilters
                ? "fixed inset-0 z-[100] bg-slate-950/50 lg:relative lg:inset-auto lg:z-auto lg:bg-transparent"
                : "hidden lg:block"
            }
          >
            <div
              className={`border border-slate-200 bg-white p-4 lg:sticky lg:top-24 ${showFilters
                ? "absolute right-0 top-[72px] h-[calc(100%-72px)] w-[min(88vw,360px)] max-w-full overflow-y-auto rounded-t-2xl rounded-b-none shadow-2xl lg:relative lg:top-auto lg:right-auto lg:w-auto lg:h-auto lg:shadow-none"
                : "rounded-xl"
                }`}
            >

              {/* FILTER HEADER */}

              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  Filters
                </h3>

                <button
                  onClick={() =>
                    setShowFilters(
                      false
                    )
                  }
                  className="lg:hidden"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">

                {/* =================================================
                    CITY
                ================================================= */}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">
                    City
                  </label>

                  <select
                    value={
                      resolvedCity
                    }
                    onChange={(e) =>
                      handleCityChange(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#A054A0] focus:outline-none"
                  >
                    <option value="">
                      All Cities
                    </option>

                    {cities.map(
                      (
                        cityOption
                      ) => (
                        <option
                          key={
                            cityOption
                          }
                          value={
                            cityOption
                          }
                        >
                          {
                            cityOption
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* =================================================
                    MICROMARKET
                ================================================= */}

                <div className="relative">
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">
                    Micromarket
                  </label>

                  <button
                    type="button"
                    disabled={
                      !resolvedCity ||
                      micromarketsLoading
                    }
                    onClick={() =>
                      setShowMicromarkets(
                        !showMicromarkets
                      )
                    }
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${!resolvedCity
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : "border-slate-300 bg-white text-slate-900 hover:border-[#A054A0]"
                      }`}
                  >
                    <span className="truncate">
                      {micromarketsLoading
                        ? "Loading micromarkets..."
                        : selectedMicromarkets.length ===
                          0
                          ? "All Micromarkets"
                          : `${selectedMicromarkets.length} selected`}
                    </span>

                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${showMicromarkets
                        ? "rotate-180"
                        : ""
                        }`}
                    />
                  </button>

                  {showMicromarkets &&
                    resolvedCity &&
                    !micromarketsLoading && (
                      <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">

                        <button
                          type="button"
                          onClick={
                            selectAllMicromarkets
                          }
                          className="flex w-full items-center gap-2 border-b border-slate-100 px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded border ${selectedMicromarkets.length ===
                              0
                              ? "border-[#A054A0] bg-[#A054A0]"
                              : "border-slate-300"
                              }`}
                          >
                            {selectedMicromarkets.length ===
                              0 && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                          </span>

                          <span className="font-medium text-slate-800">
                            All Micromarkets
                          </span>
                        </button>

                        <div className="max-h-64 overflow-y-auto">
                          {micromarkets.length ===
                            0 ? (
                            <div className="px-3 py-3 text-sm text-slate-500">
                              No micromarkets
                              found
                            </div>
                          ) : (
                            micromarkets.map(
                              (market) => {
                                const id =
                                  String(
                                    market.id
                                  );

                                const selected =
                                  selectedMicromarkets.includes(
                                    id
                                  );

                                return (
                                  <button
                                    key={id}
                                    type="button"
                                    onClick={() =>
                                      toggleMicromarket(
                                        id
                                      )
                                    }
                                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                                  >
                                    <span
                                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selected
                                        ? "border-[#A054A0] bg-[#A054A0]"
                                        : "border-slate-300"
                                        }`}
                                    >
                                      {selected && (
                                        <Check className="h-3 w-3 text-white" />
                                      )}
                                    </span>

                                    <span
                                      className={`truncate ${selected
                                        ? "font-medium text-slate-900"
                                        : "text-slate-700"
                                        }`}
                                    >
                                      {
                                        market.name
                                      }
                                    </span>
                                  </button>
                                );
                              }
                            )
                          )}
                        </div>

                        <div className="border-t border-slate-100 p-2">
                          <button
                            type="button"
                            onClick={() =>
                              setShowMicromarkets(
                                false
                              )
                            }
                            className="w-full rounded-md bg-slate-900 py-2 text-xs font-medium text-white hover:bg-slate-800"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                </div>

                {/* =================================================
                    OFFICE TYPE
                ================================================= */}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">
                    Office Type
                  </label>

                  <select
                    value={
                      filters.type ===
                        "ai"
                        ? ""
                        : filters.type
                    }
                    onChange={(e) =>
                      updateFilter(
                        "type",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#A054A0] focus:outline-none"
                  >
                    <option value="">
                      All Types
                    </option>

                    {OFFICE_TYPES.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* =================================================
                    DYNAMIC FILTERS
                ================================================= */}

                {isCoworking ? (
                  <>
                    {/* SEATS */}

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Required Seats
                      </label>

                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          type="number"
                          min="0"
                          value={
                            filters.seats
                          }
                          onChange={(e) =>
                            updateFilter(
                              "seats",
                              e.target
                                .value
                            )
                          }
                          placeholder="e.g. 50"
                          className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#A054A0] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* MIN SEAT PRICE */}

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Min Seat Price / month (
                        {filters.currency}
                        )
                      </label>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50">
                          {renderCurrencyIcon()}
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={
                            filters.minBudget
                          }
                          onChange={(e) =>
                            updateFilter(
                              "minBudget",
                              e.target
                                .value
                            )
                          }
                          placeholder="Min seat price"
                          className="w-full rounded-lg border border-slate-300 py-2 pl-11 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#A054A0] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* MAX SEAT PRICE */}

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Max Seat Price / month (
                        {filters.currency}
                        )
                      </label>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50">
                          {renderCurrencyIcon()}
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={
                            filters.maxBudget
                          }
                          onChange={(e) =>
                            updateFilter(
                              "maxBudget",
                              e.target
                                .value
                            )
                          }
                          placeholder="Max seat price"
                          className="w-full rounded-lg border border-slate-300 py-2 pl-11 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#A054A0] focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* MIN RENT */}

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Min Rent / month (
                        {filters.currency}
                        )
                      </label>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50">
                          {renderCurrencyIcon()}
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={
                            filters.minBudget
                          }
                          onChange={(e) =>
                            updateFilter(
                              "minBudget",
                              e.target
                                .value
                            )
                          }
                          placeholder="Min rent"
                          className="w-full rounded-lg border border-slate-300 py-2 pl-11 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#A054A0] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* MAX RENT */}

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Max Rent / month (
                        {filters.currency}
                        )
                      </label>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50">
                          {renderCurrencyIcon()}
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={
                            filters.maxBudget
                          }
                          onChange={(e) =>
                            updateFilter(
                              "maxBudget",
                              e.target
                                .value
                            )
                          }
                          placeholder="Max rent"
                          className="w-full rounded-lg border border-slate-300 py-2 pl-11 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#A054A0] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* AREA */}

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Min Area (
                        {filters.areaUnit ===
                          "sqm"
                          ? "sq.m"
                          : "sq.ft"}
                        )
                      </label>

                      <div className="relative">
                        <Maximize2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          type="number"
                          min="0"
                          value={
                            filters.area
                          }
                          onChange={(e) =>
                            updateFilter(
                              "area",
                              e.target
                                .value
                            )
                          }
                          placeholder={
                            filters.areaUnit ===
                              "sqm"
                              ? "Enter area"
                              : "e.g. 2000"
                          }
                          className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#A054A0] focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}



                {filters.isAi && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                      AI Query
                    </label>

                    <textarea
                      value={
                        filters.prompt
                      }
                      onChange={(e) =>
                        updateFilter(
                          "prompt",
                          e.target
                            .value
                        )
                      }
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#A054A0] focus:outline-none"
                    />
                  </div>
                )}

                <button
                  onClick={clearAll}
                  className="w-full rounded-lg border border-slate-300 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Clear All
                </button>
              </div>
            </div>
          </aside>


          <div>
            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map(
                  (_, index) => (
                    <div
                      key={index}
                      className="animate-pulse overflow-hidden rounded-xl bg-white"
                    >
                      <div className="aspect-[4/3] bg-slate-200" />

                      <div className="space-y-2 p-4">
                        <div className="h-4 w-3/4 rounded bg-slate-200" />
                        <div className="h-3 w-1/2 rounded bg-slate-200" />
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-white py-16 text-center">
                <Search className="mx-auto mb-3 h-12 w-12 text-red-300" />

                <h3 className="text-lg font-semibold text-slate-900">
                  Unable to load properties
                </h3>

                <p className="mx-auto mt-1 max-w-2xl text-sm text-slate-500">
                  {error}
                </p>
              </div>
            ) : properties.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
                <Search className="mx-auto mb-3 h-12 w-12 text-slate-300" />

                <h3 className="text-lg font-semibold text-slate-900">
                  No properties found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try adjusting your
                  filters or clear
                  them to see all
                  listings.
                </p>

                <button
                  onClick={clearAll}
                  className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {properties.map(
                  (property) => (
                    <PropertyCard
                      key={
                        property.id ||
                        property.rowId ||
                        property.ROWID
                      }
                      property={
                        property
                      }
                      isCompared={compareSelection.some(
                        (item) =>
                          getPropertyId(
                            item
                          ) ===
                          getPropertyId(
                            property
                          )
                      )}
                      onCompareToggle={
                        handleCompareToggle
                      }
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {compareSelection.length >
          0 && (
            <div className="fixed bottom-20 left-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-xl sm:p-4 lg:bottom-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {
                      compareSelection.length
                    }{" "}
                    of 2 properties
                    selected
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {compareSelection.length ===
                      2
                      ? "Ready to compare your selected properties."
                      : "Select one more property to compare."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={
                      clearCompareSelection
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 sm:px-4 sm:text-sm"
                  >
                    Clear
                  </button>

                  <button
                    type="button"
                    onClick={
                      openComparePage
                    }
                    disabled={
                      compareSelection.length !==
                      2
                    }
                    className="rounded-xl bg-[#A054A0] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#864286] disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-sm"
                  >
                    Compare Properties
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-slate-200 bg-white p-3 lg:hidden">
        <button
          onClick={() =>
            setShowFilters(true)
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </button>

        <button
          onClick={() =>
            router.push(
              "/wishlist"
            )
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-sm font-medium text-slate-950"
        >
          <Heart className="h-4 w-4" />
          Shortlisted
        </button>
      </div>
    </div>
  );
}