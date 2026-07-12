import { Link, usePathname } from "@/src/navigation";
import { ChevronRight, Headphones, LogOut, Sparkles } from "lucide-react";
import clsx from "clsx";
import { APP_NAME, NAV_ITEMS } from "@/src/constants";
import useAuthStore from "@/src/stores/useAuthStore";
import { useNavigate } from "@/src/navigation";
import { useRef } from "react";

const MIN_SIDEBAR_WIDTH = 88;
const DEFAULT_SIDEBAR_WIDTH = 280;
const MAX_SIDEBAR_WIDTH = 340;
const COMPACT_THRESHOLD = 136;

function clampSidebarWidth(value) {
  return Math.min(Math.max(value, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH);
}

export default function Sidebar({ open = false, onClose = () => {}, width = DEFAULT_SIDEBAR_WIDTH, onWidthChange = () => {} }) {
  const path = usePathname();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const resizingRef = useRef(false);
  const compact = width <= COMPACT_THRESHOLD && window.innerWidth >= 1024;
  const userModules = user?.modules_access || ["both"];
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.roles && !item.roles.includes(user?.role)) return false;
    if (item.modules && !item.modules.some((m) => userModules.includes(m))) return false;
    return true;
  });
  const activeHref = visibleItems
    .filter((item) => path === item.href || path.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  function handleLogout() {
    logout();
    onClose();
    navigate("/login");
  }

  function updateWidth(nextWidth) {
    onWidthChange(clampSidebarWidth(nextWidth));
  }

  function handleResizeStart(event) {
    if (window.innerWidth < 1024) return;
    resizingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function handleResizeMove(event) {
    if (!resizingRef.current) return;
    updateWidth(event.clientX);
  }

  function handleResizeEnd(event) {
    if (!resizingRef.current) return;
    resizingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function toggleCompact() {
    updateWidth(compact ? DEFAULT_SIDEBAR_WIDTH : MIN_SIDEBAR_WIDTH);
  }

  function handleResizeKeyDown(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateWidth(width - 16);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      updateWidth(width + 16);
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleCompact();
    }
  }

  return (
    <aside
      style={{ "--sidebar-current-width": `${width}px` }}
      className={clsx(
        "sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[radial-gradient(circle_at_30%_0%,rgba(5,150,105,0.3),transparent_34%),linear-gradient(180deg,#064e3b_0%,#053f31_48%,#042f25_100%)] transition-transform duration-200",
        "w-[82vw] max-w-72 sm:w-72 lg:w-[var(--sidebar-current-width)] lg:max-w-none",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      <div className={clsx("pb-6 pt-7", compact ? "px-3" : "px-5")}>
        <div className={clsx("flex items-center gap-3", compact && "flex-col")}>
          <img src="/edvols%20logo.png" alt="Edvols" className="h-9 w-9 shrink-0 rounded-full object-cover float-element" />
          <div className={clsx("min-w-0", compact && "hidden")}>
            <p className="text-xl font-bold leading-none tracking-tight text-white">
              {APP_NAME}
            </p>
            <p className="mt-1 text-[11px] font-medium text-emerald-200/80">Placement readiness</p>
          </div>
        </div>
      </div>

      <nav className={clsx("flex-1 space-y-0.5 overflow-y-auto pb-4", compact ? "px-2" : "px-2.5")}>
        {visibleItems.map(({ href, icon: Icon, label }) => {
          const active = activeHref === href;
          return (
            <Link key={href} href={href} onClick={onClose}
              title={compact ? label : undefined}
              className={clsx(
                "group relative flex items-center rounded-lg text-sm font-semibold transition-all duration-150 active:scale-[0.98]",
                compact ? "justify-center py-3" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-emerald-600/70 text-white shadow-sm shadow-emerald-900/30"
                  : "text-emerald-50/70 hover:bg-white/10 hover:text-white hover:shadow-sm hover:shadow-black/10",
              )}>
              <Icon size={18} className={clsx("shrink-0", active ? "text-white" : "text-emerald-100/60 group-hover:text-white")} />
              <span className={clsx("min-w-0 flex-1 truncate", compact && "hidden")}>{label}</span>
              {active && !compact ? <ChevronRight size={14} className="shrink-0 text-emerald-200/60" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className={clsx("space-y-2 pb-5", compact ? "px-2" : "px-4")}>
        <div className={clsx("rounded-xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] ring-1 ring-white/10 transition-all duration-300 hover:bg-white/[0.08] hover:shadow-sm hover:shadow-emerald-900/20", compact ? "p-2.5" : "p-3.5")}>
          <div className={clsx("flex items-center", compact ? "flex-col gap-1" : "gap-3")}>
            <Headphones size={16} className="shrink-0 text-emerald-200/60" />
            <div className={clsx("min-w-0", compact && "hidden")}>
              <p className="text-sm font-semibold text-white">Need Help?</p>
              <p className="text-xs text-emerald-200/60">Contact Support</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title={compact ? "Logout" : undefined}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-emerald-100/70 transition-all hover:bg-white/[0.1] hover:text-white active:scale-[0.97]"
        >
          <LogOut size={15} />
          <span className={clsx(compact && "hidden")}>Logout</span>
        </button>
      </div>

      <div
        role="separator"
        aria-label="Resize sidebar"
        aria-orientation="vertical"
        aria-valuemin={MIN_SIDEBAR_WIDTH}
        aria-valuemax={MAX_SIDEBAR_WIDTH}
        aria-valuenow={width}
        tabIndex={0}
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        onPointerCancel={handleResizeEnd}
        onKeyDown={handleResizeKeyDown}
        onClick={() => toggleCompact()}
        className="group absolute right-0 hidden cursor-col-resize touch-none flex-col items-center justify-center outline-none transition-all duration-200 lg:flex"
        style={{ top: '50%', transform: 'translateY(-50%)', height: '120px', width: '20px' }}
      >
        <span className="h-full w-1.5 rounded-full bg-white/15 transition-all duration-200 group-hover:bg-white/30 group-hover:w-2 group-focus:bg-white/40 group-hover:shadow-sm group-hover:shadow-emerald-900/30" />
      </div>
    </aside>
  );
}