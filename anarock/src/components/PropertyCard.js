import Link from "next/link";

export default function PropertyCard({ property }) {

    return (

        <Link
            href={`/properties/${property.id}`}
            className="group block overflow-hidden rounded-2xl border border-black/10 bg-white"
        >

            <div className="aspect-[4/3] bg-gray-100">

                {/* Image will come here */}

            </div>

            <div className="p-5">

                <h2 className="text-lg font-semibold">
                    {property.propertyName}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    {property.micromarket.name}
                </p>

                <p className="text-sm text-gray-500">
                    {property.city.name}
                </p>

            </div>

        </Link>
    );
}