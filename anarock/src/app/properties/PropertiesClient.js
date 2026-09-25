"use client";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import PropertyCard from "@/components/properties/PropertyCard";
import { usePreferences } from "@/lib/preferences";
import { useWishlist } from "@/lib/wishlist";
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

const MAX_COMPARE_PROPERTIES = 3;
const MIN_COMPARE_PROPERTIES = 2;
const COMPARE_STORAGE_KEY = "anarock_compare_properties";
const SHORTLIST_STORAGE_KEY = "anarock_shortlist_properties";
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
      toUrlValue(type) === String(value).toLowerCase(),
  );

  return match || value;
};

const getPropertyId = (property) =>
  String(
    property?.id ||
    property?.rowId ||
    property?.ROWID ||
    "",
  );

const getNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(
    String(value)
      .replace(/,/g, "")
      .replace(/[^\d.-]/g, ""),
  );

  return Number.isFinite(number)
    ? number
    : null;
};

const getFirstNumber = (property, fields = []) => {
  for (const field of fields) {
    const value = getNumber(property?.[field]);

    if (value !== null) {
      return value;
    }
  }

  return null;
};

const getAvailableSeats = (property) => {
  return getFirstNumber(property, [
    "seatsOffered",
    "SeatsOffered",
    "seatsAvailable",
    "SeatsAvailable",
    "availableSeats",
    "AvailableSeats",
    "seatCapacity",
    "SeatCapacity",
    "totalSeats",
    "TotalSeats",
  ]);
};

const getPropertyType = (property) => {
  return normalizeValue(
    property?.propertyType ||
    property?.PropertyType ||
    property?.type ||
    property?.Type ||
    property?.officeType ||
    property?.OfficeType ||
    "",
  );
};

const getPropertyCity = (property) => {
  return normalizeValue(
    property?.city ||
    property?.City ||
    property?.cityName ||
    property?.CityName ||
    "",
  );
};

const getPropertyMicromarket = (property) => {
  return normalizeValue(
    property?.micromarket ||
    property?.Micromarket ||
    property?.micromarketName ||
    property?.MicromarketName ||
    "",
  );
};

const getAreaSqft = (property) => {
  return getFirstNumber(property, [
    "areaSqft",
    "AreaSqft",
    "area",
    "Area",
    "superBuiltUpArea",
    "SuperBuiltUpArea",
    "carpetArea",
    "CarpetArea",
    "floorPlate",
    "FloorPlate",
  ]);
};

const getSeatPrice = (property) => {
  return getFirstNumber(property, [
    "monthlyCostPerSeat",
    "MonthlyCostPerSeat",
    "monthlyCostPerSeatInr",
    "MonthlyCostPerSeatInr",
    "pricePerSeat",
    "PricePerSeat",
    "costPerSeat",
    "CostPerSeat",
    "rentPerSeat",
    "RentPerSeat",
  ]);
};

const getSqftPrice = (property) => {
  const directPrice = getFirstNumber(property, [
    "rentPerSqft",
    "RentPerSqft",
    "pricePerSqft",
    "PricePerSqft",
    "ratePerSqft",
    "RatePerSqft",
    "costPerSqft",
    "CostPerSqft",
  ]);

  if (directPrice !== null) {
    return directPrice;
  }

  const rent = getFirstNumber(property, [
    "quotedRent",
    "QuotedRent",
    "monthlyRent",
    "MonthlyRent",
    "rent",
    "Rent",
  ]);

  const area = getAreaSqft(property);

  if (rent !== null && area !== null && area > 0) {
    return rent / area;
  }

  return null;
};


export default function PropertiesClient() {
  const { currency, unit, exchangeRates } = usePreferences();
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [compareSelection, setCompareSelection] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const [micromarkets, setMicromarkets] = useState([]);
  const [micromarketsLoading, setMicromarketsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMicromarkets, setShowMicromarkets] = useState(false);
  useEffect(() => {
    if (!showFilters) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showFilters]);
  const ITEMS_PER_PAGE = 30;
  const currentPage = Math.max(1, Number(searchParams.get("page") || "1") || 1);

  const filters = useMemo(() => {
    const rawType = searchParams.get("type") || "";
    const type = rawType === "ai" ? "ai" : getOfficeTypeFromUrl(rawType);
    return {
      city: searchParams.get("city") || "",
      micromarket: searchParams.get("micromarket") || "",
      type,
      minBudget: searchParams.get("minBudget") || "",
      maxBudget: searchParams.get("maxBudget") || "",
      area: searchParams.get("area") || "",
      seats: searchParams.get("seats") || "",
      currency: searchParams.get("currency") || currency,
      areaUnit: searchParams.get("areaUnit") || unit,
      prompt: searchParams.get("prompt") || "",
      isAi: rawType === "ai" || searchParams.has("prompt"),
    };
  }, [searchParams, currency, unit]);

  useEffect(() => {
    const page = Number(searchParams.get("page") || "1");

    if (page <= 1) return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    router.replace(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`,
    );
  }, [
    filters.city,
    filters.micromarket,
    filters.type,
    filters.minBudget,
    filters.maxBudget,
    filters.area,
    filters.seats,
  ]);

  const normalizedOfficeType = normalizeValue(filters.type);
  const isCoworking = normalizedOfficeType === "managed office/co-working";
  const handleShortlistToggle = (property) => {
    const propertyId = getPropertyId(property);

    if (!propertyId) {
      console.warn("Cannot shortlist property without an ID:", property);
      return;
    }

    toggleWishlist(propertyId);
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchAllProperties() {
      setSuggestionsLoading(true);

      try {
        const response = await fetch("/api/properties", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch suggested properties");
        }

        if (!cancelled) {
          setAllProperties(Array.isArray(data.data) ? data.data : []);
        }
      } catch (error) {
        console.error("Suggested properties error:", error);

        if (!cancelled) {
          setAllProperties([]);
        }
      } finally {
        if (!cancelled) {
          setSuggestionsLoading(false);
        }
      }
    }

    fetchAllProperties();

    return () => {
      cancelled = true;
    };
  }, []);
  const handleCompareToggle = (property) => {
    const propertyId = getPropertyId(property);

    if (!propertyId) {
      console.warn("Cannot compare property without an ID:", property);
      return;
    }

    setCompareSelection((previousSelection) => {
      const alreadySelected = previousSelection.some(
        (item) => getPropertyId(item) === propertyId,
      );

      let updatedSelection;

      // Remove property if already selected
      if (alreadySelected) {
        updatedSelection = previousSelection.filter(
          (item) => getPropertyId(item) !== propertyId,
        );
      }

      // Add property
      else {
        // Maximum 3 properties
        if (previousSelection.length >= MAX_COMPARE_PROPERTIES) {
          return previousSelection;
        }

        updatedSelection = [...previousSelection, property];
      }

      try {
        localStorage.setItem(
          COMPARE_STORAGE_KEY,
          JSON.stringify(updatedSelection),
        );
      } catch (error) {
        console.error("Failed to save comparison properties:", error);
      }

      return updatedSelection;
    });
  };

  const clearCompareSelection = () => {
    setCompareSelection([]);

    try {
      localStorage.removeItem(COMPARE_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear comparison properties:", error);
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
      console.error("Failed to save comparison properties:", error);
      return;
    }

    router.push("/compare");
  };
  useEffect(() => {
    fetch("/api/cities")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setCities(data.cities || []);
        }
      })
      .catch(() => {
        setCities([]);
      });
  }, []);

  useEffect(() => {
    try {
      const savedProperties = localStorage.getItem(COMPARE_STORAGE_KEY);

      if (!savedProperties) {
        return;
      }

      const parsedProperties = JSON.parse(savedProperties);

      if (Array.isArray(parsedProperties)) {
        const validProperties = parsedProperties
          .filter((property) => getPropertyId(property))
          .slice(0, MAX_COMPARE_PROPERTIES);

        setCompareSelection(validProperties);
      }
    } catch (error) {
      console.error("Failed to load comparison properties:", error);
    }
  }, []);
  const resolvedCity = useMemo(() => {
    if (!filters.city) {
      return "";
    }

    const match = cities.find(
      (city) => toUrlValue(city) === filters.city.toLowerCase(),
    );

    return match || filters.city;
  }, [filters.city, cities]);

  useEffect(() => {
    if (!resolvedCity) {
      setMicromarkets([]);
      setShowMicromarkets(false);
      return;
    }

    let cancelled = false;

    setMicromarketsLoading(true);

    fetch(`/api/micromarkets?city=${encodeURIComponent(resolvedCity)}`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) {
          return;
        }

        if (data.success && Array.isArray(data.micromarkets)) {
          setMicromarkets(data.micromarkets);
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

  const selectedMicromarkets = useMemo(() => {
    if (!filters.micromarket || micromarkets.length === 0) {
      return [];
    }

    const selectedNames = filters.micromarket
      .split(",")
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean);

    return micromarkets
      .filter((market) => {
        const marketSlug = toUrlValue(market.name);
        return selectedNames.some(
          (selected) =>
            selected === String(market.name).trim().toLowerCase() ||
            selected === marketSlug,
        );
      })
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
        params.delete("page");
        if (resolvedCity) {
          params.set("city", resolvedCity);
        }
        if (filters.type && filters.type !== "ai") {
          params.set("type", filters.type.toLowerCase());
        }
        if (filters.minBudget !== "") {
          const value = Number(filters.minBudget);
          if (Number.isFinite(value)) {
            const converted = convertCurrency(
              value,
              filters.currency,
              "INR",
              exchangeRates,
            );
            params.set("minBudget", String(Math.round(converted)));
          }
        } else {
          params.delete("minBudget");
        }

        if (filters.maxBudget !== "") {
          const value = Number(filters.maxBudget);

          if (Number.isFinite(value)) {
            const converted = convertCurrency(
              value,
              filters.currency,
              "INR",
              exchangeRates,
            );
            params.set("maxBudget", String(Math.round(converted)));
          }
        } else {
          params.delete("maxBudget");
        }

        if (!isCoworking && filters.area !== "") {
          const enteredArea = Number(filters.area);

          if (Number.isFinite(enteredArea)) {
            const areaInSqft = convertArea(
              enteredArea,
              filters.areaUnit,
              "sqft",
            );

            params.set("area", String(Math.round(areaInSqft)));
          }
        } else {
          params.delete("area");
        }

        if (isCoworking && filters.seats !== "") {
          const enteredSeats = Number(filters.seats);

          if (Number.isFinite(enteredSeats)) {
            params.set("seats", String(Math.round(enteredSeats)));
          }
        } else {
          params.delete("seats");
        }

        if (selectedMicromarketNames.length) {
          params.set("micromarket", selectedMicromarketNames.join(","));
        } else {
          params.delete("micromarket");
        }
        if (filters.currency) {
          params.set("currency", filters.currency);
        }
        if (filters.areaUnit) {
          params.set("areaUnit", filters.areaUnit);
        }
        if (filters.isAi) {
          params.set("type", "ai");
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

  useEffect(() => {
    if (!filters.city && !filters.micromarket) {
      return;
    }

    try {
      const searchLocationObj = {
        city: resolvedCity || filters.city || "",

        micromarket: selectedMicromarketNames.length
          ? selectedMicromarketNames.join(", ")
          : filters.micromarket || "",

        propertyType: filters.type || "",

        state: "",
      };

      localStorage.setItem(
        "anarock_last_searched_location",
        JSON.stringify(searchLocationObj),
      );
    } catch (error) {
      console.error("Unable to save last searched location:", error);
    }
  }, [
    filters.city,
    filters.micromarket,
    filters.type,
    resolvedCity,
    selectedMicromarketNames,
  ]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (key === "type") {
      if (!value) {
        params.delete("type");
        params.delete("area");
        params.delete("seats");
      } else {
        params.set("type", toUrlValue(value));

        const nextIsCoworking =
          normalizeValue(value) === "managed office/co-working";

        if (nextIsCoworking) {
          params.delete("area");
        } else {
          params.delete("seats");
        }
      }

      // Any filter change starts from page 1
      params.delete("page");

      router.push(
        `/properties${params.toString() ? `?${params.toString()}` : ""}`,
      );

      return;
    }

    if (value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key === "area" && isCoworking) {
      params.delete("area");
    }

    if (key === "seats" && !isCoworking) {
      params.delete("seats");
    }
    params.delete("page");
    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`,
    );
  };

  const handleCityChange = (selectedCity) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCity) {
      params.set("city", toUrlValue(selectedCity));
    } else {
      params.delete("city");
    }
    params.delete("micromarket");
    params.delete("page");
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

    if (selectedNames.length) {
      params.set("micromarket", selectedNames.map(toUrlValue).join(","));
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

    // Reset pagination
    params.delete("page");

    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`,
    );
  };

  const clearAll = () => {
    router.push("/properties");

    setShowMicromarkets(false);
    setShowFilters(false);
  };

  const renderCurrencyIcon = () => {
    switch (String(filters.currency || currency).toUpperCase()) {
      case "USD":
      case "SGD":
        return <DollarSign className="h-4 w-4 text-[#A054A0]" />;

      case "EUR":
        return <Euro className="h-4 w-4 text-[#A054A0]" />;

      case "AED":
        return <span className="text-xs font-bold text-[#A054A0]">د.إ</span>;

      default:
        return <IndianRupee className="h-4 w-4 text-[#A054A0]" />;
    }
  };

  const getCurrencySymbol = (value) => {
    switch (
    String(value || "")
      .trim()
      .toUpperCase()
    ) {
      case "USD":
        return "$";

      case "EUR":
        return "€";

      case "GBP":
        return "£";

      case "AED":
        return "د.إ";

      case "SGD":
        return "S$";

      case "AUD":
        return "A$";

      case "CAD":
        return "C$";

      case "INR":
      default:
        return "₹";
    }
  };

  const formatRawNumber = (value) => {
    if (value === "" || value === null || value === undefined) {
      return "";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return String(value);
    }

    return number.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  };

  const getAreaUnitLabel = (value) => {
    switch (
    String(value || "")
      .trim()
      .toLowerCase()
    ) {
      case "sqm":
      case "sq.m":
      case "square meter":
      case "square meters":
        return "sq.m";

      case "sqyd":
      case "sq.yd":
      case "square yard":
      case "square yards":
        return "sq.yd";

      case "acre":
      case "acres":
        return "acre";

      case "hectare":
      case "hectares":
        return "hectare";

      case "sqft":
      case "sq.ft":
      case "square feet":
      case "square foot":
      default:
        return "sq.ft";
    }
  };

  const currencySymbol = getCurrencySymbol(filters.currency);

  const areaUnitLabel = getAreaUnitLabel(filters.areaUnit);

  const activeChips = [
    filters.city && {
      label: `City: ${resolvedCity || filters.city}`,
      key: "city",
    },

    filters.micromarket && {
      label: `Micromarkets: ${selectedMicromarketNames.length
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

    filters.minBudget !== "" && {
      label: `Min ${isCoworking ? "Seat Price" : "Rent"
        }: ${currencySymbol}${formatRawNumber(filters.minBudget)}`,

      key: "minBudget",
    },

    filters.maxBudget !== "" && {
      label: `Max ${isCoworking ? "Seat Price" : "Rent"
        }: ${currencySymbol}${formatRawNumber(filters.maxBudget)}`,

      key: "maxBudget",
    },

    !isCoworking &&
    filters.area !== "" && {
      label: `Min Area: ${formatRawNumber(filters.area)} ${areaUnitLabel}`,

      key: "area",
    },

    isCoworking &&
    filters.seats !== "" && {
      label: `Seats: ${formatRawNumber(filters.seats)}`,

      key: "seats",
    },

    filters.prompt && {
      label: `AI: ${filters.prompt.slice(0, 40)}${filters.prompt.length > 40 ? "..." : ""
        }`,

      key: "prompt",
    },
  ].filter(Boolean);

  const totalPages = Math.max(1, Math.ceil(properties.length / ITEMS_PER_PAGE));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProperties = properties.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(1, page), totalPages);

    const params = new URLSearchParams(searchParams.toString());

    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }

    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getPaginationPages = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page++) {
        pages.push(page);
      }

      return pages;
    }

    pages.push(1);

    if (safeCurrentPage > 4) {
      pages.push("ellipsis-start");
    }

    const start = Math.max(2, safeCurrentPage - 1);

    const end = Math.min(totalPages - 1, safeCurrentPage + 1);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    if (safeCurrentPage < totalPages - 3) {
      pages.push("ellipsis-end");
    }

    pages.push(totalPages);

    return pages;
  };

  const breadcrumbs = [
    {
      label: "Properties",
      href: "/properties",
    },

    ...(resolvedCity
      ? [
        {
          label: resolvedCity,
        },
      ]
      : []),
  ];

  const requestedCapacity = isCoworking
    ? getNumber(filters.seats)
    : filters.area !== ""
      ? convertArea(getNumber(filters.area) || 0, filters.areaUnit, "sqft")
      : null;


  const requestedPrice = useMemo(() => {
    const min = getNumber(filters.minBudget);

    const max = getNumber(filters.maxBudget);

    if (min !== null && max !== null) {
      return (min + max) / 2;
    }

    if (max !== null) {
      return max;
    }

    if (min !== null) {
      return min;
    }

    return null;
  }, [filters.minBudget, filters.maxBudget]);

  const suggestedProperties = useMemo(() => {
    if (!Array.isArray(allProperties) || allProperties.length === 0) {
      return [];
    }

    const filteredIds = new Set(
      properties.map((property) => getPropertyId(property)).filter(Boolean),
    );

    const requestedCity = normalizeValue(resolvedCity || filters.city);

    const requestedType =
      filters.type && filters.type !== "ai" ? normalizeValue(filters.type) : "";

    const requestedMicromarkets = selectedMicromarketNames
      .map(normalizeValue)
      .filter(Boolean);

    const hasCity = Boolean(requestedCity);

    const hasType = Boolean(requestedType);

    const hasMicromarket = requestedMicromarkets.length > 0;

    const scored = allProperties
      .filter((property) => {
        const id = getPropertyId(property);

        return id && !filteredIds.has(id);
      })
      .map((property) => {
        const city = getPropertyCity(property);

        const type = getPropertyType(property);

        const micromarket = getPropertyMicromarket(property);

        const cityMatch = hasCity && city === requestedCity;

        const typeMatch = hasType && type === requestedType;

        const micromarketMatch =
          hasMicromarket && requestedMicromarkets.includes(micromarket);

        let tier = 4;

        if (cityMatch && typeMatch && micromarketMatch) {
          tier = 0;
        } else if (cityMatch && typeMatch) {
          tier = 1;
        } else if (cityMatch) {
          tier = 2;
        } else if (typeMatch) {
          tier = 3;
        }

        const available = isCoworking
          ? getAvailableSeats(property)
          : getAreaSqft(property);

        let capacityRank = 2;

        let capacityDistance = Number.POSITIVE_INFINITY;

        if (
          requestedCapacity !== null &&
          requestedCapacity > 0 &&
          available !== null &&
          available > 0
        ) {
          capacityRank = available >= requestedCapacity ? 0 : 1;

          capacityDistance = Math.abs(available - requestedCapacity);
        } else if (requestedCapacity === null && available !== null) {
          capacityRank = 0;
          capacityDistance = 0;
        }

        const price = isCoworking
          ? getSeatPrice(property)
          : getSqftPrice(property);

        let priceRank = 2;

        let priceDistance = Number.POSITIVE_INFINITY;

        if (price !== null && price >= 0) {
          if (requestedPrice !== null && requestedPrice >= 0) {
            const minBudget = getNumber(filters.minBudget);

            const maxBudget = getNumber(filters.maxBudget);

            const withinBudget =
              (minBudget === null || price >= minBudget) &&
              (maxBudget === null || price <= maxBudget);

            priceRank = withinBudget ? 0 : 1;

            priceDistance = Math.abs(price - requestedPrice);
          } else {
            priceRank = 0;
            priceDistance = price;
          }
        }

        return {
          property,
          tier,
          capacityRank,
          capacityDistance,
          priceRank,
          priceDistance,
        };
      });

    scored.sort((a, b) => {
      if (a.tier !== b.tier) {
        return a.tier - b.tier;
      }

      if (a.capacityRank !== b.capacityRank) {
        return a.capacityRank - b.capacityRank;
      }

      if (a.capacityDistance !== b.capacityDistance) {
        return a.capacityDistance - b.capacityDistance;
      }

      if (a.priceRank !== b.priceRank) {
        return a.priceRank - b.priceRank;
      }

      if (a.priceDistance !== b.priceDistance) {
        return a.priceDistance - b.priceDistance;
      }

      return 0;
    });

    return scored.slice(0, 9).map((item) => item.property);
  }, [
    allProperties,
    properties,
    resolvedCity,
    filters.city,
    filters.type,
    filters.minBudget,
    filters.maxBudget,
    filters.seats,
    filters.area,
    filters.areaUnit,
    selectedMicromarketNames,
    isCoworking,
    requestedCapacity,
    requestedPrice,
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-4">
        <Breadcrumbs items={breadcrumbs} />

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
                : `${properties.length} properties found${properties.length > ITEMS_PER_PAGE
                  ? ` • Page ${safeCurrentPage} of ${totalPages}`
                  : ""
                }`}
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
        {activeChips.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <button
                key={`${chip.key}-${chip.label}`}
                onClick={() => clearFilter(chip.key)}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 hover:bg-amber-200"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            ))}

            <button
              onClick={clearAll}
              className="text-xs text-slate-500 underline hover:text-slate-800"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside
            className={
              showFilters
                ? "fixed inset-0 z-[200] bg-slate-950/50 lg:relative lg:inset-auto lg:z-auto lg:bg-transparent"
                : "hidden lg:block"
            }
          >
            <div
              className={`border border-slate-200 bg-white p-4 ${showFilters
                ? "absolute inset-y-0 right-0 h-full w-[min(88vw,360px)] max-w-full overflow-y-auto rounded-l-2xl shadow-2xl pt-20 lg:relative lg:inset-auto lg:h-auto lg:w-auto lg:overflow-visible lg:rounded-xl lg:shadow-none lg:pt-4"
                : "rounded-xl lg:sticky lg:top-24"
                }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900"> Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">
                    City
                  </label>

                  <select
                    value={resolvedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#A054A0] focus:outline-none"
                  >
                    <option value="">All Cities</option>

                    {cities.map((cityOption) => (
                      <option key={cityOption} value={cityOption}>
                        {cityOption}
                      </option>
                    ))}
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
                    disabled={!resolvedCity || micromarketsLoading}
                    onClick={() => setShowMicromarkets(!showMicromarkets)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${!resolvedCity
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : "border-slate-300 bg-white text-slate-900 hover:border-[#A054A0]"
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
                      className={`h-4 w-4 shrink-0 transition-transform ${showMicromarkets ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {showMicromarkets && resolvedCity && !micromarketsLoading && (
                    <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                      <button
                        type="button"
                        onClick={selectAllMicromarkets}
                        className="flex w-full items-center gap-2 border-b border-slate-100 px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded border ${selectedMicromarkets.length === 0
                            ? "border-[#A054A0] bg-[#A054A0]"
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
                                  {market.name}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>

                      <div className="border-t border-slate-100 p-2">
                        <button
                          type="button"
                          onClick={() => setShowMicromarkets(false)}
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
                    value={filters.type === "ai" ? "" : filters.type}
                    onChange={(e) => updateFilter("type", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#A054A0] focus:outline-none"
                  >
                    <option value="">All Types</option>

                    {OFFICE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
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
                          value={filters.seats}
                          onChange={(e) =>
                            updateFilter("seats", e.target.value)
                          }
                          placeholder="e.g. 50"
                          className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#A054A0] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* MIN SEAT PRICE */}

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Min Seat Price / month ({filters.currency})
                      </label>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50">
                          {renderCurrencyIcon()}
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={filters.minBudget}
                          onChange={(e) =>
                            updateFilter("minBudget", e.target.value)
                          }
                          placeholder="Min seat price"
                          className="w-full rounded-lg border border-slate-300 py-2 pl-11 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#A054A0] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* MAX SEAT PRICE */}

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Max Seat Price / month ({filters.currency})
                      </label>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50">
                          {renderCurrencyIcon()}
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={filters.maxBudget}
                          onChange={(e) =>
                            updateFilter("maxBudget", e.target.value)
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
                        Min Rent / month ({filters.currency})
                      </label>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50">
                          {renderCurrencyIcon()}
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={filters.minBudget}
                          onChange={(e) =>
                            updateFilter("minBudget", e.target.value)
                          }
                          placeholder="Min rent"
                          className="w-full rounded-lg border border-slate-300 py-2 pl-11 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#A054A0] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* MAX RENT */}

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Max Rent / month ({filters.currency})
                      </label>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50">
                          {renderCurrencyIcon()}
                        </span>

                        <input
                          type="number"
                          min="0"
                          value={filters.maxBudget}
                          onChange={(e) =>
                            updateFilter("maxBudget", e.target.value)
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
                        {filters.areaUnit === "sqm" ? "sq.m" : "sq.ft"})
                      </label>

                      <div className="relative">
                        <Maximize2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          type="number"
                          min="0"
                          value={filters.area}
                          onChange={(e) => updateFilter("area", e.target.value)}
                          placeholder={
                            filters.areaUnit === "sqm"
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
                      value={filters.prompt}
                      onChange={(e) => updateFilter("prompt", e.target.value)}
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
                {[...Array(6)].map((_, index) => (
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
                ))}
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
              <>
                {/* =====================================================
                    NO SEARCH RESULTS
                ===================================================== */}

                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-[#241B2B] sm:text-xl">
                    No search results found for your search.
                  </h2>

                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#7D7482]">
                    We couldn&apos;t find a property matching your selected
                    requirements. Please explore other properties near you.
                  </p> </div>

                {/* =====================================================
                    SUGGESTED PROPERTIES
                ===================================================== */}

                {suggestionsLoading ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {[...Array(3)].map((_, index) => (
                      <div
                        key={index}
                        className="overflow-hidden rounded-xl bg-white"
                      >
                        <div className="aspect-[4/3] animate-pulse bg-slate-200" />

                        <div className="space-y-3 p-4">
                          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : suggestedProperties.length > 0 ? (
                  <>
                    <div className="mb-5 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#A054A0]" />

                      <h3 className="text-lg font-semibold text-slate-900">
                        Other properties you may consider
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {suggestedProperties.map((property) => (
                        <div key={getPropertyId(property)} className="relative">
                          <PropertyCard
                            property={property}
                            isCompared={compareSelection.some(
                              (item) =>
                                getPropertyId(item) === getPropertyId(property),
                            )}
                            onCompareToggle={handleCompareToggle}
                            isShortlisted={wishlistIds.some(
                              (id) => String(id) === getPropertyId(property),
                            )}
                            onShortlistToggle={handleShortlistToggle}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                    We couldn&apos;t find any nearby alternative properties at the
                    moment.
                  </div>
                )}
              </>
            ) : (
              <>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {paginatedProperties.map((property) => (
                    <PropertyCard
                      key={property.id || property.rowId || property.ROWID}
                      property={property}
                      isCompared={compareSelection.some(
                        (item) =>
                          getPropertyId(item) === getPropertyId(property),
                      )}
                      onCompareToggle={handleCompareToggle}
                      isShortlisted={wishlistIds.some(
                        (item) =>
                          getPropertyId(item) === getPropertyId(property),
                      )}
                      onShortlistToggle={handleShortlistToggle}
                    />
                  ))}
                </div>

                {/* =====================================================
                    PAGINATION
                ===================================================== */}

                {totalPages > 1 && (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-2 pb-8">
                    <button
                      type="button"
                      onClick={() => goToPage(safeCurrentPage - 1)}
                      disabled={safeCurrentPage === 1}
                      className="
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        px-3
                        py-2
                        text-sm
                        font-medium
                        text-slate-700
                        transition
                        hover:border-[#A054A0]
                        hover:text-[#A054A0]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      Previous
                    </button>

                    {getPaginationPages().map((page, index) =>
                      typeof page === "string" ? (
                        <span
                          key={`${page}-${index}`}
                          className="px-1 text-sm text-slate-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          type="button"
                          onClick={() => goToPage(page)}
                          aria-current={
                            page === safeCurrentPage ? "page" : undefined
                          }
                          className={`
                              min-w-10
                              rounded-lg
                              px-3
                              py-2
                              text-sm
                              font-medium
                              transition
                              ${page === safeCurrentPage
                              ? "bg-[#A054A0] text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-[#A054A0] hover:text-[#A054A0]"
                            }
                            `}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      type="button"
                      onClick={() => goToPage(safeCurrentPage + 1)}
                      disabled={safeCurrentPage === totalPages}
                      className="
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        px-3
                        py-2
                        text-sm
                        font-medium
                        text-slate-700
                        transition
                        hover:border-[#A054A0]
                        hover:text-[#A054A0]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* =====================================================
                    SUGGESTED PROPERTIES
                ===================================================== */}

                {!suggestionsLoading && suggestedProperties.length > 0 && (
                  <section className="mt-10 border-t border-slate-200 pt-9">
                    <div className="mb-5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#A054A0]" />

                        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                          More properties you may consider
                        </h2>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Explore additional properties that are similar to your
                        search.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {suggestedProperties.map((property) => (
                        <div key={getPropertyId(property)} className="relative">
                          <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-full border border-white/70 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#A054A0] shadow-sm backdrop-blur">
                            Suggested
                          </div>

                          <PropertyCard
                            property={property}
                            isCompared={compareSelection.some(
                              (item) =>
                                getPropertyId(item) === getPropertyId(property),
                            )}
                            onCompareToggle={handleCompareToggle}
                            isShortlisted={wishlistIds.some(
                              (id) => String(id) === getPropertyId(property),
                            )}
                            onShortlistToggle={handleShortlistToggle}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>

        {/* =====================================================
    COMPARE TRAY
===================================================== */}

        {compareSelection.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-[150] border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md sm:px-4">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Selection info */}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  {compareSelection.length} of {MAX_COMPARE_PROPERTIES}{" "}
                  properties selected
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {compareSelection.length >= MIN_COMPARE_PROPERTIES
                    ? "Ready to compare your selected properties."
                    : `Select ${MIN_COMPARE_PROPERTIES - compareSelection.length
                    } more property${MIN_COMPARE_PROPERTIES - compareSelection.length === 1
                      ? ""
                      : "ies"
                    } to compare.`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={clearCompareSelection}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-none"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={openComparePage}
                  disabled={
                    compareSelection.length < MIN_COMPARE_PROPERTIES ||
                    compareSelection.length > MAX_COMPARE_PROPERTIES
                  }
                  className="flex-1 rounded-lg bg-[#A054A0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8F478F] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none sm:flex-none"
                >
                  Compare Properties
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
