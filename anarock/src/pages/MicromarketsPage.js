import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const markets = [
  ["BKC", "Mumbai", "Corporate HQ & BFSI"],
  ["Cyber City", "Gurgaon", "GCC & Enterprise"],
  ["Whitefield", "Bengaluru", "IT / ITES"],
  ["Hitech City", "Hyderabad", "GCC & Technology"],
  ["Koramangala", "Bengaluru", "Flex & Startups"],
  ["Nariman Point", "Mumbai", "Premium Corporate"],
];

export default function MicromarketsPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="inner-hero">
          <div className="container">
            <div className="eyebrow">
              <span />
              Micromarkets
            </div>

            <h1>
              India's most important business districts.
            </h1>

            <p>
              Explore commercial real estate by
              micromarket.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">

            <div className="market-grid">

              {markets.map(
                ([market, city, description]) => (
                  <Link
                    key={market}
                    href={`/properties?micromarket=${encodeURIComponent(
                      market
                    )}`}
                    className="market-card"
                  >
                    <span>{city}</span>
                    <h2>{market}</h2>
                    <p>{description}</p>
                    <strong>
                      Explore properties →
                    </strong>
                  </Link>
                )
              )}

            </div>

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}