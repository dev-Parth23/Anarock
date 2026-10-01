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
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/30 backdrop-blur-sm transition-all p-0 sm:p-4">
      <div className="w-full max-h-[92vh] overflow-y-auto bg-white border-t-2 sm:border-2 border-[#8f3d8a] sm:rounded-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.15)] px-4 py-5 sm:px-6 sm:py-6 lg:px-12 lg:py-8 font-medium">
        <div className="max-w-[1320px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 lg:gap-10">
          <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#f8eaf7] flex items-center justify-center text-[#8f3d8a] shrink-0">
                <Cookie size={18} className="sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8f3d8a] truncate">
                  ANAROCK PROPERTY CONSULTANTS
                </span>
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight">
                  Your privacy, your choice
                </h3>
              </div>
            </div>
            <p className="text-[13px] sm:text-sm md:text-[15px] text-slate-600 leading-relaxed max-w-[760px]">
              We use cookies and similar technologies to personalise your experience, analyse site performance, and surface the most relevant commercial real estate opportunities for you. You remain in control of what we collect.
            </p>
          </div>

          <div className="w-full lg:w-[260px] flex flex-col gap-2 sm:gap-2.5 shrink-0">
            <button type="button" onClick={handleAcceptAll} className=" w-full min-h-11 sm:h-11 px-4 sm:px-5 py-2.5 sm:py-0 rounded-xl bg-[#8f3d8a] hover:bg-[#7e3479] active:bg-[#702d6b] text-white text-xs sm:text-sm     font-semibold transition-all shadow-sm">
              Accept All Cookies
            </button>
            <button type="button" onClick={handleEssentialOnly} className=" w-full min-h-11 sm:h-11 px-4 sm:px-5 py-2.5 sm:py-0 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-[#8f3d8a] text-xs sm:text-sm font-semibold transition-all shadow-sm">
              Essential Cookies Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}