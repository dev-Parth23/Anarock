import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { WishlistProvider } from "@/lib/wishlist";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://anarock.com"
).replace(/\/+$/, "");

export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "ANAROCK | Premium Commercial Real Estate in India",
    template: "%s | ANAROCK",
  },

  description:
    "Discover commercial office spaces, coworking environments and business parks across Mumbai, Bengaluru, Delhi NCR, Pune, Hyderabad and more.",

  keywords: [
    "commercial real estate",
    "office space",
    "coworking",
    "ANAROCK",
    "Mumbai office",
    "Bengaluru office",
    "commercial property India",
  ],

  authors: [{ name: "ANAROCK" }],

  openGraph: {
    type: "website",
    siteName: "ANAROCK",
    title: "ANAROCK | Premium Commercial Real Estate in India",
    description:
      "Explore commercial real estate and office spaces across India's leading business markets.",
    images: [
      {
        url: "/images/anarock-home-og.jpg",
        width: 1200,
        height: 630,
        alt: "ANAROCK commercial real estate",
      },
    ],
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: "ANAROCK | Premium Commercial Real Estate",
    description:
      "Explore commercial office spaces and coworking environments across India.",
    images: ["/images/anarock-home-og.jpg"],
  },

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
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

export default function RootLayout({ children }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "ANAROCK",
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Commercial real estate advisory and property search across India.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressLocality: "Mumbai",
    },
    sameAs: [
      "https://www.linkedin.com/company/anarock",
      "https://twitter.com/anarock",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgJsonLd).replace(/</g, "\\u003c"),
          }}
        />

        <Script
          src="https://static.zohocdn.com/catalyst/sdk/js/4.6.2/catalystWebSDK.js"
          strategy="afterInteractive"
        />

        <WishlistProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </WishlistProvider>
      </body>
    </html>
  );
}