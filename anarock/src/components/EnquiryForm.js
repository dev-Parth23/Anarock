"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export default function EnquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

async function submitForm(e) {
  e.preventDefault();

  const form = e.currentTarget;

  setLoading(true);
  setSubmitted(false);
  setError("");

  const formData = new FormData(form);

  const data = {
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    company: formData.get("company"),
  };

  try {
    const response = await fetch("/api/leads", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    });

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(
        `Server returned an invalid response (${response.status})`
      );
    }

    if (!response.ok || !result.success) {
      console.error("Zoho/API Error:", result);

      throw new Error(
        result.error?.data?.[0]?.message ||
        result.error?.message ||
        result.message ||
        "Unable to submit enquiry."
      );
    }

  

    setSubmitted(true);
    form.reset();

  } catch (error) {
    console.error("Submit error:", error);

    setError(
      error.message ||
      "Something went wrong. Please try again."
    );

  } finally {
    setLoading(false);
  }
}

  return (
    <form
      onSubmit={submitForm}
      className="w-full border border-black/10 bg-white p-5 sm:p-6 md:p-8"
    >
      {/* =========================================
          FORM GRID
      ========================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Full Name */}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="fullName"
            className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#555]"
          >
            Full name
          </label>

          <input
            id="fullName"
            name="fullName"
            required
            type="text"
            placeholder="Your name"
            autoComplete="name"
            className="h-11 w-full border border-black/10 bg-white px-3 text-sm text-black outline-none transition-colors placeholder:text-[#aaa] focus:border-black"
          />
        </div>

        {/* Phone */}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="phone"
            className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#555]"
          >
            Phone number
          </label>

          <input
            id="phone"
            name="phone"
            required
            type="tel"
            placeholder="+91"
            autoComplete="tel"
            className="h-11 w-full border border-black/10 bg-white px-3 text-sm text-black outline-none transition-colors placeholder:text-[#aaa] focus:border-black"
          />
        </div>

        {/* Email */}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#555]"
          >
            Work email
          </label>

          <input
            id="email"
            name="email"
            required
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            className="h-11 w-full border border-black/10 bg-white px-3 text-sm text-black outline-none transition-colors placeholder:text-[#aaa] focus:border-black"
          />
        </div>

        {/* Company */}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="company"
            className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#555]"
          >
            Company
          </label>

          <input
            id="company"
            name="company"
            type="text"
            placeholder="Company name"
            autoComplete="organization"
            className="h-11 w-full border border-black/10 bg-white px-3 text-sm text-black outline-none transition-colors placeholder:text-[#aaa] focus:border-black"
          />
        </div>
      </div>

      {/* =========================================
          SUBMIT
      ========================================== */}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-black px-6 text-[11px] font-semibold text-white transition-all hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Submitting...
            </>
          ) : (
            "Request a walkthrough"
          )}
        </button>

        <span className="text-[11px] leading-relaxed text-[#777]">
          No obligation. Our CLA team will get in touch.
        </span>
      </div>

      {/* =========================================
          SUCCESS
      ========================================== */}

      {submitted && (
        <div className="mt-5 flex items-center gap-2 border border-black/10 bg-[#f5f5f3] px-4 py-3 text-xs text-[#222]">
          <Check size={16} />
          Thanks! We'll be in touch shortly.
        </div>
      )}

      {/* =========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}
    </form>
  );
}
