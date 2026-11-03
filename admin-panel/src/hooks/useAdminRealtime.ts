import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { API_BASE_URL, getAccessToken } from "@/api/client";
import { useAuthStore } from "@/stores/auth.store";
import { queryClient } from "@/lib/queryClient";

/** Server origin for Socket.IO — the API URL without its /api/v1 path. */
const SOCKET_URL = new URL(API_BASE_URL, window.location.origin).origin;

/** Admin queries made stale by each public catalog change. */
const CATALOG_KEYS: Record<string, string[][]> = {
  product: [["admin-products"], ["admin-product"], ["admin-variants"], ["admin-product-reviews"], ["inventory-stock"]],
  brand: [["admin-brands"]],
  category: [["admin-categories"]],
  page: [["admin-pages"], ["admin-page"]],
  blog: [["admin-blogs"], ["admin-blog"], ["admin-blog-categories"]],
  settings: [["admin-settings"]],
  banner: [["category-banners"]],
  home: [["admin-home-sections"], ["admin-workshop-cards"]],
  announcement: [["admin-announcements"]],
  faq: [["admin-faqs"]],
  coupon: [["admin-coupons"], ["admin-coupon"], ["admin-coupon-analytics"]],
};

const invalidate = (keys: string[][]) => keys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));

/**
 * Live admin panel: dashboard, orders, payments, inventory, customers,
 * coupons, support tickets and catalog lists refresh as changes happen —
 * including changes made by other admins or by customers.
 */
export function useAdminRealtime() {
  const userId = useAuthStore((s) => s.user?._id ?? null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      auth: (cb) => cb({ token: getAccessToken() }),
    });
    socketRef.current = socket;

    socket.on("catalog:changed", (p: { entity?: string }) => {
      const keys = CATALOG_KEYS[p?.entity ?? ""];
      if (keys) invalidate(keys);
    });
    socket.on("admin:order", (p: { action?: string; orderNumber?: string }) => {
      invalidate([["admin-orders"], ["admin-order"], ["admin-returns"], ["admin-customer-overview"], ["dashboard"]]);
      if (p?.action === "created") toast.success(`New order${p.orderNumber ? ` ${p.orderNumber}` : ""}`);
    });
    socket.on("admin:payment", () => invalidate([["admin-transactions"], ["admin-order"], ["admin-orders"], ["dashboard"]]));
    socket.on("admin:inventory", () => invalidate([["inventory-stock"], ["inventory-movements"], ["admin-products"], ["admin-variants"], ["warehouses"]]));
    socket.on("admin:warehouse", () => invalidate([["warehouses"]]));
    // Brand Management changes (from this or another admin) refresh the shell and the editor.
    ["brand.updated", "logo.updated", "theme.updated"].forEach((event) =>
      socket.on(event, () => invalidate([["brand"], ["admin-brand"], ["admin-settings"]])),
    );
    socket.on("admin:user", () => invalidate([["admin-customers"], ["admin-customer"], ["admin-customer-overview"], ["admin-staff"]]));
    socket.on("admin:coupon", () => invalidate(CATALOG_KEYS.coupon));
    socket.on("admin:inquiry", () => invalidate([["admin-tickets"]]));
    socket.on("admin:campaign", () => invalidate([["admin-campaigns"], ["admin-campaign-summary"]]));
    socket.on("admin:dashboard", () => invalidate([["dashboard"], ["admin-notification-stats"]]));
    socket.on("notification:new", () => invalidate([["self-notifications"]]));
    socket.on("notification:changed", () => invalidate([["self-notifications"]]));

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Sign-in / sign-out: join or leave the admins room on this connection.
  useEffect(() => {
    socketRef.current?.emit("auth", userId ? getAccessToken() : null);
  }, [userId]);
}
