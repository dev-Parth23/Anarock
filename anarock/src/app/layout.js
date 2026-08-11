import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://www.anarock.com"),

  title: {
    default: "ANAROCK CLA | Commercial Real Estate",
    template: "%s | ANAROCK CLA",
  },
 icons: {
   icon: "/icon.png",
  },

  description:
    "Discover Grade A commercial properties, office spaces, IT parks and investment opportunities across India with ANAROCK CLA.",

  keywords: [
    "commercial property India",
    "office space India",
    "commercial real estate",
    "office space Mumbai",
    "office space Gurgaon",
    "office space Bengaluru",
    "ANAROCK CLA",
    "commercial property listings",
  ],

  authors: [
    {
      name: "ANAROCK",
    },
  ],

  creator: "ANAROCK",

  openGraph: {
    title: "ANAROCK CLA | Commercial Real Estate",
    description:
      "Find commercial properties across India's leading business districts.",
    type: "website",
    locale: "en_IN",
    siteName: "ANAROCK CLA",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}