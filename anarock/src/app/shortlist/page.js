import WishlistClient from "./WishlistClient";

export const metadata = {
  title: "My Wishlist",
  description: "Your saved commercial properties on Anarock.",
  alternates: { canonical: "/wishlist" },
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return <WishlistClient />;
}
