"use client";

import { useState, useEffect, useRef } from "react";
import { usePreferences } from "@/lib/preferences";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  ChevronDown,
  MapPin,
  Loader2,
  Building2,
  IndianRupee,
  Maximize2,
  SlidersHorizontal,
  Check,
  Users,
  DollarSign,
  Euro,
} from "lucide-react";

const OFFICE_TYPES = [
  "Conventional",
  "Managed Office/Co-working",
  "Consulting",
  "Others",
];

const SAMPLE_PROMPTS = [
  "5,000 sq ft managed office in Whitefield with 80+ desks & boardrooms",
  "A-grade bare shell commercial space in BKC with panoramic views",
  "Plug-and-play HQ in Cyber City Gurgaon under ₹15 Lakhs/month",
];

const CONTROL_H = "h-[50px] sm:h-[52px] lg:h-[54px]";

const inputBase = `w-full ${CONTROL_H} rounded-[14px] bg-[#FAF8FA] border border-[#E8E0E8] text-[#211A21] text-[13px] sm:text-sm font-medium outline-none transition-all duration-200 hover:border-[#D4C4D5] hover:bg-white focus:border-[#A054A0] focus:bg-white focus:ring-[3px] focus:ring-[#A054A0]/10`;

export default function HeroSection({ consentGranted, locationData }) {
  const router = useRouter();

  const [tab, setTab] = useState("filters");

  const [city, setCity] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const [officeType, setOfficeType] = useState("");

  const [micromarkets, setMicromarkets] = useState([]);
  const [selectedMicromarket, setSelectedMicromarket] = useState("");
  const [loadingMicromarkets, setLoadingMicromarkets] = useState(false);
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const { currency, unit: areaUnit } = usePreferences();
  const [area, setArea] = useState("");
  const [seats, setSeats] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const locationAutoSelectedRef = useRef(false);
  const formatNumberWithCommas = (value) => {
    const rawValue = String(value || "").replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("en-IN").format(rawValue);
  };
  const handleMinBudgetChange = (e) => {
    setMinBudget(formatNumberWithCommas(e.target.value));
  };
  const handleMaxBudgetChange = (e) => {
    setMaxBudget(formatNumberWithCommas(e.target.value));
  };
  const handleAreaChange = (e) => {
    setArea(formatNumberWithCommas(e.target.value));
  };
  const handleSeatsChange = (e) => {
    setSeats(formatNumberWithCommas(e.target.value));
  };
  const normalizedOfficeType = officeType.trim().toLowerCase();
  const isConventional = normalizedOfficeType === "conventional";
  const isCoworking = normalizedOfficeType === "managed office/co-working";
  const isRentBased = !isCoworking;
  const handleOfficeTypeChange = (e) => {
    const newType = e.target.value;
    setOfficeType(newType);
    setMinBudget("");
    setMaxBudget("");
    setArea("");
    setSeats("");
  };
  useEffect(() => {
    const controller = new AbortController();
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const response = await fetch("/api/cities", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          let errorMessage = `Cities API failed with status ${response.status}`;
          try {
            const errorData = await response.json();
            if (errorData?.message) {
              errorMessage = errorData.message;
            }
          } catch {
            // Ignore JSON parsing errors
          }
          throw new Error(errorMessage);
        }
        const data = await response.json();
        if (controller.signal.aborted) {
          return;
        }
        if (data?.success && Array.isArray(data?.cities)) {
          const cities = [
            ...new Set(
              data.cities
                .map((city) => String(city || "").trim())
                .filter(Boolean),
            ),
          ].sort((a, b) => a.localeCompare(b));
          setCityOptions(cities);
        } else {
          console.error("Invalid cities API response:", data);
          setCityOptions([]);
        }
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch cities:", error);
        if (!controller.signal.aborted) {
          setCityOptions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingCities(false);
        }
      }
    };
    fetchCities();
    return () => {
      controller.abort();
    };
  }, []);
  useEffect(() => {
    if (locationAutoSelectedRef.current) {
      return;
    }
    if (!locationData?.city) {
      return;
    }
    if (!cityOptions.length) {
      return;
    }
    const normalizeCity = (value) =>
      String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const detectedCity = normalizeCity(locationData.city);
    const matchedCity = cityOptions.find(
      (option) => normalizeCity(option) === detectedCity,
    );
    if (matchedCity) {
      setCity(matchedCity);
      locationAutoSelectedRef.current = true;
    }
  }, [locationData?.city, cityOptions]);

  useEffect(() => {
    if (!city) {
      setMicromarkets([]);
      setSelectedMicromarket("");
      return;
    }
    setLoadingMicromarkets(true);
    fetch(`/api/micromarkets?city=${encodeURIComponent(city)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.micromarkets) {
          setMicromarkets(data.micromarkets);
        } else {
          setMicromarkets([]);
        }
      })
      .catch(() => {
        setMicromarkets([]);
      })
      .finally(() => {
        setLoadingMicromarkets(false);
      });
  }, [city]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCityOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);


  const handleSearch = (e) => {
    e.preventDefault();

    setLoading(true);

    if (typeof window !== "undefined") {
      if (tab === "filters" && city) {
        const searchLocationObj = {
          city: city.trim(),
          micromarket: selectedMicromarket || "",
          propertyType: officeType || "",
          searchedAt: Date.now(),
        };

        localStorage.setItem(
          "anarock_last_searched_location",
          JSON.stringify(searchLocationObj)
        );
      } else {
        localStorage.removeItem("anarock_last_searched_location");
      }
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

    const cleanNumber = (value) => {
      return String(value || "")
        .replace(/,/g, "")
        .trim();
    };

    const params = new URLSearchParams();

    if (tab === "filters") {
      if (city?.trim()) {
        params.set("city", toUrlValue(city));
      }
      if (selectedMicromarket?.trim()) {
        params.set(
          "micromarket",
          toUrlValue(selectedMicromarket)
        );
      }
      if (officeType?.trim()) {
        params.set(
          "type",
          toUrlValue(officeType)
        );
      }

      const cleanedMinBudget = cleanNumber(minBudget);
      const cleanedMaxBudget = cleanNumber(maxBudget);
      if (cleanedMinBudget) {
        params.set("minBudget", cleanedMinBudget);
      }
      if (cleanedMaxBudget) {
        params.set("maxBudget", cleanedMaxBudget);
      }

      if (isCoworking) {
        const cleanedSeats = cleanNumber(seats);
        if (cleanedSeats) {
          params.set("seats", cleanedSeats);
        }
        params.delete("area");
      } else {
        const cleanedArea = cleanNumber(area);

        if (cleanedArea) {
          params.set("area", cleanedArea);
        }
        params.delete("seats");
      }

      if (currency) {
        params.set(
          "currency",
          String(currency).trim().toUpperCase()
        );
      }

      if (areaUnit) {
        params.set(
          "areaUnit",
          toUrlValue(areaUnit)
        );
      }
    } else {
      params.set("type", "ai");
      if (prompt.trim()) {
        params.set(
          "prompt",
          prompt.trim()
        );
      }
    }

    const queryString = params.toString();
    const searchUrl = queryString
      ? `/properties?${queryString}`
      : "/properties";
    router.push(searchUrl);
  };

  const filteredCities = cityOptions.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase()),
  );

  const renderCurrencyIcon = () => {
    switch (currency.toUpperCase()) {
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

  return (
    <main className="relative w-full overflow-hidden bg-[#160B17]">
      <section className="relative flex min-h-[100svh] w-full items-start justify-center overflow-visible pb-10 pt-[76px] sm:pb-14 sm:pt-[88px] lg:min-h-[760px] lg:pt-[108px]">
        <div className="absolute inset-0 z-0">
          <img
            src="/main.jpg"
            alt="Luxury Commercial Architecture"
            className="absolute inset-0 h-full w-full object-cover object-center lg:object-top"
          />
          <div className="absolute inset-0 bg-[#4E2352]/35 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(160,84,160,.30),transparent_38%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#100912]/55 via-[#170D19]/25 to-[#160B17]" />
          <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#160B17] via-[#160B17]/80 to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-[10%] h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-[#A054A0]/20 blur-[100px] sm:h-[420px] sm:w-[420px] lg:h-[620px] lg:w-[620px]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto mb-8 max-w-[980px] text-center sm:mb-10 lg:mb-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,.12)] backdrop-blur-xl sm:mb-6 sm:px-4 sm:py-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A054A0] shadow-[0_0_24px_rgba(160,84,160,.45)]">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </span>

              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/90 sm:text-[10px] sm:tracking-[0.22em]">
                Describe · Discover · Decide
              </span>
            </div>

            <h1 className="mx-auto max-w-[920px] text-[clamp(2.35rem,7vw,5.35rem)] font-bold leading-[0.98] tracking-[-0.045em] text-white drop-shadow-[0_4px_28px_rgba(0,0,0,.2)]">
              Describe the Need.
              <span className="mt-1 block text-nowrap bg-clip-text sm:mt-2">
                Discover the Space.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-[760px] text-[14px] leading-6 tracking-wide text-white/70 sm:mt-6 sm:text-base sm:leading-7 lg:text-lg">
              An AI-enabled, data-driven approach to discovering commercial
              workspaces aligned with your business requirements.
            </p>
          </div>

          <div className="relative z-30 mx-auto w-full max-w-[1240px]">
            <div className="overflow-visible rounded-[24px] border border-white/80 bg-white shadow-[0_28px_90px_rgba(20,5,25,.34)] sm:rounded-[28px] lg:rounded-[32px]">

              <div className="flex items-center px-4 pt-4 sm:px-6 sm:pt-5 lg:px-7 lg:pt-6">
                <div className="grid w-full max-w-[430px] grid-cols-2 rounded-2xl border border-[#ECE7EC] bg-[#F7F5F7] p-1 shadow-[inset_0_1px_2px_rgba(30,15,30,.04)] sm:inline-flex sm:w-auto sm:max-w-none sm:grid-cols-none sm:rounded-full">
                  <button
                    type="button"
                    onClick={() => setTab("filters")}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-[11px] font-bold transition-all duration-200 sm:h-12 sm:min-w-[160px] sm:rounded-full sm:px-6 sm:text-xs ${tab === "filters"
                      ? "border border-[#E7E1E7] bg-white text-[#211A21] shadow-[0_4px_14px_rgba(30,15,30,.09)]"
                      : "text-[#817981] hover:bg-white/70 hover:text-[#3C353C]"
                      }`}
                  >
                    <SlidersHorizontal
                      className={`h-4 w-4 ${tab === "filters" ? "text-[#A054A0]" : "text-[#9A939A]"
                        }`}
                    />
                    Smart Filters
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab("ai")}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-[11px] font-bold transition-all duration-200 sm:h-12 sm:min-w-[160px] sm:rounded-full sm:px-6 sm:text-xs ${tab === "ai"
                      ? "border border-[#E7E1E7] bg-white text-[#211A21] shadow-[0_4px_14px_rgba(30,15,30,.09)]"
                      : "text-[#817981] hover:bg-white/70 hover:text-[#3C353C]"
                      }`}
                  >
                    <Sparkles
                      className={`h-4 w-4 ${tab === "ai" ? "text-[#A054A0]" : "text-[#9A939A]"
                        }`}
                    />
                    AI Search
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-7 xl:p-8">
                <div className="mb-5 flex flex-col gap-1.5 sm:mb-6">
                  <h2 className="text-lg font-bold tracking-[-0.025em] text-[#191519] sm:text-xl lg:text-2xl">
                    Find your perfect place
                  </h2>

                  <p className="text-xs leading-5 text-[#8B838B] sm:text-sm">
                    Refine the essentials or describe your workspace in natural
                    language.
                  </p>
                </div>

                <form onSubmit={handleSearch}>
                  {tab === "filters" ? (
                    <div className="space-y-4">

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <div className="relative" ref={dropdownRef}>
                          <label className="mb-2 ml-1 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/50 sm:text-[10px]">
                            City
                          </label>

                          <button
                            type="button"
                            onClick={() => setCityOpen(!cityOpen)}
                            className={`${inputBase} flex items-center justify-between px-3.5 text-left ${cityOpen
                              ? "border-[#A054A0] bg-white ring-[3px] ring-[#A054A0]/10"
                              : ""
                              }`}
                          >
                            <span className="flex min-w-0 items-center gap-2.5">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[#E9E1E9] bg-white shadow-sm">
                                <MapPin className="h-4 w-4 text-[#A054A0]" />
                              </span>

                              <span
                                className={`truncate ${city
                                  ? "font-semibold text-[#211A21]"
                                  : "text-black/35"
                                  }`}
                              >
                                {loadingCities
                                  ? "Loading cities..."
                                  : city || "Select City"}
                              </span>
                            </span>

                            <ChevronDown
                              className={`h-4 w-4 shrink-0 text-black/35 transition-transform ${cityOpen ? "rotate-180 text-[#A054A0]" : ""
                                }`}
                            />
                          </button>

                          {cityOpen && (
                            <div className="absolute left-0 right-0 z-[100] mt-2 overflow-hidden rounded-2xl border border-[#E6DDE6] bg-white shadow-[0_24px_60px_rgba(35,10,38,.18)]">
                              <div className="border-b border-[#EEE7EE] bg-[#FBF9FB] p-3">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />

                                  <input
                                    value={citySearch}
                                    onChange={(e) =>
                                      setCitySearch(e.target.value)
                                    }
                                    placeholder="Search city..."
                                    autoFocus
                                    className="h-10 w-full rounded-xl border border-[#E7DFE7] bg-white pl-9 pr-3 text-sm text-[#211A21] outline-none transition focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10"
                                  />
                                </div>
                              </div>

                              <div className="max-h-60 overflow-y-auto p-1.5">
                                {filteredCities.map((c) => (
                                  <button
                                    type="button"
                                    key={c}
                                    onClick={() => {
                                      setCity(c);
                                      setCityOpen(false);
                                      setCitySearch("");
                                    }}
                                    className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm text-[#393039] transition-colors hover:bg-[#A054A0]/[.06] hover:text-[#A054A0]"
                                  >
                                    <span>{c}</span>

                                    {city === c && (
                                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A054A0]/10">
                                        <Check className="h-3.5 w-3.5 text-[#A054A0]" />
                                      </span>
                                    )}
                                  </button>
                                ))}

                                {!filteredCities.length && (
                                  <div className="px-4 py-8 text-center text-xs text-black/35">
                                    No cities found
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 ml-1 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/50 sm:text-[10px]">
                            Micromarket
                          </label>

                          <div className="relative">
                            <select
                              value={selectedMicromarket}
                              disabled={!city || loadingMicromarkets}
                              onChange={(e) =>
                                setSelectedMicromarket(e.target.value)
                              }
                              className={`${inputBase} cursor-pointer appearance-none px-4 pr-10 disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              <option value="">
                                {loadingMicromarkets
                                  ? "Loading..."
                                  : city
                                    ? "All Micromarkets"
                                    : "Select City First"}
                              </option>

                              {micromarkets.map((m) => (
                                <option key={m.id || m.name} value={m.name}>
                                  {m.name}
                                </option>
                              ))}
                            </select>

                            {loadingMicromarkets ? (
                              <Loader2 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#A054A0]" />
                            ) : (
                              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                            )}
                          </div>
                        </div>
                      </div>


                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <div>
                          <label className="mb-2 ml-1 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/50 sm:text-[10px]">
                            Property Type
                          </label>

                          <div className="relative">
                            <select
                              value={officeType}
                              onChange={handleOfficeTypeChange}
                              className={`${inputBase} cursor-pointer appearance-none px-4 pr-10`}
                            >
                              <option value="">All Office Types</option>

                              {OFFICE_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>

                            <Building2 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                          </div>
                        </div>

                        <div>
                          {isCoworking ? (
                            <>
                              <label className="mb-2 ml-1 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/50 sm:text-[10px]">
                                Required Seats
                              </label>

                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg border border-[#E9E1E9] bg-white">
                                  <Users className="h-4 w-4 text-[#A054A0]" />
                                </span>

                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={seats}
                                  onChange={handleSeatsChange}
                                  placeholder="e.g. 50"
                                  className={`${inputBase} pl-14 pr-4 placeholder:text-black/25`}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <label className="mb-2 ml-1 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/50 sm:text-[10px]">
                                Min Area ({areaUnit})
                              </label>

                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg border border-[#E9E1E9] bg-white">
                                  <Maximize2 className="h-4 w-4 text-[#A054A0]" />
                                </span>

                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={area}
                                  onChange={handleAreaChange}
                                  placeholder="e.g. 2,500"
                                  className={`${inputBase} pl-14 pr-4 placeholder:text-black/25`}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {isRentBased && (
                        <div>
                          <label className="mb-2 ml-1 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/50 sm:text-[10px]">
                            Rent/month
                          </label>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">

                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg border border-[#E9E1E9] bg-white">
                                {renderCurrencyIcon()}
                              </span>

                              <input
                                type="text"
                                inputMode="numeric"
                                value={minBudget}
                                onChange={handleMinBudgetChange}
                                placeholder="Min Rent/month"
                                className={`${inputBase} pl-14 pr-4 placeholder:text-black/25`}
                              />
                            </div>

                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg border border-[#E9E1E9] bg-white">
                                {renderCurrencyIcon()}
                              </span>

                              <input
                                type="text"
                                inputMode="numeric"
                                value={maxBudget}
                                onChange={handleMaxBudgetChange}
                                placeholder="Max Rent/month"
                                className={`${inputBase} pl-14 pr-4 placeholder:text-black/25`}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {isCoworking && (
                        <div>
                          <label className="mb-2 ml-1 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/50 sm:text-[10px]">
                            Seat Price/month
                          </label>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg border border-[#E9E1E9] bg-white">
                                {renderCurrencyIcon()}
                              </span>

                              <input
                                type="text"
                                inputMode="numeric"
                                value={minBudget}
                                onChange={handleMinBudgetChange}
                                placeholder="Min Seat Price/month"
                                className={`${inputBase} pl-14 pr-4 placeholder:text-black/25`}
                              />
                            </div>

                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg border border-[#E9E1E9] bg-white">
                                {renderCurrencyIcon()}
                              </span>

                              <input
                                type="text"
                                inputMode="numeric"
                                value={maxBudget}
                                onChange={handleMaxBudgetChange}
                                placeholder="Max Seat Price/month"
                                className={`${inputBase} pl-14 pr-4 placeholder:text-black/25`}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="pointer-events-none absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-[#A054A0]/10 bg-[#A054A0]/10">
                          <Sparkles className="h-4 w-4 text-[#A054A0]" />
                        </div>

                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Tell us what kind of workspace you're looking for..."
                          rows={4}
                          className="min-h-[150px] w-full resize-none rounded-2xl border border-[#E8E0E8] bg-[#FAF8FA] p-4 pl-16 text-sm font-medium leading-6 text-[#211A21] outline-none transition-all duration-200 placeholder:text-black/30 hover:border-[#D4C4D5] hover:bg-white focus:border-[#A054A0] focus:bg-white focus:ring-[3px] focus:ring-[#A054A0]/10 sm:min-h-[160px]"
                        />

                        <span className="pointer-events-none absolute bottom-3.5 right-4 text-[10px] font-medium uppercase tracking-wider text-black/25">
                          AI powered
                        </span>
                      </div>

                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <span className="shrink-0 text-[11px] font-semibold text-black/35">
                          Try asking
                        </span>

                        {SAMPLE_PROMPTS.map((samplePrompt, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setPrompt(samplePrompt)}
                            className="max-w-[300px] shrink-0 truncate rounded-full border border-[#E8E0E8] bg-[#FAF8FA] px-3.5 py-2 text-[11px] text-[#514751] transition-all hover:border-[#A054A0]/30 hover:bg-[#A054A0]/[.06] hover:text-[#A054A0] sm:text-xs"
                          >
                            {samplePrompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-5 flex flex-col gap-3 border-t border-[#EEE7EE] pt-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:pt-5">
                    <div className="hidden items-center gap-2 sm:flex">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#A054A0]/10">
                        <Check className="h-3.5 w-3.5 text-[#A054A0]" />
                      </span>
                      <span className="text-[11px] text-black/40">
                        Tailored to your requirements
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="group inline-flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[14px] bg-[#A054A0] px-7 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_10px_28px_rgba(160,84,160,.28)] transition-all duration-200 hover:bg-[#914891] hover:shadow-[0_14px_34px_rgba(160,84,160,.38)] active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A054A0] focus-visible:ring-offset-2 sm:w-auto sm:min-w-[220px]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
                          Search Workspaces
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
