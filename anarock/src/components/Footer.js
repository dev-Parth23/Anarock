import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-top">

          <div className="footer-brand">

            <div className="brand">
              <div className="brand-slant" />

              <div>
              <div className="brand-name"><img src="/Anarock.svg" alt="Anarock" className="brand-logo" /></div>


                <div className="brand-sub footer-sub">
                  CLA · Commercial Platform
                </div>
              </div>
            </div>

            <p>
              A smarter way to discover, evaluate and
              transact commercial real estate across India.
            </p>

          </div>

          <div className="footer-links">

            <div>
              <h4>Explore</h4>

              <Link href="/properties">
                Properties
              </Link>

              <Link href="/micromarkets">
                Micromarkets
              </Link>

              <Link href="/occupiers">
                For Occupiers
              </Link>

              <Link href="/investors">
                For Investors
              </Link>
            </div>

            <div>
              <h4>Platform</h4>

              <Link href="/">
                AI Search
              </Link>

              <Link href="/">
                CRM Inventory
              </Link>

              <Link href="/">
                Market Intelligence
              </Link>
            </div>

          </div>

        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} ANAROCK CLA</span>
          <span>Commercial Real Estate Platform</span>
        </div>

      </div>

    </footer>
  );
}