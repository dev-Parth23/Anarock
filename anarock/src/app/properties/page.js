import { Suspense } from "react";
import PropertiesClient from "./PropertiesClient";

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 px-4 py-10">
          <div className="mx-auto max-w-7xl text-slate-600">
            Loading properties...
          </div>
        </div>
      }
    >
      <PropertiesClient />
    </Suspense>
  );
}
