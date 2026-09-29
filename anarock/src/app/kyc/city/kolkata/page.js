import CityPageClient from "@/app/kyc/CityPageClient";

export const dynamic = "force-dynamic";

export default function KolkataPage() {
    return (
        <CityPageClient
            city="Kolkata"
            slug="kolkata"
        />
    );
}