import CityPageClient from "@/app/kyc/CityPageClient";

export const dynamic = "force-dynamic";

export default function NoidaPage() {
    return (
        <CityPageClient
            city="Noida"
            slug="noida"
        />
    );
}