"use client";

import { usePreferences } from "@/lib/preferences";
import { formatPrice, formatArea } from "@/lib/format";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
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
  Car,
  ArrowUpRight,
} from "lucide-react";

const IMAGE_BASE_URL = "https://property-images.zohostratus.in";

const IMAGE_FILES = [
  {
    key: "project",
    name: "Project Picture 1",
    filename: "Project_Picture_1.jpg",
  },
  {
    key: "floor-plan",
    name: "Floor Plan 1",
    filename: "Floor_Plan_1.jpg",
  },
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

const AUTO_SCROLL_INTERVAL = 25000;

/* =========================================================
   SAFE VALUE HELPERS
========================================================= */

const getValue = (property, keys, fallback = "-") => {
  for (const key of keys) {
    const value = property?.[key];

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
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
    property?.type
  );

  return (
    type.includes("cowork") ||
    type.includes("co-working") ||
    type.includes("managed office")
  );
};

const formatDisplayValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  if (Array.isArray(value)) {
    return value.length
      ? value.join(", ")
      : "-";
  }

  if (
    typeof value === "object"
  ) {
    return Object.values(value).join(", ") || "-";
  }

  return String(value);
};

/* =========================================================
   FIELD COMPONENT
========================================================= */

function DetailField({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon className="h-4 w-4 shrink-0 text-[#A054A0]" />
        )}

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

/* =========================================================
   SECTION COMPONENT
========================================================= */

function DetailSection({
  title,
  children,
}) {
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
   INFO COMPONENT
========================================================= */

function Info({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words font-semibold text-slate-900">
        {formatDisplayValue(value)}
      </p>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PropertyDetailClient({
  propertyId,
}) {
  const [property, setProperty] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [activeImg, setActiveImg] =
    useState("project");

  const [related, setRelated] = useState([]);

  const {
    currency,
    unit,
    exchangeRates,
  } = usePreferences();

  const [
    failedImages,
    setFailedImages,
  ] = useState(new Set());

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const thumbnailContainerRef =
    useRef(null);

  const thumbnailRefs =
    useRef({});

  const autoScrollTimeoutRef =
    useRef(null);

  /* =========================================================
     LOAD PROPERTY
  ========================================================= */

  useEffect(() => {
    if (!propertyId) return;

    async function loadProperty() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/properties/${encodeURIComponent(
            propertyId
          )}`,
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
            "Failed to load property"
          );
        }

        const propertyData =
          data.data;

        const imageFolderPath =
          String(
            propertyData.imageFolderPath ||
            ""
          ).replace(
            /^\/+|\/+$/g,
            ""
          );

        const images =
          imageFolderPath
            ? IMAGE_FILES.map(
              (image) => ({
                ...image,
                url: `${IMAGE_BASE_URL}/${imageFolderPath}/${image.filename}`,
              })
            )
            : [];

        setProperty({
          ...propertyData,
          image:
            images.find(
              (image) =>
                image.key === "project"
            )?.url || "",
        });

        setGallery(images);

        setActiveImg("project");

        setFailedImages(
          new Set()
        );

        /* ===============================================
           RELATED PROPERTIES
        =============================================== */

        if (propertyData.city) {
          try {
            const relatedResponse =
              await fetch(
                `/api/properties?city=${encodeURIComponent(
                  propertyData.city
                )}`,
                {
                  cache: "no-store",
                }
              );

            const relatedData =
              await relatedResponse.json();

            if (
              relatedData.success
            ) {
              const relatedProperties =
                (
                  relatedData.data ||
                  []
                )
                  .filter(
                    (item) =>
                      String(item.id) !==
                      String(
                        propertyData.id
                      )
                  )
                  .slice(0, 3);

              setRelated(
                relatedProperties
              );
            }
          } catch (
          relatedError
          ) {
            console.error(
              "Related properties error:",
              relatedError
            );
          }
        }
      } catch (err) {
        console.error(err);

        setError(
          err?.message ||
          "Unable to load property"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [propertyId]);

  /* =========================================================
     AVAILABLE GALLERY
  ========================================================= */

  const availableGallery =
    useMemo(() => {
      return gallery.filter(
        (image) =>
          !failedImages.has(
            image.key
          )
      );
    }, [
      gallery,
      failedImages,
    ]);

  /* =========================================================
     ACTIVE IMAGE
  ========================================================= */

  const activeImage =
    availableGallery.find(
      (image) =>
        image.key === activeImg
    )?.url ||
    property?.image ||
    "";

  const activeIndex = Math.max(
    0,
    availableGallery.findIndex(
      (image) =>
        image.key === activeImg
    )
  );

  /* =========================================================
     IMAGE ERROR
  ========================================================= */

  const handleImageError = (
    imageKey
  ) => {
    setFailedImages(
      (previous) => {
        const updated =
          new Set(previous);

        updated.add(imageKey);

        return updated;
      }
    );

    if (
      activeImg === imageKey
    ) {
      const currentIndex =
        availableGallery.findIndex(
          (image) =>
            image.key === imageKey
        );

      const nextImage =
        availableGallery[
        currentIndex + 1
        ] ||
        availableGallery[
        currentIndex - 1
        ];

      if (nextImage) {
        setActiveImg(
          nextImage.key
        );
      }
    }
  };

  /* =========================================================
     SCROLL SELECTED THUMBNAIL
  ========================================================= */

  const scrollThumbnailToTop = (
    imageKey
  ) => {
    const container =
      thumbnailContainerRef.current;

    const thumbnail =
      thumbnailRefs.current[
      imageKey
      ];

    if (!container || !thumbnail) {
      return;
    }

    /* Desktop: vertical thumbnail list */
    if (
      window.innerWidth >= 768
    ) {
      const targetTop =
        thumbnail.offsetTop -
        container.offsetTop;

      container.scrollTo({
        top: Math.max(
          0,
          targetTop
        ),
        behavior: "smooth",
      });

      return;
    }

    /* Mobile: horizontal thumbnail list */
    thumbnail.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  /* =========================================================
     SELECT IMAGE
  ========================================================= */

  const selectImage = (
    imageKey
  ) => {
    setActiveImg(imageKey);

    requestAnimationFrame(() => {
      scrollThumbnailToTop(
        imageKey
      );
    });
  };

  /* =========================================================
     NEXT IMAGE
  ========================================================= */

  const goToNextImage = () => {
    if (
      availableGallery.length === 0
    ) {
      return;
    }

    const nextIndex =
      activeIndex + 1 >=
        availableGallery.length
        ? 0
        : activeIndex + 1;

    const nextImage =
      availableGallery[nextIndex];

    if (nextImage) {
      selectImage(
        nextImage.key
      );
    }
  };

  /* =========================================================
     PREVIOUS IMAGE
  ========================================================= */

  const goToPreviousImage = () => {
    if (
      availableGallery.length === 0
    ) {
      return;
    }

    const previousIndex =
      activeIndex - 1 < 0
        ? availableGallery.length -
        1
        : activeIndex - 1;

    const previousImage =
      availableGallery[
      previousIndex
      ];

    if (previousImage) {
      selectImage(
        previousImage.key
      );
    }
  };

  /* =========================================================
     AUTO SCROLL EVERY 25 SECONDS
  ========================================================= */

  useEffect(() => {
    if (
      availableGallery.length <= 1
    ) {
      return;
    }

    const startAutoScroll = () => {
      if (
        autoScrollTimeoutRef.current
      ) {
        clearTimeout(
          autoScrollTimeoutRef.current
        );
      }

      autoScrollTimeoutRef.current =
        setTimeout(() => {
          goToNextImage();
        }, AUTO_SCROLL_INTERVAL);
    };

    startAutoScroll();

    return () => {
      if (
        autoScrollTimeoutRef.current
      ) {
        clearTimeout(
          autoScrollTimeoutRef.current
        );
      }
    };
  }, [
    activeImg,
    availableGallery.length,
  ]);

  /* =========================================================
     KEYBOARD NAVIGATION
  ========================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === "ArrowRight"
      ) {
        goToNextImage();
      }

      if (
        event.key === "ArrowLeft"
      ) {
        goToPreviousImage();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    activeIndex,
    availableGallery.length,
  ]);

  /* =========================================================
     PROPERTY TYPE
  ========================================================= */

  const isCoworking =
    isCoworkingProperty(
      property
    );

  const propertyType =
    getValue(
      property,
      [
        "officeType",
        "office_type",
        "propertyType",
        "property_type",
        "type",
      ],
      "Conventional"
    );

  /* =========================================================
     PROPERTY FIELDS
  ========================================================= */

  const managedBy =
    getValue(
      property,
      [
        "operatorName",
        "OperatorName",
        "operator",
        "Operator",
        "managedBy",
        "ManagedBy",
        "managed_by",
      ]
    );

  const offeredSeats =
    getValue(
      property,
      [
        "seatsOffered",
        "SeatsOffered",
        "offeredSeats",
        "OfferedSeats",
        "seats",
        "Seats",
      ]
    );

  const towerFloor =
    getValue(
      property,
      [
        "floor",
        "Floor",
        "proposedFloor",
        "ProposedFloor",
        "towerFloor",
        "TowerFloor",
        "towerFloorOffered",
        "TowerFloorOffered",
      ]
    );

  const areaOffered =
    getValue(
      property,
      [
        "areaSqft",
        "AreaSqft",
        "area",
        "Area",
        "floorPlate",
        "FloorPlate",
      ]
    );

  const availability =
    getValue(
      property,
      [
        "availability",
        "Availability",
        "availabilityTimeline",
        "AvailabilityTimeline",
        "availabilityDate",
        "AvailabilityDate",
      ]
    );

  const buildingCertification =
    getValue(
      property,
      [
        "buildingCertification",
        "BuildingCertification",
        "certificateName",
        "CertificateName",
        "certification",
        "Certification",
      ]
    );

  const numberOfElevators =
    getValue(
      property,
      [
        "numberOfElevators",
        "NumberOfElevators",
        "noOfElevators",
        "NoOfElevators",
        "elevators",
        "Elevators",
      ]
    );

  const yearOfCompletion =
    getValue(
      property,
      [
        "yearBuilt",
        "YearBuilt",
        "yearOfCompletion",
        "YearOfCompletion",
        "completionYear",
        "CompletionYear",
      ]
    );

  const nearbyMetro =
    getValue(
      property,
      [
        "nearbyMetro",
        "NearbyMetro",
        "metro",
        "Metro",
        "metroStation",
        "MetroStation",
      ]
    );

  const busStation =
    getValue(
      property,
      [
        "busStation",
        "BusStation",
        "bussStation",
        "BussStation",
        "nearbyBus",
        "NearbyBus",
      ]
    );

  const airport =
    getValue(
      property,
      [
        "airport",
        "Airport",
        "nearbyAirport",
        "NearbyAirport",
      ]
    );

  const parking =
    getValue(
      property,
      [
        "parkingRatio",
        "ParkingRatio",
        "parking",
        "Parking",
      ]
    );

  const buildingType =
    getValue(
      property,
      [
        "buildingType",
        "BuildingType",
      ]
    );

  /* =========================================================
     AMENITIES
  ========================================================= */

  const amenities = Array.isArray(
    property?.amenities
  )
    ? property.amenities
    : typeof property?.amenities ===
      "string"
      ? property.amenities
        .split(",")
        .map((item) =>
          item.trim()
        )
        .filter(Boolean)
      : [];

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-lg text-slate-600">
          Loading property...
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-semibold text-slate-900">
            Property not found
          </h1>

          <p className="text-slate-500">
            {error ||
              "Unable to load property details."}
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* ===================================================
            PROPERTY HEADER
        =================================================== */}

        <div className="mb-6">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            {property.city && (
              <>
                <span>
                  {property.city}
                </span>
              </>
            )}

            {property.micromarket && (
              <>
                <span>•</span>

                <span>
                  {property.micromarket}
                </span>
              </>
            )}

            {propertyType && (
              <>
                <span>•</span>

                <span>
                  {propertyType}
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            {property.name}
          </h1>

          {property.address && (
            <div className="mt-2 flex items-start gap-2 text-sm text-slate-500 sm:text-base">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#A054A0]" />

              <p>
                {property.address}
              </p>
            </div>
          )}
        </div>

        {/* ===================================================
            IMAGE GALLERY
        =================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">

          {/* GALLERY HEADER */}

          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-900 sm:text-base">
                Property Media Gallery
              </h2>
            </div>

            <div className="text-xs font-medium text-slate-500 sm:text-sm">
              {availableGallery.length}{" "}
              image
              {availableGallery.length ===
                1
                ? ""
                : "s"}{" "}
              found
            </div>
          </div>

          {/* GALLERY */}

          <div className="p-3 sm:p-5">

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_340px] lg:grid-cols-[minmax(0,1fr)_380px]">

              {/* =========================================
                  MAIN IMAGE
              ========================================= */}

              <div
                className="group relative overflow-hidden rounded-2xl bg-slate-100"
                onMouseEnter={() => {
                  if (
                    autoScrollTimeoutRef.current
                  ) {
                    clearTimeout(
                      autoScrollTimeoutRef.current
                    );
                  }
                }}
                onMouseLeave={() => {
                  if (
                    availableGallery.length >
                    1
                  ) {
                    autoScrollTimeoutRef.current =
                      setTimeout(
                        () => {
                          goToNextImage();
                        },
                        AUTO_SCROLL_INTERVAL
                      );
                  }
                }}
              >
                <div className="relative aspect-[4/3] min-h-[280px] w-full sm:aspect-[16/10] md:aspect-[4/3] lg:aspect-[16/10]">

                  {activeImage ? (
                    <Image
                      key={activeImg}
                      src={activeImage}
                      alt={
                        property.name ||
                        "Property image"
                      }
                      fill
                      priority
                      className="object-cover transition-opacity duration-500"
                      sizes="(max-width: 767px) 100vw, 70vw"
                      onError={() =>
                        handleImageError(
                          activeImg
                        )
                      }
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      Image unavailable
                    </div>
                  )}

                  {/* DARK GRADIENT */}

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/65 to-transparent" />

                  {/* IMAGE NAME */}

                  <div className="absolute bottom-4 left-4 max-w-[70%] text-sm font-semibold text-white drop-shadow-md sm:text-base">
                    {availableGallery.find(
                      (image) =>
                        image.key ===
                        activeImg
                    )?.name ||
                      "Property Photo"}
                  </div>

                  {/* COUNTER */}

                  <div className="absolute right-4 top-4 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                    {activeIndex + 1} /{" "}
                    {availableGallery.length}
                  </div>

                  {/* PREVIOUS */}

                  {availableGallery.length >
                    1 && (
                      <button
                        type="button"
                        onClick={
                          goToPreviousImage
                        }
                        aria-label="Previous image"
                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white opacity-100 shadow-lg backdrop-blur-md transition hover:bg-black/75 md:opacity-0 md:group-hover:opacity-100"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                    )}

                  {/* NEXT */}

                  {availableGallery.length >
                    1 && (
                      <button
                        type="button"
                        onClick={
                          goToNextImage
                        }
                        aria-label="Next image"
                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white opacity-100 shadow-lg backdrop-blur-md transition hover:bg-black/75 md:opacity-0 md:group-hover:opacity-100"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    )}
                </div>
              </div>

              {/* =========================================
                  THUMBNAILS
              ========================================= */}

              <div className="min-w-0">

                {/* DESKTOP THUMBNAILS */}

                <div
                  ref={
                    thumbnailContainerRef
                  }
                  className="hidden h-full max-h-[620px] flex-col gap-3 overflow-y-auto pr-1 md:flex"
                >
                  {availableGallery.map(
                    (image) => {
                      const isActive =
                        activeImg ===
                        image.key;

                      return (
                        <button
                          key={
                            image.key
                          }
                          ref={(element) => {
                            thumbnailRefs.current[
                              image.key
                            ] = element;
                          }}
                          type="button"
                          onClick={() =>
                            selectImage(
                              image.key
                            )
                          }
                          aria-label={`View ${image.name}`}
                          aria-current={
                            isActive
                              ? "true"
                              : undefined
                          }
                          className={`group relative w-full shrink-0 overflow-hidden rounded-xl border-2 text-left transition-all duration-300 ${isActive
                            ? "border-[#A054A0] shadow-md"
                            : "border-transparent bg-slate-50 hover:border-slate-300"
                            }`}
                        >
                          <div className="relative aspect-[16/9] w-full">
                            <Image
                              src={
                                image.url
                              }
                              alt={
                                image.name
                              }
                              fill
                              className="object-cover"
                              sizes="380px"
                              onError={() =>
                                handleImageError(
                                  image.key
                                )
                              }
                            />

                            <div
                              className={`absolute inset-0 transition ${isActive
                                ? "bg-[#A054A0]/10"
                                : "bg-black/0 group-hover:bg-black/10"
                                }`}
                            />
                          </div>

                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8">
                            <p className="truncate text-xs font-medium text-white">
                              {image.name}
                            </p>
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>

                {/* MOBILE THUMBNAILS */}

                <div className="md:hidden">
                  <div
                    ref={
                      thumbnailContainerRef
                    }
                    className="flex gap-2 overflow-x-auto pb-1"
                  >
                    {availableGallery.map(
                      (image) => {
                        const isActive =
                          activeImg ===
                          image.key;

                        return (
                          <button
                            key={
                              image.key
                            }
                            ref={(element) => {
                              thumbnailRefs.current[
                                image.key
                              ] = element;
                            }}
                            type="button"
                            onClick={() =>
                              selectImage(
                                image.key
                              )
                            }
                            aria-label={`View ${image.name}`}
                            aria-current={
                              isActive
                                ? "true"
                                : undefined
                            }
                            className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${isActive
                              ? "border-[#A054A0] shadow-md"
                              : "border-transparent opacity-75"
                              }`}
                          >
                            <Image
                              src={
                                image.url
                              }
                              alt={
                                image.name
                              }
                              fill
                              className="object-cover"
                              sizes="112px"
                              onError={() =>
                                handleImageError(
                                  image.key
                                )
                              }
                            />

                            {isActive && (
                              <div className="absolute inset-0 bg-[#A054A0]/15" />
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* GALLERY HINT */}

            {availableGallery.length >
              1 && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span>
                    Select an image to view
                  </span>

                  <span className="hidden md:inline">
                    Use ← / → to navigate
                  </span>

                  <span>
                    Changes automatically every
                    25 seconds
                  </span>
                </div>
              )}
          </div>
        </section>

        {/* ===================================================
            PROPERTY DETAILS
        =================================================== */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mt-10 sm:rounded-3xl sm:p-7 lg:p-8">

          {/* =========================================
              PROPERTY DETAILS
          ========================================= */}

          <DetailSection title="Property details">

            {isCoworking ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                <DetailField
                  label="Managed By"
                  value={managedBy}
                  icon={Building2}
                />

                <DetailField
                  label="Offered Seats"
                  value={offeredSeats}
                  icon={Users}
                />

                <DetailField
                  label="Tower/Floor offered"
                  value={towerFloor}
                  icon={Layers3}
                />

              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                <DetailField
                  label="Area offered"
                  value={
                    areaOffered !==
                      "-" &&
                      !isNaN(
                        Number(
                          areaOffered
                        )
                      )
                      ? formatArea(
                        Number(
                          areaOffered
                        ),
                        unit
                      )
                      : areaOffered
                  }
                  icon={Building2}
                />

                <DetailField
                  label="Tower/Floor offered"
                  value={towerFloor}
                  icon={Layers3}
                />

                <DetailField
                  label="Availability Timeline"
                  value={availability}
                  icon={CalendarDays}
                />

              </div>
            )}
          </DetailSection>

          {/* =========================================
              PROJECT SPECIFICATIONS
          ========================================= */}

          <div className="mt-7">
            <DetailSection title="Project Specifications">

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                <DetailField
                  label="Building certification"
                  value={
                    buildingCertification
                  }
                  icon={Building2}
                />

                <DetailField
                  label="Number of elevators"
                  value={
                    numberOfElevators
                  }
                  icon={Layers3}
                />

                <DetailField
                  label="Year of Completion"
                  value={
                    yearOfCompletion
                  }
                  icon={CalendarDays}
                />

              </div>
            </DetailSection>
          </div>

          {/* =========================================
              BUILDING AMENITIES
          ========================================= */}

          <div className="mt-7">
            <DetailSection title="Amenities of the building">

              {amenities.length >
                0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {amenities.map(
                    (
                      amenity,
                      index
                    ) => (
                      <span
                        key={`${amenity}-${index}`}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700"
                      >
                        {formatDisplayValue(
                          amenity
                        )}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField
                    label="Building certification"
                    value={
                      buildingCertification
                    }
                  />

                  <DetailField
                    label="Number of elevators"
                    value={
                      numberOfElevators
                    }
                  />

                  <DetailField
                    label="Year of Completion"
                    value={
                      yearOfCompletion
                    }
                  />
                </div>
              )}

            </DetailSection>
          </div>

          {/* =========================================
              CONNECTIVITY
          ========================================= */}

          <div className="mt-7">
            <DetailSection title="Connectivity">

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                <DetailField
                  label="Nearby Metro"
                  value={
                    nearbyMetro
                  }
                  icon={TrainFront}
                />

                <DetailField
                  label="Bus station"
                  value={
                    busStation
                  }
                  icon={BusFront}
                />

                <DetailField
                  label="Airport"
                  value={airport}
                  icon={Plane}
                />

              </div>
            </DetailSection>
          </div>

        </section>

        {/* ===================================================
            QUICK PROPERTY INFO
        =================================================== */}

        <section className="mt-8 sm:mt-10">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">

            <Info
              label="Type"
              value={
                property.officeType ||
                property.type ||
                "-"
              }
            />

            <Info
              label="Parking Ratio"
              value={parking}
            />

            <Info
              label="Building Type"
              value={buildingType}
            />

            <Info
              label="Availability"
              value={
                availability
              }
            />

          </div>
        </section>



        {property.description && (
          <section className="mt-8 sm:mt-10">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 sm:text-2xl">
              About the Property
            </h2>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                {property.description}
              </p>
            </div>
          </section>
        )}

        {/* ===================================================
            PROJECT HIGHLIGHTS
        =================================================== */}

        {property.projectHighlights && (
          <section className="mt-8 sm:mt-10">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 sm:text-2xl">
              Project Highlights
            </h2>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                {
                  property.projectHighlights
                }
              </p>
            </div>
          </section>
        )}

        {/* ===================================================
            AMENITIES
        =================================================== */}

        {amenities.length > 0 && (
          <section className="mt-8 sm:mt-10">
            <h2 className="mb-4 text-xl font-semibold text-slate-900 sm:text-2xl">
              Amenities
            </h2>

            <div className="flex flex-wrap gap-2.5">
              {amenities.map(
                (
                  amenity,
                  index
                ) => (
                  <span
                    key={`${amenity}-${index}`}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm"
                  >
                    {formatDisplayValue(
                      amenity
                    )}
                  </span>
                )
              )}
            </div>
          </section>
        )}

        {/* ===================================================
            CONTACT
        =================================================== */}

        {property.contact?.name && (
          <section className="mt-8 rounded-2xl bg-slate-900 p-5 text-white sm:mt-10 sm:p-7">
            <h2 className="mb-4 text-xl font-semibold">
              Contact
            </h2>

            <p className="font-medium">
              {property.contact.name}
            </p>

            {property.contact.phone && (
              <p className="mt-1 text-sm text-slate-300">
                {
                  property.contact.phone
                }
              </p>
            )}
          </section>
        )}

        {/* ===================================================
            SIMILAR PROPERTIES
        =================================================== */}

        {related.length > 0 && (
          <section className="mt-12 sm:mt-14">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                  Similar Properties
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Explore other properties in
                  this location.
                </p>
              </div>

              <ArrowUpRight className="hidden h-5 w-5 text-slate-400 sm:block" />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map(
                (item) => (
                  <PropertyCard
                    key={
                      item.id ||
                      item.rowId ||
                      item.ROWID
                    }
                    property={
                      item
                    }
                  />
                )
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}