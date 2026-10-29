"use client";

import { usePreferences } from "@/lib/preferences";
import { formatArea, formatPrice } from "@/lib/format";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PropertyCard from "@/components/properties/PropertyCard";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import {
  ChevronLeft,
  MapPin,
  X,
  GitCompare,
  ChevronRight,
  Building2,
  Users,
  Layers3,
  CalendarDays,
  TrainFront,
  Plane,
  Heart,
  ArrowUpRight,
  Sparkles,
  Building,
} from "lucide-react";

const IMAGE_BASE_URL = "https://property-images.zohostratus.in";
const AUTO_SCROLL_INTERVAL = 25000;
const COMPARE_STORAGE_KEY = "anarock_compare_properties";
const MAX_COMPARE_PROPERTIES = 3;
const MIN_COMPARE_PROPERTIES = 2;

const IMAGE_FILES = [
  { key: "project", name: "Project Picture 1", filename: "Project_Picture_1.jpg" },
  { key: "floor-plan", name: "Floor Plan 1", filename: "Floor_Plan_1.jpg" },
  { key: "property-1", name: "Property Photo 1", filename: "Property_Photo_1.jpg" },
  { key: "property-2", name: "Property Photo 2", filename: "Property_Photo_2.jpg" },
  { key: "property-3", name: "Property Photo 3", filename: "Property_Photo_3.jpg" },
  { key: "property-4", name: "Property Photo 4", filename: "Property_Photo_4.jpg" },
  { key: "property-5", name: "Property Photo 5", filename: "Property_Photo_5.jpg" },
  { key: "property-6", name: "Property Photo 6", filename: "Property_Photo_6.jpg" },
  { key: "property-7", name: "Property Photo 7", filename: "Property_Photo_7.jpg" },
  { key: "property-8", name: "Property Photo 8", filename: "Property_Photo_8.jpg" },
  { key: "property-9", name: "Property Photo 9", filename: "Property_Photo_9.jpg" },
  { key: "property-10", name: "Property Photo 10", filename: "Property_Photo_10.jpg" },
];

const getValue = (property, keys, fallback = "-") => {
  for (const key of keys) {
    const value = property?.[key];
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback;
};

const normalizeType = (value) => {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
};

const isCoworkingProperty = (property) => {
  const type = normalizeType(
    property?.officeType ||
    property?.office_type ||
    property?.propertyType ||
    property?.property_type ||
    property?.type
  );
  return (
    type.includes("cowork") ||
    type.includes("co-working") ||
    type.includes("managed office")
  );
};

const formatDisplayValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  if (typeof value === "object") return Object.values(value).join(", ") || "-";
  return String(value);
};

const getPropertyId = (item) => {
  return String(
    item?.id ||
    item?.ID ||
    item?.rowId ||
    item?.ROWID ||
    item?.RowID ||
    item?.propertyId ||
    item?.Property_ID ||
    item?.projectId ||
    item?.Project_ID ||
    ""
  ).trim();
};

function DetailField({ label, value, icon: Icon }) {
  return (
    <div className="group relative flex min-w-0 items-center gap-3.5 rounded-2xl border border-[#A054A0]/10 bg-white/80 p-4 shadow-[0_2px_12px_-4px_rgba(160,84,160,0.06)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#A054A0]/30 hover:bg-white hover:shadow-[0_12px_24px_-10px_rgba(160,84,160,0.15)] sm:gap-4 sm:p-4.5">
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#A054A0]/10 text-[#A054A0] transition-transform duration-300 group-hover:scale-105">
          <Icon className="h-4.5 w-4.5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#A054A0]/80">
          {label}
        </p>
        <p className="mt-1 break-words text-xs font-semibold text-slate-800 sm:text-sm">
          {formatDisplayValue(value)}
        </p>
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="relative border-t border-slate-100 pt-6 first:border-t-0 first:pt-0 sm:pt-8">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="h-1.5 w-1.5 rounded-full bg-[#A054A0]/70" />
        <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

export default function PropertyDetailClient({ propertyId }) {
  const [property, setProperty] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [activeImg, setActiveImg] = useState("project");
  const [related, setRelated] = useState([]);
  const { unit, currency } = usePreferences();
  const [failedImages, setFailedImages] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [compareSelection, setCompareSelection] = useState([]);
  const [isTitleVisible, setIsTitleVisible] = useState(true);

  const similarSectionRef = useRef(null);
  const thumbnailContainerRef = useRef(null);
  const thumbnailRefs = useRef({});
  const autoScrollTimeoutRef = useRef(null);

  // Smart scroll handler: visible only at the top and hides before reaching similar/recommended properties
  useEffect(() => {
    let frameId = null;

    const handleScroll = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        const currentY = Math.max(0, window.scrollY);
        let shouldShow = currentY < 100;

        if (similarSectionRef.current) {
          const rect = similarSectionRef.current.getBoundingClientRect();
          // Hide sticky header as soon as similar properties section approaches the viewport
          if (rect.top <= window.innerHeight * 0.8) {
            shouldShow = false;
          }
        }

        setIsTitleVisible(shouldShow);
        frameId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    if (!propertyId) return;
    const controller = new AbortController();
    async function loadProperty() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertyId)}`,
          { cache: "no-store", signal: controller.signal }
        );

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load property");
        }
        const propertyData = data.data;
        const imageFolderPath = String(
          propertyData.imageFolderPath || ""
        ).replace(/^\/+|\/+$/g, "");
        const images = imageFolderPath
          ? IMAGE_FILES.map((image) => ({
            ...image,
            url: `${IMAGE_BASE_URL}/${imageFolderPath}/${image.filename}`,
          }))
          : [];
        setProperty({
          ...propertyData,
          image: images.find((image) => image.key === "project")?.url || "",
        });
        setGallery(images);
        setActiveImg("project");
        setFailedImages(new Set());

        if (propertyData.city) {
          try {
            const relatedResponse = await fetch(
              `/api/properties?city=${encodeURIComponent(propertyData.city)}`,
              { cache: "no-store", signal: controller.signal }
            );
            const relatedData = await relatedResponse.json();
            if (relatedData.success) {
              const currentId = getPropertyId(propertyData);
              const relatedProperties = (relatedData.data || []).filter(
                (item) => getPropertyId(item) !== currentId
              );
              setRelated(relatedProperties);
            }
          } catch (relatedError) {
            if (relatedError.name !== "AbortError") {
              console.error("Related properties error:", relatedError);
            }
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err?.message || "Unable to load property");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    loadProperty();
    return () => {
      controller.abort();
    };
  }, [propertyId]);

  const { row1, row2 } = useMemo(() => {
    const r1 = [];
    const r2 = [];
    related.forEach((item, index) => {
      if (index % 2 === 0) {
        r1.push(item);
      } else {
        r2.push(item);
      }
    });
    return { row1: r1, row2: r2 };
  }, [related]);

  useEffect(() => {
    if (!property) return;
    const syncWishlist = () => {
      try {
        const wishlist = JSON.parse(
          localStorage.getItem("anarock_wishlist_properties") || "[]"
        );
        const currentId = getPropertyId(property);
        setIsWishlisted(
          wishlist.some((item) => getPropertyId(item) === currentId)
        );
      } catch (err) {
        console.error("Wishlist sync failed:", err);
        setIsWishlisted(false);
      }
    };
    syncWishlist();
    window.addEventListener("wishlist-updated", syncWishlist);
    window.addEventListener("storage", syncWishlist);
    return () => {
      window.removeEventListener("wishlist-updated", syncWishlist);
      window.removeEventListener("storage", syncWishlist);
    };
  }, [property]);

  const handleWishlist = (item) => {
    if (!item) return;
    try {
      const storageKey = "anarock_wishlist_properties";
      const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const currentId = getPropertyId(item);
      if (!currentId) return;
      const exists = existing.some(
        (wishlistItem) => getPropertyId(wishlistItem) === currentId
      );
      const updated = exists
        ? existing.filter(
          (wishlistItem) => getPropertyId(wishlistItem) !== currentId
        )
        : [...existing, item];

      setIsWishlisted(!exists);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      console.error("Wishlist update failed:", err);
    }
  };

  useEffect(() => {
    const loadCompareSelection = () => {
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
        const unique = [];
        const seenIds = new Set();
        for (const item of parsed) {
          const id = getPropertyId(item);
          if (!id || seenIds.has(id)) continue;
          seenIds.add(id);
          unique.push(item);
        }
        setCompareSelection(unique.slice(-MAX_COMPARE_PROPERTIES));
      } catch (err) {
        console.error("Failed to load compare selection:", err);
        setCompareSelection([]);
      }
    };
    loadCompareSelection();
    window.addEventListener("compare-updated", loadCompareSelection);
    window.addEventListener("storage", loadCompareSelection);
    return () => {
      window.removeEventListener("compare-updated", loadCompareSelection);
      window.removeEventListener("storage", loadCompareSelection);
    };
  }, []);

  const currentPropertyId = useMemo(() => getPropertyId(property), [property]);
  const isCompared = useMemo(() => {
    if (!currentPropertyId) return false;
    return compareSelection.some(
      (item) => getPropertyId(item) === currentPropertyId
    );
  }, [compareSelection, currentPropertyId]);

  const handleCompareToggle = useCallback(() => {
    if (!property) return;
    const propertyId = getPropertyId(property);
    if (!propertyId) return;

    setCompareSelection((previousSelection) => {
      const alreadySelected = previousSelection.some(
        (item) => getPropertyId(item) === propertyId
      );
      let updatedSelection = alreadySelected
        ? previousSelection.filter((item) => getPropertyId(item) !== propertyId)
        : [...previousSelection, property].slice(-MAX_COMPARE_PROPERTIES);

      try {
        localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(updatedSelection));
        window.dispatchEvent(new Event("compare-updated"));
      } catch (err) {
        console.error("Failed to save compare selection:", err);
      }
      return updatedSelection;
    });
  }, [property]);

  const clearCompareSelection = useCallback(() => {
    setCompareSelection([]);
    try {
      localStorage.removeItem(COMPARE_STORAGE_KEY);
      window.dispatchEvent(new Event("compare-updated"));
    } catch (err) {
      console.error("Failed to clear compare selection:", err);
    }
  }, []);

  const openComparePage = useCallback(() => {
    if (
      compareSelection.length < MIN_COMPARE_PROPERTIES ||
      compareSelection.length > MAX_COMPARE_PROPERTIES
    ) {
      return;
    }
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareSelection));
      window.location.href = "/compare";
    } catch (err) {
      console.error("Failed to open compare page:", err);
    }
  }, [compareSelection]);

  const availableGallery = useMemo(() => {
    return gallery.filter((image) => !failedImages.has(image.key));
  }, [gallery, failedImages]);

  const activeImage =
    availableGallery.find((image) => image.key === activeImg)?.url ||
    property?.image ||
    "";
  const activeIndex = Math.max(
    0,
    availableGallery.findIndex((image) => image.key === activeImg)
  );

  const handleImageError = (imageKey) => {
    setFailedImages((previous) => {
      const next = new Set(previous);
      next.add(imageKey);
      return next;
    });
    if (activeImg === imageKey) {
      const currentIndex = availableGallery.findIndex((img) => img.key === imageKey);
      const nextImage = availableGallery[currentIndex + 1] || availableGallery[currentIndex - 1];
      if (nextImage) setActiveImg(nextImage.key);
    }
  };

  const scrollThumbnailToTop = useCallback((imageKey) => {
    const container = thumbnailContainerRef.current;
    const thumbnail = thumbnailRefs.current[imageKey];
    if (!container || !thumbnail) return;

    if (window.innerWidth >= 768) {
      const targetTop = thumbnail.offsetTop - container.offsetTop;
      container.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    } else {
      thumbnail.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, []);

  const selectImage = useCallback(
    (imageKey) => {
      setActiveImg(imageKey);
      requestAnimationFrame(() => {
        scrollThumbnailToTop(imageKey);
      });
    },
    [scrollThumbnailToTop]
  );

  const goToNextImage = useCallback(() => {
    if (!availableGallery.length) return;
    const nextIndex = (activeIndex + 1) % availableGallery.length;
    const nextImage = availableGallery[nextIndex];
    if (nextImage) selectImage(nextImage.key);
  }, [activeIndex, availableGallery, selectImage]);

  const goToPreviousImage = useCallback(() => {
    if (!availableGallery.length) return;
    const previousIndex = (activeIndex - 1 + availableGallery.length) % availableGallery.length;
    const previousImage = availableGallery[previousIndex];
    if (previousImage) selectImage(previousImage.key);
  }, [activeIndex, availableGallery, selectImage]);

  useEffect(() => {
    if (availableGallery.length <= 1) return;
    autoScrollTimeoutRef.current = setTimeout(goToNextImage, AUTO_SCROLL_INTERVAL);
    return () => {
      if (autoScrollTimeoutRef.current) clearTimeout(autoScrollTimeoutRef.current);
    };
  }, [activeImg, availableGallery.length, goToNextImage]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") goToNextImage();
      if (event.key === "ArrowLeft") goToPreviousImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextImage, goToPreviousImage]);

  const propertyDetails = useMemo(() => {
    if (!property) return {};
    return {
      isCoworking: isCoworkingProperty(property),
      propertyType: getValue(property, ["officeType"], "Conventional"),
      managedBy: getValue(property, ["OperatorName"]),
      offeredSeats: getValue(property, ["NoOfSeatsOffered"]),
      seatPrice: getValue(property, ["monthlyCostPerSeat"]),
      quotedRent: getValue(property, ["quotedRent"]),
      towerFloor: getValue(property, ["floor"]),
      areaOffered: getValue(property, ["TotalLeasableAreaAvailable"]),
      availability: getValue(property, ["availability"]),
      buildingCertification: getValue(property, ["buildingCertifications"]),
      buildingStructure: getValue(property, ["buildingStructure"]),
      yearOfCompletion: getValue(property, ["estYearOfCompletion"]),
      nearbyMetro: getValue(property, ["distanceFromMetro"]),
      airport: getValue(property, ["distanceFromAirport"]),
    };
  }, [property]);

  const areaValue = Number(property?.totalLeasableAreaAvailable);
  const hasArea = Number.isFinite(areaValue) && areaValue > 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfbfd]">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-[#A054A0]">
          <Building className="h-5 w-5 animate-pulse text-[#A054A0]" />
          Loading property details...
        </div>
      </div>
    );
  }

  if (error || !property) {
    const isAuthError =
      error?.toLowerCase().includes("oauth") ||
      error?.toLowerCase().includes("token");

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfbfd] px-4">
        <div className="max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-[0_10px_30px_-15px_rgba(160,84,160,0.15)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#A054A0]/10 text-[#A054A0]">
            <Building className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-lg font-bold text-slate-900">
            {isAuthError ? "Unable to load property" : "Property not found"}
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            {isAuthError
              ? "There was a temporary problem connecting to the property database. Please try again."
              : error || "Unable to load property details."}
          </p>
          <Link
            href="/properties"
            className="mt-5 inline-flex min-h-[40px] items-center justify-center rounded-xl bg-[#A054A0] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#864286]"
          >
            Explore Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Properties", href: "/properties" },
          { label: property.name || "Property Detail" },
        ]}
      />

      <main className={`min-h-screen overflow-x-clip px-3 py-4 sm:px-5 sm:py-6 lg:px-8 xl:px-10 ${compareSelection.length > 0 ? "pb-24 sm:pb-28" : "pb-12 sm:pb-16"
        }`}>
        <style jsx global>{`
          @keyframes propertyImageFade {
            from { opacity: 0.5; transform: scale(1.01); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes fadeInSlide {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          html { scroll-behavior: smooth; }
          ::selection { background: rgba(160, 84, 160, 0.15); color: #1a1a1a; }
          .scrollbar-none { scrollbar-width: none; -ms-overflow-style: none; }
          .scrollbar-none::-webkit-scrollbar { display: none; }
          @media (prefers-reduced-motion: no-preference) {
            main > div > section { animation: fadeInSlide 500ms cubic-bezier(0.16, 1, 0.3, 1) both; }
            main > div > section:nth-of-type(2) { animation-delay: 60ms; }
            main > div > section:nth-of-type(3) { animation-delay: 100ms; }
          }
        `}</style>

        <div className="mx-auto w-full min-w-0 max-w-[1500px]">
          {/* Minimal Sticky Header Title Bar */}
          <div
            className={`sticky top-[60px] z-40 mb-4 overflow-hidden rounded-2xl border border-[#A054A0]/15 bg-white/90 px-3.5 py-3.5 shadow-[0_12px_30px_-15px_rgba(160,84,160,0.12)] backdrop-blur-xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none sm:top-[68px] sm:mb-6 sm:px-6 sm:py-4 ${isTitleVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-[calc(100%+12px)] pointer-events-none opacity-0 shadow-none"
              }`}
            aria-hidden={!isTitleVisible}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A054A0]">
                  {property.city && (
                    <span className="rounded-full bg-[#A054A0]/8 px-2.5 py-0.5 ring-1 ring-[#A054A0]/15">
                      {property.city}
                    </span>
                  )}
                  {property.micromarket && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700">
                        {property.micromarket}
                      </span>
                    </>
                  )}
                  {propertyDetails.propertyType && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="rounded-full bg-slate-50 px-2.5 py-0.5 text-slate-600">
                        {propertyDetails.propertyType}
                      </span>
                    </>
                  )}
                </div>
                <h1 className="break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {property.name}
                </h1>

                {property.address && (
                  <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#A054A0]" />
                    <p className="truncate">{property.address}</p>
                  </div>
                )}
              </div>

              <div className="flex w-full min-w-0 shrink-0 items-center gap-2.5 lg:w-auto">
                <button
                  type="button"
                  onClick={handleCompareToggle}
                  className={`group inline-flex min-h-[40px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold shadow-xs transition-all duration-200 active:scale-95 sm:flex-none ${isCompared
                    ? "border-[#A054A0] bg-[#A054A0] text-white shadow-sm shadow-[#A054A0]/20"
                    : "border-slate-200/80 bg-white text-slate-700 hover:border-[#A054A0]/50 hover:text-[#A054A0]"
                    }`}
                  aria-pressed={isCompared}
                >
                  {isCompared ? <X className="h-3.5 w-3.5" /> : <GitCompare className="h-3.5 w-3.5 text-[#A054A0]" />}
                  <span>{isCompared ? "Compared" : "Compare"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWishlist(property)}
                  className={`group inline-flex min-h-[40px] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold shadow-xs transition-all duration-200 active:scale-95 sm:flex-none ${isWishlisted
                    ? "border-[#A054A0] bg-[#A054A0] text-white shadow-sm shadow-[#A054A0]/20"
                    : "border-slate-200/80 bg-white text-slate-700 hover:border-[#A054A0]/50 hover:text-[#A054A0]"
                    }`}
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${isWishlisted ? "fill-white text-white" : "text-[#A054A0]"
                      }`}
                  />
                  <span>{isWishlisted ? "Shortlisted" : "Shortlist"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Minimal Media Gallery Section */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_30px_-15px_rgba(160,84,160,0.1)] ring-1 ring-slate-100">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-[#fcfbfd] px-4 py-3 sm:px-6 sm:py-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#A054A0]" />
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-800">
                  Media Gallery
                </h2>
              </div>
              <span className="rounded-full bg-[#A054A0]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#A054A0]">
                {availableGallery.length} {availableGallery.length === 1 ? "Image" : "Images"}
              </span>
            </div>

            <div className="p-3 sm:p-5 lg:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_340px]">
                <div
                  className="group relative overflow-hidden rounded-xl bg-slate-50 shadow-xs ring-1 ring-slate-200/50"
                  onMouseEnter={() => {
                    if (autoScrollTimeoutRef.current) {
                      clearTimeout(autoScrollTimeoutRef.current);
                    }
                  }}
                  onMouseLeave={() => {
                    if (availableGallery.length > 1) {
                      autoScrollTimeoutRef.current = setTimeout(
                        goToNextImage,
                        AUTO_SCROLL_INTERVAL
                      );
                    }
                  }}
                >
                  <div className="relative aspect-[16/10] min-h-[220px] w-full sm:min-h-[280px]">
                    {activeImage ? (
                      <Image
                        key={activeImg}
                        src={activeImage}
                        alt={property.name || "Property image"}
                        fill
                        priority
                        className="object-cover [animation:propertyImageFade_350ms_ease_both] motion-reduce:[animation:none]"
                        sizes="(max-width: 767px) 100vw, 70vw"
                        onError={() => handleImageError(activeImg)}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        Image unavailable
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

                    <div className="absolute bottom-3 left-3 max-w-[80%] text-xs font-semibold text-white drop-shadow-xs sm:text-sm">
                      {availableGallery.find((img) => img.key === activeImg)?.name ||
                        "Property Photo"}
                    </div>

                    <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
                      {activeIndex + 1} / {availableGallery.length}
                    </div>

                    {availableGallery.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={goToPreviousImage}
                          aria-label="Previous image"
                          className="absolute left-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-xs transition hover:bg-[#A054A0] md:opacity-0 md:group-hover:opacity-100"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={goToNextImage}
                          aria-label="Next image"
                          className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-xs transition hover:bg-[#A054A0] md:opacity-0 md:group-hover:opacity-100"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Minimal Thumbnails */}
                <div className="min-w-0">
                  <div
                    ref={thumbnailContainerRef}
                    className="hidden h-full max-h-[460px] flex-col gap-2.5 overflow-y-auto pr-1 md:flex scrollbar-none"
                  >
                    {availableGallery.map((image) => {
                      const isActive = activeImg === image.key;
                      return (
                        <button
                          key={image.key}
                          ref={(el) => {
                            thumbnailRefs.current[image.key] = el;
                          }}
                          type="button"
                          onClick={() => selectImage(image.key)}
                          aria-label={`View ${image.name}`}
                          aria-current={isActive ? "true" : undefined}
                          className={`group relative w-full shrink-0 overflow-hidden rounded-xl border transition-all duration-200 ${isActive
                            ? "border-[#A054A0] ring-1 ring-[#A054A0]/40 shadow-xs"
                            : "border-transparent bg-slate-50 hover:border-slate-200"
                            }`}
                        >
                          <div className="relative aspect-[16/9] w-full">
                            <Image
                              src={image.url}
                              alt={image.name}
                              fill
                              className="object-cover"
                              sizes="320px"
                              onError={() => handleImageError(image.key)}
                            />
                            <div
                              className={`absolute inset-0 transition ${isActive
                                ? "bg-[#A054A0]/10"
                                : "bg-black/0 group-hover:bg-black/10"
                                }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="md:hidden">
                    <div
                      ref={thumbnailContainerRef}
                      className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none"
                    >
                      {availableGallery.map((image) => {
                        const isActive = activeImg === image.key;
                        return (
                          <button
                            key={image.key}
                            ref={(el) => {
                              thumbnailRefs.current[image.key] = el;
                            }}
                            type="button"
                            onClick={() => selectImage(image.key)}
                            aria-label={`View ${image.name}`}
                            aria-current={isActive ? "true" : undefined}
                            className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border transition-all ${isActive
                              ? "border-[#A054A0] ring-1 ring-[#A054A0]/40 shadow-xs"
                              : "border-transparent opacity-80 hover:opacity-100"
                              }`}
                          >
                            <Image
                              src={image.url}
                              alt={image.name}
                              fill
                              className="object-cover"
                              sizes="96px"
                              onError={() => handleImageError(image.key)}
                            />
                            {isActive && <div className="absolute inset-0 bg-[#A054A0]/15" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Minimal Detailed Information Section */}
          <section className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_10px_30px_-15px_rgba(160,84,160,0.1)] ring-1 ring-slate-100 sm:mt-6 sm:p-7 lg:mt-8 lg:p-8">
            <DetailSection title="Property Details">
              {propertyDetails.isCoworking ? (
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField
                    label="Operator Name"
                    value={propertyDetails.managedBy}
                    icon={Building2}
                  />
                  <DetailField
                    label="Offered Seats"
                    value={propertyDetails.offeredSeats}
                    icon={Users}
                  />
                  <DetailField
                    label="Seat Price"
                    value={
                      propertyDetails.seatPrice !== "-"
                        ? formatPrice(propertyDetails.seatPrice, currency)
                        : "-"
                    }
                    icon={Layers3}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailField
                    label="Area Available"
                    value={hasArea ? formatArea(areaValue, unit) : "-"}
                    icon={Building2}
                  />
                  <DetailField
                    label="Typical Floor"
                    value={propertyDetails.towerFloor}
                    icon={Layers3}
                  />
                  <DetailField
                    label="Availability Timeline"
                    value={propertyDetails.availability}
                    icon={CalendarDays}
                  />
                  <DetailField
                    label="Rent"
                    value={
                      propertyDetails.quotedRent !== "-"
                        ? formatPrice(propertyDetails.quotedRent, currency)
                        : "-"
                    }
                    icon={CalendarDays}
                  />
                </div>
              )}
            </DetailSection>

            <div className="mt-6 sm:mt-7">
              <DetailSection title="Project Specifications">
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField
                    label="Building Certification"
                    value={propertyDetails.buildingCertification}
                    icon={Building2}
                  />
                  <DetailField
                    label="Building Structure"
                    value={propertyDetails.buildingStructure}
                    icon={Layers3}
                  />
                  <DetailField
                    label="Year of Construction"
                    value={propertyDetails.yearOfCompletion}
                    icon={CalendarDays}
                  />
                </div>
              </DetailSection>
            </div>

            <div className="mt-6 sm:mt-7">
              <DetailSection title="Connectivity & Location">
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField
                    label="Nearby Metro"
                    value={propertyDetails.nearbyMetro}
                    icon={TrainFront}
                  />
                  <DetailField
                    label="Airport Distance"
                    value={propertyDetails.airport}
                    icon={Plane}
                  />
                </div>
              </DetailSection>
            </div>
          </section>

          {/* SIMILAR PROPERTIES (Ref referenced here to trigger sticky title hiding) */}
          {related.length > 0 && (
            <section ref={similarSectionRef} className="mt-10 sm:mt-14 lg:mt-16">
              <div className="mb-4 flex items-end justify-between gap-3 sm:mb-6">
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-[#A054A0]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A054A0]">
                      Explore More
                    </span>
                  </div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
                    Similar Properties
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Explore other commercial listings in this location.
                  </p>
                </div>

                <Link
                  href="/properties"
                  className="group inline-flex min-h-[36px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-[#A054A0]/50 hover:bg-[#A054A0]/5 hover:text-[#A054A0]"
                >
                  <span>View All</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>

              <div className="space-y-4">
                {row1.length > 0 && (
                  <div className="-mx-1 flex gap-3.5 overflow-x-auto px-1 pb-3 pt-1 snap-x snap-mandatory scrollbar-none sm:gap-4">
                    {row1.map((item) => (
                      <div
                        key={getPropertyId(item)}
                        className="w-[min(80vw,300px)] shrink-0 snap-start sm:w-[300px] lg:w-[330px]"
                      >
                        <PropertyCard
                          property={item}
                          isCompared={compareSelection.some(
                            (selected) => getPropertyId(selected) === getPropertyId(item)
                          )}
                          onCompareToggle={(selectedProperty) => {
                            if (!selectedProperty) return;
                            const selectedId = getPropertyId(selectedProperty);
                            if (!selectedId) return;

                            setCompareSelection((previousSelection) => {
                              const alreadySelected = previousSelection.some(
                                (selected) => getPropertyId(selected) === selectedId
                              );
                              const updatedSelection = alreadySelected
                                ? previousSelection.filter(
                                  (selected) => getPropertyId(selected) !== selectedId
                                )
                                : [...previousSelection, selectedProperty].slice(
                                  -MAX_COMPARE_PROPERTIES
                                );

                              try {
                                localStorage.setItem(
                                  COMPARE_STORAGE_KEY,
                                  JSON.stringify(updatedSelection)
                                );
                                window.dispatchEvent(new Event("compare-updated"));
                              } catch (error) {
                                console.error("Failed to update compare selection:", error);
                              }
                              return updatedSelection;
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {row2.length > 0 && (
                  <div className="-mx-1 flex gap-3.5 overflow-x-auto px-1 pb-3 pt-1 snap-x snap-mandatory scrollbar-none sm:gap-4">
                    {row2.map((item) => (
                      <div
                        key={getPropertyId(item)}
                        className="w-[min(80vw,300px)] shrink-0 snap-start sm:w-[300px] lg:w-[330px]"
                      >
                        <PropertyCard
                          property={item}
                          isCompared={compareSelection.some(
                            (selected) => getPropertyId(selected) === getPropertyId(item)
                          )}
                          onCompareToggle={(selectedProperty) => {
                            if (!selectedProperty) return;
                            const selectedId = getPropertyId(selectedProperty);
                            if (!selectedId) return;

                            setCompareSelection((previousSelection) => {
                              const alreadySelected = previousSelection.some(
                                (selected) => getPropertyId(selected) === selectedId
                              );
                              const updatedSelection = alreadySelected
                                ? previousSelection.filter(
                                  (selected) => getPropertyId(selected) !== selectedId
                                )
                                : [...previousSelection, selectedProperty].slice(
                                  -MAX_COMPARE_PROPERTIES
                                );

                              try {
                                localStorage.setItem(
                                  COMPARE_STORAGE_KEY,
                                  JSON.stringify(updatedSelection)
                                );
                                window.dispatchEvent(new Event("compare-updated"));
                              } catch (error) {
                                console.error("Failed to update compare selection:", error);
                              }
                              return updatedSelection;
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Minimal Floating Action Bar */}
        {compareSelection.length > 0 && (
          <div className="fixed bottom-3 left-1/2 z-[150] w-[calc(100%-1.25rem)] max-w-3xl -translate-x-1/2 rounded-2xl border border-[#A054A0]/20 bg-white/95 p-3.5 shadow-[0_20px_50px_-20px_rgba(160,84,160,0.25)] backdrop-blur-xl ring-1 ring-slate-100 sm:bottom-5 sm:w-[calc(100%-2rem)] sm:p-4">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <GitCompare className="h-4 w-4 shrink-0 text-[#A054A0]" />
                  <p className="text-xs font-semibold text-slate-900">
                    {compareSelection.length} of {MAX_COMPARE_PROPERTIES} properties selected for comparison
                  </p>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {compareSelection.length >= MIN_COMPARE_PROPERTIES
                    ? "Ready to compare side-by-side."
                    : `Select ${MIN_COMPARE_PROPERTIES - compareSelection.length} more property to compare.`}
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={openComparePage}
                  disabled={
                    compareSelection.length < MIN_COMPARE_PROPERTIES ||
                    compareSelection.length > MAX_COMPARE_PROPERTIES
                  }
                  className="inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#A054A0] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#864286] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <GitCompare className="h-3.5 w-3.5 shrink-0" />
                  <span>Compare Properties</span>
                </button>

                <button
                  type="button"
                  onClick={clearCompareSelection}
                  className="inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                >
                  <X className="h-3.5 w-3.5 shrink-0" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}