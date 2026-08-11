import PropertiesPage from "@/pages/PropertiesPage";

export const metadata = {
  title: "Commercial Properties",
  description:
    "Search commercial office spaces, IT parks, GCC campuses and Grade A properties across India.",
};

export default async function Page({ searchParams }) {
  const params = await searchParams;

  return (
    <PropertiesPage
      searchParams={params}
    />
  );
}