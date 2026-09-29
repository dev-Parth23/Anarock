import CityPageClient from "@/app/kyc/CityPageClient";

export const dynamic = "force-dynamic";

export default function BengaluruPage() {
    return (
        <CityPageClient
            city="Bengaluru"
            slug="bengaluru"
        />
    );
}