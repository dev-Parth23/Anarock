import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const { latitude, longitude } = body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        {
          success: false,
          message: "Valid latitude and longitude are required.",
        },
        { status: 400 },
      );
    }

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", latitude.toString());
    url.searchParams.set("lon", longitude.toString());
    url.searchParams.set("zoom", "18");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "ANAROCK-Commercial-Website/1.0",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    console.log(response);
    if (!response.ok) {
      throw new Error(
        `Nominatim request failed with status ${response.status}`,
      );
    }

    const data = await response.json();

    const address = data?.address || {};

    const location = {
      city:
        address.city ||
        address.town ||
        address.municipality ||
        address.village ||
        address.city_district ||
        "",
      area:
        address.suburb ||
        address.neighbourhood ||
        address.residential ||
        address.quarter ||
        address.city_district ||
        "",
      pincode: address.postcode || "",
      state: address.state || "",
      country: address.country || "",
      displayName: data?.display_name || "",
    };

    return NextResponse.json({
      success: true,
      location,
    });
  } catch (error) {
    console.error("Location API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to determine location.",
      },
      { status: 500 },
    );
  }
}
