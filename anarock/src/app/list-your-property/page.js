"use client";

import { useMemo, useState } from "react";
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
    Home,
    Info,
    MapPin,
    Phone,
    ShieldCheck,
    Sparkles,
    UserRound,
    X,
} from "lucide-react";

const STEPS = [
    "Property details",
    "Contact details",
    "Choose method",
    "Complete listing",
    "Review",
];

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

const cities = [
    "Delhi",
    "Gurugram",
    "Noida",
    "Bengaluru",
    "Mumbai",
    "Pune",
    "Hyderabad",
    "Chennai",
];

const times = [
    "9:00 AM – 11:00 AM",
    "11:00 AM – 1:00 PM",
    "1:00 PM – 3:00 PM",
    "3:00 PM – 5:00 PM",
    "5:00 PM – 7:00 PM",
];

export default function ListYourPropertyPage() {
    const [step, setStep] = useState(0);
    const [method, setMethod] = useState(null);
    const [form, setForm] = useState(initialForm);

    const [callbackTime, setCallbackTime] = useState("");
    const [callbackConsent, setCallbackConsent] = useState(false);

    const [formConsent, setFormConsent] = useState(false);
    const [showReview, setShowReview] = useState(false);

    const [submitted, setSubmitted] = useState(false);

    const [errors, setErrors] = useState({});

    const isCoworking = form.propertyType === "coworking";

    const updateField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [field]: "",
        }));
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

        if (!form.contactName.trim()) {
            nextErrors.contactName = "Contact name is required";
        }

        if (!form.phone.trim()) {
            nextErrors.phone = "Phone number is required";
        }

        if (!form.email.trim()) {
            nextErrors.email = "Email address is required";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const validateListing = () => {
        const nextErrors = {};

        if (isCoworking) {
            if (!form.seats) {
                nextErrors.seats = "Seat count is required";
            }

            if (!form.seatPriceMin) {
                nextErrors.seatPriceMin = "Minimum seat price is required";
            }
        } else {
            if (!form.area) {
                nextErrors.area = "Area is required";
            }

            if (!form.rentMin) {
                nextErrors.rentMin = "Minimum rent is required";
            }
        }

        if (!formConsent) {
            nextErrors.consent = "Please accept the declaration";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 0 && !validateBasicDetails()) return;
        if (step === 1 && !validateContact()) return;

        setStep((prev) => Math.min(prev + 1, 4));
    };

    const handleMethodSelect = (selectedMethod) => {
        setMethod(selectedMethod);

        if (selectedMethod === "callback") {
            setStep(2);
        } else {
            setStep(3);
        }
    };

    const handleCallbackSubmit = () => {
        if (!callbackTime || !callbackConsent) {
            setErrors({
                callback: "Please select a callback time and accept the consent.",
            });

            return;
        }

        setSubmitted(true);
    };

    const handleListingContinue = () => {
        if (!validateListing()) return;

        setShowReview(true);
    };

    const handleFinalSubmit = () => {
        setSubmitted(true);
        setShowReview(false);
    };

    const restart = () => {
        setStep(0);
        setMethod(null);
        setForm(initialForm);
        setCallbackTime("");
        setCallbackConsent(false);
        setFormConsent(false);
        setShowReview(false);
        setSubmitted(false);
        setErrors({});
    };

    return (
        <main className="min-h-screen bg-[#f7f7f8] text-[#171717]">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#18181b] text-white">
                            <Building2 size={20} />
                        </div>

                        <div>
                            <p className="text-[15px] font-semibold tracking-tight">
                                List Your Property
                            </p>
                            <p className="hidden text-[11px] text-black/45 sm:block">
                                Add your commercial property to our platform
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => window.history.back()}
                        className="hidden items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium transition hover:bg-black/[0.03] sm:flex"
                    >
                        <X size={15} />
                        Close
                    </button>
                </div>
            </header>

            {/* PROGRESS */}
            {!submitted && (
                <div className="border-b border-black/[0.06] bg-white">
                    <div className="mx-auto max-w-[1100px] px-5 py-5 sm:px-8">
                        <div className="flex items-center justify-between">
                            {STEPS.map((item, index) => {
                                const active = index === step;
                                const complete = index < step;

                                return (
                                    <div key={item} className="flex flex-1 items-center">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={[
                                                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all",
                                                    complete
                                                        ? "bg-[#18181b] text-white"
                                                        : active
                                                            ? "bg-[#f3d5b5] text-[#18181b] ring-4 ring-[#f3d5b5]/30"
                                                            : "bg-black/[0.05] text-black/40",
                                                ].join(" ")}
                                            >
                                                {complete ? <Check size={14} /> : index + 1}
                                            </div>

                                            <span
                                                className={[
                                                    "hidden text-xs font-medium sm:block",
                                                    active
                                                        ? "text-black"
                                                        : complete
                                                            ? "text-black/65"
                                                            : "text-black/35",
                                                ].join(" ")}
                                            >
                                                {item}
                                            </span>
                                        </div>

                                        {index < STEPS.length - 1 && (
                                            <div className="mx-3 h-px flex-1 bg-black/[0.08]" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <section className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8 lg:py-14">
                <AnimatePresence mode="wait">
                    {submitted ? (
                        <SuccessScreen
                            key="success"
                            method={method}
                            onRestart={restart}
                        />
                    ) : (
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            {step === 0 && (
                                <BasicDetails
                                    form={form}
                                    errors={errors}
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
                                    onBack={() => setStep(2)}
                                    onContinue={handleListingContinue}
                                />
                            )}

                            {step === 4 && showReview && (
                                <ReviewSubmission
                                    form={form}
                                    isCoworking={isCoworking}
                                    onBack={() => setShowReview(false)}
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
   BASIC DETAILS
========================================================= */

function BasicDetails({
    form,
    errors,
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
                    required
                    value={form.buildingName}
                    placeholder="e.g. DLF Cyber City"
                    error={errors.buildingName}
                    onChange={(value) => updateField("buildingName", value)}
                />

                <SelectField
                    label="City"
                    required
                    value={form.city}
                    options={cities}
                    placeholder="Select city"
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
                                    onClick={() =>
                                        updateField("propertyType", type.value)
                                    }
                                    className={[
                                        "group rounded-2xl border p-5 text-left transition-all",
                                        selected
                                            ? "border-[#18181b] bg-[#18181b] text-white shadow-lg"
                                            : "border-black/[0.08] bg-white hover:border-black/20 hover:shadow-md",
                                    ].join(" ")}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                {type.label}
                                            </p>

                                            <p
                                                className={[
                                                    "mt-1 text-xs leading-5",
                                                    selected
                                                        ? "text-white/60"
                                                        : "text-black/45",
                                                ].join(" ")}
                                            >
                                                {type.description}
                                            </p>
                                        </div>

                                        <div
                                            className={[
                                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                                                selected
                                                    ? "border-white bg-white text-black"
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
                        <p className="mt-2 text-xs text-red-500">
                            {errors.propertyType}
                        </p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <Field
                        label="Property address"
                        required
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

                <Field
                    label="Micromarket"
                    value={form.micromarket}
                    placeholder="e.g. Golf Course Road"
                    onChange={(value) => updateField("micromarket", value)}
                />
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

function ContactDetails({
    form,
    errors,
    updateField,
    onBack,
    onNext,
}) {
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
                    required
                    value={form.contactName}
                    placeholder="Your full name"
                    error={errors.contactName}
                    onChange={(value) => updateField("contactName", value)}
                />

                <Field
                    label="Phone number"
                    required
                    value={form.phone}
                    placeholder="+91 98765 43210"
                    error={errors.phone}
                    onChange={(value) => updateField("phone", value)}
                    icon={<Phone size={16} />}
                />

                <Field
                    label="Email address"
                    required
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

            <div className="mt-8 rounded-2xl border border-black/[0.06] bg-black/[0.025] p-5">
                <div className="flex gap-3">
                    <ShieldCheck
                        size={19}
                        className="mt-0.5 shrink-0 text-black/60"
                    />

                    <div>
                        <p className="text-sm font-semibold">
                            Your information is secure
                        </p>

                        <p className="mt-1 text-xs leading-5 text-black/50">
                            Your contact details will not be displayed publicly.
                            They are used for verification and communication regarding
                            your listing.
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
                        "Upload listing details",
                        "Review before submission",
                    ]}
                    onClick={() => onSelect("form")}
                    primary
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
                <div className="rounded-3xl border border-black/[0.07] bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] sm:p-8">
                    <div className="mb-7 flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3d5b5]">
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
                        {times.map((time) => {
                            const selected = callbackTime === time;

                            return (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={() => setCallbackTime(time)}
                                    className={[
                                        "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition",
                                        selected
                                            ? "border-[#18181b] bg-[#18181b] text-white"
                                            : "border-black/[0.08] hover:border-black/20 hover:bg-black/[0.02]",
                                    ].join(" ")}
                                >
                                    {time}

                                    {selected && <Check size={15} />}
                                </button>
                            );
                        })}
                    </div>

                    <label className="mt-7 flex cursor-pointer gap-3 rounded-xl border border-black/[0.06] bg-black/[0.02] p-4">
                        <input
                            type="checkbox"
                            checked={callbackConsent}
                            onChange={(e) =>
                                setCallbackConsent(e.target.checked)
                            }
                            className="mt-0.5 h-4 w-4 accent-black"
                        />

                        <span className="text-xs leading-5 text-black/55">
                            I agree to be contacted regarding my property listing and
                            understand that my information may be used for verification
                            purposes.
                        </span>
                    </label>

                    {error && (
                        <p className="mt-3 text-xs text-red-500">{error}</p>
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
                    <PrimaryButton onClick={onSubmit}>
                        Request callback
                        <Phone size={15} />
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
                            onChange={(value) =>
                                updateField("buildingName", value)
                            }
                        />

                        <Field
                            label="City"
                            value={form.city}
                            onChange={(value) => updateField("city", value)}
                        />

                        <Field
                            label="Micromarket"
                            value={form.micromarket}
                            onChange={(value) =>
                                updateField("micromarket", value)
                            }
                        />

                        <Field
                            label="Developer / Owner"
                            value={form.developer}
                            onChange={(value) =>
                                updateField("developer", value)
                            }
                        />

                        <div className="md:col-span-2">
                            <Field
                                label="Address"
                                value={form.address}
                                onChange={(value) =>
                                    updateField("address", value)
                                }
                            />
                        </div>
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
                                    required
                                    type="number"
                                    value={form.seats}
                                    error={errors.seats}
                                    placeholder="e.g. 250"
                                    onChange={(value) =>
                                        updateField("seats", value)
                                    }
                                />

                                <Field
                                    label="Operator"
                                    value={form.developer}
                                    placeholder="Operator name"
                                    onChange={(value) =>
                                        updateField("developer", value)
                                    }
                                />

                                <Field
                                    label="Minimum seat price / month"
                                    required
                                    type="number"
                                    value={form.seatPriceMin}
                                    error={errors.seatPriceMin}
                                    placeholder="₹ 0"
                                    onChange={(value) =>
                                        updateField("seatPriceMin", value)
                                    }
                                />

                                <Field
                                    label="Maximum seat price / month"
                                    type="number"
                                    value={form.seatPriceMax}
                                    placeholder="₹ 0"
                                    onChange={(value) =>
                                        updateField("seatPriceMax", value)
                                    }
                                />
                            </>
                        ) : (
                            <>
                                <Field
                                    label="Area"
                                    required
                                    type="number"
                                    value={form.area}
                                    error={errors.area}
                                    placeholder="e.g. 25000"
                                    suffix="sq ft"
                                    onChange={(value) =>
                                        updateField("area", value)
                                    }
                                />

                                <Field
                                    label="Minimum rent / month"
                                    required
                                    type="number"
                                    value={form.rentMin}
                                    error={errors.rentMin}
                                    placeholder="₹ 0"
                                    onChange={(value) =>
                                        updateField("rentMin", value)
                                    }
                                />

                                <Field
                                    label="Maximum rent / month"
                                    type="number"
                                    value={form.rentMax}
                                    placeholder="₹ 0"
                                    onChange={(value) =>
                                        updateField("rentMax", value)
                                    }
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
                                onChange={(e) =>
                                    updateField("description", e.target.value)
                                }
                                placeholder="Tell potential tenants about the property..."
                                className="w-full resize-none rounded-xl border border-black/[0.09] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-black/30 focus:border-black/30 focus:ring-4 focus:ring-black/[0.04]"
                            />
                        </div>
                    </div>
                </SectionCard>

                <SectionCard
                    number="03"
                    title="Declaration & privacy"
                    description="Please confirm before continuing."
                >
                    <label className="flex cursor-pointer gap-3 rounded-2xl border border-black/[0.07] bg-black/[0.02] p-5">
                        <input
                            type="checkbox"
                            checked={formConsent}
                            onChange={(e) =>
                                setFormConsent(e.target.checked)
                            }
                            className="mt-0.5 h-4 w-4 accent-black"
                        />

                        <div>
                            <p className="text-sm font-semibold">
                                I confirm that the information provided is accurate.
                            </p>

                            <p className="mt-1 text-xs leading-5 text-black/50">
                                I agree to the platform's privacy policy and understand
                                that the information may be reviewed by the property
                                administration team before publication.
                            </p>
                        </div>
                    </label>

                    {errors.consent && (
                        <p className="mt-2 text-xs text-red-500">
                            {errors.consent}
                        </p>
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
                <ReviewCard
                    title="Property"
                    icon={<Building2 size={18} />}
                >
                    <ReviewRow
                        label="Building"
                        value={form.buildingName}
                    />

                    <ReviewRow label="Type" value={isCoworking ? "Coworking" : "Conventional Office"} />

                    <ReviewRow label="City" value={form.city} />

                    <ReviewRow
                        label="Micromarket"
                        value={form.micromarket || "—"}
                    />

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

                <ReviewCard
                    title="Contact"
                    icon={<UserRound size={18} />}
                >
                    <ReviewRow
                        label="Contact"
                        value={form.contactName}
                    />

                    <ReviewRow label="Phone" value={form.phone} />

                    <ReviewRow label="Email" value={form.email} />
                </ReviewCard>

                <div className="flex items-start gap-3 rounded-2xl border border-[#d9c4a9] bg-[#fff7ed] p-5">
                    <Info
                        size={18}
                        className="mt-0.5 shrink-0 text-[#8a633f]"
                    />

                    <p className="text-xs leading-5 text-[#6f5135]">
                        After submission, our administration team will verify the
                        information. The property will only be published after
                        successful verification.
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
                    <PrimaryButton onClick={onSubmit}>
                        Submit property
                        <Check size={16} />
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
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#18181b] text-white shadow-xl"
            >
                <CheckCircle2 size={34} />
            </motion.div>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                Submission received
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {method === "callback"
                    ? "Your callback is scheduled."
                    : "Your property has been submitted."}
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-black/50">
                {method === "callback"
                    ? "Our property team will contact you during your selected time window and help you complete the listing."
                    : "Our administration team will review the information you've provided. Your property will be published after successful verification."}
            </p>

            <div className="mx-auto mt-10 max-w-md rounded-2xl border border-black/[0.07] bg-white p-5 text-left">
                <div className="flex items-start gap-3">
                    <ShieldCheck
                        size={19}
                        className="mt-0.5 shrink-0"
                    />

                    <div>
                        <p className="text-sm font-semibold">
                            What happens next?
                        </p>

                        <div className="mt-4 space-y-4">
                            {[
                                "Our team reviews your information",
                                "Property details are verified",
                                "Your property is approved",
                                "The property is published",
                            ].map((item, index) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/[0.05] text-[10px] font-semibold">
                                        {index + 1}
                                    </div>

                                    <span className="text-xs text-black/55">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={onRestart}
                className="mt-8 text-sm font-semibold underline underline-offset-4"
            >
                List another property
            </button>
        </div>
    );
}

/* =========================================================
   COMPONENTS
========================================================= */

function PageShell({
    eyebrow,
    title,
    description,
    icon,
    children,
}) {
    return (
        <div>
            <div className="mb-9 max-w-2xl">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3d5b5]">
                    {icon}
                </div>

                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/35">
                    {eyebrow}
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-[40px] sm:leading-[1.1]">
                    {title}
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
                    {description}
                </p>
            </div>

            {children}
        </div>
    );
}

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
                {label}{" "}
                {required && (
                    <span className="text-red-500">*</span>
                )}
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
                    onChange={(e) => onChange(e.target.value)}
                    className={[
                        "h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition",
                        icon ? "pl-11" : "",
                        suffix ? "pr-20" : "",
                        error
                            ? "border-red-300 focus:border-red-400"
                            : "border-black/[0.09] focus:border-black/30 focus:ring-4 focus:ring-black/[0.04]",
                    ].join(" ")}
                />

                {suffix && (
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-black/35">
                        {suffix}
                    </span>
                )}
            </div>

            {error && (
                <p className="mt-1.5 text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}

function SelectField({
    label,
    required,
    value,
    options,
    placeholder,
    error,
    onChange,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold">
                {label}{" "}
                {required && (
                    <span className="text-red-500">*</span>
                )}
            </label>

            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={[
                        "h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-sm outline-none transition",
                        error
                            ? "border-red-300"
                            : "border-black/[0.09] focus:border-black/30 focus:ring-4 focus:ring-black/[0.04]",
                        !value ? "text-black/35" : "text-black",
                    ].join(" ")}
                >
                    <option value="">{placeholder}</option>

                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
                />
            </div>

            {error && (
                <p className="mt-1.5 text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}

function MethodCard({
    icon,
    title,
    description,
    features,
    onClick,
    primary,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "group relative overflow-hidden rounded-3xl border p-7 text-left transition-all duration-300",
                primary
                    ? "border-black/[0.08] bg-white hover:-translate-y-1 hover:border-black/15 hover:shadow-[0_25px_70px_rgba(0,0,0,0.08)]"
                    : "border-black/[0.08] bg-white hover:-translate-y-1 hover:border-black/15 hover:shadow-[0_25px_70px_rgba(0,0,0,0.08)]",
            ].join(" ")}
        >
            <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3d5b5]">
                    {icon}
                </div>

                <ArrowRight
                    size={18}
                    className="text-black/30 transition-transform group-hover:translate-x-1 group-hover:text-black"
                />
            </div>

            <h3 className="mt-7 text-lg font-semibold tracking-tight">
                {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-black/45">
                {description}
            </p>

            <div className="mt-7 space-y-3">
                {features.map((feature) => (
                    <div
                        key={feature}
                        className="flex items-center gap-2.5"
                    >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black/[0.05]">
                            <Check size={11} />
                        </div>

                        <span className="text-xs text-black/60">
                            {feature}
                        </span>
                    </div>
                ))}
            </div>
        </button>
    );
}

function SectionCard({
    number,
    title,
    description,
    children,
}) {
    return (
        <div className="rounded-3xl border border-black/[0.07] bg-white p-6 shadow-[0_15px_50px_rgba(0,0,0,0.035)] sm:p-8">
            <div className="mb-7 flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/[0.05] text-xs font-semibold">
                    {number}
                </div>

                <div>
                    <h2 className="text-base font-semibold">
                        {title}
                    </h2>

                    <p className="mt-1 text-xs text-black/40">
                        {description}
                    </p>
                </div>
            </div>

            {children}
        </div>
    );
}

function ReviewCard({ title, icon, children }) {
    return (
        <div className="rounded-3xl border border-black/[0.07] bg-white p-6 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/[0.05]">
                    {icon}
                </div>

                <h2 className="text-sm font-semibold">
                    {title}
                </h2>
            </div>

            <div className="divide-y divide-black/[0.06]">
                {children}
            </div>
        </div>
    );
}

function ReviewRow({ label, value }) {
    return (
        <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <span className="text-xs text-black/40">
                {label}
            </span>

            <span className="text-sm font-medium sm:text-right">
                {value || "—"}
            </span>
        </div>
    );
}

function FormFooter({ left, right }) {
    return (
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>{left}</div>
            <div className="flex justify-end">{right}</div>
        </div>
    );
}

function PrimaryButton({ children, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#18181b] px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black hover:shadow-lg active:translate-y-0"
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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-black/[0.09] bg-white px-5 text-sm font-semibold transition hover:bg-black/[0.03]"
        >
            {children}
        </button>
    );
}