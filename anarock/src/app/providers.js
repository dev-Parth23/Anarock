"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WishlistProvider } from "@/lib/wishlist";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WishlistProvider>{children}</WishlistProvider>
    </QueryClientProvider>
  );
}
