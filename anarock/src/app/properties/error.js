"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PropertiesError({
    error,
    reset,
}) {
    useEffect(() => {
        console.error("Properties page error:", error);
    }, [error]);

    return (
        <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                    !
                </div>

                <h1 className="text-2xl font-semibold text-slate-900">
                    We couldn&apos;t load the properties
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                    Something went wrong while loading the property listings.
                    Please try again.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="rounded-lg bg-[#A054A0] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#8D478D]"
                    >
                        Try Again
                    </button>

                    <Link
                        href="/"
                        className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}