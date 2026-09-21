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

const BRAND = "#A054A0";

const DEFAULT_CITIES = [
  "Mumbai",
  "Bengaluru",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Gurgaon",
  "Noida",
  "Ahmedabad",
];

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

const CONTROL_H = "h-[52px] sm:h-[54px]";

const inputBase = `
  w-full
  ${CONTROL_H}
  rounded-[14px]
  bg-[#FAF8FA]
  border border-[#E8E0E8]
  text-[#211A21]
  text-[13px] sm:text-sm
  font-medium
  outline-none
  transition-all duration-200
  hover:border-[#D4C4D5]
  hover:bg-white
  focus:border-[#A054A0]
  focus:ring-[3px]
  focus:ring-[#A054A0]/10
`;

export default function HeroSection() {
  const router = useRouter();

  const [consentGranted, setConsentGranted] = useState(false);
  const [tab, setTab] = useState("filters");

  const [city, setCity] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [cityOptions, setCityOptions] = useState(DEFAULT_CITIES);

  const [officeType, setOfficeType] = useState("");
  const [micromarkets, setMicromarkets] = useState([]);
  const [selectedMicromarket, setSelectedMicromarket] = useState("");
  const [loadingMicromarkets, setLoadingMicromarkets] = useState(false);

  const [budget, setBudget] = useState("");
  const { currency, unit: areaUnit } = usePreferences();
  const [area, setArea] = useState("");
  const [seats, setSeats] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  const formatNumberWithCommas = (value) => {
    const rawValue = value.replace(/\D/g, "");

    if (!rawValue) return "";

    return new Intl.NumberFormat("en-IN").format(rawValue);
  };

  const handleBudgetChange = (e) =>
    setBudget(formatNumberWithCommas(e.target.value));

  const handleAreaChange = (e) =>
    setArea(formatNumberWithCommas(e.target.value));

  const handleSeatsChange = (e) =>
    setSeats(formatNumberWithCommas(e.target.value));

  useEffect(() => {
    if (!consentGranted) return;

    fetch("/api/cities")
      .then((r) => r.json())
      .then((d) => {
        let fetchedCities = DEFAULT_CITIES;

        if (d.success && d.cities?.length) {
          fetchedCities = d.cities;
          setCityOptions(d.cities);
        }

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;

              fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              )
                .then((res) => res.json())
                .then((data) => {
                  const detectedCity =
                    data.address?.city ||
                    data.address?.town ||
                    data.address?.state_district;

                  const detectedState = data.address?.state || "";
                  const detectedCountry = data.address?.country || "";
                  const detectedPincode = data.address?.postcode || "";

                  const detectedArea =
                    data.address?.suburb || data.address?.neighbourhood || "";

                  const locationObj = {
                    city: detectedCity || "",
                    state: detectedState,
                    country: detectedCountry,
                    pincode: detectedPincode,
                    area: detectedArea,
                    latitude,
                    longitude,
                  };

                  sessionStorage.setItem(
                    "anarock_user_location",
                    JSON.stringify(locationObj),
                  );

                  window.dispatchEvent(
                    new CustomEvent("anarock-location-updated"),
                  );

                  if (detectedCity) {
                    const normalizeCity = (value) =>
                      String(value || "")
                        .trim()
                        .toLowerCase()
                        .replace(/\s+/g, " ");

                    const normalizedDetectedCity = normalizeCity(detectedCity);

                    const match = fetchedCities.find(
                      (c) => normalizeCity(c) === normalizedDetectedCity,
                    );

                    if (match) {
                      setCity(match);
                    } else {
                      setCity("");
                    }
                  }
                })
                .catch(() => { });
            },
            (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                sessionStorage.setItem("anarock_location_denied", "true");
              }
            },
          );
        }
      })
      .catch(() => { });
  }, [consentGranted]);

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
      .catch(() => setMicromarkets([]))
      .finally(() => setLoadingMicromarkets(false));
  }, [city]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCityOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
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
          JSON.stringify(searchLocationObj),
        );
      } else {
        localStorage.removeItem("anarock_last_searched_location");
      }
    }

    const params = new URLSearchParams();

    if (tab === "filters") {
      if (city) {
        params.set("city", city);
      }

      if (selectedMicromarket) {
        params.set("micromarket", selectedMicromarket);
      }

      if (officeType) {
        params.set("type", officeType.toLowerCase());
      }

      if (budget) {
        params.set("budget", budget.replace(/,/g, ""));
      }

      if (officeType.toLowerCase() === "managed office/co-working" && seats) {
        params.set("seats", seats.replace(/,/g, ""));
      } else if (area) {
        params.set("area", area.replace(/,/g, ""));
      }

      params.set("currency", currency);
      params.set("areaUnit", areaUnit);
    } else {
      params.set("type", "ai");

      if (prompt.trim()) {
        params.set("prompt", prompt.trim());
      }
    }

    router.push(`/properties?${params.toString()}`);
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
        return <span className="text-[#A054A0] text-xs font-bold">د.إ</span>;

      default:
        return <IndianRupee className="h-4 w-4 text-[#A054A0]" />;
    }
  };

  return (
    <>

      <section
        className=" 
        pt-[65px]
          relative
          w-full
          h-[90vh]
          min-h-[560px]
         
          overflow-hidden
          flex
          items-center
          justify-center
        "
      >
        <div className="absolute inset-0">
          <img
            src="/main.jpg"
            alt="Luxury Commercial Architecture"
            className="
           
              w-full
              h-full
              object-cover
              object-top
              scale-100
            "
          />
          <div
            className="
              absolute
              inset-0
              bg-[#A054A0]/20
              mix-blend-multiply
            "
          />

          <div
            className="
              absolute
              inset-0
            
            "
          />
          <div
            className="
              absolute
              left-0
              right-0
              bottom-0
              h-44
           
            "
          />
        </div>
        <div
          className="
            absolute
            top-[14%]
            left-1/2
            -translate-x-1/2
            w-[260px]
            sm:w-[520px]
            h-[170px]
            sm:h-[280px]
            rounded-full
           
            blur-[100px]
            pointer-events-none
          "
        />

        {/* Hero Content */}
        <div
          className="
            relative
            z-10
            w-full
            max-w-6xl
            mx-auto
            px-5
            sm:px-8
            lg:px-10
            pt-10
            sm:pt-10
            pb-10
            text-center
          "
        >
          {/* Eyebrow */}
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/25
              bg-white/10
              px-3.5
              py-2
              backdrop-blur-xl
              shadow-[0_8px_30px_rgba(0,0,0,.12)]
            "
          >
            <span
              className="
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-full
                bg-[#A054A0]
                shadow-[0_0_20px_rgba(160,84,160,.45)]
              "
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </span>

            <span
              className="
                text-[9px]
                sm:text-[10px]
                font-bold
                tracking-[.18em]
                sm:tracking-[.22em]
                uppercase
                text-white/95
              "
            >
              Describe · Discover · Decide
            </span>
          </div>

          {/* Heading */}
          <h1
            className="
              mt-6
              sm:mt-7
              max-w-5xl
              mx-auto
              text-[2.35rem]
              leading-[1.04]
              sm:text-5xl
              md:text-6xl
              lg:text-[4.5rem]
              xl:text-[5rem]
              font-bold
              tracking-[-.045em]
              text-white
              drop-shadow-[0_4px_24px_rgba(0,0,0,.16)]
            "
          >
            Describe the Need.
            <br />
            <span className="relative inline-block mt-2">
              <span
                className="
                  bg-gradient-to-r
                  from-white
                  via-white
                  to-[#f9d8f9]
                  bg-clip-text
                  text-transparent
                "
              >
                Discover the Space.
              </span>

              <span
                className="
                  absolute
                  -bottom-2
                  sm:-bottom-3
                  left-1/2
                  -translate-x-1/2
                  w-16
                  sm:w-28
                  h-[3px]
                  sm:h-1
                  rounded-full
                  bg-[#A054A0]
                  shadow-[0_0_18px_rgba(160,84,160,.7)]
                "
              />
            </span>
          </h1>

          {/* Description */}
          <p
            className="
              mt-7
              sm:mt-8
w-full      
              text-xl
              sm:text-base
              lg:text-2xl
              leading-7
              text-white/85
              drop-shadow-[0_2px_12px_rgba(0,0,0,.2)]
            "
          >
            An AI-enabled, data-driven approach to discovering commercial
            workspaces aligned with your business requirements.
          </p>
        </div>
      </section>


      <div
        className="
          relative
          z-30
          w-full
          max-w-6xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          -mt-20
          sm:-mt-24
        "
      >
        {/* Search Tabs */}
        <div className="flex justify-center mb-4">
          <div
            className="
              w-full
              max-w-[390px]
              rounded-2xl
              border
              border-white/30
              bg-[#241126]/95
              p-1.5
              backdrop-blur-2xl
              shadow-[0_18px_55px_rgba(0,0,0,.22)]
            "
          >
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setTab("filters")}
                className={`
                  h-11
                  sm:h-12
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  text-[10px]
                  sm:text-xs
                  font-bold
                  tracking-[.08em]
                  uppercase
                  transition-all
                  duration-300
                  ${tab === "filters"
                    ? "bg-[#A054A0] text-white shadow-[0_8px_25px_rgba(160,84,160,.35)]"
                    : "text-white/55 hover:text-white hover:bg-white/[.07]"
                  }
                `}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Smart Filters
              </button>

              <button
                type="button"
                onClick={() => setTab("ai")}
                className={`
                  h-11
                  sm:h-12
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  text-[10px]
                  sm:text-xs
                  font-bold
                  tracking-[.08em]
                  uppercase
                  transition-all
                  duration-300
                  ${tab === "ai"
                    ? "bg-[#A054A0] text-white shadow-[0_8px_25px_rgba(160,84,160,.35)]"
                    : "text-white/55 hover:text-white hover:bg-white/[.07]"
                  }
                `}
              >
                <Sparkles className="w-4 h-4" />
                AI Search
              </button>
            </div>
          </div>
        </div>

        {/* Main Search Card */}
        <div
          className="
            relative
            overflow-visible
            rounded-[24px]
            sm:rounded-[28px]
            bg-white
            border
            border-[#eee7ee]
            shadow-[0_30px_90px_rgba(35,10,38,.18)]
          "
        >
          {/* Brand Accent */}
          <div
            className="
              absolute
              top-0
              left-10
              right-10
              h-[3px]
              rounded-b-full
              bg-[#A054A0]
            "
          />

          <div
            className="
              p-5
              sm:p-7
              lg:p-8
              xl:p-9
            "
          >
            {/* Card Header */}
            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-end
                sm:justify-between
                gap-2
                mb-6
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    mb-1.5
                  "
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A054A0]" />

                  <span
                    className="
                      text-[9px]
                      sm:text-[10px]
                      font-bold
                      tracking-[.18em]
                      uppercase
                      text-[#A054A0]
                    "
                  >
                    Workspace Discovery
                  </span>
                </div>

                <h2
                  className="
                    text-xl
                    sm:text-2xl
                    font-bold
                    tracking-[-.025em]
                    text-[#191519]
                  "
                >
                  Find your perfect place
                </h2>
              </div>

              <span
                className="
                  hidden
                  sm:block
                  text-[11px]
                  text-black/35
                "
              >
                Refine your requirements
              </span>
            </div>

            <form onSubmit={handleSearch}>
              {tab === "filters" ? (
                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-4
                    gap-3
                    sm:gap-4
                  "
                >
                  {/* LOCATION */}
                  <div className="relative" ref={dropdownRef}>
                    <label
                      className="
                        block
                        mb-2
                        ml-1
                        text-[9px]
                        sm:text-[10px]
                        font-bold
                        text-black/50
                        tracking-[.15em]
                        uppercase
                      "
                    >
                      Location
                    </label>

                    <button
                      type="button"
                      onClick={() => setCityOpen(!cityOpen)}
                      className={`
                        ${inputBase}
                        px-3
                        sm:px-3.5
                        flex
                        items-center
                        justify-between
                        text-left
                        ${cityOpen
                          ? "border-[#A054A0] ring-[3px] ring-[#A054A0]/10"
                          : ""
                        }
                      `}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="
                            flex
                            shrink-0
                            items-center
                            justify-center
                            w-8
                            h-8
                            rounded-[10px]
                            bg-white
                            border
                            border-[#E9E1E9]
                          "
                        >
                          <MapPin className="w-4 h-4 text-[#A054A0]" />
                        </span>

                        <span
                          className={`
                            truncate
                            ${city
                              ? "text-[#211A21] font-semibold"
                              : "text-black/35"
                            }
                          `}
                        >
                          {city || "Select City"}
                        </span>
                      </span>

                      <ChevronDown
                        className={`
                          w-4
                          h-4
                          shrink-0
                          text-black/35
                          transition-transform
                          ${cityOpen ? "rotate-180 text-[#A054A0]" : ""}
                        `}
                      />
                    </button>

                    {cityOpen && (
                      <div
                        className="
                          absolute
                          left-0
                          right-0
                          z-50
                          mt-2
                          overflow-hidden
                          rounded-2xl
                          bg-white
                          border
                          border-[#E6DDE6]
                          shadow-[0_20px_50px_rgba(35,10,38,.16)]
                        "
                      >
                        <div
                          className="
                            p-3
                            bg-[#FBF9FB]
                            border-b
                            border-[#EEE7EE]
                          "
                        >
                          <div className="relative">
                            <Search
                              className="
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                w-4
                                h-4
                                text-black/30
                              "
                            />

                            <input
                              value={citySearch}
                              onChange={(e) => setCitySearch(e.target.value)}
                              placeholder="Search city..."
                              className="
                                w-full
                                h-10
                                rounded-xl
                                bg-white
                                border
                                border-[#E7DFE7]
                                pl-9
                                pr-3
                                text-sm
                                text-[#211A21]
                                outline-none
                                focus:border-[#A054A0]
                                focus:ring-2
                                focus:ring-[#A054A0]/10
                              "
                            />
                          </div>
                        </div>

                        <div className="max-h-56 overflow-y-auto">
                          {filteredCities.map((c) => (
                            <button
                              type="button"
                              key={c}
                              onClick={() => {
                                setCity(c);
                                setCityOpen(false);
                                setCitySearch("");
                              }}
                              className="
                                w-full
                                px-4
                                py-3
                                text-sm
                                text-left
                                text-[#393039]
                                hover:bg-[#A054A0]/[.06]
                                hover:text-[#A054A0]
                                flex
                                items-center
                                justify-between
                                transition-colors
                              "
                            >
                              {c}

                              {city === c && (
                                <span
                                  className="
                                    w-6
                                    h-6
                                    rounded-full
                                    bg-[#A054A0]/10
                                    flex
                                    items-center
                                    justify-center
                                  "
                                >
                                  <Check className="w-3.5 h-3.5 text-[#A054A0]" />
                                </span>
                              )}
                            </button>
                          ))}

                          {!filteredCities.length && (
                            <div
                              className="
                                px-4
                                py-7
                                text-center
                                text-xs
                                text-black/35
                              "
                            >
                              No cities found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MICROMARKET */}
                  <div>
                    <label
                      className="
                        block
                        mb-2
                        ml-1
                        text-[9px]
                        sm:text-[10px]
                        font-bold
                        text-black/50
                        tracking-[.15em]
                        uppercase
                      "
                    >
                      Micromarket
                    </label>

                    <div className="relative">
                      <select
                        value={selectedMicromarket}
                        disabled={!city || loadingMicromarkets}
                        onChange={(e) => setSelectedMicromarket(e.target.value)}
                        className={`
                          ${inputBase}
                          appearance-none
                          cursor-pointer
                          px-4
                          pr-10
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        `}
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

                      <ChevronDown
                        className="
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          w-4
                          h-4
                          text-black/35
                          pointer-events-none
                        "
                      />
                    </div>
                  </div>

                  {/* PROPERTY TYPE */}
                  <div>
                    <label
                      className="
                        block
                        mb-2
                        ml-1
                        text-[9px]
                        sm:text-[10px]
                        font-bold
                        text-black/50
                        tracking-[.15em]
                        uppercase
                      "
                    >
                      Property Type
                    </label>

                    <div className="relative">
                      <select
                        value={officeType}
                        onChange={(e) => setOfficeType(e.target.value)}
                        className={`
                          ${inputBase}
                          appearance-none
                          cursor-pointer
                          px-4
                          pr-10
                        `}
                      >
                        <option value="">All Office Types</option>

                        {OFFICE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>

                      <Building2
                        className="
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          w-4
                          h-4
                          text-black/35
                          pointer-events-none
                        "
                      />
                    </div>
                  </div>

                  {/* BUDGET */}
                  <div>
                    <label
                      className="
                        block
                        mb-2
                        ml-1
                        text-[9px]
                        sm:text-[10px]
                        font-bold
                        text-black/50
                        tracking-[.15em]
                        uppercase
                      "
                    >
                      Max Budget ({currency})
                    </label>

                    <div className="relative flex items-center">
                      <span
                        className="
                          absolute
                          left-3.5
                          w-7
                          h-7
                          rounded-lg
                          bg-white
                          border
                          border-[#E9E1E9]
                          flex
                          items-center
                          justify-center
                          pointer-events-none
                        "
                      >
                        {renderCurrencyIcon()}
                      </span>

                      <input
                        type="text"
                        inputMode="numeric"
                        value={budget}
                        onChange={handleBudgetChange}
                        placeholder="e.g. 5,00,000"
                        className={`
                          ${inputBase}
                          pl-14
                          pr-4
                          placeholder:text-black/25
                        `}
                      />
                    </div>
                  </div>

                  {/* AREA / SEATS */}
                  <div className="sm:col-span-2 lg:col-span-4">
                    {officeType.toLowerCase() ===
                      "managed office/co-working" ? (
                      <div className="max-w-full lg:max-w-[25%]">
                        <label
                          className="
                            block
                            mb-2
                            ml-1
                            text-[9px]
                            sm:text-[10px]
                            font-bold
                            text-black/50
                            tracking-[.15em]
                            uppercase
                          "
                        >
                          Required Seats
                        </label>

                        <div className="relative">
                          <span
                            className="
                              absolute
                              left-3.5
                              top-1/2
                              -translate-y-1/2
                              w-7
                              h-7
                              rounded-lg
                              bg-white
                              border
                              border-[#E9E1E9]
                              flex
                              items-center
                              justify-center
                              pointer-events-none
                            "
                          >
                            <Users className="w-4 h-4 text-[#A054A0]" />
                          </span>

                          <input
                            type="text"
                            inputMode="numeric"
                            value={seats}
                            onChange={handleSeatsChange}
                            placeholder="e.g. 50"
                            className={`
                              ${inputBase}
                              pl-14
                              pr-4
                              placeholder:text-black/25
                            `}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-full lg:max-w-[25%]">
                        <label
                          className="
                            block
                            mb-2
                            ml-1
                            text-[9px]
                            sm:text-[10px]
                            font-bold
                            text-black/50
                            tracking-[.15em]
                            uppercase
                          "
                        >
                          Min Area ({areaUnit})
                        </label>

                        <div className="relative">
                          <span
                            className="
                              absolute
                              left-3.5
                              top-1/2
                              -translate-y-1/2
                              w-7
                              h-7
                              rounded-lg
                              bg-white
                              border
                              border-[#E9E1E9]
                              flex
                              items-center
                              justify-center
                              pointer-events-none
                            "
                          >
                            <Maximize2 className="w-4 h-4 text-[#A054A0]" />
                          </span>

                          <input
                            type="text"
                            inputMode="numeric"
                            value={area}
                            onChange={handleAreaChange}
                            placeholder="e.g. 2,500"
                            className={`
                              ${inputBase}
                              pl-14
                              pr-4
                              placeholder:text-black/25
                            `}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <div
                      className="
                        absolute
                        left-4
                        top-4
                        w-9
                        h-9
                        rounded-xl
                        bg-[#A054A0]/10
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Sparkles className="w-4 h-4 text-[#A054A0]" />
                    </div>

                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Tell us what kind of workspace you're looking for..."
                      rows={2}
                      className="
                        w-full
                        min-h-[130px]
                        sm:min-h-[145px]
                        bg-[#FAF8FA]
                        border
                        border-[#E8E0E8]
                        rounded-2xl
                        p-4
                        pl-16
                        text-[#211A21]
                        placeholder:text-black/30
                        text-sm
                        leading-6
                        font-medium
                        outline-none
                        resize-none
                        transition-all
                        hover:border-[#D4C4D5]
                        hover:bg-white
                        focus:border-[#A054A0]
                        focus:ring-[3px]
                        focus:ring-[#A054A0]/10
                      "
                    />
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      overflow-x-auto
                      pb-1
                      scrollbar-none
                    "
                  >
                    <span
                      className="
                        text-[11px]
                        text-black/35
                        font-semibold
                        whitespace-nowrap
                      "
                    >
                      Try asking
                    </span>

                    {SAMPLE_PROMPTS.map((samplePrompt, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setPrompt(samplePrompt)}
                        className="
                            shrink-0
                            text-[11px]
                            sm:text-xs
                            text-[#514751]
                            hover:text-[#A054A0]
                            bg-[#FAF8FA]
                            hover:bg-[#A054A0]/[.06]
                            border
                            border-[#E8E0E8]
                            hover:border-[#A054A0]/30
                            rounded-full
                            px-3.5
                            py-2
                            max-w-[280px]
                            truncate
                            transition-all
                          "
                      >
                        {samplePrompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Footer */}
              <div
                className="
                  mt-6
                  pt-5
                  border-t
                  border-[#EEE7EE]
                  flex
                  flex-col-reverse
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-4
                "
              >
                <div
                  className="
                    hidden
                    sm:flex
                    items-center
                    gap-2
                  "
                >
                  <span
                    className="
                      flex
                      items-center
                      justify-center
                      w-7
                      h-7
                      rounded-full
                      bg-[#A054A0]/10
                    "
                  >
                    <Check className="w-3.5 h-3.5 text-[#A054A0]" />
                  </span>

                  <span className="text-[11px] text-black/40">
                    Tailored to your requirements
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    w-full
                    sm:w-auto
                    min-w-[200px]
                    h-[52px]
                    sm:h-[54px]
                    px-8
                    rounded-[14px]
                    bg-[#A054A0]
                    hover:bg-[#914891]
                    active:scale-[.99]
                    disabled:opacity-70
                    disabled:cursor-not-allowed
                    text-white
                    font-bold
                    text-[11px]
                    sm:text-xs
                    tracking-[.12em]
                    uppercase
                    flex
                    items-center
                    justify-center
                    gap-2.5
                    shadow-[0_10px_28px_rgba(160,84,160,.28)]
                    hover:shadow-[0_14px_34px_rgba(160,84,160,.38)]
                    transition-all
                    duration-200
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#A054A0]
                    focus-visible:ring-offset-2
                  "
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
                      Search Workspaces
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="h-12 sm:h-16 lg:h-20" />
      </div>
    </>
  );
}
