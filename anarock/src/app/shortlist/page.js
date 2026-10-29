import WishlistClient from "./WishlistClient";
export const metadata = {
  title: "Shortlisted Commercial & Residential Properties | Real Estate Wishlist | Anarock",
  description: "Manage and compare your saved commercial properties, office spaces, retail shops, and luxury residential apartments across top Indian real estate hubs including Mumbai, Bengaluru, Gurugram, Noida, Pune, and Hyderabad.",
  keywords: [
    "commercial properties wishlist",
    "saved real estate listings",
    "shortlisted office spaces",
    "commercial real estate India",
    "buy commercial property",
    "retail shops for sale shortlist",
    "luxury residential apartments wishlist",
    "property comparison tool",
    "real estate property enquiry",
    "commercial property Mumbai",
    "office space Bengaluru",
    "commercial real estate Gurugram",
    "property for sale Noida",
    "commercial spaces Pune",
    "real estate Hyderabad",
    "commercial property Chennai",
    "office spaces Delhi NCR"
  ],
  alternates: {
    canonical: "/wishlist"
  },
  robots: {
    index: false, follow: true
  },
  openGraph: {
    title: "Shortlisted Commercial & Residential Properties | Real Estate Wishlist",
    description: "Access your saved commercial properties, office spaces, and residential listings. Compare properties side-by-side and submit unified enquiries.",
    url: "/wishlist",
    siteName: "Anarock Property Portal",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shortlisted Properties & Real Estate Wishlist",
    description: "View and compare your saved commercial and residential real estate listings.",
  },
};

export default function WishlistPage() {
  return <WishlistClient />;
}