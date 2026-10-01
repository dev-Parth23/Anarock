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
  User,
  Mail,
  Phone,
  Building2,
  Loader2,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
const COMPARE_STORAGE_KEY = "anarock_compare_properties";
const MAX_COMPARE_PROPERTIES = 3;
const MIN_COMPARE_PROPERTIES = 2;
function getPropertyId(property) {
  if (!property) return "";
  if (typeof property === "string" || typeof property === "number") {
    return String(property);
  }
  return String(
    property?.id ??
    property?.ID ??
    property?.rowId ??
    property?.ROWID ??
    property?.RowId ??
    property?.RowID ??
    property?.projectId ??
    property?.Project_ID ??
    property?.project_id ??
    property?.propertyId ??
    property?.Property_ID ??
    "",
  ).trim();
}
function getCRMPropertyId(property) {
  if (!property || typeof property !== "object") {
    return "";
  }

  const possibleCRMIds = [
    property?.crmID,
    property?.crmId,
    property?.CRM_ID,
    property?.zohoPropertyId,
    property?.zoho_property_id,
    property?.Property_CRM_ID,
    property?.propertyCRMId,
  ];

  for (const value of possibleCRMIds) {
    const id = String(value ?? "").trim();

    if (id) {
      return id;
    }
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

function readLocalStorageObject(keys) {
  if (typeof window === "undefined") {
    return null;
  }

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) {
        continue;
      }

      const parsed = safeParseJSON(raw);

      if (parsed && typeof parsed === "object") {
        return parsed;
      }

      if (typeof raw === "string" && raw.trim()) {
        return {
          value: raw.trim(),
        };
      }
    } catch {
    }
  }
  return null;
}

function readLocalStorageValue(keys) {
  if (typeof window === "undefined") {
    return "";
  }
  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      if (value !== null && String(value).trim()) {
        const parsed = safeParseJSON(value);
        if (typeof parsed === "string" || typeof parsed === "number") {
          return String(parsed).trim();
        }
        if (parsed && typeof parsed === "object") {
          const possibleValue = parsed.city || parsed.City || parsed.name || parsed.Name || parsed.value;
          if (possibleValue) {
            return String(possibleValue).trim();
          }
        }
        return String(value).trim();
      }
    } catch {
    }
  }
  return "";
}
function getShortlistPropertyCity(property) {
  if (!property || typeof property !== "object") {
    return "";
  }
  return String(property?.city ?? property?.City ?? property?.cityName ?? property?.City_Name ?? property?.micromarketCity ?? "").trim();
}
function getShortlistPropertyType(property) {
  if (!property || typeof property !== "object") {
    return "";
  }

  return String(
    property?.propertyType ??
    property?.Property_Type ??
    property?.property_type ??
    property?.type ??
    property?.Type ??
    "",
  ).trim();
}

function getStoredUserLocation() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const savedLocation = sessionStorage.getItem("anarock_user_location");
    if (!savedLocation) {
      console.warn("[ENQUIRY] No saved user location found in sessionStorage.");
      return null;
    }
    const location = JSON.parse(savedLocation);
    console.log("[ENQUIRY] Detected user location:", location);
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
function hasCompletePropertyData(property) {
  if (!property || typeof property !== "object") {
    return false;
  }

  return Boolean(
    getPropertyId(property) &&
    (property.name ||
      property.Property_Name ||
      property.propertyName ||
      property.Name) &&
    (property.city ||
      property.City ||
      property.micromarket ||
      property.Micromarket),
  );
}

function getSelectionKey(properties = []) {
  return properties
    .map((property) => getPropertyId(property))
    .filter(Boolean)
    .map(String)
    .sort()
    .join("|");
}

export default function WishlistClient() {
  const router = useRouter();
  const [enquirySubmittedSelectionKey, setEnquirySubmittedSelectionKey] = useState("");
  const [enquirySubmittedForSelection, setEnquirySubmittedForSelection] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const { items, count, isInitialized } = useWishlist();
  const { currency, unit } = usePreferences();
  const [compareSelection, setCompareSelection] = useState([]);
  const [enquirySelection, setEnquirySelection] = useState([]);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);
  const [enquiryError, setEnquiryError] = useState("");
  const [enquiryForm, setEnquiryForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  useEffect(() => {
    if (!isInitialized || !items.length) {
      return;
    }
    let cancelled = false;
    async function repairWishlist() {
      const needsRepair = items.some(
        (property) => !getPropertyId(property) || !getCRMPropertyId(property),
      );
      if (!needsRepair) {
        return;
      }
      try {
        console.log(
          "[SHORTLIST] Refreshing shortlisted properties to obtain CRM IDs...",
        );
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
        if (cancelled) {
          return;
        }
        const propertyMap = new Map();
        data.data.forEach((property) => {
          const id = getPropertyId(property);
          if (id) {
            propertyMap.set(id, property);
          }
        });
        const repairedItems = items
          .map((oldProperty) => {
            const id = getPropertyId(oldProperty);
            if (!id) {
              return null;
            } const freshProperty = propertyMap.get(id);
            return freshProperty || oldProperty;
          })
          .filter(Boolean);
        localStorage.setItem(
          "anarock_wishlist_properties",
          JSON.stringify(repairedItems),
        );

        window.dispatchEvent(new Event("wishlist-updated"));

        console.log("[SHORTLIST] Shortlist refreshed successfully.");
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

      if (Array.isArray(parsed)) {
        setCompareSelection(parsed.slice(-MAX_COMPARE_PROPERTIES));
      } else {
        setCompareSelection([]);
      }
    } catch (error) {
      console.error("[COMPARE] Failed to load compare selection:", error);

      setCompareSelection([]);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      return;
    } if (!items.length) {
      setEnquirySubmittedForSelection(false);
      return;
    }
    setEnquirySubmittedForSelection(false);
  }, [items, isInitialized]);

  const handleCompareToggle = (property) => {
    const propertyId = getPropertyId(property);

    if (!propertyId) {
      return;
    }

    setCompareSelection((previous) => {
      const alreadySelected = previous.some(
        (item) => getPropertyId(item) === propertyId,
      );

      let updated;

      if (alreadySelected) {
        updated = previous.filter((item) => getPropertyId(item) !== propertyId);
      } else {
        updated = [...previous, property].slice(-MAX_COMPARE_PROPERTIES);
      }

      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(updated));

      return updated;
    });
  };

  const clearCompareSelection = () => {
    setCompareSelection([]);

    localStorage.removeItem(COMPARE_STORAGE_KEY);
  };

  const openComparePage = () => {
    if (
      compareSelection.length < MIN_COMPARE_PROPERTIES ||
      compareSelection.length > MAX_COMPARE_PROPERTIES
    ) {
      return;
    }

    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareSelection));

    router.push("/compare");
  };

  const canCompare = compareSelection.length >= MIN_COMPARE_PROPERTIES && compareSelection.length <= MAX_COMPARE_PROPERTIES;
  const remainingToCompare = Math.max(0, MIN_COMPARE_PROPERTIES - compareSelection.length);
  const openEnquiryForm = () => {
    if (!items || items.length === 0) {
      return;
    }
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
    if (isSubmittingEnquiry) {
      return;
    }

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

    if (!enquirySelection || enquirySelection.length === 0) {
      setEnquiryError("Please shortlist at least one property.");
      return;
    }

    setIsSubmittingEnquiry(true);
    setEnquiryError("");

    try {
      /* ================================================================
         1. BUILD CRM PROPERTY IDs
         ================================================================ */

      const selectedProperties = enquirySelection
        .map((property) => {
          const crmId = getCRMPropertyId(property);

          if (!crmId) {
            console.error("[ENQUIRY] Missing CRM Property ID:", property);

            return null;
          }

          return {
            id: String(crmId).trim(),
          };
        })
        .filter(Boolean);

      console.log(
        "[ENQUIRY] Selected shortlist properties:",
        selectedProperties,
      );

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

      /* ================================================================
         2. GET LAST SEARCHED CITY
         ================================================================ */

      let lastSearchedCity = getLastSearchedCityFromStorage();

      /*
       * If the search state was not persisted separately,
       * use the city of the first shortlisted property.
       *
       * This prevents the CRM Lead from completely losing
       * the property city.
       */

      if (!lastSearchedCity) {
        for (const property of enquirySelection) {
          const propertyCity = getShortlistPropertyCity(property);

          if (propertyCity) {
            lastSearchedCity = propertyCity;
            break;
          }
        }
      }

      /* ================================================================
         3. GET REQUIREMENT TYPE
         ================================================================ */

      let lastRequirementType = getRequirementTypeFromStorage();

      /*
       * Fallback to shortlisted property's property type.
       */

      if (!lastRequirementType) {
        for (const property of enquirySelection) {
          const propertyType = getShortlistPropertyType(property);

          if (propertyType) {
            lastRequirementType = propertyType;
            break;
          }
        }
      }

      /* ================================================================
         4. GET USER LOCATION
         ================================================================ */

      let userLocation = getStoredUserLocation();

      if (!userLocation) {
        userLocation = {
          street: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
          latitude: null,
          longitude: null,
        };
      }

      /*
       * Make sure every property/location field is a clean value.
       */

      userLocation = {
        street: String(userLocation?.street || "").trim(),

        city: String(userLocation?.city || "").trim(),

        state: String(userLocation?.state || "").trim(),

        country: String(userLocation?.country || "").trim(),

        postalCode: String(userLocation?.postalCode || "").trim(),

        latitude: userLocation?.latitude ?? null,

        longitude: userLocation?.longitude ?? null,
      };

      /* ================================================================
         5. FINAL PAYLOAD
         ================================================================ */

      const payload = {
        firstName: enquiryForm.firstName.trim(),
        lastName: enquiryForm.lastName.trim(),
        email: enquiryForm.email.trim(),
        phone: enquiryForm.phone.trim(),
        company: enquiryForm.company.trim(),
        message: enquiryForm.message.trim(),
        source: "Shortlist",
        selectedProperties,
        requirementCity: lastSearchedCity || "",
        requirementType: lastRequirementType || "",
        location: {
          street: userLocation.street,
          city: userLocation.city,
          state: userLocation.state,
          country: userLocation.country,
          postalCode: userLocation.postalCode,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
      };
      console.log(JSON.stringify(payload, null, 2));
      const response = await fetch("/api/lead3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      console.log("[ENQUIRY] API response:", data);
      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
          data?.error ||
          "Unable to submit your enquiry. Please try again.",
        );
      }
      console.log("[ENQUIRY] Lead created:", data?.leadId);
      console.log("[ENQUIRY] CRM Requirement City:", data?.requirementCity);
      console.log("[ENQUIRY] CRM Requirement Type:", data?.requirementType);
      console.log("[ENQUIRY] CRM Current Location:", data?.currentLocation);
      setEnquirySuccess(true);
      setEnquirySubmittedSelectionKey(getSelectionKey(enquirySelection));

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
        error?.message || "Unable to submit your enquiry. Please try again.",
      );
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };
  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-6 pb-32 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1600px]">
        <Breadcrumbs
          items={[
            {
              label: "Properties",
              href: "/properties",
            },
            {
              label: "Shortlisted Properties",
            },
          ]}
        />

        {/* =========================
            HEADER
        ========================= */}

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
              {count} saved {count === 1 ? "property" : "properties"}
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

        {/* =========================
            PROPERTY GRID
        ========================= */}

        {items.length > 0 ? (
          <section className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((property) => {
              const propertyId = getPropertyId(property);

              return (
                <PropertyCard
                  key={propertyId}
                  property={property}
                  isCompared={compareSelection.some(
                    (item) => getPropertyId(item) === propertyId,
                  )}
                  onCompareToggle={handleCompareToggle}
                />
              );
            })}
          </section>
        ) : (
          <section className="mt-12 flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#A054A0]/10">
              <Heart className="h-7 w-7 text-[#A054A0]" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              No shortlisted properties yet
            </h2>

            <Link
              href="/properties"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#A054A0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#864286]"
            >
              Browse Properties
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        )}

        {items.length > 0 && (
          <div className="fixed bottom-4 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* LEFT SIDE */}
              <div className="min-w-0">
                {compareSelection.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2">
                      <GitCompare className="h-4 w-4 text-[#A054A0]" />

                      <p className="text-sm font-semibold text-slate-900">
                        {compareSelection.length} of 3 properties selected
                      </p>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {canCompare
                        ? "Ready to compare your selected properties."
                        : `Select ${remainingToCompare === 1
                          ? "one more property"
                          : "at least two properties"
                        } to compare.`}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-[#A054A0]" />

                      <p className="text-sm font-semibold text-slate-900">
                        {items.length} shortlisted{" "}
                        {items.length === 1 ? "property" : "properties"}
                      </p>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Raise an enquiry for your shortlisted properties.
                    </p>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                {compareSelection.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCompareSelection}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 sm:px-4 sm:text-sm"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}
                {getSelectionKey(items) !== enquirySubmittedSelectionKey && (
                  <button
                    type="button"
                    onClick={openEnquiryForm}
                    disabled={!items.length}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#A054A0] bg-white px-4 py-2 text-xs font-semibold text-[#A054A0] transition hover:bg-[#A054A0]/5 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Raise Enquiry
                  </button>
                )}
                {compareSelection.length > 0 && (
                  <button
                    type="button"
                    onClick={openComparePage}
                    disabled={!canCompare}
                    className="rounded-xl bg-[#A054A0] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#864286] disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-sm"
                  >
                    Compare Properties
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {isEnquiryOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeEnquiryForm();
              }
            }}
          >
            <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A054A0]/10">
                      <MessageSquare className="h-4 w-4 text-[#A054A0]" />
                    </div>

                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A054A0]">
                      Property Enquiry
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                    Tell us about your requirement
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Our team will get in touch with you regarding your selected
                    properties.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEnquiryForm}
                  disabled={isSubmittingEnquiry}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[calc(92vh-110px)] overflow-y-auto px-5 py-5 sm:px-7">
                {enquirySuccess ? (
                  <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>

                    <h3 className="mt-5 text-2xl font-semibold text-slate-900">
                      Enquiry submitted
                    </h3>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Thank you. Your enquiry has been submitted successfully.
                      Our team will contact you shortly.
                    </p>

                    <button
                      type="button"
                      onClick={closeEnquiryForm}
                      className="mt-7 rounded-xl bg-[#A054A0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#864286]"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} className="space-y-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                          Selected Properties
                        </p>

                        <span className="rounded-full bg-[#A054A0]/10 px-2.5 py-1 text-xs font-semibold text-[#A054A0]">
                          {enquirySelection.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {enquirySelection.map((property, index) => {
                          const propertyId = getPropertyId(property);

                          const propertyName =
                            property?.name ??
                            property?.Property_Name ??
                            property?.propertyName ??
                            property?.Name ??
                            "Selected Property";

                          const city = property?.city ?? property?.City ?? "";

                          const micromarket =
                            property?.micromarket ??
                            property?.Micromarket ??
                            property?.Micro_Market ??
                            "";

                          return (
                            <div
                              key={`${propertyId}-${index}`}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                            >
                              <p className="text-sm font-semibold text-slate-900">
                                {propertyName}
                              </p>

                              {(city || micromarket) && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {[city, micromarket]
                                    .filter(Boolean)
                                    .join(" • ")}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* NAME */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                          First Name *
                        </span>

                        <div className="relative">
                          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                          <input
                            required
                            name="firstName"
                            value={enquiryForm.firstName}
                            onChange={handleEnquiryChange}
                            autoComplete="given-name"
                            placeholder="First name"
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10"
                          />
                        </div>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                          Last Name *
                        </span>
                        <input
                          required
                          name="lastName"
                          value={enquiryForm.lastName}
                          onChange={handleEnquiryChange}
                          autoComplete="family-name"
                          placeholder="Last name"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10"
                        />
                      </label>
                    </div>

                    {/* EMAIL + PHONE */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                          Email *
                        </span>

                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                          <input
                            type="email"
                            name="email"
                            value={enquiryForm.email}
                            onChange={handleEnquiryChange}
                            autoComplete="email"
                            placeholder="you@company.com"
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10"
                          />
                        </div>
                      </label>

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                          Phone *
                        </span>

                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                          <input
                            required
                            type="tel"
                            name="phone"
                            value={enquiryForm.phone}
                            onChange={handleEnquiryChange}
                            autoComplete="tel"
                            placeholder="+91 98765 43210"
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10"
                          />
                        </div>
                      </label>
                    </div>

                    {/* COMPANY */}
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Company
                      </span>

                      <div className="relative">
                        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          name="company"
                          value={enquiryForm.company}
                          onChange={handleEnquiryChange}
                          autoComplete="organization"
                          placeholder="Company name"
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10"
                        />
                      </div>
                    </label>

                    {/* MESSAGE */}
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                        Message
                      </span>

                      <textarea
                        name="message"
                        value={enquiryForm.message}
                        onChange={handleEnquiryChange}
                        rows={4}
                        placeholder="Tell us about your requirement..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10"
                      />
                    </label>

                    {/* ERROR */}
                    {enquiryError && (
                      <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                      >
                        {enquiryError}
                      </div>
                    )}

                    {/* SUBMIT */}
                    <button
                      type="submit"
                      disabled={isSubmittingEnquiry}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#A054A0] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#864286] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmittingEnquiry ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating enquiry...
                        </>
                      ) : (
                        <>
                          Raise Enquiry
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-[11px] leading-5 text-slate-400">
                      By submitting this enquiry, you agree to be contacted
                      regarding your selected properties.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
