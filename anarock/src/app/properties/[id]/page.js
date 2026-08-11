import { getProperty } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function PropertyPage({ params }) {

    const { id } = await params;

    const response = await getProperty(id);

    if (!response) {
        notFound();
    }

    const property = response.data;

    return (

        <main className="px-6 py-10">

            <h1 className="text-4xl font-semibold">
                {property.propertyName}
            </h1>

            <div className="mt-6 space-y-2">

                <p>
                    <strong>City:</strong>{" "}
                    {property.city.name}
                </p>

                <p>
                    <strong>Micromarket:</strong>{" "}
                    {property.micromarket.name}
                </p>

                <p>
                    <strong>Region:</strong>{" "}
                    {property.city.region}
                </p>

                <p>
                    <strong>Availability:</strong>{" "}
                    {property.availabilityType}
                </p>

                <p>
                    <strong>Office Type:</strong>{" "}
                    {property.officeType}
                </p>

            </div>

        </main>
    );
}