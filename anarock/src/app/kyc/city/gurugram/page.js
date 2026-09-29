import CityPageClient from "@/app/kyc/CityPageClient";

export const dynamic = "force-dynamic";

export default function GurugramPage() {
    return (
        <CityPageClient
            city="Gurugram"
            slug="gurugram"
        />
    );
}