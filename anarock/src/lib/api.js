const API_BASE =
    process.env.NEXT_PUBLIC_CATALYST_FUNCTION_URL || "http://localhost:3000/server/anarock_function";


export async function getProperties({
    page = 1,
    limit = 12,
    city = "",
    micromarket = ""
} = {}) {

    const params = new URLSearchParams();

    params.set("page", page);
    params.set("limit", limit);

    if (city) {
        params.set("city", city);
    }

    if (micromarket) {
        params.set("micromarket", micromarket);
    }

    const response = await fetch(
        `${API_BASE}/properties?${params.toString()}`,
        {
            cache: "no-store"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch properties");
    }

    return response.json();
}


export async function getProperty(id) {

    const response = await fetch(
        `${API_BASE}/properties/${id}`,
        {
            cache: "no-store"
        }
    );

    if (!response.ok) {

        if (response.status === 404) {
            return null;
        }

        throw new Error("Failed to fetch property");
    }

    return response.json();
}