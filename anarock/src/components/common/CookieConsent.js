"use client";

import { useState, useEffect } from "react";
import { Cookie, ArrowUpRight } from "lucide-react";

export default function CookieConsent({ onConsentGiven }) {
  const [show, setShow] = useState(false);
  const [view, setView] = useState("overview");
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: true,
    preferences: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent_accepted");

    if (!consent) {
      setShow(true);
    } else {
      if (onConsentGiven) onConsentGiven();
    }
  }, [onConsentGiven]);

  const handleSave = (customPrefs) => {
    const finalPrefs = customPrefs || preferences;

    localStorage.setItem("cookie_consent_accepted", "true");
    localStorage.setItem("cookie_preferences", JSON.stringify(finalPrefs));

    setShow(false);

    if (onConsentGiven) onConsentGiven();
  };

  const handleAcceptAll = () => {
    const allOn = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };

    setPreferences(allOn);
    handleSave(allOn);
  };

  const handleEssentialOnly = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };

    setPreferences(essentialOnly);
    handleSave(essentialOnly);
  };

  const togglePreference = (key) => {
    if (key === "essential") return;

    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/30 backdrop-blur-sm transition-all p-0 sm:p-4">
      <div
        className="
          w-full
          max-h-[92vh]
          overflow-y-auto
          bg-white
          border-t-2
          sm:border-2
          border-[#8f3d8a]
          sm:rounded-2xl
          shadow-[0_-10px_30px_rgba(0,0,0,0.15)]
          px-4
          py-5
          sm:px-6
          sm:py-6
          lg:px-12
          lg:py-8
          font-medium
        "
      >
        <div
          className="
            max-w-[1320px]
            mx-auto
            flex
            flex-col
            lg:flex-row
            lg:items-center
            justify-between
            gap-5
            sm:gap-6
            lg:gap-10
          "
        >
          {/* Left Content */}
          <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
            {/* Heading */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div
                className="
                  w-9
                  h-9
                  sm:w-10
                  sm:h-10
                  rounded-xl
                  sm:rounded-2xl
                  bg-[#f8eaf7]
                  flex
                  items-center
                  justify-center
                  text-[#8f3d8a]
                  shrink-0
                "
              >
                <Cookie size={18} className="sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>

              <div className="min-w-0">
                <span
                  className="
                    block
                    text-[9px]
                    sm:text-[11px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-[#8f3d8a]
                    truncate
                  "
                >
                  {view === "overview"
                    ? "ANAROCK PROPERTY CONSULTANTS"
                    : "COOKIE PREFERENCES"}
                </span>

                <h3
                  className="
                    text-lg
                    sm:text-2xl
                    font-bold
                    text-slate-900
                    leading-tight
                  "
                >
                  {view === "overview"
                    ? "Your privacy, your choice"
                    : "Manage your consent"}
                </h3>
              </div>
            </div>

            {/* Description */}
            <p
              className="
                text-[13px]
                sm:text-sm
                md:text-[15px]
                text-slate-600
                leading-relaxed
                max-w-[760px]
              "
            >
              {view === "overview"
                ? "We use cookies and similar technologies to personalise your experience, analyse site performance, and surface the most relevant commercial real estate opportunities for you. You remain in control of what we collect."
                : "Toggle categories below. Essential cookies are always enabled and ensure the site functions correctly."}
            </p>

            {/* Overview View */}
            {view === "overview" && (
              <div
                className="
                  pt-1
                  sm:pt-2
                  flex
                  flex-wrap
                  items-center
                  gap-x-4
                  sm:gap-x-6
                  gap-y-2
                  text-xs
                  sm:text-sm
                  text-slate-500
                  font-medium
                "
              >
                <a
                  href="#privacy"
                  className="
                    flex
                    items-center
                    gap-1
                    text-[#8f3d8a]
                    font-semibold
                    hover:underline
                  "
                >
                  Read Privacy Policy
                  <ArrowUpRight size={13} className="sm:w-[14px] sm:h-[14px]" />
                </a>
              </div>
            )}

            {/* Preferences View */}
            {view === "preferences" && (
              <div
                className="
                  pt-1
                  sm:pt-2
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-2.5
                  sm:gap-3
                  max-w-[760px]
                "
              >
                {/* Essential */}
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    p-3
                    px-3.5
                    sm:px-4
                    rounded-xl
                    sm:rounded-2xl
                    border
                    border-slate-100
                    bg-[#f9f9fb]
                  "
                >
                  <div className="flex items-center gap-2 text-slate-800 text-xs sm:text-sm font-semibold min-w-0">
                    <span>Essential</span>

                    <span
                      className="
                        text-[8px]
                        sm:text-[10px]
                        uppercase
                        font-bold
                        tracking-wider
                        px-1.5
                        sm:px-2
                        py-0.5
                        rounded
                        bg-slate-200
                        text-slate-600
                        whitespace-nowrap
                      "
                    >
                      REQUIRED
                    </span>
                  </div>

                  <div
                    className="
                      w-10
                      sm:w-11
                      h-5.5
                      sm:h-6
                      bg-[#cca3cb]
                      rounded-full
                      p-0.5
                      opacity-80
                      cursor-not-allowed
                      flex
                      items-center
                      justify-end
                      shrink-0
                    "
                  >
                    <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 bg-white rounded-full shadow-sm" />
                  </div>
                </div>

                {/* Analytics */}
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    p-3
                    px-3.5
                    sm:px-4
                    rounded-xl
                    sm:rounded-2xl
                    border
                    border-slate-100
                    bg-[#f9f9fb]
                  "
                >
                  <div className="flex items-center gap-2 text-slate-800 text-xs sm:text-sm font-semibold">
                    <span>Analytics</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => togglePreference("analytics")}
                    className={`
                      w-10
                      sm:w-11
                      h-5.5
                      sm:h-6
                      rounded-full
                      p-0.5
                      transition-colors
                      flex
                      items-center
                      shrink-0
                      ${
                        preferences.analytics
                          ? "bg-[#8f3d8a] justify-end"
                          : "bg-slate-300 justify-start"
                      }
                    `}
                  >
                    <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 bg-white rounded-full shadow-sm" />
                  </button>
                </div>

                {/* Marketing */}
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    p-3
                    px-3.5
                    sm:px-4
                    rounded-xl
                    sm:rounded-2xl
                    border
                    border-slate-100
                    bg-[#f9f9fb]
                  "
                >
                  <div className="flex items-center gap-2 text-slate-800 text-xs sm:text-sm font-semibold">
                    <span>Marketing</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => togglePreference("marketing")}
                    className={`
                      w-10
                      sm:w-11
                      h-5.5
                      sm:h-6
                      rounded-full
                      p-0.5
                      transition-colors
                      flex
                      items-center
                      shrink-0
                      ${
                        preferences.marketing
                          ? "bg-[#8f3d8a] justify-end"
                          : "bg-slate-300 justify-start"
                      }
                    `}
                  >
                    <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 bg-white rounded-full shadow-sm" />
                  </button>
                </div>

                {/* Preferences */}
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    p-3
                    px-3.5
                    sm:px-4
                    rounded-xl
                    sm:rounded-2xl
                    border
                    border-slate-100
                    bg-[#f9f9fb]
                  "
                >
                  <div className="flex items-center gap-2 text-slate-800 text-xs sm:text-sm font-semibold">
                    <span>Preferences</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => togglePreference("preferences")}
                    className={`
                      w-10
                      sm:w-11
                      h-5.5
                      sm:h-6
                      rounded-full
                      p-0.5
                      transition-colors
                      flex
                      items-center
                      shrink-0
                      ${
                        preferences.preferences
                          ? "bg-[#8f3d8a] justify-end"
                          : "bg-slate-300 justify-start"
                      }
                    `}
                  >
                    <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 bg-white rounded-full shadow-sm" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Action Buttons */}
          <div
            className="
              w-full
              lg:w-[260px]
              flex
              flex-col
              gap-2
              sm:gap-2.5
              shrink-0
            "
          >
            {view === "overview" ? (
              <>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="
                    w-full
                    min-h-11
                    sm:h-11
                    px-4
                    sm:px-5
                    py-2.5
                    sm:py-0
                    rounded-xl
                    bg-[#8f3d8a]
                    hover:bg-[#7e3479]
                    active:bg-[#702d6b]
                    text-white
                    text-xs
                    sm:text-sm
                    font-semibold
                    transition-all
                    shadow-sm
                  "
                >
                  Accept All Cookies
                </button>

                <button
                  type="button"
                  onClick={() => setView("preferences")}
                  className="
                    w-full
                    min-h-11
                    sm:h-11
                    px-4
                    sm:px-5
                    py-2.5
                    sm:py-0
                    rounded-xl
                    bg-white
                    border
                    border-slate-200
                    hover:bg-slate-50
                    active:bg-slate-100
                    text-slate-800
                    text-xs
                    sm:text-sm
                    font-semibold
                    transition-all
                  "
                >
                  Manage Preferences
                </button>

                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="
                    w-full
                    min-h-11
                    sm:h-11
                    px-4
                    sm:px-5
                    py-2.5
                    sm:py-0
                    rounded-xl
                    bg-white
                    border
                    border-slate-200
                    hover:bg-slate-50
                    active:bg-slate-100
                    text-[#8f3d8a]
                    text-xs
                    sm:text-sm
                    font-semibold
                    transition-all
                  "
                >
                  Essential Cookies Only
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="
                    w-full
                    min-h-11
                    sm:h-11
                    px-4
                    sm:px-5
                    py-2.5
                    sm:py-0
                    rounded-xl
                    bg-[#8f3d8a]
                    hover:bg-[#7e3479]
                    active:bg-[#702d6b]
                    text-white
                    text-xs
                    sm:text-sm
                    font-semibold
                    transition-all
                    shadow-sm
                  "
                >
                  Save My Preferences
                </button>

                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="
                    w-full
                    min-h-11
                    sm:h-11
                    px-4
                    sm:px-5
                    py-2.5
                    sm:py-0
                    rounded-xl
                    bg-white
                    border
                    border-slate-200
                    hover:bg-slate-50
                    active:bg-slate-100
                    text-slate-800
                    text-xs
                    sm:text-sm
                    font-semibold
                    transition-all
                  "
                >
                  Accept All Cookies
                </button>

                <button
                  type="button"
                  onClick={() => setView("overview")}
                  className="
                    w-full
                    min-h-11
                    sm:h-11
                    px-4
                    sm:px-5
                    py-2.5
                    sm:py-0
                    rounded-xl
                    bg-white
                    border
                    border-slate-200
                    hover:bg-slate-50
                    active:bg-slate-100
                    text-[#8f3d8a]
                    text-xs
                    sm:text-sm
                    font-semibold
                    transition-all
                  "
                >
                  Back to Overview
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
