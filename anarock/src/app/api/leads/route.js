import { NextResponse } from "next/server";

// ============================================
// GET - Test API
// ============================================

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Leads API is working",
    zohoConfigured: !!process.env.ZOHO_CLIENT_ID,
  });
}

// ============================================
// GET ZOHO ACCESS TOKEN
// ============================================

async function getZohoAccessToken() {
  const response = await fetch(
    `${process.env.ZOHO_ACCOUNTS_URL}/oauth/v2/token`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },

      body: new URLSearchParams({
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: "refresh_token",
      }),
    },
  );

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    console.error("Zoho authentication error:", data);

    throw new Error(data.error || "Unable to authenticate with Zoho CRM");
  }

  return data.access_token;
}

// ============================================
// POST - CREATE LEAD
// ============================================

export async function POST(request) {
  try {
    // ----------------------------------------
    // 1. Get form data
    // ----------------------------------------

    const body = await request.json();

    console.log("Website enquiry:", body);

    const { fullName, phone, email, company } = body;

    // ----------------------------------------
    // 2. Validate required fields
    // ----------------------------------------

    if (!fullName || !phone || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name, phone number and email are required.",
        },
        {
          status: 400,
        },
      );
    }

    const nameParts = fullName.trim().split(/\s+/);

    let firstName = "";
    let lastName = "";

    if (nameParts.length === 1) {
      lastName = nameParts[0];
    } else {
      firstName = nameParts.slice(0, -1).join(" ");

      lastName = nameParts[nameParts.length - 1];
    }

    const accessToken = await getZohoAccessToken();
    const zohoResponse = await fetch(
      `${process.env.ZOHO_API_DOMAIN}/crm/v8/Leads`,
      {
        method: "POST",

        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,

          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          data: [
            {
              First_Name: firstName,
              Last_Name: lastName,
              Phone: phone,
              Email: email,
              Requirement_Type: "Conventional",
              Lead_Owner_Team: "Platform",
              Reqirement_City: "1164552000000647050",
              Company: company || "Anarock Website Enquiry",
              Lead_Source: "Others",
              Description:
                "Lead generated from Anarock Commercial Platform website.",
            },
          ],
        }),
      },
    );

    const zohoData = await zohoResponse.json();

    console.log("ZOHO CRM RESPONSE:", JSON.stringify(zohoData, null, 2));

    if (!zohoResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Zoho CRM could not create the lead.",
          zohoError: zohoData,
        },
        {
          status: zohoResponse.status,
        },
      );
    }

    return NextResponse.json({
      success: true,

      message: "Lead created successfully.",

      data: zohoData,
    });
  } catch (error) {
    console.error("Lead API error:", error);

    return NextResponse.json(
      {
        success: false,

        message:
          error.message || "Something went wrong while creating the lead.",
      },
      {
        status: 500,
      },
    );
  }
}
