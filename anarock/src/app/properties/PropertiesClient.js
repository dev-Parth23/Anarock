"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import PropertyCard from "@/components/properties/PropertyCard";
import { usePreferences } from "@/lib/preferences";
import { useWishlist } from "@/lib/wishlist";
import { convertCurrency, convertArea } from "@/lib/format";
import {
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Search,
  ChevronDown,
  Check,
  Users,
  Maximize2,
  IndianRupee,
  DollarSign,
  Euro,
  MessageSquare,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const MAX_COMPARE_PROPERTIES = 3;
const MIN_COMPARE_PROPERTIES = 2;
const COMPARE_STORAGE_KEY = "anarock_compare_properties";
const OFFICE_TYPES = ["Conventional", "Managed Office/Co-working"];
const SORT_CATEGORIES = [
  { id: "recommended", label: "Recommended", value: "" },
  { id: "budget", label: "Budget", ascVal: "budget_asc", descVal: "budget_desc" },
  { id: "seats", label: "Seat Count", ascVal: "seats_asc", descVal: "seats_desc" },
  { id: "area", label: "Area", ascVal: "area_asc", descVal: "area_desc" },
  { id: "name", label: "Alphabetically", ascVal: "name_asc", descVal: "name_desc" },
];

function PropertyCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
      <div className="shimmer-effect relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100" />
      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
        <div className="shimmer-effect h-3 w-1/3 rounded bg-slate-100" />
        <div className="shimmer-effect mt-2.5 h-5 w-4/5 rounded bg-slate-100" />
        <div className="shimmer-effect mt-2 h-3.5 w-1/2 rounded bg-slate-100" />
        <div className="my-3.5 h-px bg-slate-100" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="shimmer-effect h-2.5 w-12 rounded bg-slate-100" />
            <div className="shimmer-effect mt-1.5 h-4 w-20 rounded bg-slate-100" />
          </div>
          <div className="border-l border-slate-100 pl-3">
            <div className="shimmer-effect h-2.5 w-12 rounded bg-slate-100" />
            <div className="shimmer-effect mt-1.5 h-4 w-20 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

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
  String(property?.id || property?.rowId || property?.ROWID || "");

function getCRMPropertyId(property) {
  if (!property || typeof property !== "object") return "";
  const possibleIds = [
    property.crmID,
    property.crmId,
    property.CRM_ID,
    property.zohoPropertyId,
    property.zoho_property_id,
    property.Property_CRM_ID,
    property.propertyCRMId,
  ];

  for (const value of possibleIds) {
    const id = String(value ?? "").trim();
    if (id) return id;
  }
  return "";
}

function readLocalStorageValue(keys) {
  if (typeof window === "undefined") return "";
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw || !raw.trim()) continue;
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "string" || typeof parsed === "number") {
          return String(parsed).trim();
        }
        if (parsed && typeof parsed === "object") {
          const value =
            parsed.city ||
            parsed.City ||
            parsed.name ||
            parsed.Name ||
            parsed.value;
          if (value) return String(value).trim();
        }
      } catch {
        return raw.trim();
      }
      return raw.trim();
    } catch (error) {
      console.error("Unable to read storage key:", key, error);
    }
  }
  return "";
}

function getLastSearchedCityFromStorage() {
  return readLocalStorageValue([
    "anarock_last_searched_city",
    "lastSearchedCity",
    "last_searched_city",
    "requirementCity",
    "requirement_city",
    "selectedCity",
    "selected_city",
    "propertyCity",
    "property_city",
    "searchCity",
    "search_city",
  ]);
}

function getRequirementTypeFromStorage() {
  return readLocalStorageValue([
    "anarock_requirement_type",
    "requirementType",
    "requirement_type",
    "propertyType",
    "property_type",
    "selectedPropertyType",
    "selected_property_type",
    "searchPropertyType",
    "search_property_type",
  ]);
}

function getEnquiryPropertyCity(property) {
  return String(
    property?.city ??
    property?.City ??
    property?.cityName ??
    property?.City_Name ??
    property?.micromarketCity ??
    "",
  ).trim();
}

function getEnquiryPropertyType(property) {
  return String(
    property?.propertyType ??
    property?.Property_Type ??
    property?.property_type ??
    property?.type ??
    property?.Type ??
    property?.officeType ??
    "",
  ).trim();
}

function getStoredUserLocation() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("anarock_user_location");
    if (!raw) return null;
    const location = JSON.parse(raw);
    return {
      street: String(
        location?.area || location?.street || location?.address || "",
      ).trim(),
      city: String(location?.city || "").trim(),
      state: String(location?.state || location?.province || "").trim(),
      country: String(location?.country || "").trim(),
      postalCode: String(
        location?.pincode ||
        location?.postalCode ||
        location?.postal_code ||
        "",
      ).trim(),
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
    };
  } catch (error) {
    console.error("Unable to read saved user location:", error);
    return null;
  }
}

function PropertiesClientContent() {
  const { currency, unit, exchangeRates } = usePreferences();
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquirySelection, setEnquirySelection] = useState([]);
  const [compareSelection, setCompareSelection] = useState([]);
  const [suggestedProperties, setSuggestedProperties] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalPagesFromApi, setTotalPagesFromApi] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const [micromarkets, setMicromarkets] = useState([]);
  const [micromarketsLoading, setMicromarketsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMicromarkets, setShowMicromarkets] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("filters");
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [aiPromptDraft, setAiPromptDraft] = useState("");
  const [appliedAiPrompt, setAppliedAiPrompt] = useState("");

  const hasShortlistedProperties = wishlistIds.length > 0;
  const hasComparedProperties = compareSelection.length > 0;
  const showSelectionBar = hasShortlistedProperties || hasComparedProperties;

  const [enquiryForm, setEnquiryForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

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
    const prompt = searchParams.get("prompt") || "";
    const mode = searchParams.get("mode") || "";
    const isAi = mode === "ai" && Boolean(prompt.trim());
    return {
      city: searchParams.get("city") || "",
      micromarket: searchParams.get("micromarket") || "",
      type: rawType === "ai" ? "" : getOfficeTypeFromUrl(rawType),
      minBudget: searchParams.get("minBudget") || "",
      maxBudget: searchParams.get("maxBudget") || "",
      area: searchParams.get("area") || "",
      maxArea: searchParams.get("maxArea") || "",
      seats: searchParams.get("seats") || "",
      maxSeats: searchParams.get("maxSeats") || "",
      sort: searchParams.get("sort") || "",
      currency: searchParams.get("currency") || currency,
      areaUnit: searchParams.get("areaUnit") || unit,
      prompt,
      isAi,
    };
  }, [searchParams, currency, unit]);

  useEffect(() => {
    const prompt = searchParams.get("prompt") || "";
    setAiPromptDraft(prompt);
    setAppliedAiPrompt(prompt);
  }, [searchParams]);

  const handleApplyAiSearch = () => {
    const prompt = aiPromptDraft.trim();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (prompt) {
      params.set("mode", "ai");
      params.set("prompt", prompt);
      params.delete("type");
    } else {
      params.delete("mode");
      params.delete("prompt");
    }

    setAppliedAiPrompt(prompt);
    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`,
      { scroll: false }
    );
  };

  const openEnquiryForm = () => {
    if (!compareSelection.length) {
      setEnquiryError("Please select at least one property.");
      return;
    }
    setEnquirySelection([...compareSelection]);
    setEnquiryError("");
    setEnquirySuccess(false);
    setIsEnquiryOpen(true);
  };

  const closeEnquiryForm = () => {
    if (isSubmittingEnquiry) return;
    setIsEnquiryOpen(false);
    setEnquiryError("");
    setEnquirySuccess(false);
  };

  const handleEnquiryChange = (e) => {
    const { name, value } = e.target;
    setEnquiryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingEnquiry) return;
    if (!enquirySelection.length) {
      setEnquiryError("Please select at least one property.");
      return;
    }

    setIsSubmittingEnquiry(true);
    setEnquiryError("");

    try {
      const propertiesResponse = await fetch("/api/properties", {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const propertiesData = await propertiesResponse.json().catch(() => ({}));
      const refreshedProperties =
        propertiesResponse.ok &&
          propertiesData?.success &&
          Array.isArray(propertiesData?.data)
          ? propertiesData.data
          : [];

      const freshById = new Map();
      refreshedProperties.forEach((prop) => {
        const id = getPropertyId(prop);
        if (id) freshById.set(String(id), prop);
      });

      const resolvedSelection = enquirySelection.map((prop) => {
        const id = getPropertyId(prop);
        const fresh = id ? freshById.get(String(id)) : null;
        return fresh ? { ...prop, ...fresh } : prop;
      });

      const selectedProperties = resolvedSelection.map((prop) => {
        const crmId = String(getCRMPropertyId(prop) || "").trim();
        if (!crmId || !/^\d+$/.test(crmId)) {
          throw new Error(
            "A selected property is missing its CRM record ID."
          );
        }
        return { id: crmId };
      });

      const requirementCity =
        getLastSearchedCityFromStorage() ||
        resolvedSelection.map(getEnquiryPropertyCity).find(Boolean) ||
        filters.city ||
        "";

      const requirementType =
        getRequirementTypeFromStorage() ||
        resolvedSelection.map(getEnquiryPropertyType).find(Boolean) ||
        filters.type ||
        "";

      const savedLocation = getStoredUserLocation() || {};

      const payload = {
        firstName: enquiryForm.firstName.trim(),
        lastName: enquiryForm.lastName.trim(),
        email: enquiryForm.email.trim(),
        phone: enquiryForm.phone.trim(),
        company: enquiryForm.company.trim(),
        message: enquiryForm.message.trim(),
        source: "Properties",
        selectedProperties,
        requirementCity,
        requirementType,
        location: {
          street: savedLocation.street || "",
          city: savedLocation.city || "",
          state: savedLocation.state || "",
          country: savedLocation.country || "",
          postalCode: savedLocation.postalCode || "",
          latitude: savedLocation.latitude ?? null,
          longitude: savedLocation.longitude ?? null,
        },
      };

      const response = await fetch("/api/lead3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success !== true || !data?.leadId) {
        throw new Error(
          data?.message ||
          data?.error ||
          `CRM did not confirm lead creation. HTTP ${response.status}.`
        );
      }

      setEnquirySuccess(true);
      setEnquiryForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        message: "",
      });
    } catch (err) {
      console.error("[ENQUIRY] Lead creation failed:", err);
      setEnquiryError(
        err?.message || "Unable to submit your enquiry. Please try again."
      );
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  const normalizedOfficeType = normalizeValue(filters.type);
  const sortValue = filters.sort || "";
  const isCoworking = normalizedOfficeType === "managed office/co-working";

  const handleShortlistToggle = useCallback(
    (property) => {
      const id = getPropertyId(property);
      if (id) toggleWishlist(property);
    },
    [toggleWishlist]
  );

  const handleCompareToggle = useCallback((property) => {
    const id = getPropertyId(property);
    if (!id) return;

    setCompareSelection((prev) => {
      const alreadySelected = prev.some((item) => getPropertyId(item) === id);
      let updated;
      if (alreadySelected) {
        updated = prev.filter((item) => getPropertyId(item) !== id);
      } else {
        if (prev.length >= MAX_COMPARE_PROPERTIES) return prev;
        updated = [...prev, property];
      }
      try {
        localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save comparison properties:", e);
      }
      return updated;
    });
  }, []);

  const clearCompareSelection = () => {
    setCompareSelection([]);
    try {
      localStorage.removeItem(COMPARE_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear comparison properties:", e);
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
    } catch (e) {
      console.error("Failed to save comparison properties:", e);
      return;
    }
    router.push("/compare");
  };

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCities(data.cities);
      })
      .catch(() => setCities([]));
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const valid = parsed
          .filter((p) => getPropertyId(p))
          .slice(0, MAX_COMPARE_PROPERTIES);
        setCompareSelection(valid);
      }
    } catch (e) {
      console.error("Failed to load comparison properties:", e);
    }
  }, []);

  const resolvedCity = useMemo(() => {
    if (!filters.city) return "";
    const match = cities.find(
      (c) => toUrlValue(c) === filters.city.toLowerCase()
    );
    return match || filters.city;
  }, [filters.city, cities]);

  useEffect(() => {
    if (!resolvedCity) {
      setMicromarkets([]);
      setShowMicromarkets(false);
      return;
    }
    const controller = new AbortController();
    setMicromarketsLoading(true);
    fetch(`/api/micromarkets?city=${encodeURIComponent(resolvedCity)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.micromarkets)) {
          setMicromarkets(data.micromarkets);
        } else {
          setMicromarkets([]);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") setMicromarkets([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setMicromarketsLoading(false);
      });

    return () => controller.abort();
  }, [resolvedCity]);

  const selectedMicromarkets = useMemo(() => {
    if (!filters.micromarket || micromarkets.length === 0) return [];
    const selectedNames = filters.micromarket
      .split(",")
      .map((n) => n.trim().toLowerCase())
      .filter(Boolean);

    return micromarkets
      .filter((market) => {
        const marketSlug = toUrlValue(market.name);
        return selectedNames.some(
          (selected) =>
            selected === String(market.name).trim().toLowerCase() ||
            selected === marketSlug
        );
      })
      .map((market) => String(market.id));
  }, [filters.micromarket, micromarkets]);

  const selectedMicromarketNames = useMemo(() => {
    if (selectedMicromarkets.length === 0) return [];
    return selectedMicromarkets
      .map(
        (id) =>
          micromarkets.find((item) => String(item.id) === String(id))?.name ||
          ""
      )
      .filter(Boolean);
  }, [selectedMicromarkets, micromarkets]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProperties() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("pageSize", String(ITEMS_PER_PAGE));
        if (resolvedCity) params.set("city", resolvedCity);
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
              exchangeRates
            );
            params.set("minBudget", String(Math.round(converted)));
          }
        }

        if (!isCoworking && filters.area !== "") {
          const enteredArea = Number(filters.area);
          if (Number.isFinite(enteredArea)) {
            const areaInSqft = convertArea(
              enteredArea,
              filters.areaUnit,
              "sqft"
            );
            params.set("area", String(Math.round(areaInSqft)));
          }
        }

        if (isCoworking && filters.seats !== "") {
          const enteredSeats = Number(filters.seats);
          if (Number.isFinite(enteredSeats)) {
            params.set("seats", String(Math.round(enteredSeats)));
          }
        }

        if (selectedMicromarketNames.length) {
          params.set("micromarket", selectedMicromarketNames.join(","));
        }

        if (sortValue) params.set("sort", sortValue);

        const prompt = appliedAiPrompt.trim();
        const shouldUseAi = Boolean(prompt);

        if (shouldUseAi) {
          params.set("mode", "ai");
          params.set("prompt", prompt);
        }

        const query = params.toString();
        const response = shouldUseAi
          ? await fetch("/api/ai-search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              ...Object.fromEntries(params.entries()),
              mode: "ai",
              prompt,
            }),
            cache: "no-store",
            signal: controller.signal,
          })
          : await fetch(`/api/properties?${query}`, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
            signal: controller.signal,
          });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch properties");
        }

        if (filters.isAi && data.interpretedQuery) {
          const interpreted = data.interpretedQuery;
          const nextParams = new URLSearchParams(searchParams.toString());
          nextParams.set("mode", "ai");
          nextParams.set("prompt", filters.prompt || "");

          const setOrDelete = (key, value) => {
            if (value !== null && value !== undefined && value !== "") {
              nextParams.set(key, String(value));
            } else {
              nextParams.delete(key);
            }
          };

          setOrDelete(
            "city",
            interpreted.city ? toUrlValue(interpreted.city) : ""
          );
          setOrDelete(
            "micromarket",
            interpreted.micromarket ? toUrlValue(interpreted.micromarket) : ""
          );
          setOrDelete(
            "type",
            interpreted.type ? toUrlValue(interpreted.type) : ""
          );
          setOrDelete("area", interpreted.minArea);
          setOrDelete("maxArea", interpreted.maxArea);
          setOrDelete("seats", interpreted.minSeats);
          setOrDelete("maxSeats", interpreted.maxSeats);
          setOrDelete("minBudget", interpreted.minPrice);
          setOrDelete("maxBudget", interpreted.maxPrice);
          nextParams.delete("page");

          if (nextParams.toString() !== searchParams.toString()) {
            router.replace(`/properties?${nextParams.toString()}`, {
              scroll: false,
            });
          }
        }

        setProperties(Array.isArray(data.data) ? data.data : []);
        setTotalProperties(Number(data.total || 0));
        setTotalPagesFromApi(Math.max(1, Number(data.totalPages || 1)));
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("[PropertiesClient] Fetch failed:", err);
          setError(err?.message || "Failed to fetch properties");
          setProperties([]);
          setTotalProperties(0);
          setTotalPagesFromApi(1);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchProperties();
    return () => controller.abort();
  }, [
    currentPage,
    resolvedCity,
    selectedMicromarketNames,
    filters.type,
    filters.minBudget,
    filters.area,
    filters.seats,
    filters.currency,
    filters.areaUnit,
    filters.prompt,
    filters.isAi,
    filters.sort,
    sortValue,
    appliedAiPrompt,
    exchangeRates,
    isCoworking,
    router,
    searchParams,
  ]);

  // Always fetch suggestions whenever properties or filters change, so they can always be shown outside filter results
  useEffect(() => {
    if (loading) return;

    const controller = new AbortController();

    async function fetchSuggestions() {
      setSuggestionsLoading(true);
      try {
        const params = new URLSearchParams();
        if (resolvedCity) params.set("city", resolvedCity);
        if (filters.type && filters.type !== "ai") {
          params.set("type", filters.type.toLowerCase());
        }
        if (selectedMicromarketNames.length) {
          params.set("micromarket", selectedMicromarketNames.join(","));
        }
        if (filters.minBudget !== "") {
          const value = Number(filters.minBudget);
          if (Number.isFinite(value)) {
            const converted = convertCurrency(
              value,
              filters.currency,
              "INR",
              exchangeRates
            );
            params.set("minBudget", String(Math.round(converted)));
          }
        }

        const excludeIds = properties
          .map((p) => getPropertyId(p))
          .filter(Boolean);
        if (excludeIds.length > 0) {
          params.set("exclude", excludeIds.join(","));
        }

        const response = await fetch(
          `/api/properties/suggestions?${params.toString()}`,
          { cache: "no-store", signal: controller.signal }
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Suggestions search failed");
        }

        setSuggestedProperties(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        if (err?.name !== "AbortError") setSuggestedProperties([]);
      } finally {
        if (!controller.signal.aborted) setSuggestionsLoading(false);
      }
    }

    fetchSuggestions();
    return () => controller.abort();
  }, [
    loading,
    properties,
    resolvedCity,
    filters.type,
    filters.minBudget,
    filters.currency,
    selectedMicromarketNames,
    exchangeRates,
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
        if (nextIsCoworking) params.delete("area");
        else params.delete("seats");
      }
      params.delete("page");
      router.push(
        `/properties${params.toString() ? `?${params.toString()}` : ""}`
      );
      return;
    }

    if (value !== "") params.set(key, value);
    else params.delete(key);

    if (key === "area" && isCoworking) params.delete("area");
    if (key === "seats" && !isCoworking) params.delete("seats");

    params.delete("page");
    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`
    );
  };

  const handleSortChange = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("sort", value);
    else params.delete("sort");

    params.delete("page");
    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`
    );
    setShowFilters(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryClick = (category) => {
    if (category.id === "recommended") {
      handleSortChange("");
      return;
    }
    const isActive = sortValue.startsWith(category.id);
    let nextVal = category.ascVal;
    if (isActive) {
      nextVal =
        sortValue === category.ascVal ? category.descVal : category.ascVal;
    }
    handleSortChange(nextVal);
  };

  const handleCityChange = (selectedCity) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCity) params.set("city", toUrlValue(selectedCity));
    else params.delete("city");

    params.delete("micromarket");
    params.delete("page");
    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`
    );
    setShowMicromarkets(false);
  };

  const toggleMicromarket = (micromarketId) => {
    const id = String(micromarketId);
    const nextSelected = selectedMicromarkets.includes(id)
      ? selectedMicromarkets.filter((selectedId) => selectedId !== id)
      : [...selectedMicromarkets, id];

    const selectedNames = nextSelected
      .map(
        (selectedId) =>
          micromarkets.find((item) => String(item.id) === String(selectedId))
            ?.name || ""
      )
      .filter(Boolean);

    const params = new URLSearchParams(searchParams.toString());
    if (selectedNames.length) params.set("micromarket", selectedNames.join(","));
    else params.delete("micromarket");

    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`
    );
  };

  const selectAllMicromarkets = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("micromarket");
    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`
    );
    setShowMicromarkets(false);
  };

  const clearFilter = (key) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`
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
    switch (String(value || "").trim().toUpperCase()) {
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "AED": return "د.إ";
      case "SGD": return "S$";
      case "AUD": return "A$";
      case "CAD": return "C$";
      case "INR":
      default: return "₹";
    }
  };

  const formatRawNumber = (value) => {
    if (value === "" || value === null || value === undefined) return "";
    const number = Number(value);
    if (!Number.isFinite(number)) return String(value);
    return number.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  };

  const currencySymbol = getCurrencySymbol(filters.currency);
  const areaUnitLabel = filters.areaUnit === "sqm" ? "sq.m" : "sq.ft";

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
      label: `Min ${isCoworking ? "Seat Price" : "Rent"}: ${currencySymbol}${formatRawNumber(
        filters.minBudget
      )}`,
      key: "minBudget",
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
      label: `AI: ${filters.prompt.slice(0, 30)}${filters.prompt.length > 30 ? "..." : ""
        }`,
      key: "prompt",
    },
  ].filter(Boolean);

  const totalPages = totalPagesFromApi;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
    if (nextPage === safeCurrentPage) return;

    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));

    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPaginationPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (safeCurrentPage > 4) pages.push("ellipsis-start");

    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (safeCurrentPage < totalPages - 3) pages.push("ellipsis-end");
    pages.push(totalPages);
    return pages;
  };

  const breadcrumbs = [
    { label: "Properties", href: "/properties" },
    ...(resolvedCity ? [{ label: resolvedCity }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 antialiased selection:bg-[#A054A0]/20 selection:text-[#A054A0]">
      <style jsx global>{`
        @keyframes shimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        .shimmer-effect::after {
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.5) 20%,
            rgba(255, 255, 255, 0.8) 60%,
            rgba(255, 255, 255, 0)
          );
          animation: shimmerSweep 1.6s infinite ease-in-out;
          content: "";
        }
      `}</style>

      <Breadcrumbs items={breadcrumbs} />

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                {filters.isAi ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 shrink-0 text-[#A054A0]" />
                    AI Recommended Properties
                  </span>
                ) : resolvedCity ? (
                  `Commercial Properties in ${resolvedCity}`
                ) : (
                  "All Commercial Properties"
                )}
              </h1>
              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                {loading
                  ? "Searching properties..."
                  : `${totalProperties.toLocaleString("en-IN")} properties found${totalProperties > ITEMS_PER_PAGE
                    ? ` • Page ${safeCurrentPage} of ${totalPages}`
                    : ""
                  }`}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleApplyAiSearch();
              }}
              className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-all focus-within:border-[#A054A0] focus-within:ring-2 focus-within:ring-[#A054A0]/10 sm:flex-row lg:max-w-xl"
            >
              <div className="flex flex-1 items-center gap-2 px-2">
                <Sparkles className="h-5 w-5 shrink-0 text-[#A054A0]" />
                <input
                  type="text"
                  value={aiPromptDraft}
                  onChange={(e) => setAiPromptDraft(e.target.value)}
                  placeholder="Describe your ideal office space..."
                  aria-label="Search properties using AI"
                  className="w-full bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                {aiPromptDraft && (
                  <button
                    type="button"
                    onClick={() => setAiPromptDraft("")}
                    aria-label="Clear AI search"
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#A054A0] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#884188] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Search className="h-4 w-4" />
                Apply
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => {
                setSidebarTab("filters");
                setShowFilters(true);
              }}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
            >
              <SlidersHorizontal className="h-4 w-4 shrink-0" />
              Filters
              {activeChips.length > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-slate-900">
                  {activeChips.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setSidebarTab("sort");
                setShowFilters(true);
              }}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#A054A0]/40 hover:text-[#A054A0] active:scale-[0.98]"
            >
              <ArrowUpDown className="h-4 w-4 shrink-0" />
              Sort
              {sortValue && (
                <span className="rounded-full bg-[#A054A0]/10 px-2 py-0.5 text-[10px] font-semibold text-[#A054A0]">
                  Active
                </span>
              )}
            </button>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={`${chip.key}-${chip.label}`}
                onClick={() => clearFilter(chip.key)}
                className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#A054A0] ring-1 ring-inset ring-[#A054A0]/20 transition-all hover:bg-purple-100"
              >
                {chip.label}
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
            <button
              onClick={clearAll}
              className="ml-1 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <aside
            className={
              showFilters
                ? "fixed inset-0 z-[200] bg-slate-950/50 backdrop-blur-sm transition-opacity lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:backdrop-blur-none"
                : "hidden lg:block"
            }
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowFilters(false);
            }}
          >
            <div
              className={`border-slate-200 bg-white shadow-xl lg:sticky lg:top-24 lg:rounded-2xl lg:border lg:p-5 lg:shadow-sm ${showFilters
                ? "fixed inset-y-0 right-0 z-[210] flex w-full max-w-xs flex-col overflow-y-auto p-5 sm:max-w-sm"
                : ""
                }`}
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex w-full items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setSidebarTab("filters")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${sidebarTab === "filters"
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarTab("sort")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${sidebarTab === "sort"
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Sort
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {sidebarTab === "sort" ? (
                <div className="space-y-2">
                  {SORT_CATEGORIES.map((cat) => {
                    const isSelected =
                      cat.id === "recommended"
                        ? !sortValue
                        : sortValue.startsWith(cat.id);
                    const isDesc = sortValue.endsWith("_desc");

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryClick(cat)}
                        className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${isSelected
                          ? "border-[#A054A0]/30 bg-[#A054A0]/5 text-[#A054A0] shadow-sm"
                          : "border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                          }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${isSelected
                            ? "border-[#A054A0]/30 bg-[#A054A0]/10 text-[#A054A0]"
                            : "border-slate-200 bg-slate-50 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600"
                            }`}
                        >
                          {cat.id === "recommended" ? (
                            <ArrowUpDown className="h-4 w-4" />
                          ) : cat.id === "name" ? (
                            "A-Z"
                          ) : isSelected && isDesc ? (
                            <ArrowDown className="h-4 w-4" />
                          ) : (
                            <ArrowUp className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold">
                            {cat.label}
                            {cat.id !== "recommended" && isSelected && (
                              <span className="ml-1 text-[10px] opacity-75">
                                {cat.id === "name"
                                  ? isDesc
                                    ? "(Z-A)"
                                    : "(A-Z)"
                                  : isDesc
                                    ? "(High to Low)"
                                    : "(Low to High)"}
                              </span>
                            )}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                  {sortValue && (
                    <button
                      type="button"
                      onClick={() => handleSortChange("")}
                      className="mt-3 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Reset to Recommended
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      City
                    </label>
                    <select
                      value={resolvedCity}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none transition focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10"
                    >
                      <option value="">All Cities</option>
                      {cities.map((cityOption) => (
                        <option key={cityOption} value={cityOption}>
                          {cityOption}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Micromarket
                    </label>
                    <button
                      type="button"
                      disabled={!resolvedCity || micromarketsLoading}
                      onClick={() => setShowMicromarkets(!showMicromarkets)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all ${!resolvedCity
                        ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                        }`}
                    >
                      <span className="truncate">
                        {micromarketsLoading
                          ? "Loading..."
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
                      <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                        <button
                          type="button"
                          onClick={selectAllMicromarkets}
                          className="flex w-full items-center gap-2 border-b border-slate-100 px-3 py-2 text-xs font-medium hover:bg-slate-50"
                        >
                          <span
                            className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${selectedMicromarkets.length === 0
                              ? "border-[#A054A0] bg-[#A054A0]"
                              : "border-slate-300"
                              }`}
                          >
                            {selectedMicromarkets.length === 0 && (
                              <Check className="h-2.5 w-2.5 text-white" />
                            )}
                          </span>
                          All Micromarkets
                        </button>
                        <div className="max-h-48 overflow-y-auto">
                          {micromarkets.map((market) => {
                            const id = String(market.id);
                            const selected = selectedMicromarkets.includes(id);
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => toggleMicromarket(id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium hover:bg-slate-50"
                              >
                                <span
                                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${selected
                                    ? "border-[#A054A0] bg-[#A054A0]"
                                    : "border-slate-300"
                                    }`}
                                >
                                  {selected && (
                                    <Check className="h-2.5 w-2.5 text-white" />
                                  )}
                                </span>
                                <span className="truncate">{market.name}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="border-t border-slate-100 p-2">
                          <button
                            type="button"
                            onClick={() => setShowMicromarkets(false)}
                            className="w-full rounded-lg bg-slate-900 py-1.5 text-xs font-semibold text-white"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Office Type
                    </label>
                    <select
                      value={filters.type === "ai" ? "" : filters.type}
                      onChange={(e) => updateFilter("type", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none transition focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10"
                    >
                      <option value="">All Types</option>
                      {OFFICE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isCoworking ? (
                    <>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                          Required Seats
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="number"
                            min="0"
                            value={filters.seats}
                            onChange={(e) => updateFilter("seats", e.target.value)}
                            placeholder="e.g. 50"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none focus:border-[#A054A0]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                          Min Seat Price / month ({filters.currency})
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center">
                            {renderCurrencyIcon()}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={filters.minBudget}
                            onChange={(e) => updateFilter("minBudget", e.target.value)}
                            placeholder="Min price"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none focus:border-[#A054A0]"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                          Min Rent / month ({filters.currency})
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center">
                            {renderCurrencyIcon()}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={filters.minBudget}
                            onChange={(e) => updateFilter("minBudget", e.target.value)}
                            placeholder="Min rent"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none focus:border-[#A054A0]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                          Min Area ({areaUnitLabel})
                        </label>
                        <div className="relative">
                          <Maximize2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="number"
                            min="0"
                            value={filters.area}
                            onChange={(e) => updateFilter("area", e.target.value)}
                            placeholder="e.g. 2000"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none focus:border-[#A054A0]"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    onClick={clearAll}
                    className="w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, idx) => (
                  <PropertyCardSkeleton key={idx} />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                <Search className="mx-auto mb-3 h-10 w-10 text-red-400" />
                <h3 className="text-base font-semibold text-slate-900">
                  Unable to load properties
                </h3>
                <p className="mt-1 text-xs text-slate-500">{error}</p>
              </div>
            ) : totalProperties === 0 ? (
              <div className="space-y-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-900">
                    No search results found for your search.
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    We couldn&apos;t find a property matching your selected requirements. Please explore other properties near you.
                  </p>
                </div>

                {suggestionsLoading ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {[...Array(3)].map((_, idx) => (
                      <PropertyCardSkeleton key={idx} />
                    ))}
                  </div>
                ) : suggestedProperties.length > 0 ? (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#A054A0]" />
                      <h3 className="text-base font-semibold text-slate-900">
                        Other properties you may consider
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {suggestedProperties.map((property, idx) => (
                        <PropertyCard
                          key={getPropertyId(property)}
                          priority={idx < 3}
                          property={property}
                          isCompared={compareSelection.some(
                            (item) => getPropertyId(item) === getPropertyId(property)
                          )}
                          onCompareToggle={handleCompareToggle}
                          isShortlisted={wishlistIds.some(
                            (id) => String(id) === getPropertyId(property)
                          )}
                          onShortlistToggle={handleShortlistToggle}
                        />
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {properties.map((property, idx) => (
                    <PropertyCard
                      key={getPropertyId(property)}
                      priority={idx < 3}
                      property={property}
                      isCompared={compareSelection.some(
                        (item) => getPropertyId(item) === getPropertyId(property)
                      )}
                      onCompareToggle={handleCompareToggle}
                      isShortlisted={wishlistIds.some(
                        (item) => getPropertyId(item) === getPropertyId(property)
                      )}
                      onShortlistToggle={handleShortlistToggle}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                    <button
                      type="button"
                      onClick={() => goToPage(safeCurrentPage - 1)}
                      disabled={safeCurrentPage === 1}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {getPaginationPages().map((page, idx) =>
                      typeof page === "string" ? (
                        <span key={`${page}-${idx}`} className="px-1 text-xs text-slate-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          type="button"
                          onClick={() => goToPage(page)}
                          className={`min-w-[36px] rounded-xl py-2 text-xs font-semibold transition ${page === safeCurrentPage
                            ? "bg-[#A054A0] text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() => goToPage(safeCurrentPage + 1)}
                      disabled={safeCurrentPage === totalPages}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Always show suggested properties lying out of / below the filter results */}
                {!suggestionsLoading && suggestedProperties.length > 0 && (
                  <section className="border-t border-slate-200 pt-10">
                    <div className="mb-5 text-center sm:text-left">
                      <div className="flex items-center justify-center gap-2 sm:justify-start">
                        <Sparkles className="h-5 w-5 text-[#A054A0]" />
                        <h2 className="text-lg font-semibold text-slate-900">
                          More properties you may consider
                        </h2>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Explore additional properties that are similar to your search.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                      {suggestedProperties.map((property) => {
                        const propertyId = getPropertyId(property);
                        return (
                          <div key={propertyId} className="relative">
                            <PropertyCard
                              property={property}
                              isCompared={compareSelection.some(
                                (item) => getPropertyId(item) === propertyId
                              )}
                              onCompareToggle={handleCompareToggle}
                              isShortlisted={wishlistIds.some(
                                (id) => String(id) === propertyId
                              )}
                              onShortlistToggle={handleShortlistToggle}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {showSelectionBar && (
        <div className="fixed bottom-0 inset-x-0 z-[150] border-t border-slate-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-md pb-safe">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {/* <p className="text-xs font-bold text-slate-900">
                {compareSelection.length} of {MAX_COMPARE_PROPERTIES} properties selected
              </p>
              <p className="text-[11px] text-slate-500">
                {compareSelection.length >= MIN_COMPARE_PROPERTIES
                  ? "Ready to run side-by-side comparison."
                  : `Select ${MIN_COMPARE_PROPERTIES - compareSelection.length} more to compare.`}
              </p> */}
              <p className="text-xs font-bold text-slate-900">
                {compareSelection.length} of {MAX_COMPARE_PROPERTIES} properties selected for comparison
              </p>

              <p className="text-[11px] text-slate-500">
                {hasShortlistedProperties
                  ? `${wishlistIds.length} properties shortlisted`
                  : compareSelection.length >= MIN_COMPARE_PROPERTIES
                    ? "Ready to run side-by-side comparison."
                    : `Select ${MIN_COMPARE_PROPERTIES - compareSelection.length} more to compare.`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCompareSelection}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={openComparePage}
                disabled={compareSelection.length < MIN_COMPARE_PROPERTIES}
                className="rounded-xl bg-[#A054A0] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#884188] disabled:opacity-50"
              >
                Compare Now
              </button>
              <button
                type="button"
                onClick={openEnquiryForm}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#A054A0] bg-white px-4 py-2 text-xs font-semibold text-[#A054A0] transition hover:bg-purple-50"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Raise Enquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {isEnquiryOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeEnquiryForm();
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Property Enquiry
                </h2>
                <p className="text-xs text-slate-500">
                  Submit details to receive callback for selected properties.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEnquiryForm}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {enquirySuccess ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                  <h3 className="mt-3 text-lg font-bold text-slate-900">
                    Enquiry Received
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Our advisors will reach out with pricing and floor plans.
                  </p>
                  <button
                    type="button"
                    onClick={closeEnquiryForm}
                    className="mt-5 rounded-xl bg-[#A054A0] px-6 py-2.5 text-xs font-semibold text-white"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">
                        First Name *
                      </label>
                      <input
                        required
                        name="firstName"
                        value={enquiryForm.firstName}
                        onChange={handleEnquiryChange}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-[#A054A0]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">
                        Last Name *
                      </label>
                      <input
                        required
                        name="lastName"
                        value={enquiryForm.lastName}
                        onChange={handleEnquiryChange}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-[#A054A0]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">
                        Email *
                      </label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={enquiryForm.email}
                        onChange={handleEnquiryChange}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-[#A054A0]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">
                        Phone *
                      </label>
                      <input
                        required
                        type="tel"
                        name="phone"
                        value={enquiryForm.phone}
                        onChange={handleEnquiryChange}
                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-[#A054A0]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Company
                    </label>
                    <input
                      name="company"
                      value={enquiryForm.company}
                      onChange={handleEnquiryChange}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-[#A054A0]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={enquiryForm.message}
                      onChange={handleEnquiryChange}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-[#A054A0]"
                    />
                  </div>

                  {enquiryError && (
                    <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">
                      {enquiryError}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={closeEnquiryForm}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingEnquiry}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#A054A0] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#884188] disabled:opacity-50"
                    >
                      {isSubmittingEnquiry ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Submit Enquiry
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PropertiesClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <PropertiesClientContent />
    </Suspense>
  );
}