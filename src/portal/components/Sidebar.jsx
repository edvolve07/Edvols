import { Link, NavLink, useNavigate } from '../../navigation';
import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  Code2,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';
import { useState, useEffect } from 'react';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/assessments/create', label: 'Create Assessment', icon: FilePlus2 },
  { to: '/admin/assessments', label: 'Assessments', icon: ClipboardList },
  { to: '/admin/programming', label: 'Programming Problems', icon: Code2 },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/assessments', label: 'Available Assessments', icon: BookOpenCheck },
  { to: '/student/results', label: 'Results', icon: BarChart3 },
  { to: '/student/profile', label: 'Profile', icon: UserRound },
];

export default function Sidebar({ role, children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const links = role === 'admin' ? adminLinks : studentLinks;
  const home = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (window.innerWidth < 1024) return 288;
    const stored = Number(window.localStorage.getItem("portal-sidebar-width"));
    return Number.isFinite(stored) ? Math.min(Math.max(stored, 88), 360) : 280;
  });
  const compact = sidebarWidth <= 136 && window.innerWidth >= 1024;

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      window.localStorage.setItem("portal-sidebar-width", String(sidebarWidth));
    }
  }, [sidebarWidth]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function renderLinks(compactMode = false) {
    return links.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setSidebarOpen(false)}
          title={compactMode ? item.label : undefined}
          className={({ isActive }) =>
            compactMode
              ? `inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold shadow-sm ${
                  isActive
                    ? 'border-brand-200 bg-brand-50 text-brand-900'
                    : 'border-brand-100 bg-white text-brand-900 hover:bg-brand-50'
                }`
              : `group relative flex items-center rounded-lg text-sm font-semibold transition-all duration-150 ${
                  compact ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-emerald-600/70 text-white shadow-sm'
                    : 'text-emerald-50/70 hover:bg-white/10 hover:text-white'
                }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={compactMode ? 16 : 18} className={compactMode ? '' : isActive ? 'text-white' : 'text-emerald-100/60'} />
              {!compactMode ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}
            </>
          )}
        </NavLink>
      );
    });
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--canvas-bg)", "--sidebar-width": `${sidebarWidth}px` }}>
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[1px]"
        />
      ) : null}

      <aside
        className="sidebar fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-72 flex-col border-r border-white/10 bg-[radial-gradient(circle_at_30%_0%,rgba(5,150,105,0.3),transparent_34%),linear-gradient(180deg,#064e3b_0%,#053f31_48%,#042f25_100%)] transition-transform duration-200 sm:w-72 lg:w-[var(--sidebar-width)] lg:max-w-none"
        style={sidebarOpen ? {} : { transform: 'none' }}
      >
        <div className={compact ? 'px-3 pb-6 pt-7' : 'px-5 pb-6 pt-7'}>
          <Link to={home} className={compact ? 'flex justify-center' : 'flex items-center gap-3'}>
            <img src="/edvols%20logo.png" alt="Edvols" className="h-9 w-auto shrink-0" />
            {!compact ? (
              <div className="min-w-0">
                <p className="text-xl font-bold leading-none tracking-tight text-white">Edvols</p>
                <p className="mt-1 text-[11px] font-medium text-emerald-200/80">Placement readiness</p>
              </div>
            ) : null}
          </Link>
        </div>

        <nav className={compact ? 'flex-1 space-y-0.5 overflow-y-auto px-2 pb-4' : 'flex-1 space-y-0.5 overflow-y-auto px-2.5 pb-4'}>
          {renderLinks(false)}
        </nav>

        <div className={compact ? 'space-y-3 px-2 pb-5' : 'space-y-3 px-4 pb-5'}>
          <button
            type="button"
            onClick={handleLogout}
            title={compact ? 'Logout' : undefined}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-emerald-100/80 transition hover:bg-white/[0.1] hover:text-white active:scale-[0.98]"
          >
            <LogOut size={15} />
            {!compact ? <span>Logout</span> : null}
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-[calc(var(--sidebar-width)+24px)]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 active:scale-95 lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="eyebrow">{role === 'admin' ? 'Admin Console' : 'Student Portal'}</p>
            <h1 className="text-lg font-bold text-slate-900">{user?.name}</h1>
          </div>

          <img src="/edvols%20logo.png" alt="Edvols" className="h-7 w-auto hidden md:block opacity-50" />

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95 sm:px-2"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-800 text-sm font-bold text-white">
              {(user?.name || "U").slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden max-w-28 truncate sm:inline">{user?.name || "User"}</span>
          </button>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-slate-100 bg-white px-4 py-2 lg:hidden">
          {renderLinks(true)}
        </nav>

        <main className="min-h-screen min-w-0 flex-1 overflow-x-hidden p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}