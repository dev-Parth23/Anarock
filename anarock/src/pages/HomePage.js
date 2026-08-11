import Link from "next/link";

import Navbar from "@/components/Navbar";
import SearchBox from "@/components/SearchBox";
import PropertyCard from "@/components/PropertyCard";
import StatsBand from "@/components/StatsBand";
import SectionHeader from "@/components/SectionHeader";
import EnquiryForm from "@/components/EnquiryForm";
import Footer from "@/components/Footer";

import { properties } from "@/data/properties";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>

        {/* HERO */}

        <section className="hero">

          <div className="container hero-grid">

            <div className="hero-content">

              <div className="eyebrow">
                <span />
                Commercial Leasing, Reimagined
              </div>

              <h1>
                Every Grade A address in India.
                <span>
                  One search that actually understands you.
                </span>
              </h1>

              <p className="hero-description">
                Filter like a pro, or describe what you need
                in plain English. Discover commercial spaces
                with live inventory and intelligent search.
              </p>

              <SearchBox />

            </div>

            <div className="hero-visual">

              <div className="floating-match">

                <span>98% MATCH</span>

                <strong>
                  Grade A Tower, BKC
                </strong>

                <small>
                  12,000 sq.ft · Metro 320m
                </small>

              </div>

              <div className="city-illustration">

                <div className="tower tower-one" />
                <div className="tower tower-two" />
                <div className="tower tower-three" />
                <div className="tower tower-four" />

              </div>

              <div className="hero-location">
                <span>●</span>
                Live commercial inventory
              </div>

            </div>

          </div>

        </section>


        <StatsBand />


        {/* AI SEARCH */}

        <section className="section ai-demo-section">

          <div className="container">

            <SectionHeader
              eyebrow="Search that understands intent"
              title={
                <>
                  Describe the office you need.
                  <br />
                  We'll translate it.
                </>
              }
              description="Type it the way you'd say it out loud. Semantic search can understand location, budget, property grade, amenities and proximity."
            />

            <div className="ai-demo-card">

              <div className="demo-query">
                <span>⌕</span>

                <p>
                  "Grade A office near a metro station in BKC,
                  under ₹2 Cr lease, ready to move in"
                </p>
              </div>

              <div className="understood-label">
                AI UNDERSTOOD
              </div>

              <div className="understood-chips">

                <span>Micromarket: BKC</span>
                <span>Grade: A</span>
                <span>Metro &lt; 500m</span>
                <span>Budget: &lt; ₹2 Cr / yr</span>
                <span>Ready to move</span>

              </div>

              <div className="demo-results">

                <div className="demo-result">
                  <strong>Grade A Tower, BKC</strong>
                  <small>
                    12,000 sq.ft · ₹450/sq.ft/month
                  </small>

                  <span>
                    Matches all criteria
                  </span>
                </div>

                <div className="demo-result">
                  <strong>Marine Vista Chambers</strong>
                  <small>
                    8,200 sq.ft · ₹520/sq.ft/month
                  </small>

                  <span>
                    Premium location match
                  </span>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* LISTINGS */}

        <section className="section" id="listings">

          <div className="container">

            <div className="listing-header">

              <SectionHeader
                eyebrow="Featured spaces"
                title="A live look at the inventory"
              />

              <Link
                href="/properties"
                className="secondary-button"
              >
                View all properties →
              </Link>

            </div>

            <div className="property-grid">

              {properties.slice(0, 6).map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                />
              ))}

            </div>

          </div>

        </section>


        {/* WHY ANAROCK */}

        <section className="section why-section">

          <div className="container">

            <SectionHeader
              eyebrow="Built to lead, not to match"
              title="A smarter commercial property platform"
              description="The platform combines structured property discovery with intelligent search and live inventory."
            />

            <div className="usp-grid">

              {[
                [
                  "₹",
                  "Multi-Currency",
                  "Evaluate Indian commercial assets in INR, USD, SGD, AED and EUR.",
                ],
                [
                  "▣",
                  "Dual Units",
                  "Switch between sq.ft and sq.m without leaving the page.",
                ],
                [
                  "⌕",
                  "Dropdown + AI Search",
                  "Use structured filters or simply describe your requirement.",
                ],
                [
                  "✦",
                  "AI Semantic Search",
                  "Search by intent rather than simply matching keywords.",
                ],
                [
                  "✓",
                  "AI-Vetted Attributes",
                  "Property attributes can be extracted and verified before publishing.",
                ],
                [
                  "↻",
                  "Live CRM Inventory",
                  "Keep listings synchronized with the source CRM.",
                ],
              ].map(([icon, title, description]) => (
                <div className="usp-card" key={title}>

                  <div className="usp-icon">
                    {icon}
                  </div>

                  <h3>{title}</h3>

                  <p>{description}</p>

                </div>
              ))}

            </div>

          </div>

        </section>


        {/* ENQUIRY */}

        <section
          className="section enquiry-section"
          id="enquiry"
        >

          <div className="container">

            <SectionHeader
              eyebrow="Get started"
              title="See it live for your portfolio"
              description="Share a few details and our CLA team will walk you through a personalized experience."
            />

            <EnquiryForm />

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}