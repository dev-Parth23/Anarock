import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { latitude, longitude } = await request.json();

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid latitude or longitude.",
        },
        { status: 400 }
      );
    }

    // OpenStreetMap Nominatim reverse geocoding
    const url = new URL(
      "https://nominatim.openstreetmap.org/reverse"
    );

    url.searchParams.set("lat", latitude);
    url.searchParams.set("lon", longitude);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("zoom", "18");
    url.searchParams.set("accept-language", "en");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "Anarock-CLA-Commercial-Platform/1.0",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Reverse geocoding failed: ${response.status}`
      );
    }

    const result = await response.json();

    const address = result.address || {};

    /*
     * Try several possible fields because different
     * locations return different OSM address structures.
     */

    const city =
      address.city ||
      address.town ||
      address.municipality ||
      address.village ||
      address.city_district ||
      "";

    const area =
      address.suburb ||
      address.neighbourhood ||
      address.locality ||
      address.quarter ||
      address.residential ||
      "";

    const pincode =
      address.postcode ||
      "";

    const state =
      address.state ||
      "";

    const country =
      address.country ||
      "";

    return NextResponse.json({
      success: true,

      location: {
        latitude,
        longitude,

        city,
        area,
        pincode,

        state,
        country,

        displayName: result.display_name || "",
      },

      rawAddress: address,
    });
  } catch (error) {
    console.error("Location API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Unable to determine your location.",
      },
      { status: 500 }
    );
  }
}