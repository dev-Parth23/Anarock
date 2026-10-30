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
  Building,
} from "lucide-react";

const IMAGE_BASE_URL = "https://property-images.zohostratus.in";
const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
  "bmp",
  "tif",
  "tiff",
  "svg",
];
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
    <div className="group relative flex min-w-0 items-center gap-3.5 rounded-xl border border-slate-800/15 bg-white p-4 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#A054A0]/40 hover:shadow-md sm:gap-4 sm:p-4.5">
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#A054A0]/10 text-[#A054A0] transition-transform duration-300 group-hover:scale-105">
          <Icon className="h-4.5 w-4.5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A054A0]">
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
    <section className="relative border-t border-slate-800/15 pt-6 first:border-t-0 first:pt-0 sm:pt-8">
      <div className="mb-4 flex items-center gap-2.5">
        <h3 className="text-base font-bold tracking-tight text-black sm:text-lg">
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
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState("project");
  const { unit, currency } = usePreferences();
  const [failedImages, setFailedImages] = useState(new Set());
  const [imageExtensionIndexes, setImageExtensionIndexes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [compareSelection, setCompareSelection] = useState([]);
  const [isTitleVisible, setIsTitleVisible] = useState(true);
  const similarSectionRef = useRef(null);
  const thumbnailContainerRef = useRef(null);
  const thumbnailRefs = useRef({});
  const autoScrollTimeoutRef = useRef(null);

  useEffect(() => {
    let frameId = null;

    const handleScroll = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        const currentY = Math.max(0, window.scrollY);
        let shouldShow = currentY < 100;

        if (similarSectionRef.current) {
          const rect = similarSectionRef.current.getBoundingClientRect();
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
          ? IMAGE_FILES.map((image) => {
            const baseName = image.filename.replace(/\.[^/.]+$/, "");
            const originalExtension = image.filename
              .split(".")
              .pop()
              .toLowerCase();

            const extensions = [
              originalExtension,
              ...IMAGE_EXTENSIONS.filter(
                (ext) => ext !== originalExtension
              ),
            ];

            const candidates = extensions.map(
              (extension) =>
                `${IMAGE_BASE_URL}/${imageFolderPath}/${baseName}.${extension}`
            );

            return {
              ...image,
              url: candidates[0],
              candidates,
            };
          })
          : [];

        setProperty({
          ...propertyData,
          image: images.find((image) => image.key === "project")?.url || "",
        });
        setGallery(images);
        setActiveImg("project");
        setImageExtensionIndexes({});

        // Fetch ALL properties from the database to enable intelligent priority sorting & no dead-ends
        try {
          const allResponse = await fetch(`/api/properties`, {
            cache: "no-store",
            signal: controller.signal,
          });
          const allData = await allResponse.json();

          if (allData.success) {
            const currentId = getPropertyId(propertyData);
            const otherProperties = (allData.data || []).filter(
              (item) => getPropertyId(item) !== currentId
            );

            // Prioritization logic:
            // 1. Same City
            // 2. Same Micromarket
            // 3. Similar Type / Rent / Area proximity
            const scoredProperties = otherProperties.map((item) => {
              let score = 0;

              // City match gets highest primary boost
              if (
                propertyData.city &&
                item.city &&
                item.city.trim().toLowerCase() === propertyData.city.trim().toLowerCase()
              ) {
                score += 100;
              }

              // Micromarket match gets secondary boost
              if (
                propertyData.micromarket &&
                item.micromarket &&
                item.micromarket.trim().toLowerCase() === propertyData.micromarket.trim().toLowerCase()
              ) {
                score += 50;
              }

              // Property Type match
              const currentType = normalizeType(
                propertyData.officeType || propertyData.propertyType || propertyData.type
              );
              const itemType = normalizeType(
                item.officeType || item.propertyType || item.type
              );
              if (currentType && itemType && currentType === itemType) {
                score += 25;
              }

              // Rent / Price proximity check (closer rent values get small incremental score)
              const currentRent = Number(propertyData.quotedRent || propertyData.monthlyCostPerSeat || 0);
              const itemRent = Number(item.quotedRent || item.monthlyCostPerSeat || 0);
              if (currentRent > 0 && itemRent > 0) {
                const diffRatio = Math.abs(currentRent - itemRent) / currentRent;
                if (diffRatio < 0.5) score += 10;
              }

              return { item, score };
            });

            // Sort by score descending so highest priority items appear first, but ALL properties remain included
            scoredProperties.sort((a, b) => b.score - a.score);
            setRelated(scoredProperties.map((p) => p.item));
          }
        } catch (relatedError) {
          if (relatedError.name !== "AbortError") {
            console.error("All properties fetch error:", relatedError);
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
    return gallery.filter(
      (image) => !failedImages.has(image.key)
    );
  }, [gallery, failedImages]);

  const getImageSrc = (image) => {
    if (!image) return "";
    const candidates = image.candidates || [image.url];
    const index = imageExtensionIndexes[image.key] || 0;
    return candidates[index] || candidates[0] || "";
  };

  useEffect(() => {
    availableGallery.forEach((image) => {
      const src = getImageSrc(image);
      if (src) {
        const img = new window.Image();
        img.src = src;
      }
    });
  }, [availableGallery, imageExtensionIndexes]);

  const activeImageItem = availableGallery.find(
    (image) => image.key === activeImg
  );

  const activeImage =
    getImageSrc(activeImageItem) ||
    property?.image ||
    "";

  const activeIndex = Math.max(
    0,
    availableGallery.findIndex(
      (image) => image.key === activeImg
    )
  );

  const handleImageError = (imageKey) => {
    const image = gallery.find(
      (item) => item.key === imageKey
    );
    if (!image) return;

    const candidates = image.candidates || [image.url];
    const currentIndex = imageExtensionIndexes[imageKey] || 0;
    if (currentIndex < candidates.length - 1) {
      setImageExtensionIndexes((previous) => ({
        ...previous,
        [imageKey]: currentIndex + 1,
      }));
      return;
    }
    setFailedImages((previous) => {
      const next = new Set(previous);
      next.add(imageKey);
      return next;
    });
    if (activeImg === imageKey) {
      const currentIndexInGallery = availableGallery.findIndex(
        (img) => img.key === imageKey
      );
      const nextImage =
        availableGallery[currentIndexInGallery + 1] ||
        availableGallery[currentIndexInGallery - 1];

      if (nextImage) {
        setActiveImg(nextImage.key);
      }
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
        <div className="max-w-md rounded-xl border border-slate-800/15 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#A054A0]/10 text-[#A054A0]">
            <Building className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-lg font-bold text-black">
            {isAuthError ? "Unable to load property" : "Property not found"}
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            {isAuthError
              ? "There was a temporary problem connecting to the property database. Please try again."
              : error || "Unable to load property details."}
          </p>
          <Link
            href="/properties"
            className="mt-5 inline-flex min-h-[40px] items-center justify-center rounded-lg bg-[#A054A0] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#864286]"
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
          <div
            className={`sticky top-[60px] z-40 mb-4 overflow-hidden rounded-xl border border-slate-800/15 bg-white/95 px-3.5 py-3.5 shadow-sm backdrop-blur-xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none sm:top-[68px] sm:mb-6 sm:px-6 sm:py-4 ${isTitleVisible
              ? "translate-y-0 opacity-100"
              : "-translate-y-[calc(100%+12px)] pointer-events-none opacity-0 shadow-none"
              }`}
            aria-hidden={!isTitleVisible}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.14em] text-[#A054A0]">
                  {property.city && (
                    <span className="py-0.5 ">
                      {property.city}
                    </span>
                  )}
                  {property.micromarket && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="py-0.5 text-slate-800">
                        {property.micromarket}
                      </span>
                    </>
                  )}
                  {propertyDetails.propertyType && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="py-0.5 text-slate-800">
                        {propertyDetails.propertyType}
                      </span>
                    </>
                  )}
                </div>
                <h1 className="break-words text-xl font-bold tracking-tight text-black sm:text-2xl">
                  {property.name}
                </h1>

                {property.address && (
                  <div className="mt-1 flex min-w-0 items-center gap-1.5 text-base text-black/80">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#A054A0]" />
                    <p className="truncate">{property.address}</p>
                  </div>
                )}
              </div>

              <div className="flex w-full min-w-0 shrink-0 items-center gap-2.5 lg:w-auto">
                <button
                  type="button"
                  onClick={handleCompareToggle}
                  className={`group inline-flex min-h-[40px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-base font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] sm:flex-none ${isCompared
                    ? "border-[#A054A0] bg-[#A054A0] text-white shadow-sm shadow-[#A054A0]/25"
                    : "border-slate-800/15 bg-white text-black hover:border-[#A054A0]/50 hover:text-[#A054A0]"
                    }`}
                  aria-pressed={isCompared}
                >
                  {isCompared ? <X className="h-3.5 w-3.5" /> : <GitCompare className="h-3.5 w-3.5 text-[#A054A0]" />}
                  <span>{isCompared ? "Compared" : "Compare"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWishlist(property)}
                  className={`group inline-flex min-h-[40px] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-base font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] sm:flex-none ${isWishlisted
                    ? "border-[#A054A0] bg-[#A054A0] text-white shadow-sm shadow-[#A054A0]/25"
                    : "border-slate-800/15 bg-white text-black hover:border-[#A054A0]/50 hover:text-[#A054A0]"
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

          <section className="min-w-0 overflow-hidden rounded-xl border border-slate-800/15 bg-white shadow-sm">
            <div className="p-3 sm:p-5 lg:p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_340px]">
                <div
                  className="group relative overflow-hidden rounded-lg bg-slate-50 shadow-sm ring-1 ring-slate-200/50"
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
                  <div className="relative aspect-[16/10] min-h-[240px] w-full overflow-hidden bg-slate-100 sm:min-h-[320px] lg:min-h-[400px]">
                    {activeImage ? (
                      <Image
                        src={activeImage}
                        alt={property.name || "Property image"}
                        fill
                        priority
                        quality={90}
                        className="object-cover transition-opacity duration-200"
                        sizes="(max-width: 767px) 100vw, (max-width: 1199px) 65vw, 70vw"
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

                <div className="min-w-0">
                  <div
                    ref={thumbnailContainerRef}
                    className="hidden h-full max-h-[680px] flex-col gap-2.5 overflow-y-auto pr-1 md:flex scrollbar-none"
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
                          className={`group relative w-full shrink-0 overflow-hidden rounded-lg border transition-all duration-200 ${isActive
                            ? "border-[#A054A0] ring-1 ring-[#A054A0]/40 shadow-sm"
                            : "border-transparent bg-slate-50 hover:border-slate-200"
                            }`}
                        >
                          <div className="relative aspect-[16/9] w-full">
                            <Image
                              src={getImageSrc(image)}
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
                            className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-all ${isActive
                              ? "border-[#A054A0] ring-1 ring-[#A054A0]/40 shadow-sm"
                              : "border-transparent opacity-80 hover:opacity-100"
                              }`}
                          >
                            <Image
                              src={getImageSrc(image)}
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

          <section className="mt-5 rounded-xl border border-slate-800/15 bg-white p-5 shadow-sm sm:mt-6 sm:p-7 lg:mt-8 lg:p-8">
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

          {/* SIMILAR PROPERTIES / ALL PROPERTIES SORTED BY PRIORITY */}
          {related.length > 0 && (
            <section ref={similarSectionRef} className="mt-10 sm:mt-14 lg:mt-16">
              <div className="mb-4 flex items-end justify-between gap-3 sm:mb-6">
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-[#A054A0]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A054A0]">
                      Explore More
                    </span>
                  </div>
                  <h2 className="text-lg font-bold tracking-tight text-black sm:text-2xl">
                    You Might Also Be Interested In
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Showing all available listings prioritized by location, type, and rent.
                  </p>
                </div>

                <Link
                  href="/properties"
                  className="group inline-flex min-h-[36px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-800/15 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-[#A054A0]/50 hover:bg-[#A054A0]/5 hover:text-[#A054A0]"
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
                  <div className=" flex gap-3.5 overflow-x-auto px-1 pb-3 pt-1 snap-x snap-mandatory scrollbar-none sm:gap-4">
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

        {compareSelection.length > 0 && (
          <div className="fixed bottom-4 left-1/2 z-[90] w-[calc(100%-1.5rem)] max-w-5xl -translate-x-1/2 rounded-lg border border-slate-400/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-5 sm:w-[calc(100%-2.5rem)] sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5 shrink-0 text-[#A054A0]" />
                  <p className="text-sm font-bold leading-5 text-black sm:text-base">
                    {compareSelection.length} of {MAX_COMPARE_PROPERTIES} properties selected for comparison
                  </p>
                </div>
                <p className="mt-1 pl-7 text-xs leading-5 text-slate-500 sm:text-sm">
                  {compareSelection.length >= MIN_COMPARE_PROPERTIES
                    ? "Ready to compare side-by-side."
                    : `Select ${MIN_COMPARE_PROPERTIES - compareSelection.length} more property to compare.`}
                </p>
              </div>

              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-start lg:w-auto lg:shrink-0 lg:justify-end">
                <button
                  type="button"
                  onClick={openComparePage}
                  disabled={
                    compareSelection.length < MIN_COMPARE_PROPERTIES ||
                    compareSelection.length > MAX_COMPARE_PROPERTIES
                  }
                  className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#A054A0] px-3 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#864286] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:hover:shadow-sm sm:px-4 sm:text-sm"
                >
                  <GitCompare className="h-4 w-4 shrink-0" />
                  <span>Compare</span>
                  {compareSelection.length > 0 && (
                    <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[11px] font-semibold">
                      {compareSelection.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={clearCompareSelection}
                  className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-500 bg-white px-4 py-2.5 text-xs font-semibold text-black/80 transition-all duration-200 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] sm:col-span-1 sm:text-sm"
                >
                  <X className="h-4 w-4 shrink-0" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}