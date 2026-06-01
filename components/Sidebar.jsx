import { Link, usePathname } from "@/src/navigation";
import { ChevronRight, LogOut, Sparkles } from "lucide-react";
import clsx from "clsx";
import { APP_NAME, NAV_ITEMS } from "@/src/constants";
import { useAuth } from "@/src/portal/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ open = false, onClose = () => {} }) {
  const path = usePathname();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user?.role));
  const activeHref = visibleItems
    .filter((item) => path === item.href || path.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  function handleLogout() {
    logout();
    onClose();
    navigate("/login");
  }

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-72 flex-col border-r border-slate-100 bg-white shadow-2xl transition-transform duration-200 sm:w-72",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500 shadow-brand">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <p className="font-display text-[17px] font-semibold leading-none tracking-tight text-slate-900">
            {APP_NAME}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">Hiring intelligence</p>
        </div>
      </div>

      <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        {visibleItems.map(({ href, icon: Icon, label }) => {
          const active = activeHref === href;
          return (
            <Link key={href} href={href} onClick={onClose}
              className={clsx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                active ? "bg-brand-50 text-brand-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")}>
              <Icon size={18} className={clsx("transition-colors", active ? "text-brand-500" : "text-slate-400 group-hover:text-slate-600")} />
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {active && <ChevronRight size={14} className="text-brand-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-4 py-4">
        <div className="mb-3 rounded-xl bg-slate-50 px-3 py-2">
          <p className="truncate text-sm font-semibold text-slate-900">{user?.name || "User"}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
