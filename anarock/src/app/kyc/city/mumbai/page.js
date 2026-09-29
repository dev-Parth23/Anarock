import CityPageClient from "@/app/kyc/CityPageClient";

export const dynamic = "force-dynamic";

export default function MumbaiPage() {
    return (
        <CityPageClient
            city="Mumbai"
            slug="mumbai"
        />
    );
}