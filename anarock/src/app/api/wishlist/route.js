import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Session ID is required",
        },
        { status: 400 }
      );
    }

    const items = [];

    return NextResponse.json({
      success: true,
      sessionId,
      items,
      count: items.length,
    });
  } catch (error) {
    console.error("Wishlist GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch wishlist",
      },
      { status: 500 }
    );
  }
}