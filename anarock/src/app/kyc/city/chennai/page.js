import CityPageClient from "@/app/kyc/CityPageClient";

export const dynamic = "force-dynamic";

export default function ChennaiPage() {
    return (
        <CityPageClient
            city="Chennai"
            slug="chennai"
        />
    );
}