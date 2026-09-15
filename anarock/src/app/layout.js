import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WishlistProvider } from "@/lib/wishlist";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SITE = process.env.NEXT_PUBLIC_BASE_URL || "https://anarock.com";

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Anarock - Premium Commercial Real Estate in India",
    template: "%s | Anarock",
  },
  description:
    "Discover premium commercial office spaces, coworking environments and business parks across Mumbai, Bengaluru, Delhi NCR, Pune, Hyderabad and more. AI-powered property search.",
  keywords: [
    "commercial real estate",
    "office space",
    "coworking",
    "Anarock",
    "Mumbai office",
    "Bengaluru office",
    "commercial property India",
  ],
  authors: [{ name: "Anarock" }],
  openGraph: {
    type: "website",
    siteName: "Anarock",
    title: "Anarock - Premium Commercial Real Estate in India",
    description: "AI-powered commercial real estate search across India.",
    images: [
      "https://images.unsplash.com/photo-1651416452811-eca925a924f5?w=1200",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anarock - Premium Commercial Real Estate",
    description: "AI-powered commercial real estate search across India.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Anarock",
    url: SITE,
    logo: `${SITE}/logo.png`,
    description: "India's leading commercial real estate advisory.",
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
    <html lang="en">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgJsonLd),
          }}
        />

        <WishlistProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </WishlistProvider>
        <script src="https://static.zohocdn.com/catalyst/sdk/js/4.6.2/catalystWebSDK.js"></script>
        <script src="/__catalyst/sdk/init.js"></script>
      </body>
    </html>
  );
}
