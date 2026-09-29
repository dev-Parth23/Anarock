import CityPageClient from "@/app/kyc/CityPageClient";

export const dynamic = "force-dynamic";

export default function DelhiPage() {
    return (
        <CityPageClient
            city="Delhi"
            slug="delhi"
        />
    );
}