import Navbar from "@/components/Navbar";
import PropertyGrid from "@/components/PropertyGrid";
import SearchBox from "@/components/SearchBox";
import Footer from "@/components/Footer";

import { properties } from "@/data/properties";

export default function PropertiesPage({
  searchParams,
}) {
  const keyword = searchParams?.keyword || "";
  const city = searchParams?.city || "";
  const micromarket =
    searchParams?.micromarket || "";
  const type = searchParams?.type || "";

  const normalizedKeyword =
    keyword.toLowerCase();

  const filteredProperties = properties.filter(
    (property) => {

      const keywordMatch =
        !normalizedKeyword ||
        property.title
          .toLowerCase()
          .includes(normalizedKeyword) ||
        property.city
          .toLowerCase()
          .includes(normalizedKeyword) ||
        property.micromarket
          .toLowerCase()
          .includes(normalizedKeyword) ||
        property.type
          .toLowerCase()
          .includes(normalizedKeyword) ||
        property.attributes.some((attribute) =>
          attribute
            .toLowerCase()
            .includes(normalizedKeyword)
        );

      const cityMatch =
        !city ||
        property.city === city;

      const marketMatch =
        !micromarket ||
        property.micromarket === micromarket;

      const typeMatch =
        !type ||
        property.type === type;

      return (
        keywordMatch &&
        cityMatch &&
        marketMatch &&
        typeMatch
      );
    }
  );

  return (
    <>
      <Navbar />

      <main>

        <section className="properties-hero">

          <div className="container">

            <div className="eyebrow">
              <span />
              Commercial properties
            </div>

            <h1>
              Find the right commercial space.
            </h1>

            <p>
              Search India's Grade A commercial
              property inventory.
            </p>

            <SearchBox />

          </div>

        </section>


        <section className="section">

          <div className="container">

            <div className="results-header">

              <div>
                <span className="results-count">
                  {filteredProperties.length}
                </span>

                <span>
                  properties found
                </span>
              </div>

              {keyword && (
                <div className="search-query">
                  Search:
                  <strong>
                    "{keyword}"
                  </strong>
                </div>
              )}

            </div>

            <PropertyGrid
              properties={filteredProperties}
            />

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}