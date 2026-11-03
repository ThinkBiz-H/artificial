import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { API_BASE_URL, getAccessToken } from "@/api/client";
import { useAuthStore } from "@/stores/auth.store";
import { queryClient } from "@/lib/queryClient";

/** Server origin for Socket.IO — the API URL without its /api/v1 path. */
const SOCKET_URL = new URL(API_BASE_URL, window.location.origin).origin;

/** Which cached queries each public catalog change makes stale. */
const CATALOG_KEYS: Record<string, string[][]> = {
  product: [["products"], ["product"], ["product-reviews"], ["home-sections"], ["cart"], ["wishlist"]],
  brand: [["brands"], ["brand"], ["products"], ["product"]],
  category: [["categories"], ["category"], ["products"], ["home-sections"]],
  page: [["pages"], ["page"]],
  blog: [["blogs"], ["blog"], ["blog-categories"], ["blog-highlights"]],
  settings: [["settings"]],
  banner: [["category-banner"]],
  home: [["home-sections"]],
  announcement: [["announcements"]],
  faq: [["faqs"]],
};

const invalidate = (keys: string[][]) => keys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));

/**
 * Live updates: keeps the storefront in sync with admin changes (products,
 * prices, stock, banners, settings…) and with the shopper's own orders,
 * notifications, cart and wishlist — without a page refresh. Only queries on
 * screen refetch; the rest are just marked stale.
 */
export function useRealtime() {
  const userId = useAuthStore((s) => s.user?._id ?? null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      // Called on every (re)connect, so a reconnect always uses the current token.
      auth: (cb) => cb({ token: getAccessToken() }),
    });
    socketRef.current = socket;

    // Catalog changes reach every open browser at once; spread their refetches.
    socket.on("catalog:changed", (p: { entity?: string }) => {
      const keys = CATALOG_KEYS[p?.entity ?? ""];
      if (keys) setTimeout(() => invalidate(keys), Math.random() * 2500);
    });
    // Brand Management: logos, theme, company details — refresh settings (brand lives there).
    ["brand.updated", "logo.updated", "theme.updated"].forEach((event) =>
      socket.on(event, () => setTimeout(() => invalidate([["settings"]]), Math.random() * 800)),
    );
    socket.on("order:updated", () => invalidate([["orders"], ["order"], ["order-tracking"]]));
    socket.on("notification:new", () => invalidate([["notifications"]]));
    socket.on("notification:changed", () => invalidate([["notifications"]]));
    socket.on("cart:updated", () => invalidate([["cart"], ["checkout-quote"]]));
    socket.on("wishlist:updated", () => invalidate([["wishlist"]]));

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Sign-in / sign-out: move this connection into (or out of) the shopper's private room.
  useEffect(() => {
    socketRef.current?.emit("auth", userId ? getAccessToken() : null);
  }, [userId]);
}
