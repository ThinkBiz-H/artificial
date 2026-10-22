import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnnouncementBar } from "./AnnouncementBar";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { SessionExpiryWatcher } from "@/components/common/SessionExpiryWatcher";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <ScrollToTop />
      <SessionExpiryWatcher />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[2000] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-fg-inverse"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
