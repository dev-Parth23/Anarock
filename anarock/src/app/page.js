"use client";

import HomePage from "@/pages/HomePage";
export default function Page() {
  return (
    <>

      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none -z-0"
        style={{
          backgroundImage:
            "linear-gradient(#A054A0 2px, transparent 2px), linear-gradient(90deg, #A054A0 2px, transparent 2px)",
          backgroundSize: "100% 100%",
        }}
      />

      <div className="relative z-10">
        <HomePage />
      </div>
    </>
  );
}
