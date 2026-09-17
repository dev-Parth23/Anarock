"use client";

import Link from "next/link";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import PropertyCard from "@/components/properties/PropertyCard";
import { useWishlist } from "@/lib/wishlist";
import { usePreferences } from "@/lib/preferences";
import { Heart, ArrowRight } from "lucide-react";

export default function WishlistClient() {
  const { items, count } = useWishlist();
  const { currency, unit } = usePreferences();

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs items={[{ label: "Wishlist" }]} />
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            My Wishlist
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {count} propert{count === 1 ? "y" : "ies"} saved
          </p>
        </div>

        {count === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <div className="h-16 w-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
              <Heart className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mt-4">
              Your wishlist is empty
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Save properties you love to compare and revisit later.
            </p>
            <Link
              href="/properties"
              className="inline-flex items-center gap-1 mt-5 px-5 py-2.5 bg-amber-500 text-slate-950 rounded-lg text-sm font-semibold"
            >
              Browse Properties <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                currency={currency}
                unit={unit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
