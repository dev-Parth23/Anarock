"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import PropertyCard from "@/components/properties/PropertyCard";
import { useWishlist } from "@/lib/wishlist";
import {
  Heart,
  ArrowRight,
  GitCompare,
  X,
  User,
  Mail,
  Phone,
  Building2,
  Loader2,
  CheckCircle2,
  MessageSquare,
  MapPin,
  Building,
  Sparkles,
  ExternalLink,
} from "lucide-react";
const COMPARE_STORAGE_KEY = "anarock_compare_properties";
const MAX_COMPARE_PROPERTIES = 3;
const MIN_COMPARE_PROPERTIES = 2;
const IMAGE_BASE_URL = "https://property-images.zohostratus.in";
const IMAGE_FILES = [
  {
    key: "project",
    name: "Project Picture 1",
    filename: "Project_Picture_1.jpg",
  },
  {
    key: "property-1",
    name: "Property Photo 1",
    filename: "Property_Photo_1.jpg",
  },
];
function getPropertyId(property) {
  if (!property) return "";
  if (typeof property === "string" || typeof property === "number") {
    return String(property);
  }
  return String(property?.id ?? "").trim();
}

function getPropertySlug(property) {
  if (!property || typeof property !== "object") return "";

  const rawSlug = property?.slug ?? "";
  return String(rawSlug)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getPropertyImageUrl(property) {
  if (!property || typeof property !== "object") return "";

  if (property.image) return property.image;
  if (property.coverImage) return property.coverImage;
  if (Array.isArray(property.images) && property.images.length > 0) {
    return property.images[0];
  }

  const imageFolderPath = String(
    property.imageFolderPath || property.Image_Folder_Path || "",
  ).replace(/^\/+|\/+$/g, "");

  if (!imageFolderPath) return "";

  const projectImage = IMAGE_FILES.find((img) => img.key === "project");
  const filename = projectImage
    ? projectImage.filename
    : "Project_Picture_1.jpg";

  return `${IMAGE_BASE_URL}/${imageFolderPath}/${filename}`;
}

function getCRMPropertyId(property) {
  if (!property || typeof property !== "object") return "";

  const possibleCRMIds = [property?.crmID];

  for (const value of possibleCRMIds) {
    const id = String(value ?? "").trim();
    if (id) return id;
  }

  return "";
}

function safeParseJSON(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readLocalStorageValue(keys) {
  if (typeof window === "undefined") return "";

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);

      if (value !== null && String(value).trim()) {
        const parsed = safeParseJSON(value);

        if (typeof parsed === "string" || typeof parsed === "number") {
          return String(parsed).trim();
        }

        if (parsed && typeof parsed === "object") {
          const possibleValue =
            parsed.city ||
            parsed.City ||
            parsed.name ||
            parsed.Name ||
            parsed.value;

          if (possibleValue) return String(possibleValue).trim();
        }

        return String(value).trim();
      }
    } catch { }
  }

  return "";
}

function getShortlistPropertyCity(property) {
  if (!property || typeof property !== "object") return "";

  return String(property?.city ?? "").trim();
}

function getShortlistPropertyType(property) {
  if (!property || typeof property !== "object") return "";

  return String(property?.type ?? "").trim();
}

function getStoredUserLocation() {
  if (typeof window === "undefined") return null;

  try {
    const savedLocation = sessionStorage.getItem("anarock_user_location");

    if (!savedLocation) {
      console.warn("[ENQUIRY] No saved user location found in sessionStorage.");
      return null;
    }

    const location = JSON.parse(savedLocation);

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
    console.error("[ENQUIRY] Failed to read saved user location:", error);
    return null;
  }
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

function getSelectionKey(properties = []) {
  return properties.map(getPropertyId).filter(Boolean).sort().join("|");
}

export default function WishlistClient() {
  const router = useRouter();

  const [enquirySubmittedSelectionKey, setEnquirySubmittedSelectionKey] =
    useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  const { items, count, isInitialized } = useWishlist();

  const [compareSelection, setCompareSelection] = useState([]);
  const [enquirySelection, setEnquirySelection] = useState([]);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");

  const [enquiryForm, setEnquiryForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  useEffect(() => {
    if (!isInitialized || !items.length) return;

    let cancelled = false;

    async function repairWishlist() {
      const needsRepair = items.some(
        (property) => !getPropertyId(property) || !getCRMPropertyId(property),
      );

      if (!needsRepair) return;

      try {
        const response = await fetch("/api/properties", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data?.success || !Array.isArray(data?.data)) {
          throw new Error(
            data?.error ||
            data?.message ||
            "Unable to refresh shortlisted properties.",
          );
        }

        if (cancelled) return;

        const propertyMap = new Map();

        data.data.forEach((property) => {
          const id = getPropertyId(property);
          if (id) propertyMap.set(id, property);
        });

        const repairedItems = items
          .map((oldProperty) => {
            const id = getPropertyId(oldProperty);
            if (!id) return null;

            return propertyMap.get(id) || oldProperty;
          })
          .filter(Boolean);

        localStorage.setItem(
          "anarock_wishlist_properties",
          JSON.stringify(repairedItems),
        );

        window.dispatchEvent(new Event("wishlist-updated"));
      } catch (error) {
        console.error("[SHORTLIST] Failed to refresh shortlist:", error);
      }
    }

    repairWishlist();

    return () => {
      cancelled = true;
    };
  }, [isInitialized, items]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COMPARE_STORAGE_KEY);

      if (!saved) {
        setCompareSelection([]);
        return;
      }

      const parsed = JSON.parse(saved);

      setCompareSelection(
        Array.isArray(parsed) ? parsed.slice(-MAX_COMPARE_PROPERTIES) : [],
      );
    } catch (error) {
      console.error("[COMPARE] Failed to load compare selection:", error);
      setCompareSelection([]);
    }
  }, []);

  const handleCompareToggle = (property) => {
    const propertyId = getPropertyId(property);
    if (!propertyId) return;

    setCompareSelection((previous) => {
      const alreadySelected = previous.some(
        (item) => getPropertyId(item) === propertyId,
      );

      const updated = alreadySelected
        ? previous.filter((item) => getPropertyId(item) !== propertyId)
        : [...previous, property].slice(-MAX_COMPARE_PROPERTIES);

      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearCompareSelection = () => {
    setCompareSelection([]);
    localStorage.removeItem(COMPARE_STORAGE_KEY);
  };

  const canCompare =
    compareSelection.length >= MIN_COMPARE_PROPERTIES &&
    compareSelection.length <= MAX_COMPARE_PROPERTIES;

  const remainingToCompare = Math.max(
    0,
    MIN_COMPARE_PROPERTIES - compareSelection.length,
  );

  const openComparePage = () => {
    if (!canCompare) return;

    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareSelection));
    router.push("/compare");
  };

  const openEnquiryForm = () => {
    if (!items?.length) return;

    const currentSelectionKey = getSelectionKey(items);

    if (
      enquirySubmittedSelectionKey &&
      enquirySubmittedSelectionKey === currentSelectionKey
    ) {
      return;
    }

    setEnquirySelection([...items]);
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

  const handleRemoveFromEnquiry = (propertyId) => {
    setEnquirySelection((prev) => {
      const updated = prev.filter((p) => getPropertyId(p) !== propertyId);
      if (updated.length === 0) {
        closeEnquiryForm();
      }
      return updated;
    });
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

    if (!enquirySelection.length) {
      setEnquiryError("Please shortlist at least one property.");
      return;
    }

    setIsSubmittingEnquiry(true);
    setEnquiryError("");

    try {
      const selectedProperties = enquirySelection
        .map((property) => {
          const crmId = getCRMPropertyId(property);

          if (!crmId) {
            console.error("[ENQUIRY] Missing CRM Property ID:", property);
            return null;
          }

          return { id: String(crmId).trim() };
        })
        .filter(Boolean);

      if (selectedProperties.length !== enquirySelection.length) {
        throw new Error(
          "One or more shortlisted properties do not have a valid CRM Property ID. Please refresh the shortlist and try again.",
        );
      }

      if (
        selectedProperties.some(
          (property) => !/^\d+$/.test(String(property.id || "")),
        )
      ) {
        throw new Error(
          "One or more shortlisted properties have an invalid CRM Property ID.",
        );
      }

      let lastSearchedCity = getLastSearchedCityFromStorage();

      if (!lastSearchedCity) {
        for (const property of enquirySelection) {
          const city = getShortlistPropertyCity(property);
          if (city) {
            lastSearchedCity = city;
            break;
          }
        }
      }

      let lastRequirementType = getRequirementTypeFromStorage();

      if (!lastRequirementType) {
        for (const property of enquirySelection) {
          const type = getShortlistPropertyType(property);
          if (type) {
            lastRequirementType = type;
            break;
          }
        }
      }

      const storedLocation = getStoredUserLocation() || {};

      const location = {
        street: String(storedLocation.street || "").trim(),
        city: String(storedLocation.city || "").trim(),
        state: String(storedLocation.state || "").trim(),
        country: String(storedLocation.country || "").trim(),
        postalCode: String(storedLocation.postalCode || "").trim(),
        latitude: storedLocation.latitude ?? null,
        longitude: storedLocation.longitude ?? null,
      };

      const trimmedFullName = enquiryForm.fullName.trim();
      const spaceIndex = trimmedFullName.indexOf(" ");
      let firstName = trimmedFullName;
      let lastName = "";

      if (spaceIndex !== -1) {
        firstName = trimmedFullName.substring(0, spaceIndex);
        lastName = trimmedFullName.substring(spaceIndex + 1).trim();
      }

      const payload = {
        firstName,
        lastName,
        email: enquiryForm.email.trim(),
        phone: enquiryForm.phone.trim(),
        company: enquiryForm.company.trim(),
        message: enquiryForm.message.trim(),
        source: "Shortlist",
        selectedProperties,
        requirementCity: lastSearchedCity || "",
        requirementType: lastRequirementType || "",
        location,
      };

      const response = await fetch("/api/lead3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
          data?.error ||
          "Unable to submit your enquiry. Please try again.",
        );
      }

      setEnquirySuccess(true);
      setEnquirySubmittedSelectionKey(getSelectionKey(enquirySelection));

      setEnquiryForm({
        fullName: "",
        email: "",
        phone: "",
        company: "",
        message: "",
      });
    } catch (error) {
      console.error("[ENQUIRY] Lead creation failed:", error);

      setEnquiryError(
        error?.message || "Unable to submit your enquiry. Please try again.",
      );
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Properties", href: "/properties" },
          { label: "Shortlisted Properties", href: "/shortlist" },
        ]}
      />

      <main className="min-h-screen bg-slate-50/50 px-4 py-6 pb-40 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1600px]">
          <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Heart className="h-5 w-5 fill-[#A054A0] text-[#A054A0]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#A054A0]">
                  Your Collection
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Shortlisted Properties
              </h1>

              <p className="mt-1.5 text-sm text-slate-600 sm:text-base">
                {count} saved {count === 1 ? "property" : "properties"} ready
                for enquiry
              </p>
            </div>

            <Link
              href="/properties"
              className="inline-flex min-h-[44px] w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-[#A054A0] hover:text-[#A054A0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A054A0]"
            >
              Explore Properties
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          {items.length > 0 ? (
            <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {items.map((property) => {
                const propertyId = getPropertyId(property);

                return (
                  <PropertyCard
                    key={propertyId}
                    property={{
                      ...property,
                      image: getPropertyImageUrl(property),
                    }}
                    isCompared={compareSelection.some(
                      (item) => getPropertyId(item) === propertyId,
                    )}
                    onCompareToggle={handleCompareToggle}
                  />
                );
              })}
            </section>
          ) : (
            <section className="mt-12 flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#A054A0]/10 text-[#A054A0]">
                <Heart className="h-8 w-8" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                No properties shortlisted yet
              </h2>

              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Explore available commercial and residential listings to save
                them to your shortlist.
              </p>

              <Link
                href="/properties"
                className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#A054A0] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#A054A0]/20 transition hover:bg-[#864286] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A054A0]"
              >
                Browse Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          )}

          {items.length > 0 && (
            <div className="fixed bottom-4 left-1/2 z-[90] w-[calc(100%-1.5rem)] max-w-5xl -translate-x-1/2 rounded-xl border border-slate-400/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-5 sm:w-[calc(100%-2.5rem)] sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  {compareSelection.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2">
                        <GitCompare className="h-5 w-5 shrink-0 text-[#A054A0]" />
                        <p className="text-sm font-bold leading-5 text-black sm:text-base">
                          {compareSelection.length} of {MAX_COMPARE_PROPERTIES}{" "}
                          properties selected for comparison
                        </p>
                      </div>

                      <p className="mt-1 pl-7 text-xs leading-5 text-slate-500 sm:text-sm">
                        {canCompare
                          ? "Ready to compare side-by-side."
                          : `Select ${remainingToCompare === 1
                            ? "one more property"
                            : "at least two properties"
                          } to compare.`}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 shrink-0 text-[#A054A0]" />
                        <p className="text-sm font-bold leading-5 text-black sm:text-base">
                          {items.length} Shortlisted{" "}
                          {items.length === 1 ? "Property" : "Properties"}
                        </p>
                      </div>

                      <p className="mt-1 pl-7 text-xs leading-5 text-slate-500 sm:text-sm">
                        Select properties to compare or raise a unified enquiry.
                      </p>
                    </>
                  )}
                </div>

                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-start lg:w-auto lg:shrink-0 lg:justify-end">
                  <button
                    type="button"
                    onClick={openComparePage}
                    disabled={!canCompare}
                    className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#A054A0] px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#864286] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
                  >
                    <GitCompare className="h-4 w-4 shrink-0" />
                    <span>Compare</span>

                    {compareSelection.length > 0 && (
                      <span className="rounded-lg bg-white/20 px-1.5 py-0.5 text-[11px] font-semibold">
                        {compareSelection.length}
                      </span>
                    )}
                  </button>

                  {getSelectionKey(items) !== enquirySubmittedSelectionKey && (
                    <button
                      type="button"
                      onClick={openEnquiryForm}
                      disabled={!items.length}
                      className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#A054A0] bg-white px-3 py-2.5 text-xs font-bold text-[#A054A0] shadow-sm transition-all duration-200 hover:bg-[#A054A0]/10 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
                    >
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <span>Raise Enquiry</span>
                    </button>
                  )}

                  {compareSelection.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCompareSelection}
                      className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-500 bg-white px-4 py-2.5 text-xs font-semibold text-black/80 transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] sm:col-span-1 sm:text-sm"
                    >
                      <X className="h-4 w-4 shrink-0" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {isEnquiryOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md transition-all duration-300"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  closeEnquiryForm();
                }
              }}
            >
              <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#A054A0]/10 text-[#A054A0]">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#A054A0]">
                          Property Enquiry
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Tell us about your requirement
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeEnquiryForm}
                    disabled={isSubmittingEnquiry}
                    aria-label="Close form"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-800 disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-6">
                  {enquirySuccess ? (
                    <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-9 w-9" />
                      </div>

                      <h3 className="mt-5 text-2xl font-bold text-slate-900">
                        Enquiry Submitted Successfully!
                      </h3>

                      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                        Thank you for reaching out. Our real estate specialist
                        has received your requirements for the selected
                        properties and will get in touch shortly.
                      </p>

                      <button
                        type="button"
                        onClick={closeEnquiryForm}
                        className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#A054A0] px-8 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#A054A0]/20 transition hover:bg-[#864286]"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleEnquirySubmit} className="space-y-6">
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-[#A054A0]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              Selected Properties
                            </span>
                          </div>
                          <span className="rounded-full bg-[#A054A0] px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                            {enquirySelection.length}{" "}
                            {enquirySelection.length === 1
                              ? "Property"
                              : "Properties"}
                          </span>
                        </div>

                        <div className="custom-scrollbar flex gap-3 overflow-x-auto pb-1 pt-1">
                          {enquirySelection.map((property, index) => {
                            const propertyId = getPropertyId(property);
                            const propertySlug = getPropertySlug(property);

                            const propertyUrl = propertySlug
                              ? `/properties/${propertyId}/${propertySlug}`
                              : `/properties/${propertyId}`;

                            const propertyName =
                              property?.name ?? "Selected Property";
                            const city = property?.city ?? "";
                            const micromarket = property?.micromarket ?? "";
                            const coverImage = getPropertyImageUrl(property);

                            return (
                              <div
                                key={`${propertyId}-${index}`}
                                className="group relative flex min-w-[240px] max-w-[280px] shrink-0 items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs transition hover:border-[#A054A0] hover:shadow-md"
                              >
                                <Link
                                  href={propertyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex min-w-0 flex-1 items-center gap-3"
                                  title={`View details for ${propertyName}`}
                                >
                                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                    {coverImage ? (
                                      <Image
                                        src={coverImage}
                                        alt={propertyName}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-[#A054A0]/60">
                                        <Building className="h-5 w-5" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1">
                                      <p className="truncate text-xs font-bold text-slate-900 transition-colors group-hover:text-[#A054A0]">
                                        {propertyName}
                                      </p>
                                      <ExternalLink className="h-3 w-3 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                                    </div>

                                    {(city || micromarket) && (
                                      <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-slate-500">
                                        <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                        <span className="truncate">
                                          {[micromarket, city]
                                            .filter(Boolean)
                                            .join(", ")}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                </Link>

                                {enquirySelection.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleRemoveFromEnquiry(propertyId);
                                    }}
                                    title="Remove from enquiry"
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Your Contact Information
                        </p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                              Full Name <span className="text-red-500">*</span>
                            </span>
                            <div className="relative">
                              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <input
                                required
                                name="fullName"
                                value={enquiryForm.fullName}
                                onChange={handleEnquiryChange}
                                autoComplete="name"
                                placeholder="John Doe"
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/20"
                              />
                            </div>
                          </label>

                          <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                              Phone Number{" "}
                              <span className="text-red-500">*</span>
                            </span>
                            <div className="relative">
                              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <input
                                required
                                type="tel"
                                name="phone"
                                value={enquiryForm.phone}
                                onChange={handleEnquiryChange}
                                autoComplete="tel"
                                placeholder="+91 98765 43210"
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/20"
                              />
                            </div>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                              Company Name
                            </span>
                            <div className="relative">
                              <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <input
                                name="company"
                                value={enquiryForm.company}
                                onChange={handleEnquiryChange}
                                autoComplete="organization"
                                placeholder="Your company name"
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/20"
                              />
                            </div>
                          </label>

                          <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                              Email Address{" "}
                            </span>
                            <div className="relative">
                              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <input
                                type="email"
                                name="email"
                                value={enquiryForm.email}
                                onChange={handleEnquiryChange}
                                autoComplete="email"
                                placeholder="john@example.com"
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 outline-none transition focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/20"
                              />
                            </div>
                          </label>
                        </div>

                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                            Message
                          </span>
                          <textarea
                            name="message"
                            value={enquiryForm.message}
                            onChange={handleEnquiryChange}
                            rows={3}
                            placeholder="Tell us about your requirement..."
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 outline-none transition focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/20"
                          />
                        </label>
                      </div>

                      {enquiryError && (
                        <div
                          role="alert"
                          className="rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs font-medium text-red-700"
                        >
                          {enquiryError}
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmittingEnquiry}
                          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#A054A0] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#A054A0]/25 transition hover:bg-[#864286] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A054A0] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSubmittingEnquiry ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Submitting Enquiry...
                            </>
                          ) : (
                            <>
                              Submit Enquiry
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </button>

                        <p className="mt-3 text-center text-[11px] text-slate-400">
                          By submitting, you agree to be contacted by our
                          advisors regarding your selected property shortlist.
                        </p>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
