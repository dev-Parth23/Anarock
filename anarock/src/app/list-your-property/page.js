"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileCheck2,
  Info,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

const STEPS = [
  "Property details",
  "Contact details",
  "Choose method",
  "Complete listing",
  "Review",
];
const PRIMARY = "#A054A0";
const PRIMARY_DARK = "#7E3F82";
const PRIMARY_LIGHT = "#E8CBE8";

const initialForm = {
  buildingName: "",
  propertyType: "",
  city: "",
  micromarket: "",
  address: "",
  developer: "",
  ownerName: "",
  contactName: "",
  phone: "",
  email: "",
  area: "",
  seats: "",
  rentMin: "",
  rentMax: "",
  seatPriceMin: "",
  seatPriceMax: "",
  description: "",
};

const propertyTypes = [
  {
    value: "conventional",
    label: "Conventional Office",
    description: "Office spaces, commercial buildings & managed offices",
  },
  {
    value: "coworking",
    label: "Coworking",
    description: "Coworking spaces, flexible offices & managed workspaces",
  },
];

const callbackTimes = [
  "9:00 AM – 11:00 AM",
  "11:00 AM – 1:00 PM",
  "1:00 PM – 3:00 PM",
  "3:00 PM – 5:00 PM",
  "5:00 PM – 7:00 PM",
];

const STATIC_CITIES = [
  "Delhi",
  "Noida",
  "Gurgaon",
  "Bengaluru",
  "Mumbai",
  "Hyderabad",
  "Pune",
  "Chennai",
];

const STATIC_MICROMARKETS = {
  Delhi: ["Connaught Place", "Saket", "Nehru Place", "Okhla"],
  Noida: [
    "Sector 62",
    "Sector 132",
    "Sector 16",
    "Sector 18",
    "Noida Expressway",
  ],
  Gurgaon: [
    "Cyber City",
    "Golf Course Road",
    "Udyog Vihar",
    "Golf Course Extension",
    "Sohna Road",
  ],
  Bengaluru: [
    "Indiranagar",
    "Koramangala",
    "Whitefield",
    "MG Road",
    "Outer Ring Road",
  ],
  Mumbai: [
    "Bandra Kurla Complex (BKC)",
    "Lower Parel",
    "Andheri East",
    "Nariman Point",
  ],
  Hyderabad: ["Gachibowli", "Hitec City", "Madhapur", "Banjara Hills"],
  Pune: ["Baner", "Hinjawadi", "Koregaon Park", "Magarpatta"],
  Chennai: ["Anna Salai", "OMR", "Guindy", "T. Nagar"],
};

const ROUTE_CITY_STORAGE_KEYS = [
  "routeCity",
  "selectedCity",
  "userCity",
  "currentCity",
  "city",
  "locationCity",
  "userLocationCity",
];

/* =========================================================
   HELPERS
========================================================= */

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function uniqueValues(values) {
  const seen = new Set();

  return values
    .map((value) => String(value || "").trim())
    .filter((value) => {
      const key = normalize(value);

      if (!key || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

function getStorageCity() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    for (const key of ROUTE_CITY_STORAGE_KEYS) {
      const raw = window.localStorage.getItem(key);

      if (!raw) {
        continue;
      }
      try {
        const parsed = JSON.parse(raw);

        if (typeof parsed === "string") {
          if (parsed.trim()) {
            return parsed.trim();
          }
        }

        const city =
          parsed?.city ??
          parsed?.City ??
          parsed?.name ??
          parsed?.Name ??
          parsed?.location?.city ??
          parsed?.address?.city ??
          parsed?.result?.city ??
          "";

        if (city) {
          return String(city).trim();
        }
      } catch {
        if (raw.trim()) {
          return raw.trim();
        }
      }
    }
  } catch {
    return "";
  }

  return "";
}

function getRecordName(record) {
  if (typeof record === "string") {
    return record;
  }

  return (
    record?.name ??
    record?.Name ??
    record?.city ??
    record?.City ??
    record?.City_Name ??
    record?.Micromarket ??
    record?.Micromarket_Name ??
    ""
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function ListYourPropertyPage() {
  const [step, setStep] = useState(0);

  const [method, setMethod] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [cities, setCities] = useState([]);

  const [micromarkets, setMicromarkets] = useState([]);

  const [citiesLoading, setCitiesLoading] = useState(true);

  const [micromarketsLoading, setMicromarketsLoading] = useState(false);

  const [optionsError, setOptionsError] = useState("");

  const [callbackTime, setCallbackTime] = useState("");

  const [callbackConsent, setCallbackConsent] = useState(false);

  const [formConsent, setFormConsent] = useState(false);

  const [showReview, setShowReview] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");

  const [errors, setErrors] = useState({});

  const isCoworking = form.propertyType === "coworking";

  useEffect(() => {
    let cancelled = false;

    async function loadCities() {
      setCitiesLoading(true);
      setOptionsError("");

      const storedCity = getStorageCity();

      try {
        const response = await fetch(
          "/api/list-your-property?resource=cities",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || "Unable to load cities.");
        }

        if (cancelled) {
          return;
        }

        const apiCities = (result?.data || []).map(getRecordName);
        const crmCities = uniqueValues([...apiCities, ...STATIC_CITIES]);

        setCities(crmCities);

        if (storedCity) {
          const matchedCity = crmCities.find(
            (city) => normalize(city) === normalize(storedCity),
          );

          if (matchedCity) {
            setForm((previous) => ({
              ...previous,
              city: matchedCity,
              micromarket: "",
            }));
          } else if (crmCities.length === 0) {
            setForm((previous) => ({
              ...previous,
              city: storedCity,
              micromarket: "",
            }));
          }
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        // Fallback to static cities if API fails
        const crmCities = uniqueValues(STATIC_CITIES);
        setCities(crmCities);

        if (storedCity) {
          setForm((previous) => ({
            ...previous,
            city: storedCity,
            micromarket: "",
          }));

          setOptionsError(
            "City list loaded from static fallback. Your detected city has been selected.",
          );
        } else {
          setOptionsError("");
        }
      } finally {
        if (!cancelled) {
          setCitiesLoading(false);
        }
      }
    }

    loadCities();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMicromarkets() {
      const city = form.city;

      setMicromarkets([]);
      setMicromarketsLoading(false);

      if (!city) {
        return;
      }

      setMicromarketsLoading(true);
      setOptionsError("");

      try {
        const response = await fetch(
          `/api/list-your-property?resource=micromarkets&city=${encodeURIComponent(
            city,
          )}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || "Unable to load micromarkets.");
        }

        if (cancelled) {
          return;
        }

        const apiMicromarkets = (result?.data || []).map(getRecordName);
        const staticList = STATIC_MICROMARKETS[city] || [];
        const values = uniqueValues([...apiMicromarkets, ...staticList]);

        setMicromarkets(values);
        setForm((previous) => {
          const current = previous.micromarket;

          if (
            current &&
            !values.some((item) => normalize(item) === normalize(current))
          ) {
            return {
              ...previous,
              micromarket: "",
            };
          }

          return previous;
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        const staticList = STATIC_MICROMARKETS[city] || [];
        setMicromarkets(uniqueValues(staticList));

        setOptionsError("");
      } finally {
        if (!cancelled) {
          setMicromarketsLoading(false);
        }
      }
    }

    loadMicromarkets();

    return () => {
      cancelled = true;
    };
  }, [form.city]);

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
      ...(field === "city"
        ? {
            micromarket: "",
          }
        : {}),
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setSubmitError("");
  };

  const validateBasicDetails = () => {
    const nextErrors = {};

    if (!form.buildingName.trim()) {
      nextErrors.buildingName = "Building name is required";
    }

    if (!form.propertyType) {
      nextErrors.propertyType = "Please select a property type";
    }

    if (!form.city) {
      nextErrors.city = "Please select a city";
    }

    if (!form.address.trim()) {
      nextErrors.address = "Address is required";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const validateContact = () => {
    const nextErrors = {};
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateListing = () => {
    const nextErrors = {};

    if (!form.city) {
      nextErrors.city = "Please select a city";
    }

    if (!form.micromarket && micromarkets.length > 0) {
      nextErrors.micromarket = "Please select a micromarket";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* =====================================================
         NAVIGATION
      ===================================================== */

  const handleNext = () => {
    if (step === 0 && !validateBasicDetails()) {
      return;
    }

    if (step === 1 && !validateContact()) {
      return;
    }

    setStep((previous) => Math.min(previous + 1, 4));
  };

  const handleMethodSelect = (selectedMethod) => {
    setMethod(selectedMethod);
    setStep(3);
    setSubmitError("");
  };

  /* =====================================================
         SUBMISSION
      ===================================================== */

  const submitToServer = async (submissionMethod) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/list-your-property", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: submissionMethod,
          form,
          callbackTime,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Unable to submit your request.");
      }

      setSubmitted(true);
      setShowReview(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to submit your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallbackSubmit = async () => {
    if (!callbackTime || !callbackConsent) {
      setErrors({
        callback: "Please select a callback time and accept the consent.",
      });

      return;
    }

    await submitToServer("callback");
  };

  const handleListingContinue = () => {
    if (!validateListing()) {
      return;
    }

    setSubmitError("");
    setShowReview(true);
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    await submitToServer("form");
  };

  /* =====================================================
         RESTART
      ===================================================== */

  const restart = () => {
    const storedCity = getStorageCity();

    setStep(0);
    setMethod(null);

    setForm({
      ...initialForm,
      city: storedCity || "",
    });

    setMicromarkets([]);

    setCallbackTime("");
    setCallbackConsent(false);
    setFormConsent(false);

    setShowReview(false);
    setSubmitted(false);

    setIsSubmitting(false);
    setSubmitError("");
    setErrors({});
  };

  /* =====================================================
         RENDER
      ===================================================== */

  return (
    <main
      className="
                min-h-screen
                bg-[radial-gradient(circle_at_top_right,_rgba(160,84,160,0.14),_transparent_32%),linear-gradient(180deg,#fcfbfd_0%,#f7f5f8_100%)]
                text-[#171717]
            "
    >
      {!submitted && <ProgressHeader step={step} />}

      <section
        className="
                    mx-auto
                    max-w-[1180px]
                    px-4
                    py-8
                    sm:px-6
                    sm:py-10
                    lg:px-8
                    lg:py-14
                "
      >
        <AnimatePresence mode="wait">
          {submitted ? (
            <SuccessScreen key="success" method={method} onRestart={restart} />
          ) : (
            <motion.div
              key={`${step}-${showReview}`}
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -12,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              {step === 0 && (
                <BasicDetails
                  form={form}
                  errors={errors}
                  cities={cities}
                  micromarkets={micromarkets}
                  citiesLoading={citiesLoading}
                  micromarketsLoading={micromarketsLoading}
                  optionsError={optionsError}
                  updateField={updateField}
                  onNext={handleNext}
                />
              )}

              {step === 1 && (
                <ContactDetails
                  form={form}
                  errors={errors}
                  updateField={updateField}
                  onBack={() => setStep(0)}
                  onNext={handleNext}
                />
              )}

              {step === 2 && (
                <MethodSelection
                  onSelect={handleMethodSelect}
                  onBack={() => setStep(1)}
                />
              )}

              {step === 3 && method === "callback" && (
                <CallbackForm
                  callbackTime={callbackTime}
                  setCallbackTime={setCallbackTime}
                  callbackConsent={callbackConsent}
                  setCallbackConsent={setCallbackConsent}
                  error={errors.callback}
                  submitError={submitError}
                  isSubmitting={isSubmitting}
                  onBack={() => setStep(2)}
                  onSubmit={handleCallbackSubmit}
                />
              )}

              {step === 3 && method === "form" && !showReview && (
                <ListingForm
                  form={form}
                  errors={errors}
                  updateField={updateField}
                  isCoworking={isCoworking}
                  formConsent={formConsent}
                  setFormConsent={setFormConsent}
                  cities={cities}
                  micromarkets={micromarkets}
                  citiesLoading={citiesLoading}
                  micromarketsLoading={micromarketsLoading}
                  optionsError={optionsError}
                  onBack={() => setStep(2)}
                  onContinue={handleListingContinue}
                />
              )}

              {step === 4 && method === "form" && showReview && (
                <ReviewSubmission
                  form={form}
                  isCoworking={isCoworking}
                  submitError={submitError}
                  isSubmitting={isSubmitting}
                  onBack={() => {
                    setShowReview(false);
                    setStep(3);
                  }}
                  onSubmit={handleFinalSubmit}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}

/* =========================================================
   PROGRESS HEADER
========================================================= */

function ProgressHeader({ step }) {
  return (
    <div
      className="
                sticky
                top-0
                z-30
                border-b
                border-white/70
                bg-white/80
                shadow-[0_8px_30px_rgba(30,20,40,0.05)]
                backdrop-blur-xl
            "
    >
      <div
        className="
                    mx-auto
                    max-w-[1180px]
                    px-4
                    py-4
                    sm:px-6
                    lg:px-8
                "
      >
        <div className="flex items-center">
          {STEPS.map((item, index) => {
            const active = index === step;

            const complete = index < step;

            return (
              <div key={item} className="flex flex-1 items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all",
                      complete
                        ? "bg-[#A054A0] text-white shadow-[0_6px_18px_rgba(160,84,160,0.28)]"
                        : active
                          ? "bg-[#E8CBE8] text-[#6D356D] ring-4 ring-[#A054A0]/10"
                          : "bg-black/[0.05] text-black/40",
                    ].join(" ")}
                  >
                    {complete ? <Check size={14} /> : index + 1}
                  </div>

                  <span
                    className={[
                      "hidden text-xs font-medium sm:block",
                      active
                        ? "text-[#7E3F82]"
                        : complete
                          ? "text-black/65"
                          : "text-black/35",
                    ].join(" ")}
                  >
                    {item}
                  </span>
                </div>

                {index < STEPS.length - 1 && (
                  <div
                    className={[
                      "mx-2 h-px flex-1",
                      index < step ? "bg-[#A054A0]/35" : "bg-black/[0.08]",
                    ].join(" ")}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BASIC DETAILS
========================================================= */

function BasicDetails({
  form,
  errors,
  cities,
  micromarkets,
  citiesLoading,
  micromarketsLoading,
  optionsError,
  updateField,
  onNext,
}) {
  return (
    <PageShell
      eyebrow="01 / Property details"
      title="Tell us about your property"
      description="Start with a few basic details about the building you want to list."
      icon={<Building2 size={21} />}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Building name"
          value={form.buildingName}
          placeholder="e.g. DLF Cyber City"
          error={errors.buildingName}
          onChange={(value) => updateField("buildingName", value)}
        />

        <CitySelect
          value={form.city}
          options={cities}
          loading={citiesLoading}
          error={errors.city}
          onChange={(value) => updateField("city", value)}
        />

        <div className="md:col-span-2">
          <label className="mb-3 block text-sm font-semibold">
            Property type <span className="text-red-500">*</span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            {propertyTypes.map((type) => {
              const selected = form.propertyType === type.value;

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => updateField("propertyType", type.value)}
                  className={[
                    "group rounded-[24px] border p-5 text-left transition-all duration-300",
                    selected
                      ? "border-[#A054A0] bg-gradient-to-br from-[#A054A0] to-[#7E3F82] text-white shadow-[0_20px_50px_rgba(160,84,160,0.22)]"
                      : "border-black/[0.08] bg-white/80 hover:-translate-y-0.5 hover:border-[#A054A0]/30 hover:shadow-[0_20px_50px_rgba(30,20,40,0.07)]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{type.label}</p>

                      <p
                        className={[
                          "mt-1 text-xs leading-5",
                          selected ? "text-white/70" : "text-black/45",
                        ].join(" ")}
                      >
                        {type.description}
                      </p>
                    </div>

                    <div
                      className={[
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                        selected
                          ? "border-white bg-white text-[#A054A0]"
                          : "border-black/15",
                      ].join(" ")}
                    >
                      {selected && <Check size={13} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {errors.propertyType && (
            <p className="mt-2 text-xs text-red-500">{errors.propertyType}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <Field
            label="Property address"
            value={form.address}
            placeholder="Enter complete building address"
            error={errors.address}
            onChange={(value) => updateField("address", value)}
            icon={<MapPin size={16} />}
          />
        </div>

        <Field
          label="Developer / Owner"
          value={form.developer}
          placeholder="Developer or owner name"
          onChange={(value) => updateField("developer", value)}
        />

        <MicromarketSelect
          value={form.micromarket}
          options={micromarkets}
          loading={micromarketsLoading}
          disabled={!form.city}
          error={errors.micromarket}
          onChange={(value) => updateField("micromarket", value)}
        />

        {optionsError && (
          <div className="md:col-span-2 rounded-2xl border border-[#A054A0]/15 bg-[#A054A0]/[0.045] px-4 py-3 text-xs text-[#70456F]">
            {optionsError}
          </div>
        )}
      </div>

      <FormFooter
        right={
          <PrimaryButton onClick={onNext}>
            Continue
            <ArrowRight size={16} />
          </PrimaryButton>
        }
      />
    </PageShell>
  );
}

/* =========================================================
   CONTACT
========================================================= */

function ContactDetails({ form, errors, updateField, onBack, onNext }) {
  return (
    <PageShell
      eyebrow="02 / Contact details"
      title="How can we reach you?"
      description="We'll use these details only for property verification and listing communication."
      icon={<UserRound size={21} />}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Contact name"
          value={form.contactName}
          placeholder="Your full name"
          error={errors.contactName}
          onChange={(value) => updateField("contactName", value)}
        />

        <Field
          label="Phone number"
          value={form.phone}
          placeholder="+91 98765 43210"
          error={errors.phone}
          onChange={(value) => updateField("phone", value)}
          icon={<Phone size={16} />}
        />

        <Field
          label="Email address"
          value={form.email}
          placeholder="you@company.com"
          error={errors.email}
          onChange={(value) => updateField("email", value)}
        />

        <Field
          label="Owner / representative"
          value={form.ownerName}
          placeholder="Optional"
          onChange={(value) => updateField("ownerName", value)}
        />
      </div>

      <div className="mt-8 rounded-[24px] border border-[#A054A0]/10 bg-[#A054A0]/[0.035] p-5">
        <div className="flex gap-3">
          <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#A054A0]" />

          <div>
            <p className="text-sm font-semibold">Your information is secure</p>

            <p className="mt-1 text-xs leading-5 text-black/50">
              Your contact details will not be displayed publicly. They are used
              for verification and communication regarding your listing.
            </p>
          </div>
        </div>
      </div>

      <FormFooter
        left={
          <SecondaryButton onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </SecondaryButton>
        }
        right={
          <PrimaryButton onClick={onNext}>
            Continue
            <ArrowRight size={16} />
          </PrimaryButton>
        }
      />
    </PageShell>
  );
}

/* =========================================================
   METHOD SELECTION
========================================================= */

function MethodSelection({ onSelect, onBack }) {
  return (
    <PageShell
      eyebrow="03 / Choose how to proceed"
      title="How would you like to list?"
      description="Choose the option that works best for you. You can either complete the listing yourself or have our team assist you."
      icon={<Sparkles size={21} />}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <MethodCard
          icon={<FileCheck2 size={24} />}
          title="Fill it myself"
          description="Complete the property details yourself. You'll be able to review everything before submitting."
          features={[
            "Complete property information",
            "Review before submission",
            "Submit directly to our team",
          ]}
          onClick={() => onSelect("form")}
        />

        <MethodCard
          icon={<Phone size={24} />}
          title="Request a callback"
          description="Our property team will contact you and help complete the listing."
          features={[
            "Choose a convenient time",
            "Talk to our property team",
            "We help with the listing",
          ]}
          onClick={() => onSelect("callback")}
        />
      </div>

      <FormFooter
        left={
          <SecondaryButton onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </SecondaryButton>
        }
      />
    </PageShell>
  );
}

/* =========================================================
   CALLBACK
========================================================= */

function CallbackForm({
  callbackTime,
  setCallbackTime,
  callbackConsent,
  setCallbackConsent,
  error,
  submitError,
  isSubmitting,
  onBack,
  onSubmit,
}) {
  return (
    <PageShell
      eyebrow="03 / Callback"
      title="Let's complete this together"
      description="Select a preferred time and our property team will contact you."
      icon={<Phone size={21} />}
    >
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[28px] border border-white bg-white/80 p-6 shadow-[0_20px_60px_rgba(30,20,40,0.07)] backdrop-blur-xl sm:p-8">
          <div className="mb-7 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8CBE8] text-[#A054A0]">
              <Clock3 size={21} />
            </div>

            <div>
              <h3 className="text-base font-semibold">
                Select a preferred callback time
              </h3>

              <p className="mt-1 text-sm text-black/45">
                Our team will call you during the selected window.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {callbackTimes.map((time) => {
              const selected = callbackTime === time;

              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setCallbackTime(time)}
                  className={[
                    "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                    selected
                      ? "border-[#A054A0] bg-[#A054A0] text-white shadow-[0_10px_25px_rgba(160,84,160,0.18)]"
                      : "border-black/[0.08] bg-white hover:border-[#A054A0]/30 hover:bg-[#A054A0]/[0.03]",
                  ].join(" ")}
                >
                  {time}

                  {selected && <Check size={15} />}
                </button>
              );
            })}
          </div>

          <label className="mt-7 flex cursor-pointer gap-3 rounded-xl border border-[#A054A0]/10 bg-[#A054A0]/[0.025] p-4">
            <input
              type="checkbox"
              checked={callbackConsent}
              onChange={(event) => setCallbackConsent(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#A054A0]"
            />

            <span className="text-xs leading-5 text-black/55">
              I agree to be contacted regarding my property listing and
              understand that my information may be used for verification
              purposes.
            </span>
          </label>

          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

          {submitError && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
        </div>
      </div>

      <FormFooter
        left={
          <SecondaryButton onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </SecondaryButton>
        }
        right={
          <PrimaryButton onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Request callback
                <Phone size={15} />
              </>
            )}
          </PrimaryButton>
        }
      />
    </PageShell>
  );
}

/* =========================================================
   LISTING FORM
========================================================= */

function ListingForm({
  form,
  errors,
  updateField,
  isCoworking,
  formConsent,
  setFormConsent,
  micromarkets,
  micromarketsLoading,
  citiesLoading,
  cities,
  optionsError,
  onBack,
  onContinue,
}) {
  return (
    <PageShell
      eyebrow="03 / Property information"
      title="Complete your property listing"
      description="Provide the information that will be used to create your property profile."
      icon={<Building2 size={21} />}
    >
      <div className="space-y-6">
        <SectionCard
          number="01"
          title="Property overview"
          description="Basic information about your property."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Building name"
              value={form.buildingName}
              onChange={(value) => updateField("buildingName", value)}
            />

            <CitySelect
              value={form.city}
              options={cities}
              loading={citiesLoading}
              error={errors.city}
              onChange={(value) => updateField("city", value)}
            />

            <MicromarketSelect
              value={form.micromarket}
              options={micromarkets}
              loading={micromarketsLoading}
              disabled={!form.city}
              error={errors.micromarket}
              onChange={(value) => updateField("micromarket", value)}
            />

            <Field
              label="Developer / Owner"
              value={form.developer}
              placeholder="Developer or owner name"
              onChange={(value) => updateField("developer", value)}
            />

            <div className="md:col-span-2">
              <Field
                label="Address"
                value={form.address}
                onChange={(value) => updateField("address", value)}
              />
            </div>

            {optionsError && (
              <div className="md:col-span-2 rounded-2xl border border-[#A054A0]/15 bg-[#A054A0]/[0.045] px-4 py-3 text-xs text-[#70456F]">
                {optionsError}
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          number="02"
          title={isCoworking ? "Coworking information" : "Office information"}
          description={
            isCoworking
              ? "Tell us about the available coworking inventory."
              : "Tell us about the available office inventory."
          }
        >
          <div className="grid gap-5 md:grid-cols-2">
            {isCoworking ? (
              <>
                <Field
                  label="Seats offered"
                  type="number"
                  value={form.seats}
                  error={errors.seats}
                  placeholder="e.g. 250"
                  onChange={(value) => updateField("seats", value)}
                />

                <Field
                  label="Operator"
                  value={form.developer}
                  placeholder="Operator name"
                  onChange={(value) => updateField("developer", value)}
                />

                <Field
                  label="Minimum seat price / month"
                  type="number"
                  value={form.seatPriceMin}
                  error={errors.seatPriceMin}
                  placeholder="₹ 0"
                  onChange={(value) => updateField("seatPriceMin", value)}
                />

                <Field
                  label="Maximum seat price / month"
                  type="number"
                  value={form.seatPriceMax}
                  placeholder="₹ 0"
                  onChange={(value) => updateField("seatPriceMax", value)}
                />
              </>
            ) : (
              <>
                <Field
                  label="Area"
                  type="number"
                  value={form.area}
                  error={errors.area}
                  placeholder="e.g. 25000"
                  suffix="sq ft"
                  onChange={(value) => updateField("area", value)}
                />

                <Field
                  label="Minimum rent / month"
                  type="number"
                  value={form.rentMin}
                  error={errors.rentMin}
                  placeholder="₹ 0"
                  onChange={(value) => updateField("rentMin", value)}
                />

                <Field
                  label="Maximum rent / month"
                  type="number"
                  value={form.rentMax}
                  placeholder="₹ 0"
                  onChange={(value) => updateField("rentMax", value)}
                />
              </>
            )}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Property description
              </label>

              <textarea
                rows={5}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Tell potential tenants about the property..."
                className="
                                    w-full
                                    resize-none
                                    rounded-2xl
                                    border
                                    border-black/[0.09]
                                    bg-white/85
                                    px-4
                                    py-3
                                    text-sm
                                    outline-none
                                    transition
                                    placeholder:text-black/30
                                    focus:border-[#A054A0]/50
                                    focus:ring-4
                                    focus:ring-[#A054A0]/10
                                "
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          number="03"
          title="Declaration & privacy"
          description="Please confirm before continuing."
        >
          <label className="flex cursor-pointer gap-3 rounded-2xl border border-[#A054A0]/10 bg-[#A054A0]/[0.025] p-5">
            <input
              type="checkbox"
              checked={formConsent}
              onChange={(event) => setFormConsent(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#A054A0]"
            />

            <div>
              <p className="text-sm font-semibold">
                I confirm that the information provided is accurate.
              </p>

              <p className="mt-1 text-xs leading-5 text-black/50">
                I agree to the platform&apos;s privacy policy and understand
                that the information may be reviewed by the property
                administration team before publication.
              </p>
            </div>
          </label>

          {errors.consent && (
            <p className="mt-2 text-xs text-red-500">{errors.consent}</p>
          )}
        </SectionCard>
      </div>

      <FormFooter
        left={
          <SecondaryButton onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </SecondaryButton>
        }
        right={
          <PrimaryButton onClick={onContinue}>
            Review submission
            <ArrowRight size={16} />
          </PrimaryButton>
        }
      />
    </PageShell>
  );
}

/* =========================================================
   REVIEW
========================================================= */

function ReviewSubmission({
  form,
  isCoworking,
  submitError,
  isSubmitting,
  onBack,
  onSubmit,
}) {
  return (
    <PageShell
      eyebrow="04 / Review"
      title="Review your submission"
      description="Please review the information before submitting your property."
      icon={<FileCheck2 size={21} />}
    >
      <div className="space-y-5">
        <ReviewCard title="Property" icon={<Building2 size={18} />}>
          <ReviewRow label="Building" value={form.buildingName} />

          <ReviewRow
            label="Type"
            value={isCoworking ? "Coworking" : "Conventional Office"}
          />

          <ReviewRow label="City" value={form.city} />

          <ReviewRow label="Micromarket" value={form.micromarket || "—"} />

          <ReviewRow label="Address" value={form.address} />

          <ReviewRow
            label={isCoworking ? "Seats" : "Area"}
            value={
              isCoworking
                ? form.seats
                  ? `${form.seats} seats`
                  : "—"
                : form.area
                  ? `${form.area} sq ft`
                  : "—"
            }
          />
        </ReviewCard>

        <ReviewCard title="Contact" icon={<UserRound size={18} />}>
          <ReviewRow label="Contact" value={form.contactName} />

          <ReviewRow label="Phone" value={form.phone} />

          <ReviewRow label="Email" value={form.email} />
        </ReviewCard>

        {submitError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="flex items-start gap-3 rounded-2xl border border-[#A054A0]/15 bg-[#A054A0]/[0.045] p-5">
          <Info size={18} className="mt-0.5 shrink-0 text-[#A054A0]" />

          <p className="text-xs leading-5 text-[#70456F]">
            After submission, our administration team will verify the
            information. The property will only be published after successful
            verification.
          </p>
        </div>
      </div>

      <FormFooter
        left={
          <SecondaryButton onClick={onBack}>
            <ArrowLeft size={16} />
            Edit details
          </SecondaryButton>
        }
        right={
          <PrimaryButton onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit property
                <Check size={16} />
              </>
            )}
          </PrimaryButton>
        }
      />
    </PageShell>
  );
}

/* =========================================================
   SUCCESS
========================================================= */

function SuccessScreen({ method, onRestart }) {
  return (
    <div className="mx-auto max-w-2xl py-10 text-center">
      <motion.div
        initial={{
          scale: 0.85,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={{
          duration: 0.35,
        }}
        className="
                    mx-auto
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-[#A054A0]
                    to-[#7E3F82]
                    text-white
                    shadow-[0_20px_50px_rgba(160,84,160,0.28)]
                "
      >
        <CheckCircle2 size={34} />
      </motion.div>

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#A054A0]">
        Submission received
      </p>

      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
        {method === "callback"
          ? "Your callback request has been received."
          : "Your property has been submitted."}
      </h1>

      <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-black/50">
        {method === "callback"
          ? "Our property team will contact you during your selected time window and help you complete the listing."
          : "Our administration team will review the information you've provided. Your property will be published after successful verification."}
      </p>

      <div className="mx-auto mt-10 max-w-md rounded-[28px] border border-white bg-white/85 p-6 text-left shadow-[0_20px_60px_rgba(30,20,40,0.07)]">
        <div className="flex items-start gap-3">
          <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#A054A0]" />

          <div>
            <p className="text-sm font-semibold">What happens next?</p>

            <div className="mt-4 space-y-4">
              {[
                "Our team reviews your information",
                "Property details are verified",
                "Your property is approved",
                "The property is published",
              ].map((item, index) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8CBE8] text-[10px] font-semibold text-[#7E3F82]">
                    {index + 1}
                  </div>

                  <span className="text-xs text-black/55">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-8 text-sm font-semibold text-[#A054A0] underline underline-offset-4"
      >
        List another property
      </button>
    </div>
  );
}

/* =========================================================
   PAGE SHELL
========================================================= */

function PageShell({ eyebrow, title, description, icon, children }) {
  return (
    <div>
      <div className="mb-9 max-w-3xl">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#A054A0]/15 bg-gradient-to-br from-[#A054A0]/15 to-[#E8CBE8]/30 text-[#A054A0] shadow-[0_10px_30px_rgba(160,84,160,0.10)]">
          {icon}
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A054A0]">
          {eyebrow}
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-[42px] sm:leading-[1.06]">
          {title}
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-[15px]">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

/* =========================================================
   CITY SELECT
========================================================= */

function CitySelect({ value, options, loading, error, onChange }) {
  return (
    <SelectField
      label="City"
      required
      value={value}
      options={options}
      placeholder={loading ? "Loading cities..." : "Select city"}
      error={error}
      loading={loading}
      onChange={onChange}
    />
  );
}

/* =========================================================
   MICROMARKET SELECT
========================================================= */

function MicromarketSelect({
  value,
  options,
  loading,
  disabled,
  error,
  onChange,
}) {
  return (
    <SelectField
      label="Micromarket"
      required={options.length > 0}
      value={value}
      options={options}
      placeholder={
        disabled
          ? "Select city first"
          : loading
            ? "Loading micromarkets..."
            : options.length
              ? "Select micromarket"
              : "No micromarkets available"
      }
      error={error}
      loading={loading}
      disabled={disabled || loading || options.length === 0}
      onChange={onChange}
    />
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  required,
  value,
  placeholder,
  error,
  onChange,
  type = "text",
  icon,
  suffix,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={[
            "h-12 w-full rounded-xl border bg-white/85 px-4 text-sm outline-none shadow-[0_6px_25px_rgba(15,23,42,0.03)] backdrop-blur transition-all",
            icon ? "pl-11" : "",
            suffix ? "pr-20" : "",
            error
              ? "border-red-300 focus:border-red-400"
              : "border-black/[0.09] focus:border-[#A054A0]/50 focus:ring-4 focus:ring-[#A054A0]/10",
          ].join(" ")}
        />

        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-black/35">
            {suffix}
          </span>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  label,
  required,
  value,
  options,
  placeholder,
  error,
  loading,
  disabled,
  onChange,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={[
            "h-12 w-full appearance-none rounded-xl border bg-white/85 px-4 pr-12 text-sm outline-none shadow-[0_6px_25px_rgba(15,23,42,0.03)] backdrop-blur transition-all",
            error
              ? "border-red-300"
              : "border-black/[0.09] focus:border-[#A054A0]/50 focus:ring-4 focus:ring-[#A054A0]/10",
            !value ? "text-black/35" : "text-black",
            disabled ? "cursor-not-allowed bg-black/[0.025] opacity-60" : "",
          ].join(" ")}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        {loading ? (
          <Loader2
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#A054A0]"
          />
        ) : (
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
          />
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* =========================================================
   METHOD CARD
========================================================= */

function MethodCard({ icon, title, description, features, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
                group
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-white
                bg-white/80
                p-7
                text-left
                shadow-[0_15px_50px_rgba(30,20,40,0.045)]
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#A054A0]/20
                hover:shadow-[0_25px_70px_rgba(160,84,160,0.12)]
            "
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8CBE8] text-[#A054A0]">
          {icon}
        </div>

        <ArrowRight
          size={18}
          className="text-black/30 transition-transform group-hover:translate-x-1 group-hover:text-[#A054A0]"
        />
      </div>

      <h3 className="mt-7 text-lg font-semibold tracking-tight">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-black/45">{description}</p>

      <div className="mt-7 space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-2.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8CBE8] text-[#A054A0]">
              <Check size={11} />
            </div>

            <span className="text-xs text-black/60">{feature}</span>
          </div>
        ))}
      </div>
    </button>
  );
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({ number, title, description, children }) {
  return (
    <div className="rounded-[28px] border border-white bg-white/80 p-6 shadow-[0_15px_50px_rgba(30,20,40,0.045)] backdrop-blur-xl sm:p-8">
      <div className="mb-7 flex gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8CBE8] text-xs font-semibold text-[#7E3F82]">
          {number}
        </div>

        <div>
          <h2 className="text-base font-semibold">{title}</h2>

          <p className="mt-1 text-xs text-black/40">{description}</p>
        </div>
      </div>

      {children}
    </div>
  );
}

/* =========================================================
   REVIEW CARD
========================================================= */

function ReviewCard({ title, icon, children }) {
  return (
    <div className="rounded-[28px] border border-white bg-white/80 p-6 shadow-[0_15px_50px_rgba(30,20,40,0.045)] backdrop-blur-xl sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8CBE8] text-[#A054A0]">
          {icon}
        </div>

        <h2 className="text-sm font-semibold">{title}</h2>
      </div>

      <div className="divide-y divide-black/[0.06]">{children}</div>
    </div>
  );
}

/* =========================================================
   REVIEW ROW
========================================================= */

function ReviewRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <span className="text-xs text-black/40">{label}</span>

      <span className="text-sm font-medium sm:text-right">{value || "—"}</span>
    </div>
  );
}

/* =========================================================
   FORM FOOTER
========================================================= */

function FormFooter({ left, right }) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div>{left}</div>

      <div className="flex justify-end">{right}</div>
    </div>
  );
}

/* =========================================================
   PRIMARY BUTTON
========================================================= */

function PrimaryButton({ children, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="
                inline-flex
                h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#A054A0]
                px-5
                text-sm
                font-semibold
                text-white
                shadow-[0_12px_30px_rgba(160,84,160,0.22)]
                transition-all
                hover:-translate-y-0.5
                hover:bg-[#7E3F82]
                hover:shadow-[0_16px_36px_rgba(160,84,160,0.28)]
                active:translate-y-0
                disabled:cursor-not-allowed
                disabled:opacity-60
            "
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
                inline-flex
                h-12
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-black/[0.09]
                bg-white/85
                px-5
                text-sm
                font-semibold
                shadow-sm
                transition
                hover:border-[#A054A0]/25
                hover:bg-[#A054A0]/[0.03]
            "
    >
      {children}
    </button>
  );
}
