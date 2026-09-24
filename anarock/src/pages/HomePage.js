"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CookieConsent from "@/components/common/CookieConsent";
import HeroSection from "@/components/home/HeroSection";
import MarketStats from "@/components/home/MarketStats";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Users,
  Sparkles,
  BarChart3,
  Handshake,
  Leaf,
  Brain,
  ArrowRight,
  Search,
  Compass,
  Scale,
  CheckCircle2,
  ArrowLeft,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
const phoneCountries = [
  { name: "India", code: "IN", dial: "+91", flag: "🇮🇳", min: 10, max: 10 },
  {
    name: "United States",
    code: "US",
    dial: "+1",
    flag: "🇺🇸",
    min: 10,
    max: 10,
  },
  { name: "Canada", code: "CA", dial: "+1", flag: "🇨🇦", min: 10, max: 10 },
  {
    name: "United Kingdom",
    code: "GB",
    dial: "+44",
    flag: "🇬🇧",
    min: 10,
    max: 10,
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    dial: "+971",
    flag: "🇦🇪",
    min: 9,
    max: 9,
  },
  { name: "Australia", code: "AU", dial: "+61", flag: "🇦🇺", min: 9, max: 9 },
  { name: "Singapore", code: "SG", dial: "+65", flag: "🇸🇬", min: 8, max: 8 },
  { name: "Germany", code: "DE", dial: "+49", flag: "🇩🇪", min: 10, max: 11 },
  { name: "France", code: "FR", dial: "+33", flag: "🇫🇷", min: 9, max: 9 },
  { name: "Italy", code: "IT", dial: "+39", flag: "🇮🇹", min: 9, max: 10 },
  { name: "Spain", code: "ES", dial: "+34", flag: "🇪🇸", min: 9, max: 9 },
  { name: "Netherlands", code: "NL", dial: "+31", flag: "🇳🇱", min: 9, max: 9 },
  { name: "Switzerland", code: "CH", dial: "+41", flag: "🇨🇭", min: 9, max: 9 },
  { name: "Ireland", code: "IE", dial: "+353", flag: "🇮🇪", min: 9, max: 9 },
  { name: "New Zealand", code: "NZ", dial: "+64", flag: "🇳🇿", min: 8, max: 10 },
  { name: "Japan", code: "JP", dial: "+81", flag: "🇯🇵", min: 10, max: 10 },
  { name: "South Korea", code: "KR", dial: "+82", flag: "🇰🇷", min: 9, max: 10 },
  { name: "China", code: "CN", dial: "+86", flag: "🇨🇳", min: 11, max: 11 },
  { name: "Hong Kong", code: "HK", dial: "+852", flag: "🇭🇰", min: 8, max: 8 },
  { name: "Malaysia", code: "MY", dial: "+60", flag: "🇲🇾", min: 9, max: 10 },
  { name: "Thailand", code: "TH", dial: "+66", flag: "🇹🇭", min: 9, max: 9 },
  { name: "Israel", code: "IL", dial: "+972", flag: "🇮🇱", min: 9, max: 9 },
  { name: "Indonesia", code: "ID", dial: "+62", flag: "🇮🇩", min: 9, max: 12 },
  {
    name: "Philippines",
    code: "PH",
    dial: "+63",
    flag: "🇵🇭",
    min: 10,
    max: 10,
  },
  { name: "Vietnam", code: "VN", dial: "+84", flag: "🇻🇳", min: 9, max: 10 },
  { name: "South Africa", code: "ZA", dial: "+27", flag: "🇿🇦", min: 9, max: 9 },
  {
    name: "Saudi Arabia",
    code: "SA",
    dial: "+966",
    flag: "🇸🇦",
    min: 9,
    max: 9,
  },
  { name: "Qatar", code: "QA", dial: "+974", flag: "🇶🇦", min: 8, max: 8 },
  { name: "Kuwait", code: "KW", dial: "+965", flag: "🇰🇼", min: 8, max: 8 },
  { name: "Oman", code: "OM", dial: "+968", flag: "🇴🇲", min: 8, max: 8 },
  { name: "Bahrain", code: "BH", dial: "+973", flag: "🇧🇭", min: 8, max: 8 },
  { name: "Pakistan", code: "PK", dial: "+92", flag: "🇵🇰", min: 10, max: 10 },
  {
    name: "Bangladesh",
    code: "BD",
    dial: "+880",
    flag: "🇧🇩",
    min: 10,
    max: 10,
  },
  { name: "Nepal", code: "NP", dial: "+977", flag: "🇳🇵", min: 10, max: 10 },
  { name: "Sri Lanka", code: "LK", dial: "+94", flag: "🇱🇰", min: 9, max: 9 },
  { name: "Russia", code: "RU", dial: "+7", flag: "🇷🇺", min: 10, max: 10 },
  { name: "Brazil", code: "BR", dial: "+55", flag: "🇧🇷", min: 10, max: 11 },
  { name: "Mexico", code: "MX", dial: "+52", flag: "🇲🇽", min: 10, max: 10 },
  { name: "Argentina", code: "AR", dial: "+54", flag: "🇦🇷", min: 10, max: 11 },
  { name: "Turkey", code: "TR", dial: "+90", flag: "🇹🇷", min: 10, max: 10 },
];
const popularCities = [
  {
    name: "Mumbai",
    url: "https://images.unsplash.com/photo-1569758267239-d08deb78bb1a?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Bengaluru",
    url: "https://images.unsplash.com/photo-1720954006045-6b801f7f919e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmFuZ2Fsb3JlJTIwY2l0eXxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    name: "Pune",
    url: "https://images.unsplash.com/photo-1608019425630-bec4810ccb60?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Gurugram",
    url: "https://images.unsplash.com/photo-1707549573382-de5ebcb30dae?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3VydWdyYW18ZW58MHx8MHx8fDA%3D",
  },
  {
    name: "Delhi",
    url: "https://plus.unsplash.com/premium_photo-1697729438410-d53c666e3810?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZGVsaGl8ZW58MHx8MHx8fDA%3D",
  },
  {
    name: "Hyderabad",
    url: "https://images.unsplash.com/photo-1657981630164-769503f3a9a8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aHlkZXJhYmFkfGVufDB8fDB8fHww",
  },
  {
    name: "Chennai",
    url: "https://images.unsplash.com/photo-1616843413587-9e3a37f7bbd8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hlbm5haXxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    name: "Noida",
    url: "https://images.unsplash.com/photo-1661858435242-ed971767e954?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bm9pZGF8ZW58MHx8MHx8fDA%3D",
  },
  {
    name: "Kolkata",
    url: "https://images.unsplash.com/photo-1682582036641-91dfe7b66ba6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8a29sa2F0YXxlbnwwfHwwfHx8MA%3D%3D",
  },
];
const features = [
  {
    icon: Users,
    title: "Client-Centric",
    desc: "Tailored advisory built around your unique business needs.",
  },
  {
    icon: Sparkles,
    title: "AI-Enabled",
    desc: "Smart search that understands your intent, not just keywords.",
  },
  {
    icon: BarChart3,
    title: "Data-Driven",
    desc: "Decisions backed by market intelligence and analytics.",
  },
  {
    icon: Handshake,
    title: "Transaction Expertise",
    desc: "End-to-end deal execution with commercial clarity.",
  },
  {
    icon: Leaf,
    title: "Sustainability-Focused",
    desc: "Green-certified buildings and ESG-aligned choices.",
  },
  {
    icon: Brain,
    title: "Market Intelligence",
    desc: "Real-time insights across 850M+ sq.ft of commercial stock.",
  },
];
const journey = [
  {
    icon: Compass,
    title: "Define",
    desc: "Outline your property requirements across location, space, budget and key business priorities.",
  },
  {
    icon: Search,
    title: "Discover",
    desc: "Explore relevant property options aligned with your defined requirements and search criteria.",
  },
  {
    icon: Scale,
    title: "Evaluate",
    desc: "Shortlist suitable options and engage with our experts to assess fit, commercials and negotiate optimal terms.",
  },
  {
    icon: CheckCircle2,
    title: "Decide",
    desc: "Select the right property with confidence, supported by informed evaluation and commercial clarity.",
  },
];

function GlassField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-xs font-semibold text-slate-600">
        {label} {required && <span className="text-[#A054A0]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="glass-input w-full min-w-0 rounded-xl border border-white/80 bg-white/55 px-4 py-3.5 text-sm text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#A054A0]/50 focus:bg-white/90 focus:ring-4 focus:ring-[#A054A0]/10"
      />
    </div>
  );
}
function PhoneInput({
  phone,
  selectedCountry,
  countryOpen,
  setCountryOpen,
  countrySearch,
  setCountrySearch,
  phoneError,
  handlePhoneChange,
  handleCountrySelect,
  filteredCountries,
  countrySearchRef,
}) {
  return (
    <div className="min-w-0 space-y-2">
      <label
        htmlFor="requirement-phone"
        className="text-xs font-semibold text-slate-600"
      >
        Contact Number <span className="ml-1 text-[#A054A0]">*</span>
      </label>

      <div className="relative">
        <div
          className={`flex min-h-[52px] w-full min-w-0 overflow-visible rounded-xl border bg-white/55 backdrop-blur-xl transition-all duration-300 ${phoneError
            ? "border-red-400 ring-2 ring-red-500/10"
            : "border-white/80 focus-within:border-[#A054A0]/50 focus-within:ring-4 focus-within:ring-[#A054A0]/10"
            }`}
        >
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setCountryOpen((prev) => !prev)}
              aria-expanded={countryOpen}
              aria-haspopup="listbox"
              className="flex h-full min-h-[52px] items-center gap-1.5 rounded-l-xl border-r border-white/80 bg-white/35 px-3 text-[13px] font-medium text-slate-700 outline-none transition-all duration-200 hover:bg-white/75"
            >
              <span className="text-[18px] leading-none">
                {selectedCountry.flag}
              </span>
              <span className="whitespace-nowrap">{selectedCountry.dial}</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform duration-200 ${countryOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {countryOpen && (
              <div className="absolute left-0 top-[calc(100%+8px)] z-[300] w-[min(300px,calc(100vw-48px))] overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-2xl animate-[countryDrop_180ms_ease-out]">
                <div className="border-b border-slate-200/60 p-2.5">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50/80 px-3">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="shrink-0 text-slate-400"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m16 16 4 4" />
                    </svg>
                    <input
                      ref={countrySearchRef}
                      type="text"
                      value={countrySearch}
                      onChange={(event) => setCountrySearch(event.target.value)}
                      placeholder="Search country or code..."
                      className="h-9 min-w-0 flex-1 bg-transparent text-[12px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
                    />
                    {countrySearch && (
                      <button
                        type="button"
                        onClick={() => setCountrySearch("")}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-white"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-[250px] overflow-y-auto p-1.5">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => {
                      const isSelected =
                        country.code === selectedCountry.code &&
                        country.dial === selectedCountry.dial;

                      return (
                        <button
                          key={`${country.code}-${country.dial}`}
                          type="button"
                          onClick={() => handleCountrySelect(country)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${isSelected ? "bg-[#A054A0]/10" : "hover:bg-slate-50"
                            }`}
                        >
                          <span className="text-[20px] leading-none">
                            {country.flag}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[12px] font-medium text-slate-800">
                              {country.name}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {country.code}
                            </span>
                          </span>
                          <span className="text-[12px] font-medium text-slate-500">
                            {country.dial}
                          </span>
                          {isSelected && (
                            <span className="text-[#A054A0]">✓</span>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-8 text-center text-xs text-slate-400">
                      No country found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <input
            id="requirement-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="Enter phone number"
            required
            autoComplete="tel-national"
            className="min-w-0 flex-1 rounded-r-xl bg-transparent px-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>

        {phoneError && (
          <p className="mt-1 text-xs text-red-500">{phoneError}</p>
        )}
      </div>
    </div>
  );
}
function JourneyCard({ item, index }) {
  const shouldReduceMotion = useReducedMotion();

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 90,
      scale: shouldReduceMotion ? 1 : 0.96,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.9,
        delay: shouldReduceMotion ? 0 : index * 0.14,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.2,
        margin: "0px 0px -50px 0px",
      }}
      className="group relative h-full min-w-0"
    >
      <motion.div
        whileHover={
          shouldReduceMotion
            ? undefined
            : {
              y: -8,
              transition: {
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              },
            }
        }
        className="relative flex h-full min-h-[clamp(18rem,30vw,27rem)] flex-col overflow-hidden rounded-[clamp(1.25rem,2vw,2rem)] border border-slate-200/80 bg-white/85 p-[clamp(1.25rem,2.5vw,2.25rem)] shadow-[0_8px_40px_rgba(15,23,42,0.025)] backdrop-blur-xl transition-[border-color,box-shadow] duration-500 hover:border-[#A054A0]/40 hover:shadow-[0_20px_60px_rgba(160,84,160,0.12)]"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#A054A0]/[0.045] via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          aria-hidden="true"
        />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <motion.div
            whileHover={
              shouldReduceMotion
                ? undefined
                : {
                  rotate: 6,
                  scale: 1.08,
                }
            }
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            className="flex h-[clamp(2.75rem,4vw,3.75rem)] w-[clamp(2.75rem,4vw,3.75rem)] shrink-0 items-center justify-center rounded-[clamp(0.75rem,1.2vw,1.15rem)] border border-[#A054A0]/10 bg-[#A054A0]/[0.07] text-[#A054A0] transition-colors duration-500 group-hover:bg-[#A054A0] group-hover:text-white"
          >
            <item.icon className="h-[clamp(1.1rem,1.7vw,1.5rem)] w-[clamp(1.1rem,1.7vw,1.5rem)]" />
          </motion.div>

          <span className="pointer-events-none absolute -right-4 -top-8 select-none text-[clamp(7rem,10vw,10rem)] font-extrabold leading-none tracking-[-0.08em] text-slate-900/[0.04] transition-all duration-700 group-hover:scale-105 group-hover:text-[#A054A0]/[0.10]">
            0{index + 1}
          </span>
        </div>

        <div className="relative z-10 mt-auto pt-12 sm:pt-16">
          <h3 className="max-w-[18rem] pb-5 text-[clamp(1.6rem,2.2vw,2rem)] font-semibold leading-[1.12] tracking-[-0.045em] text-slate-900">
            {item.title}
          </h3>
          <p className="mt-4 max-w-[22rem] text-[clamp(0.8rem,1vw,0.95rem)] leading-[1.75] tracking-[-0.01em] text-slate-500">
            {item.desc}
          </p>
        </div>

        <div className="relative z-10 mt-8 flex items-center justify-between">
          <div className="h-px w-10 bg-slate-200 transition-all duration-500 group-hover:w-20 group-hover:bg-[#A054A0]" />
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            whileHover={{ opacity: 1, x: 0 }}
            className="text-[#A054A0]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </motion.div>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[#A054A0] to-[#DFA2DF] transition-transform duration-700 group-hover:scale-x-100"
          aria-hidden="true"
        />
      </motion.div>
    </motion.div>
  );
}

export default function HomePage() {
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(phoneCountries[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const countrySearchRef = useRef(null);
  const [requirementCity, setRequirementCity] = useState("");
  const [consentGranted, setConsentGranted] = useState(false);
  const [requirementType, setRequirementType] = useState("");
  const [requirementCityOptions, setRequirementCityOptions] = useState([]);
  const [locationData, setLocationData] = useState({
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
  });

  const filteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();
    if (!query) return phoneCountries;
    return phoneCountries.filter((country) =>
      `${country.name} ${country.code} ${country.dial}`
        .toLowerCase()
        .includes(query),
    );
  }, [countrySearch]);

  const validatePhone = useCallback(
    (value = phone, country = selectedCountry) => {
      const digits = String(value || "").replace(/\D/g, "");

      if (!digits) {
        setPhoneError("Phone number is required.");
        return false;
      }

      if (digits.length < country.min || digits.length > country.max) {
        setPhoneError(`Please enter a valid ${country.name} phone number.`);
        return false;
      }

      setPhoneError("");
      return true;
    },
    [phone, selectedCountry],
  );

  const handlePhoneChange = (event) => {
    const digits = event.target.value.replace(/\D/g, "");
    if (digits.length > selectedCountry.max) {
      return;
    }
    setPhone(digits);
    if (!digits || digits.length < selectedCountry.min) {
      setPhoneError("");
      return;
    }
    validatePhone(digits, selectedCountry);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setCountryOpen(false);
    setCountrySearch("");
    const digits = phone.replace(/\D/g, "").slice(0, country.max);
    setPhone(digits);
    if (!digits) {
      setPhoneError("");
      return;
    }
    if (digits.length >= country.min && digits.length <= country.max) {
      setPhoneError("");
    } else {
      setPhoneError(
        `Please enter ${country.min === country.max
          ? country.min
          : `${country.min}-${country.max}`
        } digits for ${country.name}.`,
      );
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const isPhoneValid = validatePhone(phone, selectedCountry);
    if (!isPhoneValid) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    let lastSearch = {};
    try {
      const savedSearch = localStorage.getItem(
        "anarock_last_searched_location",
      );

      if (savedSearch) {
        lastSearch = JSON.parse(savedSearch);
      }
    } catch (error) {
      console.error("Failed to parse last searched filters:", error);
    }
    let finalRequirementCity = "";
    if (requirementCity === "__NONE__") {
      finalRequirementCity = "";
    } else if (requirementCity.trim()) {
      finalRequirementCity = requirementCity.trim();
    } else if (lastSearch?.city) {
      finalRequirementCity = String(lastSearch.city).trim();
    }
    const finalRequirementType =
      requirementType.trim() || String(lastSearch?.propertyType || "").trim();

    const crmData = {
      ...data,

      ...(finalRequirementType
        ? {
          Requirement_Type: finalRequirementType,
        }
        : {}),
      ...(finalRequirementCity
        ? {
          Requirement_City: finalRequirementCity,
        }
        : {}),

      ...(locationData.street
        ? {
          Street: locationData.street,
        }
        : {}),

      ...(locationData.city
        ? {
          City: locationData.city,
        }
        : {}),

      ...(locationData.province
        ? {
          Province: locationData.province,
        }
        : {}),

      ...(locationData.postalCode
        ? {
          Postal_Code: locationData.postalCode,
        }
        : {}),

      ...(locationData.country
        ? {
          Country: locationData.country,
        }
        : {}),
      ...(finalRequirementType === "Managed Office/Co-working"
        ? {
          ...(data.requirementSeats
            ? {
              Requirement_Seats: Number(data.requirementSeats),
            }
            : {}),

          ...(data.requirementSeatPrice
            ? {
              Requirement_Seat_Price: Number(data.requirementSeatPrice),
            }
            : {}),
        }
        : {
          ...(data.requirementArea
            ? {
              Requirement_Area: Number(data.requirementArea),
            }
            : {}),

          ...(data.requirementRent
            ? {
              Requirement_Rent: Number(data.requirementRent),
            }
            : {}),
        }),
    };

    const payload = {
      ...crmData,

      fullPhone: `${selectedCountry.dial}${phone}`,
    };

    try {
      const response = await fetch("/api/lead2", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("Thank you! Our team will get in touch with you shortly.");

        e.target.reset();

        setPhone("");
        setRequirementCity("");
        setRequirementType("");

        setLocationData({
          street: "",
          city: "",
          province: "",
          postalCode: "",
          country: "",
        });
      } else {
        alert(
          result.message || "Failed to submit requirement. Please try again.",
        );
      }
    } catch (error) {
      console.error("Form submission error:", error);

      alert("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const locationRequestStartedRef = useRef(false);

  const requestLocationPermission = useCallback(() => {
    if (locationRequestStartedRef.current) {
      return;
    }

    locationRequestStartedRef.current = true;

    try {
      const savedLocation = sessionStorage.getItem("anarock_user_location");

      if (savedLocation) {
        const location = JSON.parse(savedLocation);

        setLocationData({
          street: location.area || "",
          city: location.city || "",
          province: location.state || "",
          postalCode: location.pincode || "",
          country: location.country || "",
        });

        window.dispatchEvent(new Event("anarock-location-updated"));

        return;
      }
    } catch (error) {
      console.warn("Failed to read saved location:", error);

      sessionStorage.removeItem("anarock_user_location");
    }

    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");

      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch("/api/location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              latitude,
              longitude,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data?.success || !data?.location) {
            console.warn("[LOCATION] Location unavailable:", data?.message);

            // IMPORTANT:
            // Do NOT clear city dropdown.
            // Do NOT set requirement city.
            // Do NOT set requirement type.
            return;
          }

          const location = {
            latitude,
            longitude,

            city: data.location.city || "",

            area: data.location.area || "",

            pincode: data.location.pincode || "",

            state: data.location.state || "",

            country: data.location.country || "",

            displayName: data.location.displayName || "",
          };

          sessionStorage.setItem(
            "anarock_user_location",
            JSON.stringify(location),
          );

          setLocationData({
            street: location.area || "",

            city: location.city || "",

            province: location.state || "",

            postalCode: location.pincode || "",

            country: location.country || "",
          });

          window.dispatchEvent(new Event("anarock-location-updated"));
        } catch (error) {
          console.warn(
            "Location capture unavailable:",
            error?.message || error,
          );
        }
      },

      (error) => {
        console.warn("Browser location unavailable:", error?.message || error);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      },
    );
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/api/cities");
        const data = await response.json();

        if (data.success && Array.isArray(data.cities)) {
          setRequirementCityOptions(data.cities);
        }
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      }
      try {
        const savedSearch = localStorage.getItem(
          "anarock_last_searched_location",
        );

        if (savedSearch) {
          const parsedSearch = JSON.parse(savedSearch);
          if (parsedSearch.city) {
            setRequirementCity(parsedSearch.city);
          }
          if (parsedSearch.propertyType) {
            setRequirementType(parsedSearch.propertyType);
          }
        }
      } catch (error) {
        console.error("Failed to load last searched filters:", error);
      }

      loadLocationData();
    };

    loadData();

    window.addEventListener("anarock-location-updated", loadLocationData);

    return () => {
      window.removeEventListener("anarock-location-updated", loadLocationData);
    };
  }, []);

  function loadLocationData() {
    try {
      const savedLocation = sessionStorage.getItem("anarock_user_location");
      if (!savedLocation) {
        setLocationData({
          street: "",
          city: "",
          province: "",
          postalCode: "",
          country: "",
        });

        return;
      }

      const location = JSON.parse(savedLocation);

      setLocationData({
        street: location.area || "",
        city: location.city || "",
        province: location.state || "",
        postalCode: location.pincode || "",
        country: location.country || "",
      });
    } catch (error) {
      console.error("Failed to load location:", error);

      setLocationData({
        street: "",
        city: "",
        province: "",
        postalCode: "",
        country: "",
      });
    }
  }

  return (
    <>
      <div className="premium-page relative w-full overflow-hidden bg-gradient-to-tr from-[#A054A0]/10 via-amber-200/5 to-purple-100/30 font-sans text-slate-800 selection:bg-[#A054A0] selection:text-white">
        <HeroSection
          locationData={locationData}
        />

        {/* POPULAR CITIES */}
        <section className="relative overflow-hidden py-20 sm:py-24 md:py-28 lg:py-24">
          {/* Background Decorations */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#A054A0]/[0.06] blur-3xl" />
            <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#A054A0]/[0.05] blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[1920px] px-[clamp(1rem,2.4vw,4rem)]">

            {/* SECTION HEADER */}
            <div className="mb-12 flex flex-col gap-6 sm:mb-16 lg:mb-20 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h2 className="text-[clamp(1.2rem,4.2vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.055em] text-slate-900">
                  Explore{" "}
                  <span className="bg-gradient-to-r from-[#A054A0] via-[#B14DB1] to-[#7A377A] bg-clip-text text-transparent">
                    Popular Cities
                  </span>
                </h2>
              </div>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base lg:text-lg">
                Discover premium commercial real estate opportunities across
                India&apos;s leading business destinations.
              </p>
            </div>

            {/* CITIES */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
              {popularCities.map((city) => (
                <Link
                  key={city.name}
                  href={`/kyc?city=${encodeURIComponent(city.name)}`}
                  className="
            group relative isolate overflow-hidden

            /* Mobile */
            w-full

            /* Small screens */
            sm:w-[calc(50%-0.625rem)]

            /* Tablet */
            md:w-[calc(33.333%-0.9rem)]

            /* Desktop - 5 per row */
            lg:w-[calc(20%-1rem)]

            rounded-[1.5rem]
            border border-[#A054A0]/15
            bg-white
            shadow-[0_10px_35px_rgba(86,42,91,0.05)]

            transition-all
            duration-500
            ease-out

            hover:-translate-y-2
            hover:border-[#A054A0]/35
            hover:shadow-[0_24px_65px_rgba(86,42,91,0.14)]

            sm:rounded-[1.75rem]
          "
                >
                  {/* IMAGE */}
                  <div className="relative aspect-square overflow-hidden bg-[#A054A0]/5">
                    <img
                      src={city.url}
                      alt={`${city.name} commercial real estate`}
                      decoding="async"
                      className="
                h-full
                w-full
                object-cover
                object-top
                transition-transform
                duration-700
                ease-out
                group-hover:scale-110
              "
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/5 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <div className="mb-4 h-px w-8 bg-[#DCA9DD] transition-all duration-500 group-hover:w-16" />
                      <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                        {city.name}
                      </h3>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/65 sm:text-[11px]">
                          Explore properties
                        </p>

                        <ArrowRight
                          className="
                    h-4
                    w-4
                    shrink-0
                    text-white/70
                    transition-all
                    duration-300
                    group-hover:translate-x-1
                    group-hover:text-white
                  "
                        />
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACCENT */}
                  <div className="h-1 w-0 bg-[#A054A0] transition-all duration-500 group-hover:w-full" />
                </Link>
              ))}
            </div>
          </div>
        </section>


        {/* MARKET AT A GLANCE */}
        <section
          id="market-glance"
          className="relative flex w-full items-center border-t border-slate-200/80"
        >
          <div className="relative z-10 mx-auto w-full max-w-[1920px] px-20 py-14">
            <div className="mb-12 text-left md:mb-16">
              <h2 className="text-[clamp(1.2rem,4.2vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.055em] text-slate-900">
                Market at a {"  "}
                <span className="bg-gradient-to-r from-[#A054A0] via-[#B14DB1] to-[#7A377A] bg-clip-text text-transparent">
                  Glance
                </span>
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base md:text-lg">
                The trusted partner for India&apos;s most ambitious enterprises.
              </p>
            </div>
            <MarketStats />
          </div>
        </section>

        {/* WHY CHOOSE ANAROCK */}
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[clamp(1.2rem,4.2vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.055em] text-slate-900">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-[#A054A0] via-[#B14DB1] to-[#7A377A] bg-clip-text text-transparent">
                Anarock
              </span>
            </h2>
            <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
              Your trusted partner in real estate, combining deep industry
              expertise with market data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col justify-between p-6 bg-white/80 rounded-2xl border border-slate-200/80 shadow-sm backdrop-blur-xl transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-[#A054A0]/40 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#A054A0]/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-xl bg-[#A054A0]/10 text-[#A054A0] flex items-center justify-center mb-5 transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-[#A054A0] group-hover:text-white">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-[#A054A0] transition-colors duration-200">
                      {feature.title}
                    </h3>

                    <p className="text-slate-600 text-sm leading-relaxed flex-grow">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CLIENT JOURNEY */}
        <section
          id="client-journey"
          className="relative isolate overflow-hidden py-8 sm:py-10 lg:py-14"
        >
          <div className="relative mx-auto w-full max-w-[1800px] px-[clamp(1rem,3vw,4rem)]">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 1.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mx-auto mb-[clamp(3rem,7vw,6rem)] max-w-3xl text-center"
            >
              <h2 className="text-[clamp(1.2rem,4.2vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.055em] text-slate-900">
                The Client {"  "}
                <span className="bg-gradient-to-r from-[#A054A0] via-[#B14DB1] to-[#7A377A] bg-clip-text text-transparent">
                  Journey
                </span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-[clamp(0.875rem,1.3vw,1.125rem)] leading-[1.8] tracking-[-0.01em] text-slate-500">
                A seamless, insight-led process to help you find, evaluate, and
                secure the right commercial space.
              </p>
            </motion.div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-[#A054A0]/20 to-transparent lg:block"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-4 xl:gap-5">
                {journey.map((item, index) => (
                  <JourneyCard key={item.title} item={item} index={index} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* POST A REQUIREMENT */}
        <section
          id="enquiry"
          className="relative isolate overflow-hidden py-[clamp(4rem,8vw,9rem)]"
        >
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 opacity-[0.035]" />
            <motion.div
              animate={{
                x: [0, 30, 0],
                y: [0, -25, 0],
              }}
              transition={{
                duration: 16,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -left-[15%] top-[5%] h-[clamp(18rem,35vw,40rem)] w-[clamp(18rem,35vw,40rem)] rounded-full blur-[120px]"
            />
            <motion.div
              animate={{
                x: [0, -30, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-[15%] right-[-10%] h-[clamp(18rem,35vw,40rem)] w-[clamp(18rem,35vw,40rem)] rounded-full  blur-[120px]"
            />
          </div>

          <div className="relative mx-auto w-full max-w-[1800px] px-[clamp(1rem,4vw,5rem)]">
            <div className="grid grid-cols-1 items-start gap-[clamp(2.5rem,6vw,8rem)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-[clamp(3rem,6vw,8rem)]">
              <motion.div
                initial={{ opacity: 0, x: -45 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex flex-col lg:sticky lg:top-28"
              >
                <h2 className="text-[clamp(1.2rem,4.2vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.055em] text-slate-900">
                  Find your {"  "}
                  <span className="bg-gradient-to-r from-[#A054A0] via-[#B14DB1] to-[#7A377A] bg-clip-text text-transparent">
                    Perfect Space
                  </span>
                </h2>

                <p className="mt-7 max-w-[32rem] text-[clamp(0.9rem,1.3vw,1.125rem)] leading-[1.8] tracking-[-0.01em] text-slate-500">
                  Tell us what you&apos;re looking for, and our experts will
                  help you discover the right commercial real estate
                  opportunity.
                </p>

                <div className="mt-12 hidden h-px w-full max-w-[22rem] bg-gradient-to-r from-[#A054A0]/30 to-transparent lg:block" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 45, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative min-w-0"
              >
                <div className="pointer-events-none absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-[#A054A0]/10 via-transparent to-[#DFA2DF]/10 blur-2xl" />

                <div className="relative overflow-hidden rounded-[clamp(1.5rem,3vw,2.5rem)] border border-white/80 bg-white/[0.62] p-[clamp(1.25rem,3vw,3rem)] shadow-[0_25px_100px_rgba(80,40,100,0.07)] backdrop-blur-[24px] backdrop-saturate-150">
                  <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-[#A054A0]/[0.06]" />

                  <div className="relative z-10 mb-8 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                        Tell us what you need
                      </h3>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#A054A0]/15 bg-[#A054A0]/[0.07] text-[#A054A0]">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M4 4h16v16H4z" />
                        <path d="M8 9h8M8 13h6" />
                      </svg>
                    </div>
                  </div>

                  <form
                    onSubmit={handleFormSubmit}
                    className="relative z-10 space-y-6"
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <GlassField
                        label="Full Name"
                        name="name"
                        placeholder="Enter your full name"
                        required
                      />
                      <PhoneInput
                        phone={phone}
                        selectedCountry={selectedCountry}
                        countryOpen={countryOpen}
                        setCountryOpen={setCountryOpen}
                        countrySearch={countrySearch}
                        setCountrySearch={setCountrySearch}
                        phoneError={phoneError}
                        handlePhoneChange={handlePhoneChange}
                        handleCountrySelect={handleCountrySelect}
                        filteredCountries={filteredCountries}
                        countrySearchRef={countrySearchRef}
                      />
                      <GlassField
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                      />
                      <GlassField
                        label="Company Name"
                        name="company"
                        placeholder="Enter your company name"
                      />

                      {/* REQUIREMENT TYPE */}

                      <div className="space-y-2">
                        <label
                          htmlFor="requirementType"
                          className="text-xs font-semibold text-slate-600"
                        >
                          Requirement Type{" "}
                        </label>

                        <select
                          id="requirementType"
                          name="requirementType"
                          value={requirementType}
                          onChange={(e) => setRequirementType(e.target.value)}
                          className="glass-input w-full appearance-none rounded-xl border border-white/80 bg-white/55 px-4 py-3.5 text-sm text-slate-800 outline-none transition-all duration-300 focus:border-[#A054A0]/50 focus:bg-white/90 focus:ring-4 focus:ring-[#A054A0]/10"
                        >
                          <option value="" disabled>
                            Select requirement type
                          </option>

                          <option value="Conventional">Conventional</option>

                          <option value="Managed Office/Co-working">
                            Managed Office/Co-working
                          </option>

                          <option value="Consulting">Consulting</option>

                          <option value="Others">Others</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="requirementCity"
                          className="text-xs font-semibold text-slate-600"
                        >
                          Requirement City
                        </label>

                        <select
                          id="requirementCity"
                          name="requirementCity"
                          value={requirementCity}
                          onChange={(e) => setRequirementCity(e.target.value)}
                          className="glass-input w-full appearance-none rounded-xl border border-white/80 bg-white/55 px-4 py-3.5 text-sm text-slate-800 outline-none transition-all duration-300 focus:border-[#A054A0]/50 focus:bg-white/90 focus:ring-4 focus:ring-[#A054A0]/10"
                        >
                          <option value="">Select City</option>

                          {requirementCityOptions.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}

                          <option value="__NONE__">
                            - None of the above -
                          </option>
                        </select>
                      </div>

                      {requirementType === "Managed Office/Co-working" ? (
                        <>
                          <GlassField
                            label="Required Seats"
                            name="requirementSeats"
                            type="number"
                            placeholder="Enter required seat count"
                          />

                          <GlassField
                            label="Per Seat Budget"
                            name="requirementSeatPrice"
                            type="number"
                            placeholder="Enter budget per seat/month"
                          />
                        </>
                      ) : (
                        <>
                          <GlassField
                            label="Required Area"
                            name="requirementArea"
                            type="number"
                            placeholder="Enter required area in sq.ft"
                          />

                          <GlassField
                            label="Budget"
                            name="requirementRent"
                            type="number"
                            placeholder="Enter rent budget per sq.ft/month"
                          />
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="message"
                        className="text-xs font-semibold text-slate-600"
                      >
                        Describe your Requirement
                      </label>

                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        placeholder="Tell us more about your requirements..."
                        className="glass-input w-full resize-none rounded-xl border border-white/80 bg-white/55 px-4 py-3.5 text-sm text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#A054A0]/50 focus:bg-white/90 focus:ring-4 focus:ring-[#A054A0]/10"
                      />
                    </div>

                    <div className="flex flex-col gap-5 border-t border-slate-200/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <p className="max-w-[22rem] text-center text-[11px] leading-relaxed text-slate-400 sm:text-left">
                        By submitting this form, you agree to be contacted by
                        our team regarding your requirement.
                      </p>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ y: -3, scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="group inline-flex w-full shrink-0 items-center justify-center gap-3 rounded-full bg-slate-900 px-6 py-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition-all duration-300 hover:bg-[#A054A0] hover:shadow-[0_12px_35px_rgba(160,84,160,0.25)] disabled:opacity-50 sm:w-auto"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Requirement"}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================= ABOUT US ================= */}
        <section
          id="aboutus"
          className="relative isolate overflow-hidden py-20 sm:py-24 md:py-20 lg:py-20"
        >
          <div className="relative z-10 mx-auto w-full max-w-[1920px] px-[clamp(1rem,4vw,5rem)]">
            <div className="mb-14 lg:mb-20 text-center">
              <h2 className="text-[clamp(1.2rem,4.2vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.055em] text-slate-900">
                About {"  "}
                <span className="bg-gradient-to-r from-[#A054A0] via-[#B14DB1] to-[#7A377A] bg-clip-text text-transparent">
                  Anarock
                </span>
              </h2>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 xl:gap-32">
              {/* Left Content */}
              <div className="flex flex-col justify-between">
                <div>
                  <p className="max-w-3xl text-xl font-medium leading-relaxed tracking-tight text-slate-800 sm:text-2xl md:text-3xl">
                    We empower businesses to make confident real estate
                    decisions through intelligence, expertise, and
                    technology-led solutions.
                  </p>

                  <p className="mt-7 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base sm:leading-8">
                    From discovering the right location to evaluating commercial
                    opportunities, ANAROCK combines market insights, strategic
                    advisory, and execution to simplify every stage of your real
                    estate journey.
                  </p>
                </div>

                {/* Single CTA */}
                <div className="mt-10 sm:mt-14">
                  <Link
                    href="https://www.anarock.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-5 rounded-full bg-[#A054A0] px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(160,84,160,0.25)] transition-all duration-500 hover:-translate-y-1 hover:bg-[#873D87] hover:shadow-[0_18px_45px_rgba(160,84,160,0.35)] sm:px-7 sm:py-5"
                  >
                    <span>Know More</span>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 group-hover:rotate-[-45deg]">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              </div>

              {/* Right Visual / Philosophy Card */}
              <div className="relative">
                <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-[#A054A0]/15 bg-[#FCFAFF] p-6 shadow-[0_25px_100px_rgba(160,84,160,0.10)] sm:min-h-[480px] sm:p-8 md:p-10">
                  {/* Card Glow */}
                  <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#A054A0]/15 blur-[90px]" />

                  {/* Decorative Circle */}
                  <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full border border-[#A054A0]/10" />
                  <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full border border-[#A054A0]/10" />

                  <div className="relative z-10 flex h-full min-h-[368px] flex-col justify-between">
                    {/* Card Top */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A054A0] sm:text-xs">
                        Our Perspective
                      </span>

                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#A054A0]/20 bg-white text-[#A054A0]">
                        <Sparkles className="h-4 w-4" />
                      </span>
                    </div>

                    {/* Large Statement */}
                    <div className="py-12">
                      <p className="text-3xl font-semibold leading-[1.1] tracking-[-0.04em] text-slate-900 sm:text-4xl md:text-5xl">
                        Intelligence
                        <br />
                        Expertise
                        <br />
                        Results
                      </p>
                    </div>

                    {/* Card Bottom */}
                    <div className="flex items-end justify-between gap-5 border-t border-slate-200/80 pt-5">
                      <p className="max-w-xs text-xs leading-relaxed text-slate-500 sm:text-sm">
                        Helping businesses navigate complex real estate
                        decisions with clarity and confidence.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div >

      <CookieConsent
        onConsentGiven={() => {
          setConsentGranted(true);
          requestLocationPermission();
        }}
      />
    </>
  );
}
