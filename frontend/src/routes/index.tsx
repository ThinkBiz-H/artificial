import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Core shopping pages ship in the main bundle for a fast first paint.
import { HomePage } from "@/pages/HomePage";
import { ProductListingPage } from "@/pages/ProductListingPage";
import { ProductDetailsPage } from "@/pages/ProductDetailsPage";
import { CategoryDetailPage } from "@/pages/CategoryDetailPage";
import { NotFoundPage } from "@/pages/static/NotFoundPage";

// Everything else is code-split and loaded on demand.
const lazy = <T extends Record<string, unknown>>(loader: () => Promise<T>, name: keyof T) => async () => ({
  Component: (await loader())[name] as React.ComponentType,
});

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "categories", lazy: lazy(() => import("@/pages/CategoriesPage"), "CategoriesPage") },
      { path: "categories/:slug", element: <CategoryDetailPage /> },
      { path: "collections", lazy: lazy(() => import("@/pages/CategoriesPage"), "CategoriesPage") },
      { path: "collections/:slug", element: <CategoryDetailPage /> },
      { path: "new-arrivals", lazy: lazy(() => import("@/pages/CuratedPage"), "NewArrivalsPage") },
      { path: "best-sellers", lazy: lazy(() => import("@/pages/CuratedPage"), "BestSellersPage") },
      { path: "sale", lazy: lazy(() => import("@/pages/CuratedPage"), "SalePage") },
      { path: "track-order", lazy: lazy(() => import("@/pages/TrackOrderPage"), "TrackOrderPage") },
      { path: "brands", lazy: lazy(() => import("@/pages/BrandsPage"), "BrandsPage") },
      { path: "brands/:slug", lazy: lazy(() => import("@/pages/BrandDetailPage"), "BrandDetailPage") },
      { path: "products", element: <ProductListingPage /> },
      { path: "products/:slug", element: <ProductDetailsPage /> },
      { path: "search", element: <ProductListingPage mode="search" /> },
      { path: "wishlist", lazy: lazy(() => import("@/pages/WishlistPage"), "WishlistPage") },
      { path: "cart", lazy: lazy(() => import("@/pages/CartPage"), "CartPage") },
      { path: "blog", lazy: lazy(() => import("@/pages/BlogListPage"), "BlogListPage") },
      { path: "blog/:slug", lazy: lazy(() => import("@/pages/BlogDetailPage"), "BlogDetailPage") },
      { path: "faq", lazy: lazy(() => import("@/pages/static/FaqPage"), "FaqPage") },
      { path: "contact", lazy: lazy(() => import("@/pages/static/ContactPage"), "ContactPage") },
      { path: "about", lazy: lazy(() => import("@/pages/static/AboutPage"), "AboutPage") },
      { path: "privacy-policy", lazy: lazy(() => import("@/pages/static/PolicyPage"), "PrivacyPolicyPage") },
      { path: "terms-conditions", lazy: lazy(() => import("@/pages/static/PolicyPage"), "TermsPage") },
      { path: "refund-policy", lazy: lazy(() => import("@/pages/static/PolicyPage"), "RefundPolicyPage") },
      { path: "shipping-policy", lazy: lazy(() => import("@/pages/static/PolicyPage"), "ShippingPolicyPage") },

      { path: "login", lazy: lazy(() => import("@/pages/auth/LoginPage"), "LoginPage") },
      { path: "register", lazy: lazy(() => import("@/pages/auth/RegisterPage"), "RegisterPage") },
      { path: "forgot-password", lazy: lazy(() => import("@/pages/auth/ForgotPasswordPage"), "ForgotPasswordPage") },

      // Guests can check out without an account — OTP verification during
      // checkout creates/logs them in automatically (see CheckoutPage).
      { path: "checkout", lazy: lazy(() => import("@/pages/CheckoutPage"), "CheckoutPage") },
      { path: "order-success/:id", lazy: lazy(() => import("@/pages/OrderSuccessPage"), "OrderSuccessPage") },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "account",
            lazy: lazy(() => import("@/components/layout/AccountLayout"), "AccountLayout"),
            children: [
              { index: true, lazy: lazy(() => import("@/pages/account/DashboardPage"), "DashboardPage") },
              { path: "profile", lazy: lazy(() => import("@/pages/account/ProfilePage"), "ProfilePage") },
              { path: "profile/edit", lazy: lazy(() => import("@/pages/account/EditProfilePage"), "EditProfilePage") },
              { path: "orders", lazy: lazy(() => import("@/pages/account/OrdersPage"), "OrdersPage") },
              { path: "orders/:id", lazy: lazy(() => import("@/pages/account/OrderDetailsPage"), "OrderDetailsPage") },
              { path: "wishlist", lazy: lazy(() => import("@/pages/account/AccountWishlistPage"), "AccountWishlistPage") },
              { path: "coupons", lazy: lazy(() => import("@/pages/account/CouponsPage"), "CouponsPage") },
              { path: "returns", lazy: lazy(() => import("@/pages/account/ReturnsPage"), "ReturnsPage") },
              { path: "addresses", lazy: lazy(() => import("@/pages/account/AddressesPage"), "AddressesPage") },
              { path: "notifications", lazy: lazy(() => import("@/pages/account/NotificationsPage"), "NotificationsPage") },
              { path: "change-password", lazy: lazy(() => import("@/pages/account/ChangePasswordPage"), "ChangePasswordPage") },
            ],
          },
        ],
      },
      { path: ":slug", lazy: lazy(() => import("@/pages/CmsPage1"), "CmsPage") },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
