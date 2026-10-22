import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Bell, User, LogOut, ChevronDown } from "lucide-react";
import { useUiStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotificationsCount";
import { GlobalSearch } from "./GlobalSearch";

export function Topbar() {
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <header className="print:hidden sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3 pr-3">
        <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-3">
        <Link to="/notifications" className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-surface" aria-label="Notifications">
          <Bell size={18} />
          {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />}
        </Link>

        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-surface">
              {user?.profileImage?.url ? (
                <img src={user.profileImage.url} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <User size={15} className="text-muted" />
              )}
            </div>
            <span className="hidden text-sm font-medium text-ink sm:block">{user?.name}</span>
            <ChevronDown size={14} className="text-muted" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-border bg-white py-1 shadow-lg">
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-ink hover:bg-surface">
                  Profile
                </Link>
                <Link to="/change-password" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-ink hover:bg-surface">
                  Change password
                </Link>
                <button
                  onClick={() => logout.mutate()}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-surface"
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
