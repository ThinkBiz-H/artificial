import { Navigate } from "@tanstack/react-router";
import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
  Outlet,
} from "@tanstack/react-router";

import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// Pages load on demand — one chunk per page — so the first visit only
// downloads the shell and the page being opened.
const DashboardPage = lazyRouteComponent(() => import("@/pages/dashboard/DashboardPage"), "DashboardPage");
const ProductsListPage = lazyRouteComponent(() => import("@/pages/products/ProductsListPage"), "ProductsListPage");
const ProductFormPage = lazyRouteComponent(() => import("@/pages/products/ProductFormPage"), "ProductFormPage");
const CategoriesPage = lazyRouteComponent(() => import("@/pages/categories/CategoriesPage"), "CategoriesPage");
const BrandsPage = lazyRouteComponent(() => import("@/pages/brands/BrandsPage"), "BrandsPage");
const CustomersListPage = lazyRouteComponent(() => import("@/pages/customers/CustomersListPage"), "CustomersListPage");
const CustomerDetailPage = lazyRouteComponent(() => import("@/pages/customers/CustomerDetailPage"), "CustomerDetailPage");
const OrdersListPage = lazyRouteComponent(() => import("@/pages/orders/OrdersListPage"), "OrdersListPage");
const OrderDetailPage = lazyRouteComponent(() => import("@/pages/orders/OrderDetailPage"), "OrderDetailPage");
const CouponsPage = lazyRouteComponent(() => import("@/pages/coupons/CouponsPage"), "CouponsPage");
const ReviewsPage = lazyRouteComponent(() => import("@/pages/reviews/ReviewsPage"), "ReviewsPage");
const BlogsListPage = lazyRouteComponent(() => import("@/pages/blogs/BlogsListPage"), "BlogsListPage");
const BlogFormPage = lazyRouteComponent(() => import("@/pages/blogs/BlogFormPage"), "BlogFormPage");
const BlogCategoriesPage = lazyRouteComponent(() => import("@/pages/blogs/BlogCategoriesPage"), "BlogCategoriesPage");
const CmsPagesListPage = lazyRouteComponent(() => import("@/pages/cms/CmsPagesListPage"), "CmsPagesListPage");
const CmsPageFormPage = lazyRouteComponent(() => import("@/pages/cms/CmsPageFormPage"), "CmsPageFormPage");
const FaqsPage = lazyRouteComponent(() => import("@/pages/cms/FaqsPage"), "FaqsPage");
const HomeSectionsPage = lazyRouteComponent(() => import("@/pages/cms/HomeSectionsPage"), "HomeSectionsPage");
const AnnouncementBarPage = lazyRouteComponent(() => import("@/pages/cms/AnnouncementBarPage"), "AnnouncementBarPage");
const WorkshopCardsPage = lazyRouteComponent(() => import("@/pages/cms/WorkshopCardsPage"), "WorkshopCardsPage");
const CategoryBannersPage = lazyRouteComponent(() => import("@/pages/marketing/CategoryBannersPage"), "CategoryBannersPage");
const NotificationsPage = lazyRouteComponent(() => import("@/pages/notifications/NotificationsPage"), "NotificationsPage");
const MediaLibraryPage = lazyRouteComponent(() => import("@/pages/media/MediaLibraryPage"), "MediaLibraryPage");
const ReportsPage = lazyRouteComponent(() => import("@/pages/reports/ReportsPage"), "ReportsPage");
const SettingsPage = lazyRouteComponent(() => import("@/pages/settings/SettingsPage"), "SettingsPage");
const ProfilePage = lazyRouteComponent(() => import("@/pages/profile/ProfilePage"), "ProfilePage");
const ChangePasswordPage = lazyRouteComponent(() => import("@/pages/profile/ChangePasswordPage"), "ChangePasswordPage");
const AuditLogPage = lazyRouteComponent(() => import("@/pages/audit/AuditLogPage"), "AuditLogPage");
const RolesPage = lazyRouteComponent(() => import("@/pages/roles/RolesPage"), "RolesPage");
const StaffPage = lazyRouteComponent(() => import("@/pages/staff/StaffPage"), "StaffPage");
const TransactionsPage = lazyRouteComponent(() => import("@/pages/transactions/TransactionsPage"), "TransactionsPage");
const ReturnsPage = lazyRouteComponent(() => import("@/pages/returns/ReturnsPage"), "ReturnsPage");
const InventoryPage = lazyRouteComponent(() => import("@/pages/inventory/InventoryPage"), "InventoryPage");
const AnalyticsPage = lazyRouteComponent(() => import("@/pages/analytics/AnalyticsPage"), "AnalyticsPage");
const SupportPage = lazyRouteComponent(() => import("@/pages/support/SupportPage"), "SupportPage");
import { z } from "zod";
const rootRoute = createRootRoute({ component: () => <Outlet /> });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
});
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/login" search={{}} />,
});
// Pathless layout route: guards + renders sidebar/topbar for every child below.
const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: AppLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const productsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/products",
  component: ProductsListPage,
});
const productNewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/products/new",
  component: ProductFormPage,
});
const productEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/products/$productId/edit",
  component: ProductFormPage,
});

const categoriesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/categories",
  component: CategoriesPage,
});
const brandsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/brands",
  component: BrandsPage,
});

const customersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/customers",
  component: CustomersListPage,
});
const customerDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/customers/$customerId",
  component: CustomerDetailPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/orders",
  component: OrdersListPage,
});
const orderDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/orders/$orderId",
  component: OrderDetailPage,
});

const couponsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/coupons",
  component: CouponsPage,
});
const reviewsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/reviews",
  component: ReviewsPage,
});

const blogsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/blogs",
  component: BlogsListPage,
});
const blogNewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/blogs/new",
  component: BlogFormPage,
});
const blogEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/blogs/$blogId/edit",
  component: BlogFormPage,
});
const blogCategoriesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/blogs/categories",
  component: BlogCategoriesPage,
});

const cmsPagesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/cms/pages",
  component: CmsPagesListPage,
});
const cmsPageNewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/cms/pages/new",
  component: CmsPageFormPage,
});
const cmsPageEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/cms/pages/$pageId/edit",
  component: CmsPageFormPage,
});
const cmsFaqsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/cms/faqs",
  component: FaqsPage,
});
const cmsHomeSectionsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/cms/home-sections",
  component: HomeSectionsPage,
});
const cmsAnnouncementBarRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/cms/announcement-bar",
  component: AnnouncementBarPage,
});
const cmsWorkshopRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/cms/workshop",
  component: WorkshopCardsPage,
});

const marketingCategoryBannersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/marketing/category-banners",
  component: CategoryBannersPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/notifications",
  component: NotificationsPage,
});
const mediaRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/media",
  component: MediaLibraryPage,
});
const reportsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/reports",
  component: ReportsPage,
});
const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/settings",
  component: SettingsPage,
});
const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/profile",
  component: ProfilePage,
});
const changePasswordRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/change-password",
  component: ChangePasswordPage,
});
const auditLogRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/audit-log",
  component: AuditLogPage,
});
const rolesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/roles",
  component: RolesPage,
});
const staffRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/staff",
  component: StaffPage,
});

const transactionsRoute = createRoute({ getParentRoute: () => appRoute, path: "/transactions", component: TransactionsPage });
const returnsRoute = createRoute({ getParentRoute: () => appRoute, path: "/returns", component: ReturnsPage });
const inventoryRoute = createRoute({ getParentRoute: () => appRoute, path: "/inventory", component: InventoryPage });
const analyticsRoute = createRoute({ getParentRoute: () => appRoute, path: "/analytics", component: AnalyticsPage });
const supportRoute = createRoute({ getParentRoute: () => appRoute, path: "/support", component: SupportPage });

const notFoundRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "*",
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  appRoute.addChildren([
    dashboardRoute,
    productsRoute,
    productNewRoute,
    productEditRoute,
    categoriesRoute,
    brandsRoute,
    customersRoute,
    customerDetailRoute,
    ordersRoute,
    orderDetailRoute,
    couponsRoute,
    reviewsRoute,
    blogsRoute,
    blogNewRoute,
    blogEditRoute,
    blogCategoriesRoute,
    cmsPagesRoute,
    cmsPageNewRoute,
    cmsPageEditRoute,
    cmsFaqsRoute,
    cmsHomeSectionsRoute,
    cmsWorkshopRoute,
    cmsAnnouncementBarRoute,
    marketingCategoryBannersRoute,
    notificationsRoute,
    mediaRoute,
    reportsRoute,
    settingsRoute,
    profileRoute,
    changePasswordRoute,
    auditLogRoute,
    rolesRoute,
    staffRoute,
    transactionsRoute,
    returnsRoute,
    inventoryRoute,
    analyticsRoute,
    supportRoute,
    notFoundRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundPage,
  basepath: "/admin",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
