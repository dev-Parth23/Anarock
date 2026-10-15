import HomePage from "@/pages/HomePage";

const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://anarock.com"
).replace(/\/+$/, "");

export const metadata = {
  title: "Commercial Office Space for Rent in India | ANAROCK",
  description:
    "Explore commercial office spaces, business parks and coworking spaces for rent across Mumbai, Gurugram, Delhi NCR, Bengaluru, Pune and other major Indian cities with ANAROCK.",

  keywords: [
    "commercial office space for rent in India",
    "office space for lease",
    "commercial property in India",
    "office space in Gurugram",
    "office space in Mumbai",
    "office space in Bengaluru",
    "coworking space in India",
    "commercial real estate advisory",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "ANAROCK",
    title: "Commercial Office Space for Rent in India | ANAROCK",
    description:
      "Discover office spaces, commercial properties and coworking environments across India's leading business markets.",
    images: [
      {
        url: "/images/anarock-home-og.jpg",
        width: 1200,
        height: 630,
        alt: "ANAROCK commercial real estate",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Commercial Office Space for Rent in India | ANAROCK",
    description:
      "Explore commercial office spaces and coworking environments across India.",
    images: ["/images/anarock-home-og.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ANAROCK",
  url: `${SITE_URL}/`,
  description:
    "Explore commercial office spaces, coworking spaces and managed offices across India.",
  inLanguage: "en-IN",
};

const webpageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Commercial Office Space for Rent in India | ANAROCK",
  url: `${SITE_URL}/`,
  description:
    "Discover and compare commercial real estate and office spaces across India's leading business destinations.",
  isPartOf: {
    "@type": "WebSite",
    name: "ANAROCK",
    url: `${SITE_URL}/`,
  },
  inLanguage: "en-IN",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webpageJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 -z-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#A054A0 2px, transparent 2px), linear-gradient(90deg, #A054A0 2px, transparent 2px)",
          backgroundSize: "100% 100%",
        }}
      />

      <div className="relative z-10">
        <HomePage />
      </div>
    </>
  );
}