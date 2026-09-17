"use client";

import { useCallback } from "react";
import CookieConsent from "@/components/common/CookieConsent";
import HeroSection from "@/components/home/HeroSection";
import MarketStats from "@/components/home/MarketStats";
import Link from "next/link";

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
  X,
} from "lucide-react";

const popularCities = [
  {
    name: "Gurugram",
    url: "https://i.redd.it/xod5eka58r1f1.jpeg",
  },
  {
    name: "Pune",
    url: "https://images.unsplash.com/photo-1638205022792-85c33651ae2c?w=800&q=80",
  },
  {
    name: "Delhi",
    url: "https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg",
  },
  {
    name: "Bengaluru",
    url: "https://static.toiimg.com/photo/62507296/.jpg",
  },
  {
    name: "Mumbai",
    url: "https://cdn.getyourguide.com/image/format=auto%2Cfit=crop%2Cgravity=auto%2Cquality=60%2Cwidth=400%2Cheight=265%2Cdpr=2/tour_img/f26d681a32ddcd849cb30d5c7334d51bbcc4763cac1d1a8c313cea88436e8d28.png",
  },
  {
    name: "Hyderabad",
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWKsgqLEdw_YIERfsuq0p1kpVUOJVCUeoLTgnvYz-gq-BXQcZg30sbqjE&s=10",
  },
  {
    name: "Chennai",
    url: "https://www.pelago.com/img/collections/chennai/0527-0937_chennai.jpg",
  },
  {
    name: "Noida",
    url: "https://static.startuptalky.com/2026/06/noida-airport-clears-final-flight-trial-Startuptalky.jpg",
  },
  {
    name: "Kolkata",
    url: "https://s7ap1.scene7.com/is/image/incredibleindia/howrah-bridge-howrah-west-bengal-city-1-hero?qlt=82&ts=1742154305591",
  },
  {
    name: "Ahmedabad",
    url: "https://www.kiomoi.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fkmadmin%2Fimage%2Fupload%2Fc_scale%2Cw_1248%2Ff_auto%2Fv1560260650%2Fkiomoi%2FAhmedabad%2Fkankaria%20Lake%20%20(1).webp&w=3840&q=75",
  },
];

const popularDevelopers = [
  {
    name: "DLF",
    description:
      "A leading real estate developer with a strong commercial and residential portfolio.",
    category: "Commercial & Residential",
  },
  {
    name: "Embassy Group",
    description:
      "Known for premium office spaces, business parks, and integrated developments.",
    category: "Office & Business Parks",
  },
  {
    name: "RMZ",
    description:
      "Developing modern workspaces designed for global enterprises and growing businesses.",
    category: "Premium Workspaces",
  },
  {
    name: "Prestige Group",
    description:
      "A diversified developer with projects across commercial, retail, and residential sectors.",
    category: "Integrated Developments",
  },
];

const whyItems = [
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

export default function HomePage() {
  const requestLocationPermission = useCallback(() => {
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

          if (!response.ok || !data.success) {
            throw new Error(data?.message || "Unable to determine location.");
          }

          const location = {
            latitude,
            longitude,
            city: data.location?.city || "",
            area: data.location?.area || "",
            pincode: data.location?.pincode || "",
            state: data.location?.state || "",
            country: data.location?.country || "",
            displayName: data.location?.displayName || "",
          };

          sessionStorage.setItem(
            "anarock_user_location",
            JSON.stringify(location),
          );

          window.dispatchEvent(new Event("anarock-location-updated"));
        } catch (error) {
          console.error("Location capture failed:", error);
        }
      },
      (error) => {
        console.warn("Location permission/error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      },
    );
  }, []);

  return (
    <>
      <div className="premium-page relative w-full overflow-hidden bg-gradient-to-tr from-[#A054A0]/10 via-amber-200/5 to-purple-100/30 text-slate-800 selection:bg-[#A054A0] selection:text-white">
        <HeroSection />

        {/* MARKET AT A GLANCE */}
        <section
          id="market-glance"
          className="relative flex w-full items-center border-t border-slate-200"
        >
          <div className="relative z-10 mx-auto w-full max-w-[1920px] py-14 px-20">
            <div className="mb-12 text-left md:mb-16">
              <h2
                className=" bg-gradient-to-r from-[#A054A0] via-[#d54ed5] to-[#dd3bdd] 
                bg-clip-text text-3xl font-bold leading-tight text-transparent sm:text-4xl md:text-5xl"
              >
                Market at a Glance
              </h2>

              <p className=" mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base md:text-lg ">
                The trusted partner for India&apos;s most ambitious enterprises.
              </p>
            </div>

            <MarketStats />
          </div>
        </section>

        {/* ================= WHY CHOOSE ANAROCK ================= */}
        <section
          id="whychoose"
          className="relative w-[80vw] mx-auto overflow-hidden  py-8 sm:py-10 lg:py-14"
        >
          <div className=" w-full px-3 sm:px-5 lg:px-6">
            <div
              className="grid grid-cols-1 gap-2 rounded-[1.5rem] border border-[#E8E8E3] bg-[#FDFDFC] p-2 sm:gap-3 sm:rounded-[1.75rem] sm:p-3 
              lg:grid-cols-3 lg:grid-rows-[180px_180px_180px_130px]"
            >
              <div
                className="relative flex min-h-[230px] flex-col justify-center overflow-hidden rounded-[1.1rem] px-6 py-7 sm:min-h-[260px] sm:px-7
          sm:py-8 md:min-h-[280px] md:px-8 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:min-h-0 lg:px-8 lg:py-8 xl:px-10"
              >
                <div className="max-w-full lg:max-w-[280px]">
                  <h2 className=" bg-gradient-to-r from-[#be37be] via-[#d54ed5] to-[#A054A0] bg-clip-text text-3xl font-bold leading-tight text-transparent sm:text-4xl md:text-5xl">
                    Why <br /> Choose <br />
                    Anarock
                  </h2>

                  <p className="mt-7 max-w-[270px] text-xs leading-[1.7] text-[#71808D] sm:mt-8 sm:text-sm lg:mt-10">
                    The trusted partner for India&apos;s most ambitious
                    enterprises.
                  </p>
                </div>
              </div>

              {whyItems.map((item, index) => {
                const Icon = item.icon;
                const gridPosition = [
                  "lg:col-start-2 lg:col-span-1 lg:row-start-1",
                  "lg:col-start-3 lg:col-span-1 lg:row-start-1",
                  "lg:col-start-2 lg:col-span-2 lg:row-start-2",
                  "lg:col-start-1 lg:col-span-2 lg:row-start-3",
                  "lg:col-start-3 lg:col-span-1 lg:row-start-3",
                  "lg:col-start-1 lg:col-span-3 lg:row-start-4",
                ];

                return (
                  <div
                    key={item.title}
                    className={`group relative flex min-h-[180px] min-w-0 flex-col justify-between overflow-hidden rounded-[1.1rem] border border-black/20
              p-5 transition-colors duration-300 hover:border-[#DCDCD5] sm:min-h-[200px] sm:p-6 md:min-h-[210px] md:p-7
              lg:min-h-0 lg:p-6 xl:p-7 bg-white ${gridPosition[index] || ""}`}
                  >
                    <div
                      className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/40 blur-3xl opacity-0 transition-opacity duration-500
                group-hover:opacity-100"
                    />

                    <div className="relative z-10 flex items-start justify-between gap-3">
                      <h3 className="min-w-0 max-w-[calc(100%-2.75rem)] text-[15px] font-semibold leading-[1.3] tracking-[-0.035em] text-[#172637] sm:text-base lg:text-[clamp(0.95rem,1.2vw,1.2rem)]">
                        {item.title}
                      </h3>
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#DDE0DE] bg-white/65 text-[#687783] transition-colors duration-300
                  group-hover:border-[#C6B2D0] group-hover:text-[#fff] group-hover:bg-[#A054A0]"
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <p className="relative z-10 mt-6 text-xs leading-[1.7] text-[#66788B] sm:text-sm lg:mt-5">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        {/* ================= CLIENT JOURNEY ================= */}
        <section className="relative overflow-hidden bg-[#FCFBFF] py-24 md:py-28">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(#A054A0 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A054A0]/10 blur-[140px]" />

          <div className="pointer-events-none absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-purple-200/20 blur-[100px]" />

          <div className="pointer-events-none absolute -right-32 bottom-1/4 h-72 w-72 rounded-full bg-fuchsia-200/20 blur-[100px]" />

          <div className="relative z-10 mx-auto w-full max-w-[1920px] px-[clamp(1rem,2.4vw,4rem)]">
            <div className="mb-16 text-center md:mb-20">
              <h2 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
                The Client{" "}
                <span className="bg-gradient-to-r from-[#A054A0] via-[#b14db1] to-[#7a377a] bg-clip-text text-transparent">
                  Journey
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 md:text-lg">
                A seamless, insight-led process to help you find, evaluate, and
                secure the right commercial space.
              </p>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden -translate-y-1/2 items-center lg:flex">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#A054A0]/20 to-transparent" />

                <div className="absolute left-0 h-px w-24 bg-gradient-to-r from-transparent via-[#A054A0] to-transparent" />
              </div>

              <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                {journey.map((item, index) => (
                  <div
                    key={item.title}
                    className="group relative rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#A054A0]/40 hover:shadow-[0_20px_50px_rgba(160,84,160,0.12)] md:p-8"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A054A0]/10 text-[#A054A0] transition-all duration-300 group-hover:bg-[#A054A0] group-hover:text-white">
                        <item.icon className="h-6 w-6" />
                      </div>

                      <span className="text-sm font-semibold text-[#A054A0]/50">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="mb-3 text-xl font-semibold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-slate-500">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-fuchsia-200/20 blur-[100px]" />

          <div className="relative z-10 mx-auto w-full max-w-[1920px] px-[clamp(1rem,2.4vw,4rem)]">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#A054A0]/20 bg-[#A054A0]/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A054A0] sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A054A0]" />
                Let&apos;s Connect
              </span>

              <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
                Find Your{" "}
                <span className="bg-gradient-to-r from-[#A054A0] via-[#b14db1] to-[#7a377a] bg-clip-text text-transparent">
                  Perfect Space
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 md:text-lg">
                Tell us what you&apos;re looking for, and our experts will help
                you discover the right commercial real estate opportunity.
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-5xl rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_25px_80px_rgba(160,84,160,0.08)] backdrop-blur-xl sm:p-8 md:p-12">
              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  const formData = new FormData(e.currentTarget);
                  const data = Object.fromEntries(formData.entries());

                  console.log("Requirement form submitted:", data);

                  alert(
                    "Thank you! Our team will get in touch with you shortly.",
                  );

                  e.currentTarget.reset();
                }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Full Name <span className="text-[#A054A0]">*</span>
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#A054A0] focus:bg-white focus:ring-4 focus:ring-[#A054A0]/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Contact Number <span className="text-[#A054A0]">*</span>
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="Enter your contact number"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#A054A0] focus:bg-white focus:ring-4 focus:ring-[#A054A0]/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#A054A0] focus:bg-white focus:ring-4 focus:ring-[#A054A0]/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="company"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Company Name
                    </label>

                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Enter your company name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#A054A0] focus:bg-white focus:ring-4 focus:ring-[#A054A0]/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="requirementType"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Requirement Type <span className="text-[#A054A0]">*</span>
                    </label>

                    <select
                      id="requirementType"
                      name="requirementType"
                      required
                      defaultValue=""
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all focus:border-[#A054A0] focus:bg-white focus:ring-4 focus:ring-[#A054A0]/10"
                    >
                      <option value="" disabled>
                        Select requirement type
                      </option>

                      <option value="Office Space">Office Space</option>
                      <option value="Retail Space">Retail Space</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Land">Land</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="location"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Preferred Location{" "}
                      <span className="text-[#A054A0]">*</span>
                    </label>

                    <input
                      id="location"
                      name="location"
                      type="text"
                      required
                      placeholder="City or preferred location"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#A054A0] focus:bg-white focus:ring-4 focus:ring-[#A054A0]/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="area"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Required Area
                    </label>

                    <input
                      id="area"
                      name="area"
                      type="text"
                      placeholder="e.g. 10,000 sq. ft."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#A054A0] focus:bg-white focus:ring-4 focus:ring-[#A054A0]/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="budget"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Budget
                    </label>

                    <input
                      id="budget"
                      name="budget"
                      type="text"
                      placeholder="Enter your budget"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#A054A0] focus:bg-white focus:ring-4 focus:ring-[#A054A0]/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Additional Requirements
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Tell us more about your requirements..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#A054A0] focus:bg-white focus:ring-4 focus:ring-[#A054A0]/10"
                  />
                </div>

                <div className="flex flex-col items-center justify-between gap-5 border-t border-slate-100 pt-6 sm:flex-row">
                  <p className="max-w-md text-center text-xs leading-relaxed text-slate-400 sm:text-left">
                    By submitting this form, you agree to be contacted by our
                    team regarding your requirement.
                  </p>

                  <button
                    type="submit"
                    className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-slate-900 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1 hover:bg-[#A054A0] hover:shadow-[#A054A0]/20 sm:w-auto"
                  >
                    Submit Requirement
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
        {/* ================= POPULAR DEVELOPERS ================= */}
        <section className="relative overflow-hidden bg-white py-20 md:py-28">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(#A054A0 1px, transparent 1px), linear-gradient(90deg, #A054A0 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative z-10 mx-auto w-full max-w-[1920px] px-[clamp(1rem,2.4vw,4rem)]">
            <div className="mb-12 flex flex-col justify-between gap-5 md:mb-16 md:flex-row md:items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A054A0]">
                  Trusted Names
                </span>

                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                  Popular Developers
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
                  Explore leading developers shaping India&apos;s commercial
                  real estate landscape.
                </p>
              </div>

              <Link
                href="/developers"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#A054A0]"
              >
                Explore Developers
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {popularDevelopers.map((developer, index) => (
                <div
                  key={developer.name}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all duration-500 hover:-translate-y-2 hover:border-[#A054A0]/40 hover:shadow-[0_20px_50px_rgba(160,84,160,0.12)] md:p-8"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#A054A0]/5 blur-3xl transition-all group-hover:bg-[#A054A0]/15" />

                  <div className="relative z-10">
                    <div className="mb-8 flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A054A0]/10 text-xl font-bold text-[#A054A0]">
                        {developer.name.charAt(0)}
                      </div>

                      <span className="text-xs font-semibold text-slate-300">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">
                      {developer.name}
                    </h3>

                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#A054A0]">
                      {developer.category}
                    </p>

                    <p className="mt-5 text-sm leading-relaxed text-slate-500">
                      {developer.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= POPULAR CITIES ================= */}
        <section className="relative overflow-hidden bg-[#FCFBFF] py-20 md:py-28">
          <div className="relative z-10 mx-auto w-full max-w-[1920px] px-[clamp(1rem,2.4vw,4rem)]">
            <div className="mb-12 flex flex-col justify-between gap-5 md:mb-16 md:flex-row md:items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A054A0]">
                  Explore Locations
                </span>

                <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                  Explore Popular Cities
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
                  Discover premium commercial real estate opportunities across
                  India&apos;s leading business destinations.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>Swipe to explore</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            <div className="cities-scroller flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 overscroll-x-contain [scrollbar-width:thin]">
              {popularCities.map((city) => (
                <Link
                  key={city.name}
                  href={`/properties?city=${encodeURIComponent(city.name)}`}
                  className="group relative min-w-[min(76vw,300px)] snap-start overflow-hidden rounded-3xl border border-slate-200 bg-white sm:min-w-[240px] md:min-w-[260px] lg:min-w-[280px]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={city.url}
                      alt={city.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-xl font-bold text-white md:text-2xl">
                          {city.name}
                        </h3>

                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all group-hover:bg-white group-hover:text-[#A054A0]">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-white/70">
                        Explore commercial properties
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ================= ABOUT US ================= */}
        <section
          id="about"
          className="relative overflow-hidden bg-white py-20 md:py-32"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(#A054A0 1px, transparent 1px), linear-gradient(90deg, #A054A0 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[#A054A0]/10 blur-[130px]" />

          <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-200/30 blur-[130px]" />

          <div className="relative z-10 mx-auto grid w-full max-w-[1920px] grid-cols-1 items-center gap-12 px-[clamp(1rem,2.4vw,4rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#A054A0]/20 bg-[#A054A0]/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#A054A0]">
                About Anarock
              </span>

              <h2 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                Building Better{" "}
                <span className="bg-gradient-to-r from-[#A054A0] via-[#b14db1] to-[#7a377a] bg-clip-text text-transparent">
                  Business Spaces
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
                We help businesses make confident real estate decisions through
                market intelligence, strategic advisory, and technology-led
                solutions.
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
                From identifying the right location to evaluating commercial
                opportunities, our approach combines expertise, data, and
                execution to simplify every stage of your real estate journey.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-3 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#A054A0]"
                >
                  Discover Our Story
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 rounded-full border border-[#A054A0]/30 px-6 py-3.5 text-sm font-semibold text-[#A054A0] transition-all duration-300 hover:-translate-y-1 hover:bg-[#A054A0] hover:text-white"
                >
                  Talk to an Expert
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-[2rem] border border-[#A054A0]/15 bg-gradient-to-br from-[#A054A0]/10 via-white to-purple-50 p-6 shadow-[0_25px_80px_rgba(160,84,160,0.10)] sm:p-8 md:p-10">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#A054A0]/10 blur-3xl" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A054A0]">
                      Our Approach
                    </span>

                    <Sparkles className="h-5 w-5 text-[#A054A0]" />
                  </div>

                  <div className="mt-10 space-y-6">
                    {[
                      {
                        title: "Intelligence",
                        text: "Data-backed insights for better decisions.",
                      },
                      {
                        title: "Expertise",
                        text: "Deep understanding of commercial markets.",
                      },
                      {
                        title: "Execution",
                        text: "Strategic support from search to closure.",
                      },
                    ].map((item, index) => (
                      <div
                        key={item.title}
                        className="flex gap-4 border-b border-slate-200/80 pb-6 last:border-0 last:pb-0"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#A054A0]/10 text-sm font-bold text-[#A054A0]">
                          0{index + 1}
                        </span>

                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {item.title}
                          </h3>

                          <p className="mt-1 text-sm leading-relaxed text-slate-500">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 rounded-2xl border border-[#A054A0]/15 bg-white/70 p-5 backdrop-blur-md">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Our Philosophy
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      Intelligence. Expertise. Results.
                    </p>
                  </div>

                  <Link
                    href="https://www.anarock.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center justify-center gap-3 rounded-full border border-[#A054A0]/30 px-5 py-3 text-sm font-semibold text-[#A054A0] transition-all duration-300 hover:-translate-y-1 hover:bg-[#A054A0] hover:text-white"
                  >
                    More About Us
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <CookieConsent onClose={requestLocationPermission} />
    </>
  );
}
