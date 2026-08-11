"use client";

import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

export default function LocationButton() {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");

  const getLocation = () => {
    setError("");

    // Browser does not support geolocation
    if (!navigator.geolocation) {
      setError("Location is not supported by your browser.");
      return;
    }

    setLoading(true);

    /*
     * This requests the current location EVERY TIME
     * the button is clicked.
     *
     * The browser itself controls whether the
     * permission popup is displayed.
     */
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          console.log("Latitude:", latitude);
          console.log("Longitude:", longitude);

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
            throw new Error(
              data.message ||
                "Unable to find your location."
            );
          }

          console.log("Location result:", data.location);

          setLocation(data.location);
        } catch (err) {
          console.error(err);

          setError(
            err.message ||
              "Unable to determine your location."
          );
        } finally {
          setLoading(false);
        }
      },

      (error) => {
        console.error("Geolocation error:", error);

        setLoading(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError(
              "Location permission was denied. Please allow location access in your browser."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setError(
              "Your location could not be determined."
            );
            break;

          case error.TIMEOUT:
            setError(
              "Location request timed out. Please try again."
            );
            break;

          default:
            setError(
              "Unable to determine your location."
            );
        }
      },

      {
        enableHighAccuracy: true,

        // Don't use an old cached location
        maximumAge: 0,

        // Wait up to 15 seconds
        timeout: 15000,
      }
    );
  };

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={getLocation}
        disabled={loading}
        aria-label="Use my location"
        className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-black/20
          bg-white
          px-3
          py-2
          text-[11px]
          font-medium
          text-[#333]
          transition-all
          duration-200
          hover:border-black
          hover:bg-black/5
          disabled:cursor-not-allowed
          disabled:opacity-60

          sm:px-4
        "
      >
        {loading ? (
          <Loader2
            size={15}
            strokeWidth={1.8}
            className="animate-spin"
          />
        ) : (
          <MapPin
            size={15}
            strokeWidth={1.8}
          />
        )}

        <span className="hidden sm:inline">
          {loading
            ? "Locating..."
            : location
              ? location.area ||
                location.city ||
                "Location"
              : "Use my location"}
        </span>

        <span className="sm:hidden">
          {loading ? "..." : "Location"}
        </span>
      </button>

      {/* Location Result */}
      {location && (
        <div
          className="
            absolute
            left-0
            top-[calc(100%+10px)]
            z-[200]
            w-[260px]
            rounded-xl
            border
            border-black/10
            bg-white
            p-4
            shadow-[0_12px_35px_rgba(0,0,0,0.12)]
          "
        >
          <div className="mb-3 flex items-center gap-2">
            <MapPin
              size={16}
              className="text-[#A054A0]"
            />

            <span className="text-[12px] font-semibold text-black">
              Your Location
            </span>
          </div>

          <div className="space-y-2 text-[11px] text-[#555]">
            {location.area && (
              <div className="flex justify-between gap-4">
                <span>Area</span>

                <span className="font-medium text-black">
                  {location.area}
                </span>
              </div>
            )}

            {location.city && (
              <div className="flex justify-between gap-4">
                <span>City</span>

                <span className="font-medium text-black">
                  {location.city}
                </span>
              </div>
            )}

            {location.pincode && (
              <div className="flex justify-between gap-4">
                <span>Pincode</span>

                <span className="font-medium text-black">
                  {location.pincode}
                </span>
              </div>
            )}

            {location.state && (
              <div className="flex justify-between gap-4">
                <span>State</span>

                <span className="font-medium text-black">
                  {location.state}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 border-t border-black/10 pt-3">
            <div className="text-[9px] text-[#999]">
              Coordinates
            </div>

            <div className="mt-1 text-[10px] text-[#555]">
              {location.latitude.toFixed(6)},{" "}
              {location.longitude.toFixed(6)}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="
            absolute
            left-0
            top-[calc(100%+10px)]
            z-[200]
            w-[280px]
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-3
            text-[11px]
            leading-relaxed
            text-red-700
            shadow-[0_12px_35px_rgba(0,0,0,0.10)]
          "
        >
          {error}
        </div>
      )}
    </div>
  );
}