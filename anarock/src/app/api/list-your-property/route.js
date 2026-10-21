import { NextResponse } from "next/server";
const RESEND_API_URL = "https://api.resend.com/emails";

const CRM_API_DOMAIN = "https://www.zohoapis.in";
const CITY_MODULE = "City";
const MICROMARKET_MODULE = "Micromarkets";
const MICROMARKET_CITY_FIELD = "City";
function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function normalize(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}
function uniqueValues(values) {
    const map = new Map();
    for (const value of values) {
        const cleaned = String(value || "").trim();
        if (!cleaned) {
            continue;
        }
        const key = normalize(cleaned);
        if (!map.has(key)) {
            map.set(key, cleaned);
        }
    }
    return Array.from(map.values());
}
function getRecordName(record) {
    if (typeof record === "string") {
        return record;
    }
    return (
        record?.Name ??
        record?.name ??
        record?.City ??
        record?.city ??
        record?.City_Name ??
        record?.city_name ??
        record?.Micromarket ??
        record?.Micromarket_Name ??
        ""
    );
}
function getMicromarketCity(record) {
    const value =
        record?.[MICROMARKET_CITY_FIELD] ??
        record?.City ??
        record?.city ??
        record?.City_Name ??
        record?.city_name ??
        "";
    if (typeof value === "string") {
        return value;
    }
    return (
        value?.name ??
        value?.Name ??
        value?.display_value ??
        value?.displayValue ??
        ""
    );
}
function matchesCity(record, requestedCity) {
    return normalize(getMicromarketCity(record)) === normalize(requestedCity);
}

async function getZohoAccessToken() {
    if (process.env.ZOHO_CRM_ACCESS_TOKEN) {
        return process.env.ZOHO_CRM_ACCESS_TOKEN;
    }
    const {
        ZOHO_CRM_REFRESH_TOKEN,
        ZOHO_CRM_CLIENT_ID,
        ZOHO_CRM_CLIENT_SECRET,
        ZOHO_ACCOUNTS_DOMAIN,
    } = process.env;

    if (
        !ZOHO_CRM_REFRESH_TOKEN ||
        !ZOHO_CRM_CLIENT_ID ||
        !ZOHO_CRM_CLIENT_SECRET
    ) {
        throw new Error("Zoho CRM credentials are not configured.");
    }

    const accountsDomain = ZOHO_ACCOUNTS_DOMAIN || "https://accounts.zoho.in";

    const params = new URLSearchParams({
        refresh_token: ZOHO_CRM_REFRESH_TOKEN,
        client_id: ZOHO_CRM_CLIENT_ID,
        client_secret: ZOHO_CRM_CLIENT_SECRET,
        grant_type: "refresh_token",
    });

    const response = await fetch(
        `${accountsDomain}/oauth/v2/token?${params.toString()}`,
        {
            method: "POST",
            cache: "no-store",
        },
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.access_token) {
        console.error("Zoho token error:", data);
        throw new Error("Unable to authenticate with Zoho CRM.");
    }
    return data.access_token;
}
async function getCRMRecords(moduleName) {
    const accessToken = await getZohoAccessToken();
    const records = [];
    let page = 1;
    while (page <= 20) {
        const url = new URL(
            `${CRM_API_DOMAIN}/crm/v6/${encodeURIComponent(moduleName)}`,
        );
        url.searchParams.set(
            "fields",
            [
                "id",
                "Name",
                "City",
                "city",
                "City_Name",
                "city_name",
                "Micromarket",
                "Micromarket_Name",
            ].join(","),
        );
        url.searchParams.set("per_page", "200");
        url.searchParams.set("page", String(page));
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
            cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            console.error("Zoho CRM error:", data);
            throw new Error(
                data?.message || `Unable to fetch ${moduleName} from CRM.`,
            );
        }
        const current = Array.isArray(data?.data) ? data.data : [];
        records.push(...current);
        if (current.length === 0 || !data?.info?.more_records) {
            break;
        }
        page += 1;
    }
    return records;
}

async function getCities() {
    const records = await getCRMRecords(CITY_MODULE);
    return uniqueValues(records.map(getRecordName));
}

async function getMicromarkets(city) {
    if (!city) {
        return [];
    }
    const records = await getCRMRecords(MICROMARKET_MODULE);
    const filtered = records.filter((record) => matchesCity(record, city));
    return uniqueValues(filtered.map(getRecordName));
}

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const resource = url.searchParams.get("resource");
        if (resource === "cities") {
            const cities = await getCities();
            return NextResponse.json({
                success: true,
                data: cities,
            });
        }

        if (resource === "micromarkets") {
            const city = url.searchParams.get("city")?.trim();

            if (!city) {
                return NextResponse.json({
                    success: true,
                    data: [],
                });
            }

            const micromarkets = await getMicromarkets(city);

            return NextResponse.json({
                success: true,
                city,
                data: micromarkets,
            });
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "Invalid resource. Use ?resource=cities or ?resource=micromarkets&city=...",
            },
            {
                status: 400,
            },
        );
    } catch (error) {
        console.error("Listing options error:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Unable to load CRM options.",
            },
            {
                status: 500,
            },
        );
    }
}

/* =========================================================
   EMAIL HTML
========================================================= */

function buildEmailHTML({ method, form, callbackTime }) {
    const isCoworking = form.propertyType === "coworking";

    const propertyType = isCoworking ? "Coworking" : "Conventional Office";

    const inventoryHTML = isCoworking
        ? `
                <tr>
                    <td style="padding:9px 0;color:#777;">
                        Seats offered
                    </td>
                    <td style="padding:9px 0;">
                        ${escapeHtml(form.seats || "—")}
                    </td>
                </tr>

                <tr>
                    <td style="padding:9px 0;color:#777;">
                        Minimum seat price / month
                    </td>
                    <td style="padding:9px 0;">
                        ₹ ${escapeHtml(form.seatPriceMin || "—")}
                    </td>
                </tr>

                <tr>
                    <td style="padding:9px 0;color:#777;">
                        Maximum seat price / month
                    </td>
                    <td style="padding:9px 0;">
                        ₹ ${escapeHtml(form.seatPriceMax || "—")}
                    </td>
                </tr>
            `
        : `
                <tr>
                    <td style="padding:9px 0;color:#777;">
                        Area
                    </td>
                    <td style="padding:9px 0;">
                        ${escapeHtml(form.area || "—")} sq ft
                    </td>
                </tr>

                <tr>
                    <td style="padding:9px 0;color:#777;">
                        Minimum rent / month
                    </td>
                    <td style="padding:9px 0;">
                        ₹ ${escapeHtml(form.rentMin || "—")}
                    </td>
                </tr>

                <tr>
                    <td style="padding:9px 0;color:#777;">
                        Maximum rent / month
                    </td>
                    <td style="padding:9px 0;">
                        ₹ ${escapeHtml(form.rentMax || "—")}
                    </td>
                </tr>
            `;

    const callbackHTML =
        method === "callback"
            ? `
                <tr>
                    <td style="padding:9px 0;color:#777;">
                        Preferred callback
                    </td>
                    <td style="padding:9px 0;">
                        ${escapeHtml(callbackTime || "—")}
                    </td>
                </tr>
            `
            : "";

    return `
        <div
            style="
                font-family:Arial,sans-serif;
                background:#f7f5f8;
                padding:32px;
                color:#171717;
            "
        >
            <div
                style="
                    max-width:720px;
                    margin:0 auto;
                    background:#ffffff;
                    border-radius:22px;
                    overflow:hidden;
                    border:1px solid #eee;
                "
            >

                <div
                    style="
                        padding:30px 32px;
                        background:
                            linear-gradient(
                                135deg,
                                #A054A0,
                                #7E3F82
                            );
                        color:#ffffff;
                    "
                >
                    <div
                        style="
                            font-size:11px;
                            letter-spacing:.15em;
                            text-transform:uppercase;
                            opacity:.8;
                        "
                    >
                        Property Portal
                    </div>

                    <h1
                        style="
                            margin:10px 0 0;
                            font-size:25px;
                        "
                    >
                        ${method === "callback"
            ? "New callback request"
            : "New property submission"
        }
                    </h1>
                </div>

                <div style="padding:30px 32px;">

                    <h2
                        style="
                            font-size:17px;
                            margin:0 0 14px;
                        "
                    >
                        Property details
                    </h2>

                    <table
                        style="
                            width:100%;
                            border-collapse:collapse;
                            font-size:14px;
                        "
                    >
                        <tr>
                            <td
                                style="
                                    padding:9px 0;
                                    color:#777;
                                    width:42%;
                                "
                            >
                                Building
                            </td>

                            <td
                                style="
                                    padding:9px 0;
                                    font-weight:600;
                                "
                            >
                                ${escapeHtml(form.buildingName || "—")}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:9px 0;color:#777;">
                                Property type
                            </td>

                            <td style="padding:9px 0;">
                                ${escapeHtml(propertyType)}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:9px 0;color:#777;">
                                City
                            </td>

                            <td style="padding:9px 0;">
                                ${escapeHtml(form.city || "—")}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:9px 0;color:#777;">
                                Micromarket
                            </td>

                            <td style="padding:9px 0;">
                                ${escapeHtml(form.micromarket || "—")}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:9px 0;color:#777;">
                                Developer / Owner
                            </td>

                            <td style="padding:9px 0;">
                                ${escapeHtml(form.developer || "—")}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:9px 0;color:#777;">
                                Address
                            </td>

                            <td style="padding:9px 0;">
                                ${escapeHtml(form.address || "—")}
                            </td>
                        </tr>

                        ${inventoryHTML}

                        ${callbackHTML}
                    </table>

                    <hr
                        style="
                            border:0;
                            border-top:1px solid #eee;
                            margin:26px 0;
                        "
                    />

                    <h2
                        style="
                            font-size:17px;
                            margin:0 0 14px;
                        "
                    >
                        Contact details
                    </h2>

                    <table
                        style="
                            width:100%;
                            border-collapse:collapse;
                            font-size:14px;
                        "
                    >
                        <tr>
                            <td
                                style="
                                    padding:9px 0;
                                    color:#777;
                                    width:42%;
                                "
                            >
                                Contact name
                            </td>

                            <td style="padding:9px 0;">
                                ${escapeHtml(form.contactName || "—")}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:9px 0;color:#777;">
                                Phone
                            </td>

                            <td style="padding:9px 0;">
                                ${escapeHtml(form.phone || "—")}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:9px 0;color:#777;">
                                Email
                            </td>

                            <td style="padding:9px 0;">
                                ${escapeHtml(form.email || "—")}
                            </td>
                        </tr>

                        <tr>
                            <td style="padding:9px 0;color:#777;">
                                Owner / representative
                            </td>

                            <td style="padding:9px 0;">
                                ${escapeHtml(form.ownerName || "—")}
                            </td>
                        </tr>
                    </table>

                    ${form.description
            ? `
                                <hr
                                    style="
                                        border:0;
                                        border-top:1px solid #eee;
                                        margin:26px 0;
                                    "
                                />

                                <h2
                                    style="
                                        font-size:17px;
                                        margin:0 0 10px;
                                    "
                                >
                                    Description
                                </h2>

                                <p
                                    style="
                                        font-size:14px;
                                        line-height:1.7;
                                        color:#555;
                                        margin:0;
                                    "
                                >
                                    ${escapeHtml(form.description)}
                                </p>
                            `
            : ""
        }

                </div>
            </div>
        </div>
    `;
}

export async function POST(request) {
    try {
        const { method, form = {}, callbackTime = "" } = await request.json();

        // Validate submission method
        if (!["form", "callback"].includes(method)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid submission method.",
                },
                { status: 400 },
            );
        }

        // Validate required contact details
        if (!form.contactName || !form.email || !form.phone) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Please provide the required contact details.",
                },
                { status: 400 },
            );
        }

        // Build the response without saving or sending anything.
        const response = {
            success: true,
            message: "Form submitted successfully. No record was created.",
            method,
            callbackTime,
            form,
        };

        // Visible in the browser's console after the frontend logs it.
        console.log("Property form response:", response);

        // Return the response to the frontend.
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Property form error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to process the form response.",
            },
            { status: 500 },
        );
    }
}
