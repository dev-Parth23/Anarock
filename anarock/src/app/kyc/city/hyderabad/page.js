import CityPageClient from "@/app/kyc/CityPageClient";

export const dynamic = "force-dynamic";

export default function HyderabadPage() {
    return (
        <CityPageClient
            city="Hyderabad"
            slug="hyderabad"
        />
    );
}