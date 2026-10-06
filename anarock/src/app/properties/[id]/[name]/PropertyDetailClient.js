"use client";

import { usePreferences } from "@/lib/preferences";
import { formatArea } from "@/lib/format";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PropertyCard from "@/components/properties/PropertyCard";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building2,
  Users,
  Layers3,
  CalendarDays,
  TrainFront,
  BusFront,
  Plane,
  ArrowUpRight,
} from "lucide-react";

const IMAGE_BASE_URL = "https://property-images.zohostratus.in";
const AUTO_SCROLL_INTERVAL = 25000;

const IMAGE_FILES = [
  {
    key: "project",
    name: "Project Picture 1",
    filename: "Project_Picture_1.jpg",
  },
  { key: "floor-plan", name: "Floor Plan 1", filename: "Floor_Plan_1.jpg" },
  {
    key: "property-1",
    name: "Property Photo 1",
    filename: "Property_Photo_1.jpg",
  },
  {
    key: "property-2",
    name: "Property Photo 2",
    filename: "Property_Photo_2.jpg",
  },
  {
    key: "property-3",
    name: "Property Photo 3",
    filename: "Property_Photo_3.jpg",
  },
  {
    key: "property-4",
    name: "Property Photo 4",
    filename: "Property_Photo_4.jpg",
  },
  {
    key: "property-5",
    name: "Property Photo 5",
    filename: "Property_Photo_5.jpg",
  },
  {
    key: "property-6",
    name: "Property Photo 6",
    filename: "Property_Photo_6.jpg",
  },
  {
    key: "property-7",
    name: "Property Photo 7",
    filename: "Property_Photo_7.jpg",
  },
  {
    key: "property-8",
    name: "Property Photo 8",
    filename: "Property_Photo_8.jpg",
  },
  {
    key: "property-9",
    name: "Property Photo 9",
    filename: "Property_Photo_9.jpg",
  },
  {
    key: "property-10",
    name: "Property Photo 10",
    filename: "Property_Photo_10.jpg",
  },
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
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

const isCoworkingProperty = (property) => {
  const type = normalizeType(
    property?.officeType ||
      property?.office_type ||
      property?.propertyType ||
      property?.property_type ||
      property?.type,
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
      "",
  );
};

/* =========================================================
   UI SUB-COMPONENTS
========================================================= */

function DetailField({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-[#A054A0]" />}
        <p className="text-sm font-semibold leading-5 text-slate-900">
          {label}
        </p>
      </div>
      <p className="mt-1.5 break-words text-sm leading-6 text-slate-600">
        {formatDisplayValue(value)}
      </p>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="border-t border-slate-200 pt-6 first:border-t-0 first:pt-0">
      <h3 className="mb-5 text-base font-bold text-slate-900 sm:text-lg">
        {title}
      </h3>
      {children}
    </section>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PropertyDetailClient({ propertyId }) {
  const [property, setProperty] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [activeImg, setActiveImg] = useState("project");
  const [related, setRelated] = useState([]);
  const { unit } = usePreferences();
  const [failedImages, setFailedImages] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [, setIsContactModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const thumbnailContainerRef = useRef(null);
  const thumbnailRefs = useRef({});
  const autoScrollTimeoutRef = useRef(null);

  /* ---------------------------------------------------------
     FETCH PROPERTY & UNLIMITED RELATED PROPERTIES
  --------------------------------------------------------- */
  useEffect(() => {
    if (!propertyId) return;

    const controller = new AbortController();

    async function loadProperty() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertyId)}`,
          { cache: "no-store", signal: controller.signal },
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load property");
        }

        const propertyData = data.data;
        const imageFolderPath = String(
          propertyData.imageFolderPath || "",
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
              { cache: "no-store", signal: controller.signal },
            );
            const relatedData = await relatedResponse.json();

            if (relatedData.success) {
              const currentId = getPropertyId(propertyData);
              // Unlimited fetch: remove slice filter and keep all matching properties
              const relatedProperties = (relatedData.data || []).filter(
                (item) => getPropertyId(item) !== currentId,
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

  /* ---------------------------------------------------------
     SPLIT RELATED PROPERTIES INTO 2 SEPARATE ROWS FOR X-SCROLL
  --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     WISHLIST SYNC
  --------------------------------------------------------- */
  useEffect(() => {
    if (!property) return;

    const syncWishlist = () => {
      try {
        const wishlist = JSON.parse(
          localStorage.getItem("anarock_wishlist_properties") || "[]",
        );
        const currentId = getPropertyId(property);
        setIsWishlisted(
          wishlist.some((item) => getPropertyId(item) === currentId),
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
        (wishlistItem) => getPropertyId(wishlistItem) === currentId,
      );
      const updated = exists
        ? existing.filter(
            (wishlistItem) => getPropertyId(wishlistItem) !== currentId,
          )
        : [...existing, item];

      setIsWishlisted(!exists);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      console.error("Wishlist update failed:", err);
    }
  };

  /* ---------------------------------------------------------
     GALLERY NAVIGATION & AUTO-SCROLL
  --------------------------------------------------------- */
  const availableGallery = useMemo(() => {
    return gallery.filter((image) => !failedImages.has(image.key));
  }, [gallery, failedImages]);

  const activeImage =
    availableGallery.find((image) => image.key === activeImg)?.url ||
    property?.image ||
    "";

  const activeIndex = Math.max(
    0,
    availableGallery.findIndex((image) => image.key === activeImg),
  );

  const handleImageError = (imageKey) => {
    setFailedImages((prev) => new Set(prev).add(imageKey));

    if (activeImg === imageKey) {
      const currentIndex = availableGallery.findIndex(
        (img) => img.key === imageKey,
      );
      const nextImage =
        availableGallery[currentIndex + 1] ||
        availableGallery[currentIndex - 1];
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
      thumbnail.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, []);

  const selectImage = useCallback(
    (imageKey) => {
      setActiveImg(imageKey);
      requestAnimationFrame(() => {
        scrollThumbnailToTop(imageKey);
      });
    },
    [scrollThumbnailToTop],
  );

  const goToNextImage = useCallback(() => {
    if (!availableGallery.length) return;
    const nextIndex = (activeIndex + 1) % availableGallery.length;
    const nextImage = availableGallery[nextIndex];
    if (nextImage) selectImage(nextImage.key);
  }, [activeIndex, availableGallery, selectImage]);

  const goToPreviousImage = useCallback(() => {
    if (!availableGallery.length) return;
    const previousIndex =
      (activeIndex - 1 + availableGallery.length) % availableGallery.length;
    const previousImage = availableGallery[previousIndex];
    if (previousImage) selectImage(previousImage.key);
  }, [activeIndex, availableGallery, selectImage]);

  useEffect(() => {
    if (availableGallery.length <= 1) return;

    autoScrollTimeoutRef.current = setTimeout(
      goToNextImage,
      AUTO_SCROLL_INTERVAL,
    );

    return () => {
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
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

  /* ---------------------------------------------------------
     PROPERTY DETAILS MEMOIZATION
  --------------------------------------------------------- */
  const propertyDetails = useMemo(() => {
    if (!property) return {};

    return {
      isCoworking: isCoworkingProperty(property),
      propertyType: getValue(
        property,
        ["officeType", "office_type", "propertyType", "property_type", "type"],
        "Conventional",
      ),
      managedBy: getValue(property, [
        "operatorName",
        "OperatorName",
        "operator",
        "Operator",
        "managedBy",
        "ManagedBy",
        "managed_by",
      ]),
      offeredSeats: getValue(property, [
        "seatsOffered",
        "SeatsOffered",
        "offeredSeats",
        "OfferedSeats",
        "seats",
        "Seats",
      ]),
      towerFloor: getValue(property, [
        "floor",
        "Floor",
        "proposedFloor",
        "ProposedFloor",
        "towerFloor",
        "TowerFloor",
        "towerFloorOffered",
        "TowerFloorOffered",
      ]),
      areaOffered: getValue(property, [
        "areaSqft",
        "AreaSqft",
        "area",
        "Area",
        "floorPlate",
        "FloorPlate",
      ]),
      availability: getValue(property, [
        "availability",
        "Availability",
        "availabilityTimeline",
        "AvailabilityTimeline",
        "availabilityDate",
        "AvailabilityDate",
      ]),
      buildingCertification: getValue(property, [
        "buildingCertification",
        "BuildingCertification",
        "certificateName",
        "CertificateName",
        "certification",
        "Certification",
      ]),
      numberOfElevators: getValue(property, [
        "numberOfElevators",
        "NumberOfElevators",
        "noOfElevators",
        "NoOfElevators",
        "elevators",
        "Elevators",
      ]),
      yearOfCompletion: getValue(property, [
        "yearBuilt",
        "YearBuilt",
        "yearOfCompletion",
        "YearOfCompletion",
        "completionYear",
        "CompletionYear",
      ]),
      nearbyMetro: getValue(property, [
        "nearbyMetro",
        "NearbyMetro",
        "metro",
        "Metro",
        "metroStation",
        "MetroStation",
      ]),
      busStation: getValue(property, [
        "busStation",
        "BusStation",
        "bussStation",
        "BussStation",
        "nearbyBus",
        "NearbyBus",
      ]),
      airport: getValue(property, [
        "airport",
        "Airport",
        "nearbyAirport",
        "NearbyAirport",
      ]),
    };
  }, [property]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-lg text-slate-600">Loading property...</div>
      </div>
    );
  }

  if (error || !property) {
    const isAuthError =
      error?.toLowerCase().includes("oauth") ||
      error?.toLowerCase().includes("token");

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          <h1 className="mb-2 text-2xl font-semibold text-slate-900">
            {isAuthError ? "Unable to load property" : "Property not found"}
          </h1>
          <p className="text-slate-500">
            {isAuthError
              ? "There was a temporary problem connecting to the property database. Please try again."
              : error || "Unable to load property details."}
          </p>
        </div>
      </div>
    );
  }
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[85vw] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="relative">
          <div className="sticky top-[72px] z-40 mb-6 border-b border-slate-200 bg-slate-50 px-4 py-4 shadow-[0_4px_18px_rgba(15,23,42,0.06)] sm:px-6 sm:py-5 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
                  {property.city && <span>{property.city}</span>}
                  {property.micromarket && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span>{property.micromarket}</span>
                    </>
                  )}

                  {propertyDetails.propertyType && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span>{propertyDetails.propertyType}</span>
                    </>
                  )}
                </div>
                <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
                  {property.name}
                </h1>

                {property.address && (
                  <div className="mt-1.5 flex min-w-0 items-center gap-2 text-xs text-slate-500 sm:text-sm">
                    <MapPin className="h-4 w-4 shrink-0 text-[#A054A0]" />

                    <p className="truncate">{property.address}</p>
                  </div>
                )}
              </div>
              <div className="flex w-full shrink-0 items-center gap-2 sm:gap-3 lg:w-auto">
                {/* <button type="button" onClick={() => setIsContactModalOpen(true)} className=" inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 sm:h-11 sm:flex-none sm:px-5"> Contact Us </button> */}
                <button
                  type="button"
                  onClick={() => handleWishlist(property)}
                  className={` inline-flex h-10 flex-1 items-center justify-center rounded-xl px-4 text-sm font-semibold shadow-sm transition sm:h-11 sm:flex-none sm:px-5 ${isWishlisted ? "bg-pink-600 text-white hover:bg-pink-700" : "bg-gray-900 text-white hover:bg-gray-800"}`}
                >
                  {" "}
                  {isWishlisted ? "Shortlisted" : "Shortlist"}
                </button>
              </div>
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-900 sm:text-base">
                Property Media Gallery
              </h2>
              <div className="text-xs font-medium text-slate-500 sm:text-sm">
                {availableGallery.length} image
                {availableGallery.length === 1 ? "" : "s"} found
              </div>
            </div>
            <div className="p-3 sm:p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_340px] lg:grid-cols-[minmax(0,1fr)_380px]">
                <div
                  className="group relative overflow-hidden rounded-2xl bg-slate-100"
                  onMouseEnter={() => {
                    if (autoScrollTimeoutRef.current) {
                      clearTimeout(autoScrollTimeoutRef.current);
                    }
                  }}
                  onMouseLeave={() => {
                    if (availableGallery.length > 1) {
                      autoScrollTimeoutRef.current = setTimeout(
                        goToNextImage,
                        AUTO_SCROLL_INTERVAL,
                      );
                    }
                  }}
                >
                  <div className="relative aspect-[4/3] min-h-[280px] w-full sm:aspect-[16/10] md:aspect-[4/3] lg:aspect-[16/10]">
                    {activeImage ? (
                      <Image
                        key={activeImg}
                        src={activeImage}
                        alt={property.name || "Property image"}
                        fill
                        priority
                        className="object-cover transition-opacity duration-500"
                        sizes="(max-width: 767px) 100vw, 70vw"
                        onError={() => handleImageError(activeImg)}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        Image unavailable
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/65 to-transparent" />
                    <div className="absolute bottom-4 left-4 max-w-[80%] text-sm font-semibold text-white drop-shadow-md sm:text-base">
                      {availableGallery.find((img) => img.key === activeImg)
                        ?.name || "Property Photo"}
                    </div>
                    <div className="absolute right-4 top-4 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                      {activeIndex + 1} / {availableGallery.length}
                    </div>
                    {availableGallery.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={goToPreviousImage}
                          aria-label="Previous image"
                          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-lg backdrop-blur-md transition hover:bg-black/75 md:opacity-0 md:group-hover:opacity-100"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>

                        <button
                          type="button"
                          onClick={goToNextImage}
                          aria-label="Next image"
                          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-lg backdrop-blur-md transition hover:bg-black/75 md:opacity-0 md:group-hover:opacity-100"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* THUMBNAILS */}
                <div className="min-w-0">
                  {/* Desktop */}
                  <div
                    ref={thumbnailContainerRef}
                    className="hidden h-full max-h-[620px] flex-col gap-3 overflow-y-auto pr-1 md:flex"
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
                          className={`
                          group
                          relative
                          w-full
                          shrink-0
                          overflow-hidden
                          rounded-xl
                          border-2
                          text-left
                          transition-all
                          duration-300
                          ${
                            isActive
                              ? "border-[#A054A0] shadow-md"
                              : "border-transparent bg-slate-50 hover:border-slate-300"
                          }
                        `}
                        >
                          <div className="relative aspect-[16/9] w-full">
                            <Image
                              src={image.url}
                              alt={image.name}
                              fill
                              className="object-cover"
                              sizes="380px"
                              onError={() => handleImageError(image.key)}
                            />

                            <div
                              className={`
                              absolute
                              inset-0
                              transition
                              ${
                                isActive
                                  ? "bg-[#A054A0]/10"
                                  : "bg-black/0 group-hover:bg-black/10"
                              }
                            `}
                            />
                          </div>

                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8">
                            <p className="truncate text-xs font-medium text-white">
                              {image.name}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden">
                    <div
                      ref={thumbnailContainerRef}
                      className="flex gap-2 overflow-x-auto pb-1"
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
                            className={`
                            relative
                            h-20
                            w-28
                            shrink-0
                            overflow-hidden
                            rounded-xl
                            border-2
                            transition-all
                            ${
                              isActive
                                ? "border-[#A054A0] shadow-md"
                                : "border-transparent opacity-75"
                            }
                          `}
                          >
                            <Image
                              src={image.url}
                              alt={image.name}
                              fill
                              className="object-cover"
                              sizes="112px"
                              onError={() => handleImageError(image.key)}
                            />

                            {isActive && (
                              <div className="absolute inset-0 bg-[#A054A0]/15" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =======================================================
            PROPERTY DETAILS
        ======================================================== */}
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mt-10 sm:rounded-3xl sm:p-7 lg:p-8">
            <DetailSection title="Property details">
              {propertyDetails.isCoworking ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField
                    label="Managed By"
                    value={propertyDetails.managedBy}
                    icon={Building2}
                  />

                  <DetailField
                    label="Offered Seats"
                    value={propertyDetails.offeredSeats}
                    icon={Users}
                  />

                  <DetailField
                    label="Tower/Floor offered"
                    value={propertyDetails.towerFloor}
                    icon={Layers3}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField
                    label="Area offered"
                    value={
                      propertyDetails.areaOffered !== "-" &&
                      !isNaN(Number(propertyDetails.areaOffered))
                        ? formatArea(Number(propertyDetails.areaOffered), unit)
                        : propertyDetails.areaOffered
                    }
                    icon={Building2}
                  />

                  <DetailField
                    label="Tower/Floor offered"
                    value={propertyDetails.towerFloor}
                    icon={Layers3}
                  />

                  <DetailField
                    label="Availability Timeline"
                    value={propertyDetails.availability}
                    icon={CalendarDays}
                  />
                </div>
              )}
            </DetailSection>

            <div className="mt-7">
              <DetailSection title="Project Specifications">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField
                    label="Building certification"
                    value={propertyDetails.buildingCertification}
                    icon={Building2}
                  />

                  <DetailField
                    label="Number of elevators"
                    value={propertyDetails.numberOfElevators}
                    icon={Layers3}
                  />

                  <DetailField
                    label="Year of Completion"
                    value={propertyDetails.yearOfCompletion}
                    icon={CalendarDays}
                  />
                </div>
              </DetailSection>
            </div>

            <div className="mt-7">
              <DetailSection title="Connectivity">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField
                    label="Nearby Metro"
                    value={propertyDetails.nearbyMetro}
                    icon={TrainFront}
                  />

                  <DetailField
                    label="Bus station"
                    value={propertyDetails.busStation}
                    icon={BusFront}
                  />

                  <DetailField
                    label="Airport"
                    value={propertyDetails.airport}
                    icon={Plane}
                  />
                </div>
              </DetailSection>
            </div>
          </section>
        </div>
        {/* =========================================================
          END STICKY PROPERTY CONTENT
          Sticky header stops here.
      ========================================================== */}

        {/* =========================================================
          SUGGESTED / SIMILAR PROPERTIES
          Header is no longer sticky from this point.
      ========================================================== */}
        {related.length > 0 && (
          <section className="mt-12 sm:mt-14">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                  Similar Properties
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Explore other properties in this location.
                </p>
              </div>

              <Link
                href="/properties"
                aria-label="View all properties"
                className="inline-flex items-center justify-center"
              >
                <ArrowUpRight
                  className="
                  h-5
                  w-5
                  text-slate-400
                  transition-transform
                  duration-200
                  hover:translate-x-0.5
                  hover:-translate-y-0.5
                "
                />
              </Link>
            </div>

            <div className="space-y-6">
              {/* ROW 1 */}
              {row1.length > 0 && (
                <div className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none">
                  {row1.map((item) => (
                    <div
                      key={getPropertyId(item)}
                      className="w-[280px] shrink-0 snap-start sm:w-[320px] lg:w-[350px]"
                    >
                      <PropertyCard property={item} />
                    </div>
                  ))}
                </div>
              )}

              {/* ROW 2 */}
              {row2.length > 0 && (
                <div className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none">
                  {row2.map((item) => (
                    <div
                      key={getPropertyId(item)}
                      className="w-[280px] shrink-0 snap-start sm:w-[320px] lg:w-[350px]"
                    >
                      <PropertyCard property={item} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
