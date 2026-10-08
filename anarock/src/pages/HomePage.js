"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CookieConsent from "@/components/common/CookieConsent";
import HeroSection from "@/components/home/HeroSection";
import Image from "next/image";
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
    name: "Bengaluru",
    slug: "bengaluru",
    url: "https://images.unsplash.com/photo-1720954006045-6b801f7f919e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmFuZ2Fsb3JlJTIwY2l0eXxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    name: "Chennai",
    slug: "chennai",
    url: "https://images.unsplash.com/photo-1616843413587-9e3a37f7bbd8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hlbm5haXxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    name: "Delhi",
    slug: "delhi",
    url: "https://plus.unsplash.com/premium_photo-1697729438410-d53c666e3810?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZGVsaGl8ZW58MHx8MHx8fDA%3D",
  },
  {
    name: "Gurugram",
    slug: "gurugram",
    url: "https://images.unsplash.com/photo-1707549573382-de5ebcb30dae?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3VydWdyYW18ZW58MHx8MHx8fDA%3D",
  },
  {
    name: "Hyderabad",
    slug: "hyderabad",
    url: "https://images.unsplash.com/photo-1657981630164-769503f3a9a8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aHlkZXJhYmFkfGVufDB8fDB8fHww",
  },
  {
    name: "Kolkata",
    slug: "kolkata",
    url: "https://images.unsplash.com/photo-1682582036641-91dfe7b66ba6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8a29sa2F0YXxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    name: "Mumbai",
    slug: "mumbai",
    url: "https://images.unsplash.com/photo-1569758267239-d08deb78bb1a?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Noida",
    slug: "noida",
    url: "https://images.unsplash.com/photo-1661858435242-ed971767e954?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bm9pZGF8ZW58MHx8MHx8fDA%3D",
  },
  {
    name: "Pune",
    slug: "pune",
    url: "https://images.unsplash.com/photo-1608019425630-bec4810ccb60?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];
const features = [
  {
    icon: Users,
    title: "Client-Centric",
    desc: "Advisory shaped around your business objectives, real estate needs and long-term priorities.",
  },
  {
    icon: Sparkles,
    title: "AI-Enabled",
    desc: "Technology and AI integrated into research, analysis and decision-making to deliver smarter outcomes.",
  },
  {
    icon: BarChart3,
    title: "Data-Driven",
    desc: "Data, analytics and market evidence that inform every stage of the real estate decision-making process.",
  },
  {
    icon: Handshake,
    title: "Transaction Expertise",
    desc: "End-to-end support from strategy and site selection through negotiations and transaction execution.",
  },
  {
    icon: Leaf,
    title: "Sustainability-Focused",
    desc: "Integrating sustainability and ESG considerations into your overall strategy",
  },
  {
    icon: Brain,
    title: "Market Intelligence",
    desc: "Deep market knowledge and granular insights to identify opportunities, assess risks and guide decisions.",
  },
];
const journey = [
  {
    icon: Compass,
    title: "Define",
    desc: "Mention location, space, budget and other preferences to define what you're looking for.",
  },
  {
    icon: Search,
    title: "Discover",
    desc: "Browse properties that match your requirements and discover relevant locations, buildings and spaces.",
  },
  {
    icon: Scale,
    title: "Evaluate",
    desc: "Shortlist your preferred properties and compare them side by side across key parameters.",
  },
  {
    icon: CheckCircle2,
    title: "Decide",
    desc: " Review property details, insights and comparisons to identify the option that best meets your needs.",
  },
  {
    icon: Handshake,
    title: "Connect",
    desc: "Connect with our team to discuss your shortlisted property and move forward with your requirement.",
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
      y: shouldReduceMotion ? 0 : 50,
      scale: shouldReduceMotion ? 1 : 0.985,
    },

    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.7,
        delay: shouldReduceMotion ? 0 : index * 0.1,
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
        amount: 0.12,
        margin: "0px 0px -30px 0px",
      }}
      className="group relative h-full min-w-0"
    >
      <motion.div
        whileHover={
          shouldReduceMotion
            ? undefined
            : {
              y: -6,
              transition: {
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              },
            }
        }
        className="
          relative
          flex
          h-full
          min-h-[300px]
          flex-col
          overflow-hidden
          rounded-[1.25rem]
          border
          border-slate-200/80
          bg-white/85
          p-5
          shadow-[0_8px_35px_rgba(15,23,42,0.025)]
          backdrop-blur-xl
          transition-[border-color,box-shadow]
          duration-500

          hover:border-[#A054A0]/40
          hover:shadow-[0_20px_55px_rgba(160,84,160,0.12)]

          /* Small phones */
          min-[400px]:min-h-[310px]

          /* Small tablets / 2-column */
          min-[600px]:min-h-[320px]
          min-[600px]:rounded-[1.4rem]
          min-[600px]:p-5

          /* Tablet / 3-column */
          md:min-h-[340px]
          md:p-6

          /* Large desktop */
          xl:min-h-[370px]
          xl:rounded-[1.6rem]
          xl:p-7

          /* Very large desktop */
          2xl:min-h-[390px]
          2xl:p-8
        "
      >
        {/* Hover background */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-br
            from-[#A054A0]/[0.045]
            via-transparent
            to-transparent
            opacity-0
            transition-opacity
            duration-700
            group-hover:opacity-100
          "
          aria-hidden="true"
        />

        {/* Top */}
        <div className="relative z-10 flex items-start justify-between">
          {/* Icon */}
          <motion.div
            whileHover={
              shouldReduceMotion
                ? undefined
                : {
                  rotate: 6,
                  scale: 1.06,
                }
            }
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-[0.8rem]
              border
              border-[#A054A0]/10
              bg-[#A054A0]/[0.07]
              text-[#A054A0]
              transition-colors
              duration-500

              group-hover:bg-[#A054A0]
              group-hover:text-white

              min-[400px]:h-12
              min-[400px]:w-12

              min-[600px]:h-12
              min-[600px]:w-12

              md:h-12
              md:w-12

              xl:h-14
              xl:w-14

              2xl:h-15
              2xl:w-15
            "
          >
            <item.icon
              className="
                h-[1.15rem]
                w-[1.15rem]

                min-[600px]:h-5
                min-[600px]:w-5

                xl:h-[1.35rem]
                xl:w-[1.35rem]
              "
            />
          </motion.div>
          <span
            className="
              pointer-events-none
              absolute
              -right-2
              -top-3
              select-none
              text-[4.5rem]
              font-extrabold
              leading-none
              tracking-[-0.07em]
              text-slate-900/[0.035]
              transition-all
              duration-700

              group-hover:scale-105
              group-hover:text-[#A054A0]/[0.09]

              min-[400px]:text-[5rem]

              min-[600px]:-right-3
              min-[600px]:-top-4
              min-[600px]:text-[5rem]

              md:text-[5rem]

              lg:text-[5.5rem]

              xl:-right-4
              xl:-top-5
              xl:text-[5rem]

              2xl:text-[5.5rem]
            "
          >
            0{index + 1}
          </span>
        </div>

        {/* Content */}
        <div
          className="
            relative
            z-10
            mt-8
           min-[400px]:mt-9
            min-[600px]:mt-9
           md:mt-10
            xl:mt-12
            2xl:mt-14
         "
        >
          <h3
            className="
             max-w-full
            pb-1
              text-[1.35rem]
              font-semibold
             leading-[1.1]
             tracking-[-0.04em]
             text-slate-900
             min-[400px]:text-[1.45rem]
             min-[600px]:text-[1.5rem]
              md:text-[1.55rem]
              xl:text-[1.7rem]
              2xl:text-[1.85rem]
           "
          >
            {item.title}
          </h3>

          <p
            className="
              mt-3
              max-w-full
              text-[0.84rem]
              leading-[1.65]
              tracking-[-0.005em]
              text-slate-500

              min-[400px]:text-[0.87rem]

              min-[600px]:text-[0.88rem]

              md:text-[0.9rem]

              xl:mt-4
              xl:text-[0.93rem]

              2xl:text-[0.95rem]
            "
          >
            {item.desc}
          </p>
        </div>

        {/* Bottom accent */}
        <div
          className="
            relative
            z-10
            mt-auto
            pt-6

            min-[600px]:pt-7

            xl:pt-8
          "
        >
          <div
            className="
              h-px
              w-9
              bg-slate-200
              transition-all
              duration-500

              group-hover:w-16
              group-hover:bg-[#A054A0]

              xl:w-10
              xl:group-hover:w-20
            "
          />
        </div>

        {/* Bottom hover line */}
        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-0
            right-0
            h-[2px]
            origin-left
            scale-x-0
            bg-gradient-to-r
            from-[#A054A0]
            to-[#DFA2DF]
            transition-transform
            duration-700
            group-hover:scale-x-100
          "
          aria-hidden="true"
        />
      </motion.div>
    </motion.div>
  );
}
function PremiumDropdown({ id, name, value, placeholder, options, onChange }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest(`[data-dropdown="${id}"]`)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [id]);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="relative w-full" data-dropdown={id}>
      {/* Hidden native field keeps form submission unchanged */}
      <input type="hidden" id={id} name={name} value={value} />

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`group relative flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm outline-none transition-all duration-300 ${open
          ? "border-[#A054A0]/50 bg-white/95 shadow-[0_12px_35px_rgba(160,84,160,0.12)] ring-4 ring-[#A054A0]/10"
          : "border-white/80 bg-white/55 hover:border-[#A054A0]/25 hover:bg-white/75"
          }`}
      >
        <span className={selectedOption ? "text-slate-800" : "text-slate-400"}>
          {selectedOption?.label || placeholder}
        </span>

        <span
          className={`ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#A054A0]/[0.07] text-[#A054A0] transition-transform duration-300 ${open ? "rotate-180" : ""
            }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {/* Options */}
      <div
        className={`absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[80] origin-top transition-all duration-200 ${open
          ? "pointer-events-auto scale-100 opacity-100"
          : "pointer-events-none scale-[0.98] opacity-0"
          }`}
      >
        <div className="overflow-hidden rounded-2xl border border-white/90 bg-white/95 p-1.5 shadow-[0_20px_50px_rgba(40,20,50,0.14)] backdrop-blur-2xl">
          <div className="max-h-64 overflow-y-auto pr-1">
            {options.map((option) => {
              const isSelected = value === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm transition-all duration-200 ${isSelected
                    ? "bg-[#A054A0]/[0.09] font-semibold text-[#8B438B]"
                    : "text-slate-600 hover:bg-[#A054A0]/[0.055] hover:text-slate-900"
                    }`}
                >
                  <span>{option.label}</span>

                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#A054A0] text-white shadow-sm">
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 12 4 4L19 6" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default function HomePage() {
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitMessageType, setSubmitMessageType] = useState("success");
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
        setSubmitMessage(
          "Thank you Our team will get in touch with you shortly.",
        );

        setSubmitMessageType("success");
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
        setSubmitMessage(
          result.errorCode === "DUPLICATE_DATA"
            ? "We already have your details on file. Our team will be in touch shortly."
            : result.message ||
            "We couldn't submit your requirement right now. Please try again.",
        );

        setSubmitMessageType("error");
      }
    } catch (error) {
      console.error("Form submission error:", error);

      setSubmitMessage(
        "We couldn't submit your requirement right now. Please try again.",
      );

      setSubmitMessageType("error");
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
        <HeroSection locationData={locationData} />

        {/* POPULAR CITIES */}
        <section className="relative overflow-hidden py-14 sm:py-16 md:py-20 lg:py-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#A054A0]/[0.05] blur-3xl" />
            <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#A054A0]/[0.04] blur-3xl" />
          </div>

          <div
            className=" relative
      z-10
      mx-auto
      w-full
      max-w-[1500px]
      px-5
      sm:px-8
      lg:px-10
      xl:px-12
    "
          >
            {/* Heading */}
            <div
              className="
        mb-10
        flex
        flex-col
        gap-5

        sm:mb-12

        lg:mb-14
        lg:flex-row
        lg:items-center
        lg:justify-between
        lg:gap-12
      "
            >
              <h2
                className="
          max-w-3xl
          text-[clamp(2rem,4.2vw,4.5rem)]
          font-bold
          leading-[0.98]
          tracking-[-0.055em]
          text-[#A054A0]
        "
              >
                Explore India&apos;s Key Cities
              </h2>

              <p
                className="
          mt-0
          max-w-2xl
          text-sm
          leading-6
          text-slate-500

          sm:text-base
          sm:leading-7

          lg:max-w-xl
          lg:text-lg
          lg:leading-8
        "
              >
                Discover premium commercial real estate opportunities across
                India&apos;s leading business destinations.
              </p>
            </div>

            {/* City Cards */}
            <div
              className="
        flex
        flex-wrap
        justify-center
        gap-4

        min-[600px]:gap-5
        sm:gap-5
      "
            >
              {popularCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/kyc/city/${city.slug}`}
                  className="
            group
            relative
            isolate
            w-full
            overflow-hidden
            rounded-[1.25rem]
            border
            border-[#A054A0]/15
            bg-white
            shadow-[0_10px_35px_rgba(86,42,91,0.05)]
            transition-all
            duration-500
            ease-out

            hover:-translate-y-2
            hover:border-[#A054A0]/35
            hover:shadow-[0_24px_65px_rgba(86,42,91,0.14)]

            /* Small phones / large phones */
            min-[600px]:w-[calc(50%-0.625rem)]

            /* Tablets */
            md:w-[calc(33.333%-0.85rem)]

            /* Desktop */
            lg:w-[calc(25%-0.9375rem)]

            /* Large desktop */
            xl:w-[calc(20%-1rem)]

            sm:rounded-[1.5rem]
          "
                >
                  {/* Image */}
                  <div
                    className="
              relative
              aspect-[16/4]
              overflow-hidden
              bg-[#A054A0]/5
   min-[600px]:aspect-[4/3]
    lg:aspect-square
            "
                  >
                    <Image
                      src={city.url}
                      alt={`${city.name} commercial real estate`}
                      decoding="async"
                      fill
                      priority
                      loading="lazy"
                      className="
                h-full
                w-full
                object-cover
                object-center
                transition-transform
                duration-700
                ease-out
                group-hover:scale-110
              "
                    />

                    {/* Image Overlay */}
                    <div
                      className="
                absolute
                inset-0
                bg-gradient-to-t
                from-slate-950/75
                via-slate-950/5
                to-transparent
              "
                    />

                    {/* Card Content */}
                    <div
                      className="
                absolute
                inset-x-0
                bottom-0
                p-4

                sm:p-5
                lg:p-5
              "
                    >
                      <div
                        className="
                  mb-3
                  h-px
                  w-8
                  bg-[#DCA9DD]
                  transition-all
                  duration-500
                  group-hover:w-14
                "
                      />

                      <h3
                        className="
                  text-lg
                  font-bold
                  tracking-tight
                  text-white

                  sm:text-xl
                  lg:text-xl
                "
                      >
                        {city.name}
                      </h3>

                      <div className="mt-2.5 flex items-center justify-between gap-3">
                        <p
                          className="
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-white/65

                    sm:text-[10px]
                  "
                        >
                          Explore
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

                  {/* Bottom hover line */}
                  <div
                    className="
              h-1
              w-0
              bg-[#A054A0]
              transition-all
              duration-500
              group-hover:w-full
            "
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* MARKET AT A GLANCE */}
        {/* <section
          id="market-glance"
          className="relative flex w-full items-center border-t border-slate-200/80"
        >
          <div className="relative z-10 mx-auto w-full max-w-[1920px] px-20 py-14">
            <div className="mb-12 text-left md:mb-16">
              <h2 className="text-[clamp(1.2rem,4.2vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.055em] text-slate-900">
                Key {"  "}
                <span className="bg-gradient-to-r from-[#A054A0] via-[#B14DB1] to-[#7A377A] bg-clip-text text-transparent">
                  Metrics
                </span>
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base md:text-lg">
                Your expert guide to navigate through India&apos;s commerical
                real estate.
              </p>
            </div>
            <MarketStats />
          </div>
        </section> */}

        {/* WHY CHOOSE ANAROCK */}
        <section
          className="
    relative
    overflow-hidden
    py-12
    sm:py-14
    md:py-16
    lg:py-20
    xl:py-24
  "
        >
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="
        absolute
        -left-40
        top-20
        h-80
        w-80
        rounded-full
        bg-[#A054A0]/[0.035]
        blur-3xl
        sm:h-96
        sm:w-96
      "
            />

            <div
              className="
        absolute
        -right-40
        bottom-0
        h-80
        w-80
        rounded-full
        bg-[#A054A0]/[0.03]
        blur-3xl
        sm:h-96
        sm:w-96
      "
            />
          </div>

          <div
            className="
      relative
      z-10
      mx-auto
      w-full
      max-w-[1500px]
      px-5
      sm:px-8
      lg:px-10
      xl:px-12
    "
          >
            {/* Heading */}
            <div
              className="
        mx-auto
        mb-10
        max-w-4xl
        text-center

        sm:mb-12
        md:mb-14
        lg:mb-16
      "
            >
              <h2
                className="
          text-[clamp(2rem,3.8vw,4rem)]
          font-bold
          leading-[0.98]
          tracking-[-0.055em]
          text-[#A054A0]
        "
              >
                Why Choose Anarock{" "}
              </h2>

              <p
                className="
          mx-auto
          mt-4
          max-w-2xl
          text-sm
          leading-6
          text-slate-600

          sm:mt-5
          sm:text-base
          sm:leading-7

          lg:text-lg
          lg:leading-8
        "
              >
                Your trusted partner in real estate, combining deep industry
                expertise with market data.
              </p>
            </div>

            {/* Feature Cards */}
            <div
              className="
        flex
        flex-wrap
        justify-center
        gap-5

        sm:gap-6
      "
            >
              {features.map((feature, idx) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={idx}
                    className="
              group
              relative
              flex
              w-full
              flex-col
              overflow-hidden
              rounded-[1.35rem]
              border
              border-slate-200/80
              bg-white/80
              p-5
              shadow-[0_8px_30px_rgba(15,23,42,0.035)]
              backdrop-blur-xl
              transition-all
              duration-500
              ease-out

              hover:-translate-y-1.5
              hover:border-[#A054A0]/40
              hover:shadow-[0_20px_50px_rgba(160,84,160,0.11)]

              min-[600px]:w-[calc(50%-0.75rem)]

              lg:w-[calc(33.333%-1rem)]

              lg:p-6
              lg:rounded-[1.5rem]
            "
                  >
                    {/* Hover gradient */}
                    <div
                      className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-br
                from-[#A054A0]/[0.05]
                via-transparent
                to-transparent
                opacity-0
                transition-opacity
                duration-500
                group-hover:opacity-100
              "
                    />

                    <div className="relative z-10 flex h-full flex-col">
                      {/* Icon */}
                      <div
                        className="
                  mb-5
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#A054A0]/10
                  text-[#A054A0]
                  transition-all
                  duration-300
                  ease-out

                  group-hover:scale-110
                  group-hover:bg-[#A054A0]
                  group-hover:text-white

                  sm:h-12
                  sm:w-12
                "
                      >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>

                      {/* Title */}
                      <h3
                        className="
                  mb-2
                  text-lg
                  font-semibold
                  leading-tight
                  tracking-[-0.02em]
                  text-slate-900
                  transition-colors
                  duration-200

                  group-hover:text-[#A054A0]

                  sm:text-xl
                "
                      >
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p
                        className="
                  flex-grow
                  text-sm
                  leading-6
                  text-slate-600

                  sm:leading-7
                "
                      >
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CLIENT JOURNEY */}
        <section
          id="client-journey"
          className="
    relative
    isolate
    overflow-hidden
    py-7
    min-[400px]:py-8
    sm:py-14
    md:py-16
    lg:py-20
    xl:py-24
  "
        >
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="
        absolute
        -left-32
        top-16
        h-64
        w-64
        rounded-full
        bg-[#A054A0]/[0.035]
        blur-3xl

        min-[400px]:h-72
        min-[400px]:w-72

        sm:-left-40
        sm:top-20
        sm:h-96
        sm:w-96
      "
            />

            <div
              className="
        absolute
        -right-32
        bottom-0
        h-64
        w-64
        rounded-full
        bg-[#A054A0]/[0.03]
        blur-3xl

        min-[400px]:h-72
        min-[400px]:w-72

        sm:-right-40
        sm:h-96
        sm:w-96
      "
            />
          </div>

          <div
            className="
      relative
      z-10
      mx-auto
      w-full
      max-w-[1700px]

      px-4
      min-[400px]:px-5

      sm:px-8
      lg:px-10
      xl:px-12
      2xl:px-14
    "
          >
            {/* Heading */}
            <motion.div
              initial={{ y: 40 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
        mx-auto
        mb-5
        w-full
        max-w-6xl
        text-center

        min-[400px]:mb-6

        sm:mb-12
        md:mb-14
        lg:mb-16
        xl:mb-20
      "
            >
              <h2
                className="
          mx-auto
          max-w-[1100px]

          text-[1.8rem]
          font-bold
          leading-[1.02]
          tracking-[-0.045em]
          text-[#A054A0]
          min-[400px]:text-[2rem]
          sm:text-[clamp(2.2rem,5vw,3.25rem)]
          lg:text-[clamp(2.5rem,3.8vw,4rem)]
        "
              >
                Find Your Next Office in 5 Simple Steps
              </h2>
            </motion.div>

            <div className="relative">
              {/* Connecting line — desktop only */}
              <div
                aria-hidden="true"
                className="
          pointer-events-none
          absolute
          left-[8%]
          right-[8%]
          top-1/2
          hidden
          h-px
          bg-gradient-to-r
          from-transparent
          via-[#A054A0]/20
          to-transparent

          min-[1800px]:block
        "
              />

              <div
                className="
          flex
          flex-wrap
          justify-center

          gap-3
          min-[400px]:gap-4

          sm:gap-6
        "
              >
                {journey.map((item, index) => (
                  <div
                    key={item.title}
                    className={`
    w-[calc(50%-0.5rem)]

    min-[600px]:w-[calc(50%-0.625rem)]

    md:w-[calc((100%-3rem)/3)]

    min-[1800px]:w-[calc((100%-6rem)/5)]

    ${index === journey.length - 1 ? "max-[599px]:mx-auto" : ""}
  `}
                  >
                    <JourneyCard item={item} index={index} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* POST A REQUIREMENT */}
        <section
          id="enquiry"
          className="relative isolate overflow-hidden py-[clamp(3.5rem,8vw,7.5rem)]"
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
                <h2 className="text-[clamp(1.2rem,4.2vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.055em] text-[#A054A0]">
                  Find your Perfect Space
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
                      <div className="space-y-2">
                        <label
                          htmlFor="requirementType"
                          className="text-xs font-semibold text-slate-600"
                        >
                          Requirement Type
                        </label>

                        <PremiumDropdown
                          id="requirementType"
                          name="requirementType"
                          value={requirementType}
                          placeholder="Select requirement type"
                          onChange={setRequirementType}
                          options={[
                            {
                              value: "Conventional",
                              label: "Conventional",
                            },
                            {
                              value: "Managed Office/Co-working",
                              label: "Managed Office / Co-working",
                            },
                          ]}
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="requirementCity"
                          className="text-xs font-semibold text-slate-600"
                        >
                          Preferred City
                        </label>

                        <PremiumDropdown
                          id="requirementCity"
                          name="requirementCity"
                          value={requirementCity}
                          placeholder="- Select your preferred city -"
                          onChange={setRequirementCity}
                          options={requirementCityOptions.map((city) => ({
                            value: city,
                            label: city,
                          }))}
                        />
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
                            label="Per Seat Cost / Month"
                            name="requirementSeatPrice"
                            type="number"
                            placeholder="Enter Min Seat price /Month"
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
                            label="Rent/sq.ft/Month"
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

                    <div className="flex flex-col gap-3 border-slate-200/60 sm:flex-row sm:items-center sm:justify-between">
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

        {/* ABOUT US */}
        <section
          id="aboutus"
          className="relative isolate overflow-hidden py-20 sm:py-24 md:py-20 lg:py-20"
        >
          <div className="relative z-10 mx-auto w-full max-w-[1920px] px-[clamp(1rem,4vw,5rem)]">
            <div className="mb-14 lg:mb-20 text-center">
              <h2 className="text-[clamp(1.2rem,4.2vw,4.5rem)] font-bold leading-[0.98] tracking-[-0.055em] text-[#A054A0]">
                About Anarock
              </h2>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <p className="text-xl text-center font-medium leading-relaxed tracking-tight text-slate-800 sm:text-2xl md:text-3xl">
                  Redefining real estate through intelligence, integrity and
                  impact.
                </p>

                <p className="mt-7 text-center text-lg leading-7 text-slate-500 sm:text-lg sm:leading-8">
                  Anarock combines 30+ years of institutional real estate
                  expertise with data-led intelligence, technology-driven
                  solutions and deep market relationships to deliver
                  comprehensive advisory and execution capabilities across India
                  and the Middle East.
                </p>
              </div>

              {/* <div className="mt-10 sm:mt-14 text-center">
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
              </div> */}
            </div>
          </div>
        </section>
      </div>

      {/* FORM SUBMISSION POPUP */}
      {submitMessage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submission-popup-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/95 p-7 shadow-[0_30px_100px_rgba(15,23,42,0.22)] backdrop-blur-2xl sm:p-8"
          >
            {/* Decorative glow */}
            <div
              className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl ${submitMessageType === "success"
                ? "bg-[#A054A0]/15"
                : "bg-red-400/10"
                }`}
            />

            {/* Close button */}
            <button
              type="button"
              onClick={() => setSubmitMessage("")}
              aria-label="Close"
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all duration-200 hover:bg-slate-200 hover:text-slate-800"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <div className="relative z-10 text-center">
              {/* Status icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.1,
                  duration: 0.4,
                  type: "spring",
                  stiffness: 220,
                  damping: 15,
                }}
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${submitMessageType === "success"
                  ? "bg-[#A054A0]/10 text-[#A054A0]"
                  : "bg-red-50 text-red-500"
                  }`}
              >
                {submitMessageType === "success" ? (
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                ) : (
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                )}
              </motion.div>

              {/* Title */}
              <h3
                id="submission-popup-title"
                className="mt-6 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl"
              >
                {submitMessageType === "success"
                  ? "Requirement Submitted"
                  : "Submission Unsuccessful"}
              </h3>

              {/* Message */}
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                {submitMessage}
              </p>

              {/* Action */}
              <button
                type="button"
                onClick={() => setSubmitMessage("")}
                className={`mt-7 inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${submitMessageType === "success"
                  ? "bg-[#A054A0] shadow-[#A054A0]/20 hover:bg-[#873D87]"
                  : "bg-slate-900 shadow-slate-900/15 hover:bg-slate-800"
                  }`}
              >
                {submitMessageType === "success" ? "Done" : "Try Again"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <CookieConsent
        onConsentGiven={() => {
          setConsentGranted(true);
          requestLocationPermission();
        }}
      />
    </>
  );
}
