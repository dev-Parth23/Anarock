"use client";

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Trash2,
  Heart,
  Plus,
  X,
  Building2,
  Search,
  Filter,
  Check,
  ImageIcon,
} from "lucide-react";
import { formatArea } from "@/lib/format";
import { usePreferences } from "@/lib/preferences";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useWishlist } from "@/lib/wishlist";

const COMPARE_STORAGE_KEY = "anarock_compare_properties";
const MAX_COMPARE_PROPERTIES = 3;

const createSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[\\/\\]+/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function ComparePage() {
  const { unit } = usePreferences();
  const { ids: wishlistIds, toggle: toggleWishlist } = useWishlist();

  const [isMounted, setIsMounted] = useState(false);
  const [properties, setProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCityFilter, setSelectedCityFilter] = useState("all");
  const [selectedMicromarkets, setSelectedMicromarkets] = useState([]);

  // Ensure client-side localStorage execution matches server rendering initially to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
      let parsed = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        setProperties(parsed.slice(-MAX_COMPARE_PROPERTIES));
      }
    } catch {
      setProperties([]);
    }
  }, []);

  // Dynamic SEO, GEO, and Schema Injection for Single-File Architecture
  useEffect(() => {
    document.title = "Commercial Property Comparison & Office Space Analytics | Compare Workspaces";

    const setMetaTag = (name, content, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    setMetaTag("description", "Compare commercial real estate, managed offices, and coworking spaces side-by-side. Analyze pricing, seating capacity, micro-markets, and square footage.");
    setMetaTag("keywords", "commercial property comparison, office space comparison, coworking space analytics, managed offices comparison, corporate real estate comparison");

    // GEO Targeting Tags
    setMetaTag("geo.region", "IN-DL");
    setMetaTag("geo.placename", "New Delhi, Mumbai, Bengaluru, India");
    setMetaTag("geo.position", "28.6139;77.2090");
    setMetaTag("ICBM", "28.6139, 77.2090");

    // Open Graph / Social Tags
    setMetaTag("og:title", "Commercial Property Comparison & Office Space Analytics", true);
    setMetaTag("og:description", "Evaluate and compare commercial properties and managed workspaces side-by-side with advanced portfolio analysis.", true);
    setMetaTag("og:type", "website", true);
    setMetaTag("og:url", window.location.href, true);
    setMetaTag("og:site_name", "Anarock Commercial Real Estate", true);

    // Structured Data (JSON-LD) for Search Engine Rich Results
    const scriptId = "json-ld-compare-seo";
    let scriptElement = document.getElementById(scriptId);
    if (!scriptElement) {
      scriptElement = document.createElement("script");
      scriptElement.id = scriptId;
      scriptElement.type = "application/ld+json";
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Commercial Property Comparison Dashboard",
      "description": "Compare commercial real estate, managed offices, and coworking spaces side-by-side.",
      "url": window.location.href,
      "publisher": {
        "@type": "Organization",
        "name": "Anarock",
      }
    });
  }, []);

  const getId = (property) =>
    String(
      property?.id || property?.rowId || property?.ROWID || property?.ID || "",
    );

  const isShortlisted = (property) => {
    const propertyId = getId(property);
    if (!propertyId) return false;
    return wishlistIds.some((id) => String(id) === propertyId);
  };

  const toggleShortlist = (property) => {
    const propertyId = getId(property);
    if (!propertyId) return;
    toggleWishlist(propertyId);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadCompareProperties() {
      try {
        const response = await fetch("/api/properties", { cache: "no-store" });
        const data = await response.json();

        if (response.ok && data?.success && Array.isArray(data.data)) {
          if (!cancelled) setAllProperties(data.data);

          const propertyMap = new Map();
          data.data.forEach((property) => {
            const id = getId(property);
            if (id) propertyMap.set(id, property);
          });

          setProperties((currentStored) => {
            const hydratedProperties = currentStored
              .map((storedProperty) => {
                const id = getId(storedProperty);
                return propertyMap.get(id) || storedProperty;
              })
              .filter(Boolean);

            if (!cancelled && hydratedProperties.length > 0) {
              localStorage.setItem(
                COMPARE_STORAGE_KEY,
                JSON.stringify(hydratedProperties),
              );
            }
            return hydratedProperties;
          });
        }
      } catch (error) {
        console.error("Unable to load comparison properties:", error);
      }
    }

    loadCompareProperties();

    return () => {
      cancelled = true;
    };
  }, []);

  const getName = (property) =>
    property?.name ||
    property?.Property_Name ||
    property?.propertyName ||
    property?.Name ||
    "Property";

  const getPropertySlug = (property) => {
    const existingSlug =
      property?.slug ||
      property?.Slug ||
      property?.propertySlug ||
      property?.Property_Slug;

    return existingSlug ? String(existingSlug) : createSlug(getName(property));
  };

  const getPropertyUrl = (property) => {
    const id = getId(property);
    const slug = getPropertySlug(property);
    if (!id) return "/properties";
    return `/properties/${encodeURIComponent(id)}/${encodeURIComponent(slug)}`;
  };

  const getImage = (property) => {
    const folder = String(
      property?.imageFolderPath ||
      property?.ImageFolderPath ||
      property?.image_folder_path ||
      property?.Image_Folder_Path ||
      property?.folder ||
      property?.Folder ||
      "",
    )
      .trim()
      .replace(/^\/+|\/+$/g, "");

    if (!folder) return "";
    return `https://property-images.zohostratus.in/${folder}/Project_Picture_1.jpg`;
  };

  const removeProperty = (id) => {
    const updatedProperties = properties.filter(
      (property) => getId(property) !== String(id),
    );

    setProperties(updatedProperties);

    if (!updatedProperties.length) {
      localStorage.removeItem(COMPARE_STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      COMPARE_STORAGE_KEY,
      JSON.stringify(updatedProperties),
    );
  };

  const addPropertyToCompare = (property) => {
    if (properties.length >= MAX_COMPARE_PROPERTIES) return;
    const propertyId = getId(property);

    if (properties.some((p) => getId(p) === propertyId)) return;

    const updated = [...properties, property];
    setProperties(updated);
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(updated));
    setIsModalOpen(false);
  };

  const rows = [
    {
      label: "City",
      value: (property) => property?.city || "-",
    },
    {
      label: "Micromarket",
      value: (property) => property?.micromarket || "-",
    },
    {
      label: "Area",
      value: (property) => {
        const area = property?.totalLeasableAreaAvailable ?? null;
        if (area === null || area === "") return "-";
        const numericArea = Number(area);
        return Number.isFinite(numericArea)
          ? formatArea(numericArea, unit)
          : "-";
      },
    },
    {
      label: "Seats",
      value: (property) => property?.NoOfSeatsOffered ?? "-",
    },
    {
      label: "Type",
      value: (property) => property?.officeType || "-",
    },
  ];

  const slots = [0, 1, 2].map((i) => properties[i] || null);
  const firstValidSlotIndex = slots.findIndex((p) => p !== null);

  const availableCities = useMemo(() => {
    const cities = allProperties
      .map((p) => String(p?.city || p?.City || "").trim())
      .filter(Boolean);
    return Array.from(new Set(cities)).sort();
  }, [allProperties]);

  const handleOpenModal = () => {
    setSearchQuery("");
    setSelectedMicromarkets([]);

    if (properties.length > 0) {
      const firstCity = String(
        properties[0]?.city || properties[0]?.City || "",
      ).trim();
      if (firstCity) {
        setSelectedCityFilter(firstCity);
      } else {
        setSelectedCityFilter("all");
      }
    } else {
      setSelectedCityFilter("all");
    }

    setIsModalOpen(true);
  };

  const availableMicromarkets = useMemo(() => {
    const filteredByCity =
      selectedCityFilter === "all"
        ? allProperties
        : allProperties.filter(
          (p) =>
            String(p?.city || p?.City || "")
              .trim()
              .toLowerCase() === selectedCityFilter.toLowerCase(),
        );
    const micromarkets = filteredByCity
      .map((p) =>
        String(p?.micromarket || p?.Micromarket || p?.microMarket || "").trim(),
      )
      .filter(Boolean);
    return Array.from(new Set(micromarkets)).sort();
  }, [allProperties, selectedCityFilter]);

  const toggleMicromarketFilter = (mm) => {
    setSelectedMicromarkets((prev) =>
      prev.includes(mm) ? prev.filter((item) => item !== mm) : [...prev, mm],
    );
  };

  const filteredModalProperties = useMemo(() => {
    return allProperties
      .filter(
        (p) => !properties.some((selected) => getId(selected) === getId(p)),
      )
      .filter((p) => {
        const nameMatch = getName(p)
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim());
        const city = String(p?.city || p?.City || "").trim();
        const cityMatch =
          selectedCityFilter === "all" ||
          city.toLowerCase() === selectedCityFilter.toLowerCase();

        const micromarket = String(
          p?.micromarket || p?.Micromarket || p?.microMarket || "",
        ).trim();
        const micromarketMatch =
          selectedMicromarkets.length === 0 ||
          selectedMicromarkets.includes(micromarket);

        return nameMatch && cityMatch && micromarketMatch;
      });
  }, [
    allProperties,
    properties,
    searchQuery,
    selectedCityFilter,
    selectedMicromarkets,
  ]);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Properties", href: "/properties" },
          { label: "Compare Properties" },
        ]}
      />

      <main className="min-h-screen bg-[#FDFCFD] px-4 py-6 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1536px]">
          {/* Header Section */}
          <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A054A0]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A054A0]">
                  Portfolio Analysis
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-light tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                Property Comparison
              </h1>
            </div>

            <Link
              href="/properties"
              className="group inline-flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-800 backdrop-blur transition hover:border-[#A054A0] hover:text-[#A054A0] hover:shadow-md"
            >
              Browse Properties
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </section>

          {!isMounted ? (
            <div className="py-24 text-center text-xs text-slate-400">
              Loading comparison dashboard...
            </div>
          ) : properties.length === 0 ? (
            <section className="mt-10 rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm sm:p-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A054A0]/10 text-[#A054A0]">
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-medium tracking-tight text-slate-900">
                No Properties Selected
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
                Select commercial real estate, managed offices, or coworking spaces to evaluate specs, pricing, and locations side by side.
              </p>
              <Link
                href="/properties"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#A054A0] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#864286]"
              >
                Browse Properties
              </Link>
            </section>
          ) : (
            <div className="space-y-6 overflow-x-auto">
              <div className="min-w-[1000px] lg:min-w-full">
                {/* Cards Section Grid */}
                <div className="grid grid-cols-[220px_repeat(3,1fr)] gap-5 pb-6">
                  <div className="flex flex-col justify-end pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Properties Overview
                    </span>
                  </div>

                  {slots.map((property, index) => {
                    if (property) {
                      const propertyId = getId(property);
                      const propertyName = getName(property);
                      const imageUrl = getImage(property);
                      const propertyUrl = getPropertyUrl(property);
                      const isFirstImage = index === firstValidSlotIndex;

                      return (
                        <article
                          key={`card-slot-${index}`}
                          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:border-[#A054A0]/30 hover:shadow-xl"
                        >
                          <div>
                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                              <Link
                                href={propertyUrl}
                                className="block relative h-full w-full"
                              >
                                {imageUrl ? (
                                  <Image
                                    src={imageUrl}
                                    alt={`${propertyName} office space`}
                                    fill
                                    priority={isFirstImage}
                                    sizes="(max-width: 1024px) 33vw, 25vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                    Image Unavailable
                                  </div>
                                )}
                              </Link>

                              <div className="absolute left-3 top-3 z-10">
                                <span className="rounded-full bg-slate-950/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                                  {property?.city ||
                                    property?.City ||
                                    "Prime Asset"}
                                </span>
                              </div>

                              <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => toggleShortlist(property)}
                                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:bg-white ${isShortlisted(property)
                                    ? "text-[#A054A0]"
                                    : "text-slate-600 hover:text-[#A054A0]"
                                    }`}
                                  title={
                                    isShortlisted(property)
                                      ? "Remove from Shortlist"
                                      : "Add to Shortlist"
                                  }
                                >
                                  <Heart
                                    className="h-3.5 w-3.5"
                                    fill={
                                      isShortlisted(property)
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => removeProperty(propertyId)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-red-600"
                                  title="Remove Property"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="p-4">
                              <Link href={propertyUrl}>
                                <h3 className="truncate text-sm font-semibold text-slate-900 transition group-hover:text-[#A054A0]">
                                  {propertyName}
                                </h3>
                              </Link>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                <span className="truncate">
                                  {property?.micromarket ||
                                    property?.city ||
                                    "-"}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="p-4 pt-0">
                            <Link
                              href={propertyUrl}
                              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 py-2 text-xs font-semibold text-slate-800 transition hover:border-[#A054A0] hover:bg-[#A054A0] hover:text-white"
                            >
                              View Full Details
                            </Link>
                          </div>
                        </article>
                      );
                    }

                    return (
                      <div
                        key={`empty-slot-${index}`}
                        onClick={handleOpenModal}
                        className="group border-dashed flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-slate-200/80 bg-slate-50/40 p-6 text-center transition hover:border-[#A054A0] hover:bg-[#A054A0]/[0.02]"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400 transition group-hover:scale-110 group-hover:border-[#A054A0]/30 group-hover:text-[#A054A0]">
                          <Plus className="h-5 w-5" />
                        </div>
                        <span className="mt-4 text-xs font-semibold text-slate-700 group-hover:text-[#A054A0]">
                          Add Property
                        </span>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Select from Properties
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Specification Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  <div className="grid grid-cols-[220px_repeat(3,1fr)] border-b border-slate-200/80 bg-slate-50/60 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <div className="px-6 py-4">Specification</div>
                    {slots.map((property, i) => (
                      <div
                        key={`table-header-${i}`}
                        className="border-l border-slate-100 px-6 py-4 font-semibold text-slate-800 truncate"
                      >
                        {property ? (
                          getName(property)
                        ) : (
                          <span className="text-slate-300 italic font-normal">
                            -- Empty Slot --
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {rows.map((row, idx) => (
                    <div
                      key={row.label}
                      className={`grid grid-cols-[220px_repeat(3,1fr)] border-b border-slate-100 text-xs text-slate-800 transition last:border-b-0 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                        }`}
                    >
                      <div className="flex items-center px-6 py-4 font-semibold text-slate-500">
                        {row.label}
                      </div>
                      {slots.map((property, i) => (
                        <div
                          key={`row-${row.label}-${i}`}
                          className="flex items-center border-l border-slate-100 px-6 py-4 font-medium text-slate-800 truncate"
                        >
                          {property ? (
                            row.value(property)
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Property Selector Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Select Property to Compare
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose an additional property to analyze side-by-side
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Bar & City Filter */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by property name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#A054A0] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="relative w-full sm:w-48">
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <select
                  value={selectedCityFilter}
                  onChange={(e) => {
                    setSelectedCityFilter(e.target.value);
                    setSelectedMicromarkets([]);
                  }}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-3 pr-8 text-xs font-medium text-slate-700 focus:border-[#A054A0] focus:bg-white focus:outline-none"
                >
                  <option value="all">All Cities</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Micromarkets Multi-Select */}
            {availableMicromarkets.length > 0 && (
              <div className="mt-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Filter by Micromarkets ({selectedMicromarkets.length}{" "}
                  selected)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {availableMicromarkets.map((mm) => {
                    const isSelected = selectedMicromarkets.includes(mm);
                    return (
                      <button
                        key={mm}
                        type="button"
                        onClick={() => toggleMicromarketFilter(mm)}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${isSelected
                          ? "bg-[#A054A0] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {mm}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Property Item Cards inside Modal */}
            <div className="mt-4 max-h-[300px] space-y-2.5 overflow-y-auto pr-1">
              {filteredModalProperties.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No properties found matching your criteria.
                </div>
              ) : (
                filteredModalProperties.map((property) => {
                  const modalImg = getImage(property);
                  const modalName = getName(property);
                  const modalCity = property?.city || property?.City || "-";
                  const modalMicromarket =
                    property?.micromarket ||
                    property?.Micromarket ||
                    property?.microMarket ||
                    "-";
                  const modalType =
                    property?.buildingType ||
                    property?.officeType ||
                    property?.propertyType ||
                    "Managed Office/Co-working";

                  return (
                    <div
                      key={`modal-item-${getId(property)}`}
                      onClick={() => addPropertyToCompare(property)}
                      className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3 transition-all hover:border-[#A054A0] hover:shadow-md"
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Image Thumbnail Container */}
                        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          {modalImg ? (
                            <img
                              src={modalImg}
                              alt={modalName}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.style.display =
                                    "flex";
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className={`h-full w-full items-center justify-center bg-slate-100 text-slate-400 ${modalImg ? "hidden" : "flex"
                              }`}
                          >
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        </div>

                        {/* Title, Location & Type Badge */}
                        <div>
                          <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#A054A0] truncate max-w-[240px]">
                            {modalName}
                          </h4>
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">
                              {modalMicromarket}, {modalCity}
                            </span>
                          </p>
                          <span className="mt-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            {modalType}
                          </span>
                        </div>
                      </div>

                      {/* Add Button */}
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#A054A0]/10 text-[#A054A0] transition group-hover:bg-[#A054A0] group-hover:text-white">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}