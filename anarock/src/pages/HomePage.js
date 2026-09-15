"use client";

import { useCallback } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CookieConsent from "@/components/CookieConsent";

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
            body: JSON.stringify({ latitude, longitude }),
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
      <Navbar />
      <main className="home-page">
        <HeroSection />
      </main>
      <CookieConsent onClose={requestLocationPermission} />
    </>
  );
}
