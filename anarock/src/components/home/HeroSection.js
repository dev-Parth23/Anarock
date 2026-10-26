"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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

const OFFICE_TYPES = ["Conventional", "Managed Office/Co-working"];
const SAMPLE_PROMPTS = [
  "5,000 sq ft managed office in Whitefield with 80+ desks & boardrooms",
  "A-grade bare shell commercial space in BKC with panoramic views",
  "Plug-and-play HQ in Cyber City Gurgaon under ₹15 Lakhs/month",
];
const CONTROL_H = "h-[clamp(2.75rem,5vh,3.5rem)]";
const INPUT_BASE = `w-full ${CONTROL_H} rounded-xl bg-[#FAF8FA] border border-[#E8E0E8] text-[#211A21] text-[13px] sm:text-sm font-medium outline-none transition-all duration-200 hover:border-[#D4C4D5] hover:bg-white focus:border-[#A054A0] focus:bg-white focus:ring-[3px] focus:ring-[#A054A0]/10 disabled:cursor-not-allowed disabled:opacity-50`;
const INPUT_OPEN = "border-[#A054A0] bg-white ring-[3px] ring-[#A054A0]/10";
const LABEL = "mb-1.5 ml-0.5 block text-[11px] font-bold tracking-[0.14em] text-black/70 sm:text-xs";
const MENU = "absolute left-0 right-0 top-full z-[100] mt-2 flex flex-col overflow-hidden rounded-2xl border border-[#E6DDE6] bg-white shadow-[0_24px_60px_rgba(35,10,38,.18)]";
const MENU_LIST = "max-h-[clamp(160px,30vh,260px)] overflow-y-auto overscroll-contain p-1.5";
const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A054A0] focus-visible:ring-offset-2";

function CheckBadge() {
  return (
    <span className="ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#A054A0]/10">
      <Check className="h-3 w-3 text-[#A054A0]" />
    </span>
  );
}

function Field({ label, innerRef, className = "", children }) {
  return (
    <div className={`relative min-w-0 ${className}`} ref={innerRef}>
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  );
}

function SelectTrigger({ icon: Icon, open, disabled, onClick, filled, loading, children }) {
  return (
    <button type="button" aria-haspopup="listbox" aria-expanded={open} disabled={disabled} onClick={onClick}
      className={`${INPUT_BASE} flex items-center justify-between gap-2 px-3.5 text-left ${open ? INPUT_OPEN : ""}`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Icon className="h-4 w-4 shrink-0 text-[#A054A0]" />
        <span className={`min-w-0 truncate ${filled ? "font-semibold text-[#211A21]/85" : "text-black/35"}`} >
          {children}
        </span>
      </span>

      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#A054A0]" />
      ) : (
        <ChevronDown className={`h-4 w-4 shrink-0 text-black/35 transition-transform ${open ? "rotate-180 text-[#A054A0]" : ""}`} />
      )}
    </button>
  );
}

function MenuSearch({ value, onChange, placeholder }) {
  return (
    <div className="shrink-0 border-b border-[#EEE7EE] bg-[#FBF9FB] p-2.5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
        <input value={value} onChange={onChange} placeholder={placeholder} autoFocus
          className="h-10 w-full rounded-xl border border-[#E7DFE7] bg-white pl-9 pr-3 text-[13px] font-medium text-[#211A21] outline-none transition placeholder:text-black/30 focus:border-[#A054A0] focus:ring-2 focus:ring-[#A054A0]/10 sm:text-sm"
        />
      </div>
    </div>
  );
}

function Option({ active, onClick, children }) {
  return (
    <button type="button" role="option" aria-selected={active}
      onClick={onClick} className={`flex min-h-[42px] w-full items-center justify-between rounded-xl px-3.5 py-2 text-left text-[13px] transition-colors sm:text-sm ${active
        ? "bg-[#A054A0]/[.08] font-semibold text-[#A054A0]"
        : "text-[#393039] hover:bg-[#A054A0]/[.05] hover:text-[#A054A0]"
        }`}
    >
      <span className="min-w-0 truncate">{children}</span>
      {active && <CheckBadge />}
    </button>
  );
}

function IconInput({ icon, value, onChange, placeholder }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 items-center justify-center">
        {icon}
      </span>

      <input type="text" inputMode="numeric" value={value} onChange={onChange} placeholder={placeholder}
        className={`${INPUT_BASE} pl-11 pr-4 font-semibold text-[#211A21]/85 placeholder:font-normal placeholder:text-black/30`}
      />
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick}
      className={`inline-flex h-[clamp(2.5rem,4.6vh,3rem)] flex-1 items-center justify-center gap-2 rounded-full px-4 text-[11px] font-bold transition-all duration-200 sm:min-w-[170px] sm:flex-none sm:px-6 sm:text-xs ${FOCUS_RING} ${active
        ? "border border-[#E7E1E7] bg-white text-[#211A21] shadow-[0_4px_14px_rgba(30,15,30,.09)]"
        : "text-[#817981] hover:bg-white/70 hover:text-[#3C353C]"
        }`}
    >
      <Icon className={`h-4 w-4 ${active ? "text-[#A054A0]" : "text-[#9A939A]"}`} />
      {children}
    </button>
  );
}

export default function HeroSection({ consentGranted, locationData }) {
  const router = useRouter();
  const [tab, setTab] = useState("filters");
  const [city, setCity] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [officeType, setOfficeType] = useState("");
  const [officeTypeOpen, setOfficeTypeOpen] = useState(false);
  const [micromarkets, setMicromarkets] = useState([]);
  const [selectedMicromarkets, setSelectedMicromarkets] = useState([]);
  const [micromarketOpen, setMicromarketOpen] = useState(false);
  const [micromarketSearch, setMicromarketSearch] = useState("");
  const [loadingMicromarkets, setLoadingMicromarkets] = useState(false);
  const [minBudget, setMinBudget] = useState("");
  const { currency, unit: areaUnit } = usePreferences();
  const [area, setArea] = useState("");
  const [seats, setSeats] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const cityDropdownRef = useRef(null);
  const micromarketDropdownRef = useRef(null);
  const officeTypeDropdownRef = useRef(null);
  const locationAutoSelectedRef = useRef(false);
  const formatNumberWithCommas = (value) => {
    const rawValue = String(value || "").replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("en-IN").format(rawValue);
  };
  const handleMinBudgetChange = (e) => {
    setMinBudget(formatNumberWithCommas(e.target.value));
  };
  const handleAreaChange = (e) => {
    setArea(formatNumberWithCommas(e.target.value));
  };
  const handleSeatsChange = (e) => {
    setSeats(formatNumberWithCommas(e.target.value));
  };
  const normalizedOfficeType = officeType.trim().toLowerCase();
  const isCoworking = normalizedOfficeType === "managed office/co-working";
  const isRentBased = !isCoworking;
  const handleOfficeTypeChange = (val) => {
    const newType = typeof val === "string" ? val : val?.target?.value || "";
    setOfficeType(newType);
    setMinBudget("");
    setArea("");
    setSeats("");
  };
  const toggleMicromarket = (micromarketName) => {
    setSelectedMicromarkets((current) => {
      if (current.includes(micromarketName)) {
        return current.filter((name) => name !== micromarketName);
      }
      return [...current, micromarketName];
    });
  };
  const clearMicromarkets = () => {
    setSelectedMicromarkets([]);
    setMicromarketSearch("");
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
          } catch { }
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
      setSelectedMicromarkets([]);
      setMicromarketOpen(false);
      setMicromarketSearch("");
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
    const handleOutsideInteraction = (e) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(e.target)
      ) {
        setCityOpen(false);
      }

      if (
        micromarketDropdownRef.current &&
        !micromarketDropdownRef.current.contains(e.target)
      ) {
        setMicromarketOpen(false);
      }

      if (
        officeTypeDropdownRef.current &&
        !officeTypeDropdownRef.current.contains(e.target)
      ) {
        setOfficeTypeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideInteraction);

    return () => {
      document.removeEventListener("mousedown", handleOutsideInteraction);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    if (typeof window !== "undefined") {
      if (tab === "filters" && city) {
        const searchLocationObj = {
          city: city.trim(),
          micromarkets: selectedMicromarkets,
          propertyType: officeType || "",
          searchedAt: Date.now(),
        };
        localStorage.setItem(
          "anarock_last_searched_location",
          JSON.stringify(searchLocationObj),
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

      if (selectedMicromarkets.length) {
        params.set(
          "micromarket",
          selectedMicromarkets.map(toUrlValue).join(","),
        );
      }

      if (officeType?.trim()) {
        params.set("type", toUrlValue(officeType));
      }

      const cleanedMinBudget = cleanNumber(minBudget);

      if (cleanedMinBudget) {
        params.set("minBudget", cleanedMinBudget);
      }

      params.delete("maxBudget");

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
        params.set("currency", String(currency).trim().toUpperCase());
      }

      if (areaUnit) {
        params.set("areaUnit", toUrlValue(areaUnit));
      }
    } else {
      params.set("mode", "ai");

      if (prompt.trim()) {
        params.set("prompt", prompt.trim());
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

  const filteredMicromarkets = micromarkets.filter((m) =>
    (m.name || "").toLowerCase().includes(micromarketSearch.toLowerCase()),
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

  const micromarketTriggerText = loadingMicromarkets ? "Loading..." : city ? selectedMicromarkets.length === 0 ? "All Micro Markets" : selectedMicromarkets.length === 1 ? selectedMicromarkets[0] : `${selectedMicromarkets.length} Micro Markets Selected` : "Select City First";

  const renderSubmitButton = (extraClass = "") => (
    <button type="submit" disabled={loading} className={`group inline-flex ${CONTROL_H} items-center justify-center gap-2.5 rounded-xl bg-[#A054A0] px-6 text-[12px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_10px_28px_rgba(160,84,160,.28)] transition-all duration-200 hover:bg-[#914891] hover:shadow-[0_14px_34px_rgba(160,84,160,.38)] active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-70 sm:text-[13px] ${FOCUS_RING} ${extraClass}`}>
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
  );

  return (
    <main
      className="relative min-h-dvh w-full overflow-x-hidden bg-[#160B17] lg:min-h-dvh lg:h-auto"
      style={{
        minHeight: "100dvh",
        overflowX: "clip",
      }}
    >
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <Image
          src="/main.jpg"
          alt="Luxury Commercial Architecture"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover object-center lg:object-top"
        />

        <div className="absolute inset-0 bg-[#4E2352]/35 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(160,84,160,.30),transparent_38%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#100912]/55 via-[#170D19]/25 to-[#160B17]" />
        <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#160B17] via-[#160B17]/80 to-transparent" />

        <div className="pointer-events-none absolute left-1/2 top-[10%] h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-[#A054A0]/20 blur-[100px] sm:h-[420px] sm:w-[420px] lg:h-[560px] lg:w-[560px]" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      {/* ------------------------------- Content -------------------------------- */}
      <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col items-center justify-center gap-[clamp(1.25rem,4vh,3.5rem)] px-4 pb-8 pt-14 sm:px-6 sm:pb-12 lg:min-h-dvh lg:px-8 lg:pb-4 lg:pt-[2.5rem] xl:px-10 [@media(max-height:760px)]:justify-start [@media(max-height:760px)]:gap-4 [@media(max-height:760px)]:pt-6 [@media(max-height:760px)]:pb-6">
        <header className="w-full max-w-[980px] shrink-0 text-center">
          <div className="mb-[clamp(0.75rem,2.2vh,1.5rem)] inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,.12)] backdrop-blur-xl sm:px-4 sm:py-2 [@media(max-height:620px)]:hidden">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A054A0] shadow-[0_0_24px_rgba(160,84,160,.45)]">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </span>

            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/90 sm:text-[10px] sm:tracking-[0.22em]">
              Describe · Discover · Decide
            </span>
          </div>

          <h1 className="mx-auto max-w-[920px] text-[clamp(1.75rem,min(9vw,7.5vh),4.5rem)] font-bold leading-[1.02] tracking-[-0.04em] text-white drop-shadow-[0_4px_28px_rgba(0,0,0,.2)]">
            Describe the Need.
            <span className="mt-1 block text-nowrap bg-clip-text sm:mt-2">
              Discover the Space.
            </span>
          </h1>

          <p className="mx-auto mt-[clamp(0.5rem,1.8vh,1.25rem)] max-w-[650px] px-2 text-[13px] leading-[1.55] tracking-wide text-white/70 sm:px-0 sm:text-base sm:leading-7">
            An AI-enabled, data-driven approach to discovering commercial
            workspaces aligned with your business requirements.
          </p>
        </header>
        <div className="relative z-30 w-full max-w-[1100px] shrink-0 rounded-[24px] border border-white/80 bg-white shadow-[0_28px_90px_rgba(20,5,25,.34)] lg:rounded-[28px]">
          <div className="flex justify-center px-4 pt-[clamp(1rem,2.6vh,1.75rem)] sm:px-6">
            <div
              role="tablist"
              aria-label="Search mode"
              className="flex w-full max-w-[430px] rounded-full border border-[#ECE7EC] bg-[#F7F5F7] p-1 shadow-[inset_0_1px_2px_rgba(30,15,30,.04)] sm:w-auto sm:max-w-none"
            >
              <TabButton
                active={tab === "filters"}
                onClick={() => setTab("filters")}
                icon={SlidersHorizontal}
              >
                Filter Properties
              </TabButton>

              <TabButton
                active={tab === "ai"}
                onClick={() => setTab("ai")}
                icon={Sparkles}
              >
                AI Search
              </TabButton>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="px-4 pb-[clamp(1.25rem,3.2vh,2.25rem)] pt-[clamp(1rem,2.6vh,1.75rem)] sm:px-8"
          >
            {tab === "filters" ? (
              <div className="grid grid-cols-1 gap-x-5 gap-y-[clamp(0.875rem,2.2vh,1.5rem)] sm:grid-cols-2 lg:grid-cols-3">
                <Field label="City" innerRef={cityDropdownRef}>
                  <SelectTrigger
                    icon={MapPin}
                    open={cityOpen}
                    loading={loadingCities}
                    filled={!!city}
                    onClick={() => setCityOpen(!cityOpen)}
                  >
                    {loadingCities
                      ? "Loading cities..."
                      : city || "Select city"}
                  </SelectTrigger>

                  {cityOpen && (
                    <div className={MENU}>
                      <MenuSearch
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        placeholder="Search city..."
                      />

                      <div
                        role="listbox"
                        className={MENU_LIST}
                        style={{
                          maxHeight: "min(220px, calc(100dvh - 360px))",
                          overflowY: "auto",
                          overscrollBehavior: "contain",
                          scrollbarWidth: "thin",
                        }}
                      >
                        {filteredCities.map((c) => (
                          <Option
                            key={c}
                            active={city === c}
                            onClick={() => {
                              setCity(c);
                              setCityOpen(false);
                              setCitySearch("");
                            }}
                          >
                            {c}
                          </Option>
                        ))}

                        {!filteredCities.length && (
                          <div className="px-4 py-8 text-center text-xs text-black/35">
                            No cities found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Field>

                {/* Micromarket */}
                <Field label="Micro market" innerRef={micromarketDropdownRef}>
                  <SelectTrigger
                    icon={MapPin}
                    open={micromarketOpen}
                    loading={loadingMicromarkets}
                    disabled={!city || loadingMicromarkets}
                    filled={selectedMicromarkets.length > 0}
                    onClick={() => setMicromarketOpen(!micromarketOpen)}
                  >
                    {micromarketTriggerText}
                  </SelectTrigger>

                  {micromarketOpen && !loadingMicromarkets && city && (
                    <div
                      className={MENU}
                      style={{
                        maxHeight: "calc(100dvh - 120px)",
                        overflow: "hidden",
                      }}
                    >
                      {micromarkets.length > 5 && (
                        <MenuSearch
                          value={micromarketSearch}
                          onChange={(e) => setMicromarketSearch(e.target.value)}
                          placeholder="Search micro market..."
                        />
                      )}

                      <div
                        role="listbox"
                        aria-multiselectable="true"
                        className={MENU_LIST}
                      >
                        <Option
                          active={selectedMicromarkets.length === 0}
                          onClick={() => {
                            clearMicromarkets();
                            setMicromarketOpen(false);
                          }}
                        >
                          All Micro Markets
                        </Option>

                        {filteredMicromarkets.map((m) => (
                          <Option
                            key={m.id || m.name}
                            active={selectedMicromarkets.includes(m.name)}
                            onClick={() => {
                              toggleMicromarket(m.name);
                              setMicromarketSearch("");
                            }}
                          >
                            {m.name}
                          </Option>
                        ))}

                        {!filteredMicromarkets.length && (
                          <div className="flex min-h-[96px] items-center justify-center px-4 text-center text-[11px] text-black/35 sm:text-xs">
                            No micromarkets found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Field>

                {/* Property Type */}
                <Field
                  label="Property Type"
                  innerRef={officeTypeDropdownRef}
                  className="sm:col-span-2 lg:col-span-1"
                >
                  <SelectTrigger
                    icon={Building2}
                    open={officeTypeOpen}
                    filled={!!officeType}
                    onClick={() => setOfficeTypeOpen(!officeTypeOpen)}
                  >
                    {officeType || "All Office Types"}
                  </SelectTrigger>

                  {officeTypeOpen && (
                    <div className={MENU}>
                      <div role="listbox" className="p-1.5">
                        <Option
                          active={!officeType}
                          onClick={() => {
                            handleOfficeTypeChange("");
                            setOfficeTypeOpen(false);
                          }}
                        >
                          All Office Types
                        </Option>

                        {OFFICE_TYPES.map((t) => (
                          <Option
                            key={t}
                            active={officeType === t}
                            onClick={() => {
                              handleOfficeTypeChange(t);
                              setOfficeTypeOpen(false);
                            }}
                          >
                            {t}
                          </Option>
                        ))}
                      </div>
                    </div>
                  )}
                </Field>

                {/* ----- Row 2 ----- */}

                {/* Seats / Area */}
                {isCoworking ? (
                  <Field label="Seats Required">
                    <IconInput
                      icon={<Users className="h-4 w-4 text-[#A054A0]" />}
                      value={seats}
                      onChange={handleSeatsChange}
                      placeholder="e.g. 50"
                    />
                  </Field>
                ) : (
                  <Field label={`Min Area Required (${areaUnit})`}>
                    <IconInput
                      icon={<Maximize2 className="h-4 w-4 text-[#A054A0]" />}
                      value={area}
                      onChange={handleAreaChange}
                      placeholder="e.g. 2,500"
                    />
                  </Field>
                )}

                {/* Rent / Seat Price */}
                <Field
                  label={
                    isRentBased ? `Rent/${areaUnit}/month` : "Seat Price/month"
                  }
                >
                  <IconInput
                    icon={renderCurrencyIcon()}
                    value={minBudget}
                    onChange={handleMinBudgetChange}
                    placeholder={
                      isRentBased ? "Rent/month" : "Seat Price/month"
                    }
                  />
                </Field>

                {/* CTA: sixth cell keeps the 3 x 2 grid balanced */}
                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  {renderSubmitButton("w-full")}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-4 z-10 flex h-5 w-5 items-center justify-center">
                    <Sparkles className="h-4 w-4 text-[#A054A0]" />
                  </div>

                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the workspace you're looking for..."
                    rows={2}
                    aria-label="Describe the workspace you're looking for"
                    className="h-[clamp(110px,20vh,135px)] w-full resize-none rounded-2xl border border-[#E8E0E8] bg-[#FAF8FA] p-4 pb-9 pl-12 text-sm font-medium leading-6 text-[#211A21] outline-none transition-all duration-200 placeholder:font-normal placeholder:text-black/30 hover:border-[#D4C4D5] hover:bg-white focus:border-[#A054A0] focus:bg-white focus:ring-[3px] focus:ring-[#A054A0]/10"
                  />

                  <span className="pointer-events-none absolute bottom-3 right-4 text-[10px] font-medium uppercase tracking-wider text-black/25">
                    AI powered
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="shrink-0 text-[11px] font-semibold text-black/35">
                    Try asking
                  </span>

                  {SAMPLE_PROMPTS.map((samplePrompt, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setPrompt(samplePrompt)}
                      title={samplePrompt}
                      className={`max-w-full truncate rounded-full border border-[#E8E0E8] bg-[#FAF8FA] px-3.5 py-2 text-[11px] text-[#514751] transition-all hover:border-[#A054A0]/30 hover:bg-[#A054A0]/[.06] hover:text-[#A054A0] sm:max-w-[340px] sm:text-xs ${FOCUS_RING}`}
                    >
                      {samplePrompt}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center border-t border-[#EEE7EE] pt-4 sm:pt-5">
                  {renderSubmitButton("w-full sm:w-auto sm:min-w-[240px]")}
                </div>
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
