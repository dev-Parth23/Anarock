"use client";

import Link from "next/link";
import { usePreferences, setPreferences } from "@/lib/preferences";
import {
  ChevronDown,
  Menu,
  X,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Search,
  Check,
  MapPin,
  Heart,
  Calendar as CalendarIcon,
} from "lucide-react";

import { useWishlist } from "@/lib/wishlist";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CURRENCY_CONFIG = {
  INR: { symbol: "₹", rate: 1, label: "₹  INR" },
  AED: { symbol: "د.إ", rate: 0.044, label: "د.إ  AED" },
  USD: { symbol: "$", rate: 0.012, label: "$  USD" },
  EUR: { symbol: "€", rate: 0.011, label: "€  EUR" },
  SGD: { symbol: "S$", rate: 0.016, label: "S$ SGD" },
};

const UNIT_FACTORS = {
  sqft: { label: "sq.ft", factor: 1 },
  sqm: { label: "sq.m", factor: 0.092903 },
};

const currencies = [
  ["INR", "₹  INR"],
  ["AED", "د.إ  AED"],
  ["USD", "$  USD"],
  ["EUR", "€  EUR"],
  ["SGD", "S$ SGD"],
];

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
  {
    name: "Australia",
    code: "AU",
    dial: "+61",
    flag: "🇦🇺",
    min: 9,
    max: 9,
  },
  {
    name: "Singapore",
    code: "SG",
    dial: "+65",
    flag: "🇸🇬",
    min: 8,
    max: 8,
  },
  {
    name: "Germany",
    code: "DE",
    dial: "+49",
    flag: "🇩🇪",
    min: 10,
    max: 11,
  },
  {
    name: "France",
    code: "FR",
    dial: "+33",
    flag: "🇫🇷",
    min: 9,
    max: 9,
  },
  {
    name: "Italy",
    code: "IT",
    dial: "+39",
    flag: "🇮🇹",
    min: 9,
    max: 10,
  },
  {
    name: "Spain",
    code: "ES",
    dial: "+34",
    flag: "🇪🇸",
    min: 9,
    max: 9,
  },
  {
    name: "Netherlands",
    code: "NL",
    dial: "+31",
    flag: "🇳🇱",
    min: 9,
    max: 9,
  },
  {
    name: "Switzerland",
    code: "CH",
    dial: "+41",
    flag: "🇨🇭",
    min: 9,
    max: 9,
  },
  {
    name: "Ireland",
    code: "IE",
    dial: "+353",
    flag: "🇮🇪",
    min: 9,
    max: 9,
  },
  {
    name: "New Zealand",
    code: "NZ",
    dial: "+64",
    flag: "🇳🇿",
    min: 8,
    max: 10,
  },
  {
    name: "Japan",
    code: "JP",
    dial: "+81",
    flag: "🇯🇵",
    min: 10,
    max: 10,
  },
  {
    name: "South Korea",
    code: "KR",
    dial: "+82",
    flag: "🇰🇷",
    min: 9,
    max: 10,
  },
  {
    name: "China",
    code: "CN",
    dial: "+86",
    flag: "🇨🇳",
    min: 11,
    max: 11,
  },
  {
    name: "Hong Kong",
    code: "HK",
    dial: "+852",
    flag: "🇭🇰",
    min: 8,
    max: 8,
  },
  {
    name: "Malaysia",
    code: "MY",
    dial: "+60",
    flag: "🇲🇾",
    min: 9,
    max: 10,
  },
  {
    name: "Thailand",
    code: "TH",
    dial: "+66",
    flag: "🇹🇭",
    min: 9,
    max: 9,
  },
  {
    name: "Israel",
    code: "IL",
    dial: "+972",
    flag: "🇮🇱",
    min: 9,
    max: 9,
  },
  {
    name: "Indonesia",
    code: "ID",
    dial: "+62",
    flag: "🇮🇩",
    min: 9,
    max: 12,
  },
  {
    name: "Philippines",
    code: "PH",
    dial: "+63",
    flag: "🇵🇭",
    min: 10,
    max: 10,
  },
  {
    name: "Vietnam",
    code: "VN",
    dial: "+84",
    flag: "🇻🇳",
    min: 9,
    max: 10,
  },
  {
    name: "South Africa",
    code: "ZA",
    dial: "+27",
    flag: "🇿🇦",
    min: 9,
    max: 9,
  },
  {
    name: "Saudi Arabia",
    code: "SA",
    dial: "+966",
    flag: "🇸🇦",
    min: 9,
    max: 9,
  },
  {
    name: "Qatar",
    code: "QA",
    dial: "+974",
    flag: "🇶🇦",
    min: 8,
    max: 8,
  },
  {
    name: "Kuwait",
    code: "KW",
    dial: "+965",
    flag: "🇰🇼",
    min: 8,
    max: 8,
  },
  {
    name: "Oman",
    code: "OM",
    dial: "+968",
    flag: "🇴🇲",
    min: 8,
    max: 8,
  },
  {
    name: "Bahrain",
    code: "BH",
    dial: "+973",
    flag: "🇧🇭",
    min: 8,
    max: 8,
  },
  {
    name: "Pakistan",
    code: "PK",
    dial: "+92",
    flag: "🇵🇰",
    min: 10,
    max: 10,
  },
  {
    name: "Bangladesh",
    code: "BD",
    dial: "+880",
    flag: "🇧🇩",
    min: 10,
    max: 10,
  },
  {
    name: "Nepal",
    code: "NP",
    dial: "+977",
    flag: "🇳🇵",
    min: 10,
    max: 10,
  },
  {
    name: "Sri Lanka",
    code: "LK",
    dial: "+94",
    flag: "🇱🇰",
    min: 9,
    max: 9,
  },
  {
    name: "Russia",
    code: "RU",
    dial: "+7",
    flag: "🇷🇺",
    min: 10,
    max: 10,
  },
  {
    name: "Brazil",
    code: "BR",
    dial: "+55",
    flag: "🇧🇷",
    min: 10,
    max: 11,
  },
  {
    name: "Mexico",
    code: "MX",
    dial: "+52",
    flag: "🇲🇽",
    min: 10,
    max: 10,
  },
  {
    name: "Argentina",
    code: "AR",
    dial: "+54",
    flag: "🇦🇷",
    min: 10,
    max: 11,
  },
  {
    name: "Turkey",
    code: "TR",
    dial: "+90",
    flag: "🇹🇷",
    min: 10,
    max: 10,
  },
];

const navigation = [
  { label: "Properties", href: "/properties", type: "link" },
  { label: "Services & Tools", href: "/services&tools", type: "link" },
  { label: "About Us", href: "/#aboutus", type: "link" },
  { label: "Post a Requirement", href: "/#enquiry", type: "link" },
  {
    label: "List your Property",
    href: "/list-your-property",
    type: "link",
  },
];

export default function Navbar() {
  const { count: wishlistCount } = useWishlist();
  const [date, setDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const { currency: currencyCode, unit } = usePreferences();

  const currencyLabel = CURRENCY_CONFIG[currencyCode]?.label || "₹  INR";

  const unitLabel = unit === "sqm" ? "sq.m" : "sq.ft";
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryStatus, setEnquiryStatus] = useState("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  const [selectedCountry, setSelectedCountry] = useState(phoneCountries[0]);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const countrySearchRef = useRef(null);
  const countryButtonRef = useRef(null);
  const phoneInputRef = useRef(null);

  const [countryMenuPosition, setCountryMenuPosition] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [manualCity, setManualCity] = useState("");
  const [locationDenied, setLocationDenied] = useState(false);
  const thankYouTimerRef = useRef(null);

  const getCurrencySymbol = () => CURRENCY_CONFIG[currencyCode]?.symbol || "₹";

  const formatCurrencyValue = (baseINR) => {
    const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.INR;
    const converted = baseINR * config.rate;
    return `${config.symbol} ${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const formatAreaValue = (baseSqFt) => {
    const config = UNIT_FACTORS[unit] || UNIT_FACTORS.sqft;
    const converted = Math.round(baseSqFt * config.factor);

    return `${converted.toLocaleString()} ${config.label}`;
  };

  const handleCurrencySelect = (code) => {
    setCurrencyOpen(false);

    setPreferences({
      currency: code,
      unit,
    });
  };

  const handleUnitSelect = (selectedUnit) => {
    const normalizedUnit = selectedUnit === "sq.m" ? "sqm" : "sqft";

    setPreferences({
      currency: currencyCode,
      unit: normalizedUnit,
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const readUserLocation = () => {
      try {
        const savedLocation = sessionStorage.getItem("anarock_user_location");

        const denied =
          sessionStorage.getItem("anarock_location_denied") === "true";

        setLocationDenied(denied);

        if (!savedLocation) {
          setUserLocation(null);
          return;
        }

        const parsedLocation = JSON.parse(savedLocation);

        setUserLocation(
          parsedLocation && typeof parsedLocation === "object"
            ? parsedLocation
            : null,
        );
      } catch (error) {
        console.warn("Unable to read saved user location:", error);
        setUserLocation(null);
      }
    };

    readUserLocation();

    const locationInterval = window.setInterval(readUserLocation, 1000);

    window.addEventListener("anarock-location-updated", readUserLocation);

    window.addEventListener("storage", readUserLocation);

    return () => {
      window.clearInterval(locationInterval);

      window.removeEventListener("anarock-location-updated", readUserLocation);

      window.removeEventListener("storage", readUserLocation);
    };
  }, []);

  const closeMenu = () => {
    setMobileOpen(false);
    setCurrencyOpen(false);
  };

  const openEnquiry = () => {
    setSubmitError("");
    setPhoneError("");
    setEnquiryStatus("form");
    setEnquiryOpen(true);
  };

  const closeEnquiry = () => {
    if (thankYouTimerRef.current) {
      clearTimeout(thankYouTimerRef.current);
      thankYouTimerRef.current = null;
    }

    setEnquiryOpen(false);
    setEnquiryStatus("form");
    setSubmitError("");
    setPhoneError("");
    setPhone("");
    setSelectedCountry(phoneCountries[0]);
    setCountryOpen(false);
    setCountrySearch("");
    setIsSubmitting(false);
    setCalendarOpen(false);
    setDate(null);
    setManualCity("");
    setLocationDenied(false);
  };

  const handleScrollNavigation = (href) => {
    closeMenu();

    const targetId = href?.replace("#", "");

    if (!targetId) return;

    setTimeout(() => {
      const section = document.getElementById(targetId);

      if (!section) {
        console.warn(`Scroll target not found: #${targetId}`);
        return;
      }

      const header = document.querySelector("header");

      const headerHeight = header?.offsetHeight || 80;

      const sectionTop =
        section.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: Math.max(0, sectionTop),
        behavior: "smooth",
      });
    }, 100);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10 || currentScrollY < lastScrollYRef.current) {
        setIsVisible(true);
      } else if (
        currentScrollY > lastScrollYRef.current &&
        currentScrollY > 70
      ) {
        setIsVisible(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1200) {
        setMobileOpen(false);
        setCurrencyOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (mobileOpen || enquiryOpen || calendarOpen) {
      document.body.style.overflow = "hidden";

      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";

      document.body.style.touchAction = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [mobileOpen, enquiryOpen, calendarOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      setMobileOpen(false);
      setCurrencyOpen(false);
      setCountryOpen(false);
      setCalendarOpen(false);

      if (enquiryOpen) {
        closeEnquiry();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enquiryOpen]);

  useEffect(() => {
    return () => {
      if (thankYouTimerRef.current) {
        clearTimeout(thankYouTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!countryOpen) return;

    const timer = setTimeout(() => {
      countrySearchRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [countryOpen]);

  const normalizePhoneInput = (rawValue, currentCountry = selectedCountry) => {
    const raw = String(rawValue || "").trim();

    if (!raw) {
      return {
        country: currentCountry,
        digits: "",
        countryDetected: false,
      };
    }

    const allDigits = raw.replace(/\D/g, "");

    const sortedCountries = [...phoneCountries].sort(
      (a, b) => b.dial.length - a.dial.length,
    );

    let detectedCountry = currentCountry;

    let localDigits = allDigits;

    let countryDetected = false;

    const hasPlusSign = raw.startsWith("+");

    const matchedCountry = sortedCountries.find((country) => {
      const dialDigits = country.dial.replace("+", "");

      if (hasPlusSign) {
        return allDigits.startsWith(dialDigits);
      }

      return (
        allDigits.startsWith(dialDigits) &&
        allDigits.length > dialDigits.length &&
        allDigits.length - dialDigits.length >= country.min
      );
    });

    if (matchedCountry) {
      detectedCountry = matchedCountry;

      const dialDigits = matchedCountry.dial.replace("+", "");

      localDigits = allDigits.slice(dialDigits.length);

      countryDetected = true;
    }

    localDigits = localDigits.replace(/^0+/, "");

    if (localDigits.length > detectedCountry.max) {
      localDigits = localDigits.slice(0, detectedCountry.max);
    }

    return {
      country: detectedCountry,
      digits: localDigits,
      countryDetected,
    };
  };

  const validatePhone = (value = phone, country = selectedCountry) => {
    const digits = String(value || "").replace(/\D/g, "");

    if (!digits) {
      setPhoneError("Phone number is required.");
      return false;
    }

    if (digits.length < country.min) {
      if (country.min === country.max) {
        setPhoneError(`Phone number must be exactly ${country.min} digits.`);
      } else {
        setPhoneError(
          `Phone number must be between ${country.min} and ${country.max} digits.`,
        );
      }

      return false;
    }

    if (digits.length > country.max) {
      setPhoneError(
        `Phone number cannot exceed ${country.max} digits for ${country.name}.`,
      );

      return false;
    }

    setPhoneError("");

    return true;
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setCountryOpen(false);
    setCountrySearch("");

    const digits = phone.replace(/\D/g, "");

    setPhone(digits);

    if (!digits) {
      setPhoneError("");
      return;
    }

    validatePhone(digits, country);
  };

  const handlePhoneInputChange = (rawValue) => {
    const { country, digits, countryDetected } = normalizePhoneInput(
      rawValue,
      selectedCountry,
    );

    if (countryDetected && country.code !== selectedCountry.code) {
      setSelectedCountry(country);
    }

    setPhone(digits);

    if (!digits) {
      setPhoneError("");
      return;
    }

    validatePhone(digits, country);
  };

  const filteredCountries = phoneCountries.filter((country) => {
    const search = countrySearch.trim().toLowerCase();

    if (!search) return true;

    return (
      country.name.toLowerCase().includes(search) ||
      country.code.toLowerCase().includes(search) ||
      country.dial.includes(search)
    );
  });

  const resolveCityState = async (cityName) => {
    const normalizedCity = String(cityName || "").trim();

    if (!normalizedCity) {
      return {
        city: "",
        state: "",
        country: "India",
      };
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&country=India&city=${encodeURIComponent(
          normalizedCity,
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Location lookup failed: ${response.status}`);
      }

      const results = await response.json();
      const result = results?.[0];

      if (!result) {
        return {
          city: normalizedCity,
          state: "",
          country: "India",
        };
      }

      const address = result.address || {};

      return {
        city:
          address.city ||
          address.town ||
          address.municipality ||
          normalizedCity,

        state: address.state || address.state_district || "",

        country: address.country || "India",
      };
    } catch (error) {
      console.warn("Unable to resolve searched city state:", error);

      return {
        city: normalizedCity,
        state: "",
        country: "India",
      };
    }
  };

  const mapLocationToLeadOwnerTeam = (city, state) => {
    const cityLower = String(city || "")
      .trim()
      .toLowerCase();

    const stateLower = String(state || "")
      .trim()
      .toLowerCase();

    if (cityLower.includes("bengaluru") || cityLower.includes("bangalore")) {
      return "Bengaluru";
    }

    if (cityLower.includes("chennai")) {
      return "Chennai";
    }

    if (cityLower.includes("hyderabad")) {
      return "Hyderabad";
    }

    if (cityLower.includes("kolkata")) {
      return "Kolkata";
    }

    if (cityLower.includes("pune")) {
      return "Pune";
    }

    if (
      cityLower.includes("mumbai") ||
      cityLower.includes("ahmedabad") ||
      cityLower.includes("surat") ||
      cityLower.includes("jaipur") ||
      stateLower.includes("maharashtra") ||
      stateLower.includes("gujarat") ||
      stateLower.includes("goa") ||
      stateLower.includes("rajasthan")
    ) {
      return "West";
    }

    if (
      cityLower.includes("agra") ||
      cityLower.includes("delhi") ||
      cityLower.includes("noida") ||
      cityLower.includes("gurugram") ||
      cityLower.includes("gurgaon") ||
      cityLower.includes("chandigarh") ||
      stateLower.includes("delhi") ||
      stateLower.includes("haryana") ||
      stateLower.includes("punjab") ||
      stateLower.includes("uttar pradesh") ||
      stateLower.includes("uttarakhand")
    ) {
      return "North";
    }

    return "Platform";
  };

  const handleEnquirySubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const form = event.currentTarget;
    const cleanPhone = phone.replace(/\D/g, "");
    const isPhoneValid = validatePhone(cleanPhone, selectedCountry);

    if (!form.checkValidity() || !isPhoneValid) {
      form.reportValidity();
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const formData = new FormData(form);

    let city = "";
    let micromarket = "";
    let state = "";
    let country = "";
    let area = "";
    let pincode = "";
    let latitude = null;
    let longitude = null;

    let searchCity = "";
    let searchMicromarket = "";
    let hasActiveSearch = false;

    try {
      const searchParams = new URLSearchParams(window.location.search);

      const urlCity = String(searchParams.get("city") || "").trim();

      const urlMicromarket = String(
        searchParams.get("micromarket") || "",
      ).trim();

      if (urlCity) {
        searchCity = urlCity;
        hasActiveSearch = true;
      }

      if (urlMicromarket) {
        searchMicromarket = urlMicromarket;
      }
    } catch (error) {
      console.error("Unable to read active search parameters:", error);
    }

    if (!searchCity) {
      try {
        const lastSearched = localStorage.getItem(
          "anarock_last_searched_location",
        );

        if (lastSearched) {
          const parsedSearch = JSON.parse(lastSearched);

          const storedCity = String(parsedSearch?.city || "").trim();

          if (storedCity) {
            searchCity = storedCity;
            hasActiveSearch = true;

            if (!searchMicromarket) {
              searchMicromarket = String(
                parsedSearch?.micromarket || "",
              ).trim();
            }
          }
        }
      } catch (error) {
        console.error("Unable to read last searched location:", error);
      }
    }

    try {
      const savedLocation = sessionStorage.getItem("anarock_user_location");

      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);

        city = String(parsed?.city || "").trim();
        state = String(parsed?.state || "").trim();
        country = String(parsed?.country || "").trim();
        area = String(parsed?.area || "").trim();
        pincode = String(parsed?.pincode || "").trim();

        latitude = parsed?.latitude ?? null;
        longitude = parsed?.longitude ?? null;
      }
    } catch (error) {
      console.error("Unable to read saved user location:", error);
    }

    if (hasActiveSearch && searchCity) {
      city = searchCity;
      micromarket = searchMicromarket || "";
      area = micromarket;
      state = "";
      country = "India";
      pincode = "";
      latitude = null;
      longitude = null;
    } else if (!city) {
      city = String(manualCity || "").trim();
    }

    const name = String(formData.get("name") || "").trim();
    const formCity = String(formData.get("city") || "").trim();

    if (!hasActiveSearch && !city && formCity) {
      city = formCity;
    }

    const email = String(formData.get("email") || "").trim();
    const company = String(formData.get("company") || "").trim();
    const budget = String(formData.get("budget") || "").trim();
    const areaRequirement = String(formData.get("area") || "").trim();
    const contactDate = date ? format(date, "yyyy-MM-dd") : null;
    const fullPhone = `${selectedCountry.dial}${cleanPhone}`;

    const nameParts = name.split(/\s+/).filter(Boolean);
    let firstName = "";
    let lastName = "";

    if (nameParts.length === 1) {
      lastName = nameParts[0];
    } else {
      firstName = nameParts.slice(0, -1).join(" ");
      lastName = nameParts[nameParts.length - 1];
    }

    if (hasActiveSearch && searchCity) {
      const resolvedSearchLocation = await resolveCityState(searchCity);

      city = resolvedSearchLocation.city || searchCity;

      state = resolvedSearchLocation.state || "";

      country = resolvedSearchLocation.country || "India";
      micromarket = searchMicromarket || "";
      area = micromarket;
      pincode = "";
      latitude = null;
      longitude = null;
    }

    const finalCity = city || "";
    const finalState = state || "";

    const finalLeadOwnerTeam = mapLocationToLeadOwnerTeam(
      finalCity,
      finalState,
    );

    const payload = {
      firstName,
      lastName,
      email,
      phone: fullPhone,
      company,
      street: area || micromarket || "",
      city: finalCity,
      state: finalState,
      country: country || "India",
      pincode: pincode || "",
      leadSource: "Listing Platform",
      leadStatus: "Not Contacted",
      subLeadSource: "Request a Callback",
      futureContactDate: contactDate || null,
      leadOwnerTeam: finalLeadOwnerTeam,
      budget,
      areaRequirement,
      preferredCurrency: currencyCode,
      preferredUnit: unit,
      countryCode: selectedCountry.code,
      countryDialCode: selectedCountry.dial,
    };

    console.log("Submitting enquiry lead payload:", payload);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let result = null;

      try {
        result = await response.json();
        console.log("API response received:", result);
      } catch (jsonError) {
        throw new Error("Invalid response received from the server.");
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to create lead in CRM.");
      }

      form.reset();
      setPhone("");
      setPhoneError("");
      setSelectedCountry(phoneCountries[0]);
      setCountryOpen(false);
      setCountrySearch("");
      setIsSubmitting(false);
      setEnquiryStatus("success");

      thankYouTimerRef.current = setTimeout(() => {
        closeEnquiry();
      }, 5000);
    } catch (error) {
      console.error("Lead creation error:", error);
      setIsSubmitting(false);
      setSubmitError(
        error?.message ||
          "Something went wrong while creating the lead. Please try again.",
      );
    }
  };

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-[100] w-full transition-all duration-300 ease-in-out
          "-translate-y-full opacity-0"
        `}
      >
        <div className="relative mx-auto w-full overflow-visible border border-white/30 bg-white/70 shadow-[0_8px_32px_rgba(160,84,160,0.08)] backdrop-blur-lg">
          <div className="flex h-[58px] min-h-[58px] w-full items-center justify-between gap-2 px-3 sm:h-[70px] sm:min-h-[70px] sm:px-4 md:gap-3 md:px-5 lg:h-[68px] lg:min-h-[68px] lg:px-3 min-[1200px]:h-[72px] min-[1200px]:min-h-[72px] min-[1200px]:gap-3 min-[1200px]:px-3 2xl:h-[80px] 2xl:min-h-[88px] 2xl:px-8">
            <Link
              href="/"
              onClick={closeMenu}
              aria-label="Anarock Commercial Listing Platform"
              className="group flex min-w-0 shrink-0 items-center transition-transform duration-200 active:scale-90"
            >
              <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:gap-3.5 2xl:gap-5">
                <img
                  src="/Anarock.svg"
                  alt="Anarock"
                  className="block h-auto w-[86px] object-contain transition-transform duration-300 group-hover:scale-105 sm:w-[102px] md:w-[112px] lg:w-[120px] min-[1280px]:w-[122px] 2xl:w-[150px]"
                />

                <div className="hidden h-6 w-px bg-[#A054A0]/20 sm:block md:h-7 2xl:h-8" />

                <div className="flex min-w-0 max-w-[116px] items-center gap-1.5 rounded-lg border border-[#A054A0]/20 bg-white/50 px-2 py-1 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white/80 sm:max-w-[165px] sm:gap-2 sm:px-2.5 sm:py-1.5 md:max-w-[185px] lg:max-w-[205px] 2xl:max-w-[260px] 2xl:px-3 2xl:py-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#A054A0] text-white shadow-sm sm:h-7 sm:w-7 2xl:h-8 2xl:w-8">
                    <MapPin
                      size={14}
                      strokeWidth={2.3}
                      className="2xl:h-4 2xl:w-4"
                    />
                  </span>

                  <span className="min-w-0 leading-tight">
                    <span className="hidden text-[9px] font-bold uppercase tracking-wider text-[#A054A0] sm:block 2xl:text-[10px]">
                      Your location
                    </span>

                    <span className="block truncate text-[9px] font-semibold text-slate-800 sm:text-[11px] md:text-[12px] lg:text-[12px] 2xl:text-[13px]">
                      {userLocation?.city
                        ? `${userLocation.city}${
                            userLocation?.state ? `, ${userLocation.state}` : ""
                          }`
                        : userLocation?.state || "Detecting location..."}
                    </span>
                  </span>
                </div>
              </div>
            </Link>

            <nav className="mx-auto hidden flex-1 items-center justify-evenly gap-1 rounded-lg border border-white/50 bg-white/40 p-1 shadow-inner backdrop-blur-sm min-[1200px]:flex min-[1200px]:gap-1 2xl:gap-2 2xl:p-1.5">
              {navigation.map((item) => {
                if (item.type === "scroll") {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleScrollNavigation(item.href)}
                      className="group relative cursor-pointer whitespace-nowrap rounded-lg border-0 bg-transparent px-3 py-1.5 text-[12px] font-medium text-slate-700 transition-all duration-200 hover:bg-[#A054A0] hover:text-white hover:shadow-md min-[1200px]:px-2 min-[1200px]:text-[12px] 2xl:px-4 2xl:py-2 2xl:text-[15px]"
                    >
                      <span>{item.label}</span>
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="group relative whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-medium text-slate-700 transition-all duration-200 hover:bg-[#A054A0] hover:text-white hover:shadow-md min-[1200px]:px-2 min-[1200px]:text-[12px] 2xl:px-4 2xl:py-2 2xl:text-[15px]"
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="ml-1 hidden shrink-0 items-center gap-1.5 min-[1200px]:flex min-[1200px]:gap-2 2xl:ml-3 2xl:gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCurrencyOpen((prev) => !prev)}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-[#A054A0]/20 bg-white/60 px-3 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-[#A054A0] hover:bg-white hover:text-[#A054A0] active:scale-95 min-[1200px]:px-3 2xl:h-10 2xl:px-4 2xl:text-[13px]"
                >
                  {currencyLabel}

                  <ChevronDown
                    size={13}
                    strokeWidth={2}
                    className={`transition-transform duration-300 ${
                      currencyOpen
                        ? "rotate-180 text-[#A054A0]"
                        : "text-slate-500"
                    }`}
                  />
                </button>

                {currencyOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-[200] w-[150px] origin-top-right rounded-lg border border-white/80 bg-white/95 p-1.5 shadow-lg backdrop-blur-xl animate-[countryDrop_180ms_cubic-bezier(0.16,1,0.3,1)] 2xl:w-[170px]">
                    {currencies.map(([code, label]) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleCurrencySelect(code)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-all duration-150 2xl:py-2.5 2xl:text-[14px] ${
                          currencyCode === code
                            ? "bg-[#A054A0] font-bold text-white shadow-sm"
                            : "text-slate-600 hover:bg-[#A054A0]/10 hover:text-[#A054A0]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center rounded-lg border border-[#A054A0]/20 bg-white/60 p-0.5 shadow-sm backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => handleUnitSelect("sq.ft")}
                  className={`relative z-10 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all duration-200 active:scale-95 min-[1200px]:px-2.5 min-[1200px]:text-[11px] 2xl:px-4 2xl:py-1.5 2xl:text-[12px] ${
                    unit === "sqft"
                      ? "bg-[#A054A0] text-white shadow-sm"
                      : "text-slate-600 hover:bg-white/80 hover:text-[#A054A0]"
                  }`}
                >
                  sq.ft
                </button>

                <button
                  type="button"
                  onClick={() => handleUnitSelect("sq.m")}
                  className={`relative z-10 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all duration-200 active:scale-95 min-[1200px]:px-2.5 min-[1200px]:text-[11px] 2xl:px-4 2xl:py-1.5 2xl:text-[12px] ${
                    unit === "sqm"
                      ? "bg-[#A054A0] text-white shadow-sm"
                      : "text-slate-600 hover:bg-white/80 hover:text-[#A054A0]"
                  }`}
                >
                  sq.m
                </button>
              </div>

              <button
                type="button"
                onClick={openEnquiry}
                className="group inline-flex h-9 items-center justify-between gap-2 rounded-lg bg-[#A054A0] px-3.5 text-[12px] font-semibold text-white shadow-md transition-all duration-200 ease-out hover:bg-[#8d478d] hover:shadow-lg active:scale-95 2xl:h-10 2xl:px-5 2xl:text-[14px]"
              >
                <span className="relative z-10">Request Callback</span>

                <ArrowUpRight
                  size={16}
                  strokeWidth={2}
                  className="relative z-10 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 2xl:h-5 2xl:w-5"
                />
              </button>

              <Link
                href="/wishlist"
                aria-label={`Wishlist${
                  wishlistCount > 0 ? `, ${wishlistCount} saved properties` : ""
                }`}
                className="group relative hidden h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#A054A0]/20 bg-white/60 px-3 text-[12px] font-semibold text-slate-800 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-[#A054A0] hover:bg-white hover:text-[#A054A0] active:scale-95 min-[1200px]:inline-flex 2xl:h-10 2xl:px-4 2xl:text-[14px]"
              >
                <Heart
                  size={16}
                  strokeWidth={1.8}
                  className={`transition-all duration-200 2xl:h-5 2xl:w-5 ${
                    wishlistCount > 0
                      ? "fill-[#A054A0] text-[#A054A0]"
                      : "text-slate-500 group-hover:text-[#A054A0]"
                  }`}
                />

                <span>Shortlisted</span>

                {wishlistCount > 0 && (
                  <span className="flex min-w-[18px] h-[18px] items-center justify-center rounded-lg bg-[#A054A0] px-1 text-[9px] font-bold leading-none text-white shadow-sm 2xl:min-w-[20px] 2xl:h-[20px] 2xl:text-[11px]">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
              className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#A054A0]/20 bg-white/70 text-slate-800 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-[#A054A0] hover:bg-white hover:text-[#A054A0] active:scale-90 sm:h-10 sm:w-10 min-[1200px]:hidden"
            >
              {mobileOpen ? (
                <X size={18} strokeWidth={2} className="text-[#A054A0]" />
              ) : (
                <Menu size={18} strokeWidth={2} />
              )}
            </button>
          </div>

          <div
            className={`overflow-hidden border-t border-[#A054A0]/10 bg-white/95 backdrop-blur-2xl transition-all duration-300 ease-in-out min-[1200px]:hidden ${
              mobileOpen
                ? "pointer-events-auto max-h-[calc(100dvh-100px)] rounded-b-lg opacity-100 shadow-xl"
                : "pointer-events-none max-h-0 opacity-0"
            }`}
          >
            <div className="flex max-h-[calc(100dvh-100px)] flex-col justify-between overflow-y-auto px-3 pb-5 pt-3 sm:px-5 sm:pb-7 sm:pt-4">
              <nav className="flex flex-col space-y-1.5">
                {navigation.map((item, index) => {
                  if (item.type === "scroll") {
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleScrollNavigation(item.href)}
                        style={{
                          transitionDelay: mobileOpen
                            ? `${index * 30}ms`
                            : "0ms",
                        }}
                        className={`group flex w-full items-center justify-between rounded-lg border border-[#A054A0]/10 bg-white/60 px-3.5 py-3 text-left text-[14px] font-semibold text-slate-800 shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-[#A054A0] hover:text-white active:scale-[0.99] sm:px-4 sm:py-3.5 sm:text-[15px] ${
                          mobileOpen
                            ? "translate-x-0 opacity-100"
                            : "-translate-x-4 opacity-0"
                        }`}
                      >
                        <span>{item.label}</span>

                        <ArrowUpRight
                          size={18}
                          strokeWidth={2}
                          className="opacity-40 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      style={{
                        transitionDelay: mobileOpen ? `${index * 30}ms` : "0ms",
                      }}
                      className={`group flex w-full items-center justify-between rounded-lg border border-[#A054A0]/10 bg-white/60 px-3.5 py-3 text-left text-[14px] font-semibold text-slate-800 shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-[#A054A0] hover:text-white active:scale-[0.99] sm:px-4 sm:py-3.5 sm:text-[15px] ${
                        mobileOpen
                          ? "translate-x-0 opacity-100"
                          : "-translate-x-4 opacity-0"
                      }`}
                    >
                      <span>{item.label}</span>

                      <ArrowUpRight
                        size={18}
                        strokeWidth={2}
                        className="opacity-40 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </Link>
                  );
                })}
              </nav>

              <Link
                href="/wishlist"
                onClick={closeMenu}
                className="mt-2 flex w-full items-center justify-between rounded-lg border border-[#A054A0]/20 bg-white/80 px-3.5 py-3 text-slate-800 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-[#A054A0] hover:bg-white hover:text-[#A054A0] active:scale-[0.99] sm:px-4 sm:py-3.5"
              >
                <div className="flex items-center gap-3">
                  <Heart
                    size={20}
                    strokeWidth={1.8}
                    className={
                      wishlistCount > 0
                        ? "fill-[#A054A0] text-[#A054A0]"
                        : "text-slate-700"
                    }
                  />

                  <span className="font-semibold">Wishlist</span>
                </div>

                {wishlistCount > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-lg bg-[#A054A0] text-white text-xs font-bold shadow-sm">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              <div className="mt-4 flex flex-col gap-3 border-t border-[#A054A0]/10 pt-4 sm:mt-5 sm:gap-3.5 sm:pt-5">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-[#A054A0]/15 bg-white/50 p-2 shadow-sm backdrop-blur-md">
                  <div className="flex min-w-0 overflow-hidden rounded-lg border border-[#A054A0]/20 bg-white/60 p-0.5">
                    <button
                      type="button"
                      onClick={() => handleUnitSelect("sq.ft")}
                      className={`h-8 rounded-lg px-3.5 text-[12px] font-bold transition-all duration-200 active:scale-95 sm:px-4 sm:text-[13px] ${
                        unit === "sqft"
                          ? "bg-[#A054A0] text-white shadow-sm"
                          : "text-slate-600 hover:bg-white/80"
                      }`}
                    >
                      sq.ft
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUnitSelect("sq.m")}
                      className={`h-8 rounded-lg px-3.5 text-[12px] font-bold transition-all duration-200 active:scale-95 sm:px-4 sm:text-[13px] ${
                        unit === "sqm"
                          ? "bg-[#A054A0] text-white shadow-sm"
                          : "text-slate-600 hover:bg-white/80"
                      }`}
                    >
                      sq.m
                    </button>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setCurrencyOpen((prev) => !prev)}
                      className="flex h-8 items-center gap-1.5 rounded-lg border border-[#A054A0]/20 bg-white px-2.5 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur-md transition-all duration-200 active:scale-95 sm:px-3"
                    >
                      {currencyLabel}

                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${
                          currencyOpen ? "rotate-180 text-[#A054A0]" : ""
                        }`}
                      />
                    </button>

                    {currencyOpen && (
                      <div className="absolute bottom-[calc(100%+8px)] right-0 z-[200] w-[150px] rounded-lg border border-white/90 bg-white/95 p-1.5 shadow-lg backdrop-blur-xl">
                        {currencies.map(([code, label]) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => handleCurrencySelect(code)}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-all duration-150 ${
                              currencyCode === code
                                ? "bg-[#A054A0] font-bold text-white shadow-sm"
                                : "text-slate-600 hover:bg-[#A054A0]/10 hover:text-[#A054A0]"
                            }`}
                          >
                            <span>{label}</span>

                            {currencyCode === code && (
                              <Check size={14} className="text-white" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    closeMenu();

                    setTimeout(() => {
                      openEnquiry();
                    }, 200);
                  }}
                  className="group relative flex h-[48px] w-full items-center justify-between overflow-hidden rounded-lg bg-[#A054A0] px-5 text-[14px] font-bold text-white shadow-md transition-all duration-200 hover:bg-[#8d478d] hover:shadow-lg active:scale-98 sm:text-[15px]"
                >
                  <span className="relative z-10">Request a Callback</span>

                  <ArrowUpRight
                    size={20}
                    strokeWidth={2}
                    className="relative z-10 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {enquiryOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm animate-[navbarFadeIn_200ms_ease-out] sm:p-4 md:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEnquiry();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-title"
            className="relative flex max-h-[85dvh] w-full max-w-[580px] 2xl:max-w-[700px] flex-col overflow-hidden rounded-lg border border-white/60 bg-white/90 shadow-2xl backdrop-blur-xl animate-[navbarPopup_280ms_cubic-bezier(0.16,1,0.3,1)]"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#A054A0]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-24 h-56 w-56 rounded-full bg-[#A054A0]/10 blur-3xl" />

            <button
              type="button"
              onClick={closeEnquiry}
              aria-label="Close enquiry form"
              className="absolute right-3.5 top-3.5 z-30 flex h-9 w-9 items-center justify-center rounded-lg border border-white/80 bg-white/80 text-slate-500 shadow-sm backdrop-blur-md transition-all duration-200 hover:rotate-90 hover:bg-white hover:text-[#A054A0] hover:shadow-md active:scale-95 sm:right-5 sm:top-5 sm:h-10 sm:w-10 2xl:h-12 2xl:w-12"
            >
              <X size={18} strokeWidth={2} className="2xl:h-6 2xl:w-6" />
            </button>

            {enquiryStatus === "success" ? (
              <div className="relative flex min-h-[380px] flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[430px] sm:px-10 2xl:min-h-[520px]">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-lg bg-[#A054A0] text-white shadow-lg animate-[successPop_450ms_cubic-bezier(0.16,1,0.3,1)] sm:h-24 sm:w-24 2xl:h-28 2xl:w-28">
                  <CheckCircle2
                    size={42}
                    strokeWidth={2}
                    className="2xl:h-14 2xl:w-14"
                  />
                </div>

                <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#A054A0] sm:text-[12px] 2xl:text-[14px]">
                  Thank you
                </p>

                <h2 className="max-w-[440px] text-[23px] font-bold tracking-[-0.02em] text-slate-900 sm:text-[27px] lg:text-[29px] 2xl:text-[34px]">
                  Your enquiry has been received
                </h2>

                <p className="mt-3 text-[14px] leading-6 text-slate-600 sm:text-[15px] 2xl:text-[17px]">
                  Our team will get back to you shortly.
                </p>

                <p className="mt-7 rounded-lg border border-[#A054A0]/20 bg-white/80 px-4 py-2 text-[11px] font-medium text-slate-500 shadow-sm backdrop-blur-md sm:text-[12px] 2xl:text-[14px]">
                  This window will close automatically.
                </p>
              </div>
            ) : (
              <>
                <div className="relative shrink-0 border-b border-[#A054A0]/10 bg-white/50 px-5 pb-5 pt-6 backdrop-blur-md sm:px-8 sm:pb-6 sm:pt-7 2xl:px-10 2xl:pb-6 2xl:pt-7">
                  <div className="mb-3 inline-flex items-center rounded-lg border border-[#A054A0]/20 bg-[#A054A0]/10 px-3 py-1 shadow-sm">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#A054A0] sm:text-[11px] 2xl:text-[13px]">
                      Get in touch
                    </span>
                  </div>

                  <h2
                    id="enquiry-title"
                    className="pr-10 text-[20px] font-bold tracking-[-0.025em] text-slate-900 sm:text-[25px] lg:text-[27px] 2xl:text-[32px]"
                  >
                    Tell us what you’re looking for
                  </h2>

                  <p className="mt-1.5 max-w-[480px] text-[11px] leading-5 text-slate-500 sm:text-[14px] sm:leading-6 2xl:text-[16px] 2xl:leading-7">
                    Share your contact info and our team will get back to you.
                  </p>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
                  <form
                    onSubmit={handleEnquirySubmit}
                    className="px-4 py-4 sm:px-8 sm:py-6 2xl:px-8 2xl:py-7"
                  >
                    <div className="space-y-4 2xl:space-y-6">
                      <div>
                        <label
                          htmlFor="enquiry-name"
                          className="mb-1.5 block text-[12px] font-bold text-slate-700 sm:text-[13px] 2xl:text-[15px]"
                        >
                          Full Name
                        </label>

                        <input
                          id="enquiry-name"
                          name="name"
                          type="text"
                          placeholder="Enter your name"
                          required
                          autoComplete="name"
                          className="h-10 w-full rounded-lg border border-[#A054A0]/20 bg-white/70 px-4 text-[14px] font-medium text-slate-900 shadow-sm outline-none backdrop-blur-md transition-all duration-200 placeholder:text-slate-400 hover:bg-white focus:border-[#A054A0] focus:bg-white focus:ring-2 focus:ring-[#A054A0]/20 sm:h-[46px] sm:text-[15px] 2xl:h-[54px] 2xl:text-[17px] 2xl:px-5"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="enquiry-phone"
                          className="mb-1.5 block text-[12px] font-bold text-slate-700 sm:text-[13px] 2xl:text-[15px]"
                        >
                          Phone Number
                        </label>

                        <div className="relative w-full">
                          <div
                            className={`flex h-10 w-full rounded-lg border bg-white/70 shadow-sm backdrop-blur-md transition-all duration-200 sm:h-[46px] 2xl:h-[54px] ${
                              phoneError
                                ? "border-red-400 ring-2 ring-red-500/10"
                                : "border-[#A054A0]/20 focus-within:border-[#A054A0] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#A054A0]/20"
                            }`}
                          >
                            <div className="relative shrink-0">
                              <button
                                ref={countryButtonRef}
                                type="button"
                                onClick={() => setCountryOpen((prev) => !prev)}
                                aria-expanded={countryOpen}
                                aria-haspopup="listbox"
                                className="flex h-full items-center gap-1.5 rounded-l-lg border-r border-[#A054A0]/20 bg-slate-50/60 px-3 text-[13px] font-semibold text-slate-800 outline-none transition-all duration-150 hover:bg-white active:scale-95 sm:px-3 sm:text-[14px] 2xl:px-4.5 2xl:text-[16px]"
                              >
                                <span className="text-[18px] leading-none 2xl:text-[22px]">
                                  {selectedCountry.flag}
                                </span>

                                <span>{selectedCountry.dial}</span>

                                <ChevronDown
                                  size={14}
                                  strokeWidth={2}
                                  className={`transition-transform duration-200 ${
                                    countryOpen
                                      ? "rotate-180 text-[#A054A0]"
                                      : "text-slate-500"
                                  }`}
                                />
                              </button>

                              {countryOpen &&
                                typeof document !== "undefined" &&
                                createPortal(
                                  <div
                                    className="fixed inset-0 z-[9998]"
                                    onMouseDown={(e) => {
                                      if (e.target === e.currentTarget) {
                                        setCountryOpen(false);
                                      }
                                    }}
                                  >
                                    <div
                                      className="fixed z-[9999] w-[310px] max-w-[calc(100vw-20px)] overflow-hidden rounded-lg border border-white/80 bg-white/95 shadow-xl backdrop-blur-2xl"
                                      style={{
                                        top: (() => {
                                          const rect =
                                            countryButtonRef.current?.getBoundingClientRect();

                                          if (!rect) return 0;

                                          const height = Math.min(
                                            330,
                                            window.innerHeight - 24,
                                          );

                                          const spaceBelow =
                                            window.innerHeight - rect.bottom;

                                          return spaceBelow < height &&
                                            rect.top > height
                                            ? Math.max(
                                                12,
                                                rect.top - height - 8,
                                              )
                                            : Math.min(
                                                rect.bottom + 8,
                                                window.innerHeight -
                                                  height -
                                                  12,
                                              );
                                        })(),
                                        left: (() => {
                                          const rect =
                                            countryButtonRef.current?.getBoundingClientRect();

                                          if (!rect) return 12;

                                          return Math.min(
                                            Math.max(12, rect.left),
                                            window.innerWidth - 310 - 12,
                                          );
                                        })(),
                                        maxHeight: "calc(100vh - 24px)",
                                      }}
                                    >
                                      <div className="border-b border-slate-100 p-2.5">
                                        <div className="flex items-center gap-2 rounded-lg border border-[#A054A0]/20 bg-slate-50/70 px-3 shadow-inner">
                                          <Search
                                            size={14}
                                            className="shrink-0 text-slate-400"
                                          />

                                          <input
                                            ref={countrySearchRef}
                                            type="text"
                                            value={countrySearch}
                                            onChange={(e) =>
                                              setCountrySearch(e.target.value)
                                            }
                                            placeholder="Search country..."
                                            className="h-9 min-w-0 flex-1 bg-transparent text-[13px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
                                          />

                                          {countrySearch && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setCountrySearch("")
                                              }
                                              className="flex h-5 w-5 items-center justify-center rounded-lg hover:bg-slate-200"
                                            >
                                              <X size={12} />
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      <div className="max-h-[250px] overflow-y-auto overscroll-contain p-1.5">
                                        {filteredCountries.length > 0 ? (
                                          filteredCountries.map((country) => {
                                            const isSelected =
                                              country.code ===
                                                selectedCountry.code &&
                                              country.dial ===
                                                selectedCountry.dial;

                                            return (
                                              <button
                                                key={`${country.code}-${country.dial}`}
                                                type="button"
                                                onClick={() =>
                                                  handleCountrySelect(country)
                                                }
                                                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all duration-150 ${
                                                  isSelected
                                                    ? "bg-[#A054A0] font-semibold text-white"
                                                    : "text-slate-800 hover:bg-[#A054A0]/10 hover:text-[#A054A0]"
                                                }`}
                                              >
                                                <span className="text-[18px] leading-none">
                                                  {country.flag}
                                                </span>

                                                <span className="min-w-0 flex-1 truncate text-[13px]">
                                                  {country.name}
                                                </span>

                                                <span
                                                  className={`text-[12px] font-medium ${
                                                    isSelected
                                                      ? "text-white/80"
                                                      : "text-slate-500"
                                                  }`}
                                                >
                                                  {country.dial}
                                                </span>

                                                {isSelected && (
                                                  <Check
                                                    size={14}
                                                    className="shrink-0 text-white"
                                                  />
                                                )}
                                              </button>
                                            );
                                          })
                                        ) : (
                                          <div className="px-3 py-6 text-center text-[13px] text-slate-500">
                                            No country found
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>,
                                  document.body,
                                )}
                            </div>

                            <input
                              ref={phoneInputRef}
                              id="enquiry-phone"
                              name="phone"
                              type="tel"
                              inputMode="tel"
                              value={phone}
                              onChange={(e) =>
                                handlePhoneInputChange(e.target.value)
                              }
                              onInput={(e) =>
                                handlePhoneInputChange(e.currentTarget.value)
                              }
                              onFocus={() => {
                                const value =
                                  phoneInputRef.current?.value || "";

                                if (value && value !== phone) {
                                  handlePhoneInputChange(value);
                                }
                              }}
                              placeholder="Enter phone number"
                              required
                              autoComplete="tel"
                              className="w-full flex-1 rounded-r-lg bg-transparent px-3 text-[14px] font-medium text-slate-900 outline-none placeholder:text-slate-400 sm:text-[15px] 2xl:text-[17px] 2xl:px-5"
                            />
                          </div>
                        </div>

                        {phoneError ? (
                          <p className="mt-1.5 text-[11px] font-medium leading-4 text-red-600 2xl:text-[13px]">
                            {phoneError}
                          </p>
                        ) : phone ? (
                          <p className="mt-1.5 text-[10px] text-slate-400 2xl:text-[12px]">
                            {selectedCountry.min === selectedCountry.max
                              ? `${selectedCountry.min} digits required`
                              : `${selectedCountry.min}-${selectedCountry.max} digits required`}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label
                          htmlFor="enquiry-email"
                          className="mb-1.5 block text-[12px] font-bold text-slate-700 sm:text-[13px] 2xl:text-[15px]"
                        >
                          Email Address
                        </label>

                        <input
                          id="enquiry-email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          className="h-10 w-full rounded-lg border border-[#A054A0]/20 bg-white/70 px-4 text-[14px] font-medium text-slate-900 shadow-sm outline-none backdrop-blur-md transition-all duration-200 placeholder:text-slate-400 hover:bg-white focus:border-[#A054A0] focus:bg-white focus:ring-2 focus:ring-[#A054A0]/20 sm:h-[46px] sm:text-[15px] 2xl:h-[54px] 2xl:text-[17px] 2xl:px-5"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="enquiry-company"
                          className="mb-1.5 block text-[12px] font-bold text-slate-700 sm:text-[13px] 2xl:text-[15px]"
                        >
                          Company Name
                        </label>

                        <input
                          id="enquiry-company"
                          name="company"
                          type="text"
                          placeholder="Enter your Company Name"
                          className="h-10 w-full rounded-lg border border-[#A054A0]/20 bg-white/70 px-4 text-[14px] font-medium text-slate-900 shadow-sm outline-none backdrop-blur-md transition-all duration-200 placeholder:text-slate-400 hover:bg-white focus:border-[#A054A0] focus:bg-white focus:ring-2 focus:ring-[#A054A0]/20 sm:h-[46px] sm:text-[15px] 2xl:h-[54px] 2xl:text-[17px] 2xl:px-5"
                        />
                      </div>
                    </div>

                    {submitError && (
                      <div
                        role="alert"
                        className="mt-4 rounded-lg border border-red-200 bg-red-50/90 px-4 py-3 text-[12px] leading-5 text-red-700 shadow-sm backdrop-blur-md animate-[errorShake_250ms_ease-out] 2xl:text-[14px]"
                      >
                        {submitError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative mt-6 flex h-[48px] w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#A054A0] text-[14px] font-bold text-white shadow-md transition-all duration-200 hover:bg-[#8d478d] hover:shadow-lg active:scale-98 disabled:cursor-not-allowed disabled:opacity-70 sm:h-[50px] sm:text-[15px] 2xl:h-[58px] 2xl:text-[18px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2
                            size={18}
                            className="relative z-10 animate-spin 2xl:h-6 2xl:w-6"
                          />

                          <span className="relative z-10">
                            Creating Lead...
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="relative z-10">Submit Enquiry</span>

                          <ArrowUpRight
                            size={18}
                            strokeWidth={2}
                            className="relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 2xl:h-6 2xl:w-6"
                          />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .rdp-caption_dropdowns {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .rdp-dropdown_month,
        .rdp-dropdown_year {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        .rdp-dropdown_month::after,
        .rdp-dropdown_year::after {
          content: "";
          position: absolute;
          right: 10px;
          pointer-events: none;
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid #64748b;
        }

        @media (min-width: 1440px) {
          .rdp {
            --rdp-cell-size: 42px !important;
            font-size: 15px !important;
          }
        }

        @media (min-width: 2560px) {
          .rdp {
            --rdp-cell-size: 52px !important;
            font-size: 17px !important;
          }
        }

        @keyframes navbarFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes navbarPopup {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes countryDrop {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes successPop {
          0% {
            opacity: 0;
            transform: scale(0.65);
          }

          70% {
            transform: scale(1.08);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes errorShake {
          0%,
          100% {
            transform: translateX(0);
          }

          25% {
            transform: translateX(-4px);
          }

          75% {
            transform: translateX(4px);
          }
        }
      `}</style>
    </>
  );
}
