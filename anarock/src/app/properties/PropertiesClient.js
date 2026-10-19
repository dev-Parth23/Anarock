"use client";
import { Suspense, useEffect, useState, useMemo } from "react";
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
  User,
  Users,
  Maximize2,
  IndianRupee,
  DollarSign,
  Euro,
  MessageSquare,
  Mail,
  Phone,
  Building2,
  Loader2,
  CheckCircle2,
  ArrowRight,
  CloudCog,
} from "lucide-react";

const MAX_COMPARE_PROPERTIES = 3;
const MIN_COMPARE_PROPERTIES = 2;
const COMPARE_STORAGE_KEY = "anarock_compare_properties";
const OFFICE_TYPES = ["Conventional", "Managed Office/Co-working"];
const SORT_CATEGORIES = [
  {
    id: "recommended",
    label: "Recommended",
    value: "",
  },
  {
    id: "budget",
    label: "Budget",
    ascVal: "budget_asc",
    descVal: "budget_desc",
  },
  {
    id: "seats",
    label: "Seat Count",
    ascVal: "seats_asc",
    descVal: "seats_desc",
  },
  {
    id: "area",
    label: "Area",
    ascVal: "area_asc",
    descVal: "area_desc",
  },
  {
    id: "name",
    label: "Alphabetically",
    ascVal: "name_asc",
    descVal: "name_desc",
  },
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
const getNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const number = Number(
    String(value)
      .replace(/,/g, "")
      .replace(/[^\d.-]/g, ""),
  );
  return Number.isFinite(number) ? number : null;
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
  return getFirstNumber(property, ["NoOfSeatsOffered"]);
};

const getPropertyType = (property) => {
  return normalizeValue(property?.type || property?.officeType || "");
};

const getPropertyCity = (property) => {
  return normalizeValue(property?.city || "");
};

const getPropertyMicromarket = (property) => {
  return normalizeValue(property?.area || property?.micromarket || "");
};

const getAreaSqft = (property) => {
  return getFirstNumber(property, ["totalLeasableAreaAvailable"]);
};

const getSeatPrice = (property) => {
  return getFirstNumber(property, ["monthlyCostPerSeat"]);
};

const getSqftPrice = (property) => {
  const directPrice = getFirstNumber(property, ["quotedRent"]);
  if (directPrice !== null) {
    return directPrice;
  }
  const rent = getFirstNumber(property, ["quotedRent"]);
  const area = getAreaSqft(property);
  if (rent !== null && area !== null && area > 0) {
    return rent / area;
  }
  return null;

};

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
    ""
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
    ""
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
        location?.area ||
        location?.street ||
        location?.address ||
        ""
      ).trim(),
      city: String(location?.city || "").trim(),
      state: String(
        location?.state ||
        location?.province ||
        ""
      ).trim(),
      country: String(location?.country || "").trim(),
      postalCode: String(
        location?.pincode ||
        location?.postalCode ||
        location?.postal_code ||
        ""
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

  const [enquiryForm, setEnquiryForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  useEffect(() => {
    if (!showFilters) {
      return;
    }

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
      area: searchParams.get("area") || "",
      seats: searchParams.get("seats") || "",
      sort: searchParams.get("sort") || "",
      currency: searchParams.get("currency") || currency,
      areaUnit: searchParams.get("areaUnit") || unit,
      prompt: searchParams.get("prompt") || "",
      isAi: rawType === "ai" || searchParams.has("prompt"),
    };
  }, [searchParams, currency, unit]);

  // const openEnquiryForm = () => {
  //   if (!Array.isArray(wishlistItems) || wishlistItems.length === 0) {
  //     return;
  //   }

  //   setEnquirySelection([...wishlistItems]);
  //   setEnquiryError("");
  //   setEnquirySuccess(false);
  //   setIsEnquiryOpen(true);
  // };

  // const closeEnquiryForm = () => {
  //   if (isSubmittingEnquiry) return;

  //   setIsEnquiryOpen(false);
  //   setEnquiryError("");
  //   setEnquirySuccess(false);
  // };

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

  const handleEnquiryChange = (event) => {
    const { name, value } = event.target;

    setEnquiryForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEnquirySubmit = async (event) => {
    event.preventDefault();

    if (isSubmittingEnquiry) return;

    if (!enquirySelection.length) {
      setEnquiryError("Please select at least one property.");
      return;
    }

    setIsSubmittingEnquiry(true);
    setEnquiryError("");

    try {
      // Refresh property data to obtain the latest Zoho CRM record IDs.
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

      refreshedProperties.forEach((property) => {
        const id = getPropertyId(property);
        if (id) freshById.set(String(id), property);
      });

      const resolvedSelection = enquirySelection.map((property) => {
        const id = getPropertyId(property);
        const freshProperty = id ? freshById.get(String(id)) : null;

        return freshProperty
          ? { ...property, ...freshProperty }
          : property;
      });

      const selectedProperties = resolvedSelection.map((property) => {
        const crmId = String(getCRMPropertyId(property) || "").trim();

        if (!crmId || !/^\d+$/.test(crmId)) {
          throw new Error(
            "A selected property is missing its Zoho CRM record ID. Check the CRM ID field returned by /api/properties."
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

      console.log("[ENQUIRY] Submitting payload:", payload);

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

      console.log("[ENQUIRY] CRM API response:", {
        status: response.status,
        data,
      });

      if (!response.ok || data?.success !== true || !data?.leadId) {
        throw new Error(
          data?.message ||
          data?.error ||
          `CRM did not confirm lead creation. HTTP ${response.status}. Request ID: ${data?.requestId || "not provided"}`
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
    } catch (error) {
      console.error("[ENQUIRY] Lead creation failed:", error);

      setEnquiryError(
        error?.message ||
        "Unable to submit your enquiry. Please try again."
      );
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  // const handleEnquiryChange = (event) => {
  //   const { name, value } = event.target;

  //   setEnquiryForm((previous) => ({
  //     ...previous,
  //     [name]: value,
  //   }));
  // };

  const normalizedOfficeType = normalizeValue(filters.type);
  const sortValue = filters.sort || "";
  const isCoworking = normalizedOfficeType === "managed office/co-working";
  const handleShortlistToggle = (property) => {
    const propertyId = getPropertyId(property);
    if (!propertyId) {
      return;
    }
    toggleWishlist(property);
  };
  const handleCompareToggle = (property) => {
    const propertyId = getPropertyId(property);
    if (!propertyId) {
      return;
    }
    setCompareSelection((prev) => {
      const alreadySelected = prev.some(
        (item) => getPropertyId(item) === propertyId,
      );
      let updated;
      if (alreadySelected) {
        updated = prev.filter((item) => getPropertyId(item) !== propertyId);
      } else {
        if (prev.length >= MAX_COMPARE_PROPERTIES) {
          return prev;
        }
        updated = [...prev, property];
      }
      try {
        localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save comparison properties:", e);
      }

      return updated;
    });
  };

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
        JSON.stringify(compareSelection),
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
        if (data.success) {
          setCities(data.cities);
        }
      })
      .catch(() => setCities([]));
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COMPARE_STORAGE_KEY);

      if (!saved) {
        return;
      }

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
    if (!filters.city) {
      return "";
    }
    const match = cities.find(
      (c) => toUrlValue(c) === filters.city.toLowerCase(),
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
        if (err.name !== "AbortError") {
          setMicromarkets([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setMicromarketsLoading(false);
        }
      });

    return () => controller.abort();
  }, [resolvedCity]);

  const selectedMicromarkets = useMemo(() => {
    if (!filters.micromarket || micromarkets.length === 0) {
      return [];
    }

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
      .map(
        (id) =>
          micromarkets.find((item) => String(item.id) === String(id))?.name ||
          "",
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

        if (sortValue) {
          params.set("sort", sortValue);
        }

        if (filters.isAi) {
          params.set("type", "ai");
        }

        if (filters.prompt) {
          params.set("prompt", filters.prompt);
        }

        const query = params.toString();

        const response = await fetch(`/api/properties?${query}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch properties");
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
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProperties();

    return () => {
      controller.abort();
    };
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
    exchangeRates,
    isCoworking,
  ]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (totalProperties > 0 && currentPage !== totalPagesFromApi) {
      setSuggestedProperties([]);
      setSuggestionsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchSuggestions() {
      setSuggestionsLoading(true);

      try {
        const params = new URLSearchParams();

        if (resolvedCity) {
          params.set("city", resolvedCity);
        }

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
              exchangeRates,
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
              "sqft",
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

        const excludeIds = properties
          .map((property) => getPropertyId(property))
          .filter(Boolean);

        if (excludeIds.length > 0) {
          params.set("exclude", excludeIds.join(","));
        }

        const response = await fetch(
          `/api/properties/suggestions?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch suggested properties");
        }

        setSuggestedProperties(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error(
            "[PropertiesClient] Suggested properties failed:",
            error,
          );

          setSuggestedProperties([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSuggestionsLoading(false);
        }
      }
    }

    fetchSuggestions();

    return () => {
      controller.abort();
    };
  }, [
    loading,
    currentPage,
    totalProperties,
    totalPagesFromApi,
    properties,
    resolvedCity,
    filters.type,
    filters.minBudget,
    filters.area,
    filters.seats,
    filters.currency,
    filters.areaUnit,
    selectedMicromarketNames,
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
    } catch (e) {
      console.error("Unable to save last searched location:", e);
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

  const handleSortChange = (value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }

    params.delete("page");

    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`,
    );

    setShowFilters(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

    const nextSelected = selectedMicromarkets.includes(id)
      ? selectedMicromarkets.filter((selectedId) => selectedId !== id)
      : [...selectedMicromarkets, id];

    const selectedNames = nextSelected
      .map(
        (selectedId) =>
          micromarkets.find((item) => String(item.id) === String(selectedId))
            ?.name || "",
      )
      .filter(Boolean);

    const params = new URLSearchParams(searchParams.toString());

    if (selectedNames.length) {
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
        return "sq.m";

      case "sqyd":
      case "sq.yd":
        return "sq.yd";

      case "acre":
      case "acres":
        return "acre";

      case "hectare":
      case "hectares":
        return "hectare";

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

  const sortedProperties = Array.isArray(properties) ? properties : [];

  const totalPages = totalPagesFromApi;

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProperties = sortedProperties;

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(1, Number(page) || 1), totalPages);

    if (nextPage === safeCurrentPage) {
      return;
    }

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

  const activeCategory =
    SORT_CATEGORIES.find((cat) => {
      if (cat.id === "recommended") return !sortValue;
      return sortValue.startsWith(cat.id);
    }) || SORT_CATEGORIES[0];

  const getActiveSortDisplayLabel = () => {
    if (!sortValue) return "Recommended";
    if (sortValue.startsWith("budget"))
      return sortValue === "budget_desc"
        ? "Budget: High to Low"
        : "Budget: Low to High";
    if (sortValue.startsWith("seats"))
      return sortValue === "seats_desc"
        ? "Seat Count: High to Low"
        : "Seat Count: Low to High";
    if (sortValue.startsWith("area"))
      return sortValue === "area_desc"
        ? "Area: High to Low"
        : "Area: Low to High";
    if (sortValue.startsWith("name"))
      return sortValue === "name_desc"
        ? "Alphabetically: Z-A"
        : "Alphabetically: A-Z";
    return "Recommended";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <style jsx global>{`
        @keyframes shimmerSweep {
          0% {
            transform: translateX(-100%);
          }

          100% {
            transform: translateX(100%);
          }
        }

        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }

        .shimmer-effect::after {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
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
                : `${totalProperties.toLocaleString("en-IN")} properties found${totalProperties > ITEMS_PER_PAGE
                  ? ` • Page ${safeCurrentPage} of${totalPages}`
                  : ""
                }`}
            </p>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto lg:hidden">
            <button
              type="button"
              onClick={() => {
                setSidebarTab("filters");
                setShowFilters(true);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:flex-none"
            >
              <SlidersHorizontal className="h-4 w-4" />

              <span>Filters</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSidebarTab("sort");
                setShowFilters(true);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#A054A0]/40 hover:text-[#A054A0] sm:flex-none"
            >
              <ArrowUpDown className="h-4 w-4" />

              <span>Sort</span>

              {sortValue && (
                <span className="hidden rounded-full bg-[#A054A0]/10 px-1.5 py-0.5 text-[9px] font-medium text-[#A054A0] min-[400px]:inline-flex">
                  {getActiveSortDisplayLabel()}
                </span>
              )}
            </button>
          </div>
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
              <div className="mb-4 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex w-full items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setSidebarTab("filters")}
                      className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${sidebarTab === "filters"
                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                      <SlidersHorizontal className="h-4 w-4 shrink-0" />

                      <span>Filters</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSidebarTab("sort")}
                      className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${sidebarTab === "sort"
                        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                      <ArrowUpDown className="h-4 w-4 shrink-0" />

                      <span>Sort</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {sidebarTab === "sort" ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
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
                          aria-pressed={isSelected}
                          className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-200 ${isSelected
                            ? "border-[#A054A0]/30 bg-[#A054A0]/5 text-[#7B3D7B] shadow-sm"
                            : "border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${isSelected
                              ? "border-[#A054A0]/20 bg-[#A054A0]/10 text-[#A054A0]"
                              : "border-slate-200 bg-slate-50 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-500"
                              }`}
                          >
                            {cat.id === "recommended" ? (
                              <ArrowUpDown className="h-4 w-4" />
                            ) : cat.id === "name" ? (
                              <span className="text-sm font-medium">A-Z</span>
                            ) : isSelected && isDesc ? (
                              <ArrowDown className="h-4 w-4" />
                            ) : (
                              <ArrowUp className="h-4 w-4" />
                            )}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className={`block text-sm font-normal leading-5 ${isSelected ? "text-[#7B3D7B]" : "text-slate-700"
                                }`}
                            >
                              {cat.label}
                              {cat.id !== "recommended" && isSelected && (
                                <span className="ml-1.5 text-[10px] text-[#A054A0] font-medium">
                                  {cat.id === "name"
                                    ? isDesc
                                      ? "(Z-A)"
                                      : "(A-Z)"
                                    : isDesc
                                      ? "(High to Low)"
                                      : "(Low to High)"}
                                </span>
                              )}
                            </span>
                          </span>

                          <span
                            className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${isSelected
                              ? "border-[#A054A0]"
                              : "border-slate-300 group-hover:border-slate-400"
                              }`}
                          >
                            {isSelected && (
                              <span className="h-2.5 w-2.5 rounded-full bg-[#A054A0]" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {sortValue && (
                    <button
                      type="button"
                      onClick={() => handleSortChange("")}
                      className="w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      Reset to Recommended
                    </button>
                  )}
                </div>
              ) : (
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

                    {showMicromarkets &&
                      resolvedCity &&
                      !micromarketsLoading && (
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

                                const selected =
                                  selectedMicromarkets.includes(id);

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

                  {isCoworking ? (
                    <>
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
                    </>
                  ) : (
                    <>
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
                            onChange={(e) =>
                              updateFilter("area", e.target.value)
                            }
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
              )}
            </div>
          </aside>

          <div className="mb-4 hidden items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:flex lg:hidden">
            <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
              <ArrowUpDown className="h-4 w-4 shrink-0 text-[#A054A0]" />

              <span className="truncate">
                Sorted by{" "}
                <span className="font-semibold text-slate-900">
                  {getActiveSortDisplayLabel()}
                </span>
              </span>
            </div>

            {filters.sort && (
              <button
                type="button"
                onClick={() => handleSortChange("")}
                className="shrink-0 text-xs font-semibold text-[#A054A0] hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div>
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, idx) => (
                  <PropertyCardSkeleton key={idx} />
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
            ) : totalProperties === 0 ? (
              <>
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-[#241B2B] sm:text-xl">
                    No search results found for your search.
                  </h2>

                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#7D7482]">
                    We couldn&apos;t find a property matching your selected
                    requirements. Please explore other properties near you.
                  </p>
                </div>

                {suggestionsLoading ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {[...Array(3)].map((_, idx) => (
                      <PropertyCardSkeleton key={idx} />
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
                      {suggestedProperties.map((property, index) => (
                        <div key={getPropertyId(property)} className="relative">
                          <PropertyCard
                            priority={index < 3}
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
                    We couldn&apos;t find any nearby alternative properties at
                    the moment.
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {paginatedProperties.map((property, index) => (
                    <PropertyCard
                      key={property.id || property.rowId || property.ROWID}
                      priority={index < 3}
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

                {totalPages > 1 && (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-2 pb-8">
                    <button
                      type="button"
                      onClick={() => goToPage(safeCurrentPage - 1)}
                      disabled={safeCurrentPage === 1}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-[#A054A0] hover:text-[#A054A0] disabled:cursor-not-allowed disabled:opacity-40"
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
                          className={`min-w-10 rounded-lg px-3 py-2 text-sm font-medium transition ${page === safeCurrentPage
                            ? "bg-[#A054A0] text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-700 hover:border-[#A054A0] hover:text-[#A054A0]"
                            }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      type="button"
                      onClick={() => goToPage(safeCurrentPage + 1)}
                      disabled={safeCurrentPage === totalPages}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-[#A054A0] hover:text-[#A054A0] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}

                {safeCurrentPage === totalPages &&
                  !suggestionsLoading &&
                  suggestedProperties.length > 0 && (
                    <section className="mt-10 border-t border-slate-200 pt-9">
                      <div className="mb-5">
                        <div className="flex items-center justify-center gap-2">
                          <Sparkles className="h-5 w-5 text-[#A054A0]" />

                          <h2 className="text-xl font-semibold text-slate-900 sm:text-xl">
                            More properties you may consider
                          </h2>
                        </div>

                        <p className="text-center text-base leading-6 text-slate-600">
                          Explore additional properties that are similar to your
                          search.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {suggestedProperties.map((property) => {
                          const propertyId = getPropertyId(property);

                          return (
                            <div key={propertyId} className="relative">
                              <PropertyCard
                                property={property}
                                isCompared={compareSelection.some(
                                  (item) => getPropertyId(item) === propertyId,
                                )}
                                onCompareToggle={handleCompareToggle}
                                isShortlisted={wishlistIds.some(
                                  (id) => String(id) === propertyId,
                                )}
                                onShortlistToggle={handleShortlistToggle}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}
              </>
            )}
          </div>
        </div>

        {compareSelection.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-[150] border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md sm:px-4">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                <button
                  type="button"
                  onClick={openEnquiryForm}
                  disabled={!compareSelection.length}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#A054A0] bg-white px-4 py-2 text-xs font-semibold text-[#A054A0] transition hover:bg-[#A054A0]/5 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  Raise Enquiry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {isEnquiryOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/55 px-3 py-4 backdrop-blur-sm sm:px-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEnquiryForm();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="property-enquiry-title"
            className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#A054A0]" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#A054A0]">
                    Property Enquiry
                  </span>
                </div>

                <h2
                  id="property-enquiry-title"
                  className="text-xl font-semibold text-slate-900 sm:text-2xl"
                >
                  Tell us about your requirement
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Our team will contact you about your selected properties.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEnquiryForm}
                disabled={isSubmittingEnquiry}
                aria-label="Close enquiry form"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="max-h-[calc(92vh-105px)] overflow-y-auto px-5 py-5 sm:px-7">
              {enquirySuccess ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                  <CheckCircle2 className="h-14 w-14 text-emerald-600" />

                  <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                    Enquiry submitted
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Thank you. Your enquiry was accepted by the API.
                    Our team will contact you shortly.
                  </p>

                  <button
                    type="button"
                    onClick={closeEnquiryForm}
                    className="mt-6 rounded-xl bg-[#A054A0] px-6 py-3 text-sm font-semibold text-white hover:bg-[#864286]"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleEnquirySubmit}
                  className="space-y-5"
                >
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Selected properties ({enquirySelection.length})
                    </p>

                    <div className="space-y-2">
                      {enquirySelection.map((property, index) => (
                        <div
                          key={`${getPropertyId(property)}-${index}`}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            {property?.name ||
                              property?.Property_Name ||
                              property?.propertyName ||
                              property?.Name ||
                              "Selected Property"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {[
                              getEnquiryPropertyCity(property),
                              property?.micromarket ||
                              property?.Micromarket ||
                              property?.Micro_Market ||
                              property?.area ||
                              "",
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        First name *
                      </span>
                      <input
                        required
                        name="firstName"
                        value={enquiryForm.firstName}
                        onChange={handleEnquiryChange}
                        autoComplete="given-name"
                        placeholder="First name"
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        Last name *
                      </span>
                      <input
                        required
                        name="lastName"
                        value={enquiryForm.lastName}
                        onChange={handleEnquiryChange}
                        autoComplete="family-name"
                        placeholder="Last name"
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        Email *
                      </span>
                      <input
                        required
                        type="email"
                        name="email"
                        value={enquiryForm.email}
                        onChange={handleEnquiryChange}
                        autoComplete="email"
                        placeholder="you@company.com"
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-700">
                        Phone *
                      </span>
                      <input
                        required
                        type="tel"
                        name="phone"
                        value={enquiryForm.phone}
                        onChange={handleEnquiryChange}
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Company
                    </span>
                    <input
                      name="company"
                      value={enquiryForm.company}
                      onChange={handleEnquiryChange}
                      autoComplete="organization"
                      placeholder="Company name"
                      className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Message
                    </span>
                    <textarea
                      name="message"
                      value={enquiryForm.message}
                      onChange={handleEnquiryChange}
                      rows={4}
                      placeholder="Tell us about your requirement..."
                      className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10"
                    />
                  </label>

                  {enquiryError && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {enquiryError}
                    </div>
                  )}

                  <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeEnquiryForm}
                      disabled={isSubmittingEnquiry}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmittingEnquiry}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A054A0] px-5 py-3 text-sm font-semibold text-white hover:bg-[#864286] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmittingEnquiry ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating enquiry...
                        </>
                      ) : (
                        <>
                          Submit Enquiry
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      )}
    </div>


  );
}
export default function PropertiesClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PropertiesClientContent />

    </Suspense>
  );
}
