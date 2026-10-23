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
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight"> We value your privacy</h3>
              </div>
            </div>
            <p id="cookie-consent-description" className="max-w-3xl text-sm leading-5 text-slate-800 sm:text-base sm:leading-6 lg:text-[15px] lg:leading-7">
              We use cookies and similar technologies to personalise your
              experience, analyse site performance, and showcase the most
              relevant commercial real estate opportunities for you. You remain
              in control of what we collect.
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-5 text-slate-700 sm:mt-3 sm:text-sm sm:leading-6 lg:text-[15px] lg:leading-6">
              Cookies help us remember your shortlisted and compared properties,
              location, search history, and preferences to deliver a seamless,
              personalised experience.
            </p>
          </div>
          <div className="w-full lg:w-[300px] flex flex-col gap-2 sm:gap-2.5 shrink-0">
            <button type="button" onClick={handleAcceptAll} className=" w-full min-h-11 sm:h-11 px-4 sm:px-5 py-2.5 sm:py-0 rounded-xl bg-[#A054A0] hover:bg-[#A054A0] active:bg-[#A054A0] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:scale-95">
              Accept All Cookies
            </button>
            <button type="button" onClick={handleEssentialOnly} className="w-full min-h-11 sm:h-11 px-4 sm:px-5 py-2.5 sm:py-0 rounded-xl text-nowrap border border-dashed border-slate-400 hover:bg-slate-50  text-[#A054A0] text-xs sm:text-sm font-semibold transition-all shadow-sm hover:scale-95">
              Reject Non-Essential Cookies
            </button>
          </div>
        </div>
      </div>
    </div >
  );
}