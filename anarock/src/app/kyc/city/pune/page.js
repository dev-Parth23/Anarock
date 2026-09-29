import CityPageClient from "@/app/kyc/CityPageClient";

export const dynamic = "force-dynamic";

export default function PunePage() {
    return (
        <CityPageClient
            city="Pune"
            slug="pune"
        />
    );
}