import Link from "next/link";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EnquiryForm from "@/components/EnquiryForm";

export default function PropertyDetailPage({
  property,
}) {
  return (
    <>
      <Navbar />

      <main>

        <section className="detail-page">

          <div className="container">

            <Link
              href="/properties"
              className="back-link"
            >
              ← Back to properties
            </Link>

            <div className="detail-header">

              <div>

                <div className="property-tags">
                  <span className="property-tag">
                    {property.type} ·{" "}
                    {property.micromarket}
                  </span>

                  <span className="ai-badge">
                    ✓ AI-vetted
                  </span>
                </div>

                <h1>
                  {property.title}
                </h1>

                <p>
                  {property.city} ·{" "}
                  {property.floors}
                </p>

              </div>

              <div className="detail-price">

                <strong>
                  ₹{property.price}
                </strong>

                <span>
                  /sq.ft/mo
                </span>

                <small>
                  {property.area.toLocaleString(
                    "en-IN"
                  )}{" "}
                  sq.ft total
                </small>

                <a
                  href="#property-enquiry"
                  className="primary-button"
                >
                  Enquire Now
                </a>

                <div className="sync-row">
                  <span className="pulse-dot" />
                  Synced live with CRM
                </div>

              </div>

            </div>


            <div className="property-detail-image">

              <div className="detail-building building-large" />
              <div className="detail-building building-medium" />
              <div className="detail-building building-small" />

            </div>


            <div className="detail-content">

              <div>

                <h2>
                  About this property
                </h2>

                <p className="detail-description">
                  {property.description}
                </p>


                <h2>
                  AI-vetted attributes
                </h2>

                <div className="attribute-list detail-attributes">

                  {property.attributes.map(
                    (attribute) => (
                      <span key={attribute}>
                        {attribute}
                      </span>
                    )
                  )}

                </div>


                <h2>
                  Specifications
                </h2>

                <table className="spec-table">

                  <tbody>

                    <tr>
                      <td>City</td>
                      <td>{property.city}</td>
                    </tr>

                    <tr>
                      <td>Micromarket</td>
                      <td>
                        {property.micromarket}
                      </td>
                    </tr>

                    <tr>
                      <td>Property type</td>
                      <td>{property.type}</td>
                    </tr>

                    <tr>
                      <td>Grade</td>
                      <td>{property.grade}</td>
                    </tr>

                    <tr>
                      <td>Area</td>
                      <td>
                        {property.area.toLocaleString(
                          "en-IN"
                        )}{" "}
                        sq.ft
                      </td>
                    </tr>

                    <tr>
                      <td>Rent</td>
                      <td>
                        ₹{property.price}/sq.ft/mo
                      </td>
                    </tr>

                  </tbody>

                </table>

              </div>

              <aside
                className="detail-enquiry"
                id="property-enquiry"
              >

                <h3>
                  Interested in this property?
                </h3>

                <p>
                  Leave your details and our
                  commercial real estate team
                  will contact you.
                </p>

                <EnquiryForm />

              </aside>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}