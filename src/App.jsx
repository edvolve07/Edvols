import { ChevronDown, Flame, Menu, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import AccessRevoked from "@/src/pages/AccessRevoked";
import AdminsList from "@/src/pages/admin/AdminsList";
import AptitudePage from "@/src/pages/AptitudePage";
import DashboardPage from "@/src/pages/DashboardPage";
import InterviewPage from "@/src/pages/InterviewPage";
import ReportPage from "@/src/pages/ReportPage";
import ReportsResultsPage from "@/src/pages/ReportsResultsPage";
import ProfilePage from "@/src/pages/ProfilePage";
import ResumeBuilderPage from "@/src/pages/ResumeBuilderPage";
import ResultDetails from "@/src/pages/aptitude/ResultDetails";
import AdminAptitudeAnalytics from "@/src/pages/admin/AdminAptitudeAnalytics";
import AdminInterviewAnalytics from "@/src/pages/admin/AdminInterviewAnalytics";
import AiUsagePage from "@/src/pages/admin/AiUsagePage";
import CreateAdmin from "@/src/pages/admin/CreateAdmin";
import CreateUser from "@/src/pages/admin/CreateUser";
import InstitutionsPage from "@/src/pages/admin/Institutions";
import InstitutionDetailPage from "@/src/pages/admin/InstitutionDetail";
import MasterAdminDashboard from "@/src/pages/admin/MasterAdminDashboard";
import MasterAdminsList from "@/src/pages/admin/MasterAdminsList";
import EdvolsAdminDashboard from "@/src/pages/admin/EdvolsAdminDashboard";
import StudentsList from "@/src/pages/admin/StudentsList";
import UserManagement from "@/src/pages/admin/UserManagement";
import AppSidebar from "../components/Sidebar";
import { APP_NAME } from "./constants";
import RoleGuard from "./portal/components/RoleGuard";
import PortalSidebar from "./portal/components/Sidebar";
import PortalLoadingSkeleton from "./portal/components/LoadingSkeleton";
import useAuthStore from "./stores/useAuthStore";
import ForgotPassword from "./portal/pages/ForgotPassword";
import PortalLogin from "./portal/pages/Login";
import ResetPassword from "./portal/pages/ResetPassword";
import PortalSignup from "./portal/pages/Signup";
import AdminAssessments from "./portal/pages/admin/AdminAssessments";
import AssessmentResults from "./portal/pages/admin/AssessmentResults";
import CreateAssessment from "./portal/pages/admin/CreateAssessment";
import QuestionReview from "./portal/pages/admin/QuestionReview";
import PortalResultDetails from "./portal/pages/student/ResultDetails";
import PortalStartAssessment from "./portal/pages/student/StartAssessment";
import PortalStudentAssessments from "./portal/pages/student/StudentAssessments";
import StudentDashboard from "./portal/pages/student/StudentDashboard";
import PortalStudentResults from "./portal/pages/student/StudentResults";
import ProgrammingProblems from "./portal/pages/programming/Problems";
import PracticeTopics from "./portal/pages/programming/PracticeTopics";
import ProblemView from "./portal/pages/programming/ProblemView";
import ProgrammingSubmissions from "./portal/pages/programming/Submissions";
import AdminProgrammingProblems from "./portal/pages/programming/AdminProblems";
import AdminProgrammingProblemForm from "./portal/pages/programming/AdminProblemForm";
import MasterAdminProblems from "./pages/admin/programming/MasterAdminProblems";
import MasterAdminProblemForm from "./pages/admin/programming/MasterAdminProblemForm";
import AdminProgrammingAnalytics from "./pages/admin/programming/AdminProgrammingAnalytics";
import ProgrammingLanding from "./portal/pages/programming/ProgrammingLanding";
import AssessmentList from "./portal/pages/programming/AssessmentList";
import TakeAssessment from "./portal/pages/programming/TakeAssessment";
import AssessmentResult from "./portal/pages/programming/AssessmentResult";
import AdminAssessmentList from "./pages/admin/programming/AdminAssessmentList";
import AdminAssessmentForm from "./pages/admin/programming/AdminAssessmentForm";
import AdminAssessmentResults from "./pages/admin/programming/AdminAssessmentResults";
import MasterAdminAssessmentList from "./pages/admin/programming/MasterAdminAssessmentList";
import MasterAdminAssessmentForm from "./pages/admin/programming/MasterAdminAssessmentForm";
import MasterAdminAssessmentResults from "./pages/admin/programming/MasterAdminAssessmentResults";
import CommunicationPage from "./pages/CommunicationPage";
import CommunicationReport from "./pages/CommunicationReport";
import AdminCommunicationAnalytics from "./pages/admin/AdminCommunicationAnalytics";
import { Switch, Route, Navigate, useLocation, useNavigate, useParams } from "./navigation";

function AppShell({ children }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const pathname = useLocation().pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (window.innerWidth < 1024) return 288;
    const stored = Number(window.localStorage.getItem("app-sidebar-width"));
    return Number.isFinite(stored) ? Math.min(Math.max(stored, 88), 360) : 288;
  });
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      window.localStorage.setItem("app-sidebar-width", String(sidebarWidth));
    }
  }, [sidebarWidth]);

  useEffect(() => {
    if (!user || user.role === "admin" || user.role === "master_admin") return;
    import("@/lib/api").then(({ apiFetch }) =>
      apiFetch("/api/student/dashboard")
        .then((data) => setStreak(data.study_streak?.current || 0))
        .catch(() => {})
    );
  }, [user]);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--canvas-bg)", "--app-sidebar-width": `${sidebarWidth}px` }}>
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[1px]"
        />
      ) : null}
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-[calc(var(--app-sidebar-width)+24px)]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/75 px-4 backdrop-blur-2xl shadow-panel sm:px-6 lg:px-8">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-400/20 to-transparent animate-shimmer-slide" style={{ backgroundSize: "200% 100%" }} />
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 active:scale-95 lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div className="hidden flex-1 justify-center md:flex">
            <label className="flex h-10 w-full max-w-[480px] items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 text-slate-400 transition-all duration-300 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:shadow-sm focus-within:shadow-brand-500/10">
              <Search size={16} className="transition-colors duration-300 group-focus-within:text-brand-500" />
              <input
                type="search"
                placeholder="Search topics, questions, or tests..."
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          <div className="min-w-0 flex-1 md:hidden">
            <p className="text-sm font-bold leading-none text-slate-900">{APP_NAME}</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">Unified prep workspace</p>
          </div>

          {(user?.role === "admin" || user?.role === "master_admin") && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 ml-2">
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-semibold">
                {user?.role === "master_admin" ? "Master Admin" : "Admin"}
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-400">
                {pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}
              </span>
            </div>
          )}

          {user?.role !== "admin" && user?.role !== "master_admin" ? (
            <button className="hidden h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-95 sm:inline-flex badge-pulse">
              <Flame size={16} className="text-amber-500" />
              {streak}
            </button>
          ) : null}



          <button  
            type="button"
            onClick={() => navigate("/profile")}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95 sm:px-2"
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-full bg-brand-800 text-sm font-bold text-white ring-2 ring-brand-300/40">
              {(user?.name || "U").slice(0, 1).toUpperCase()}
              <span className="ring-soft-pulse absolute inset-0 rounded-full ring-2 ring-brand-400/30" />
            </span>
            <span className="hidden max-w-28 truncate sm:inline">{user?.name || "User"}</span>
          </button>
        </header>

        <main className="min-h-screen min-w-0 flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

function RequireSession({ children }) {
  const { user, loading, revoked } = useAuthStore();
  if (loading) return <PortalLoadingSkeleton label="Checking session" />;
  if (revoked) return <Navigate to="/access-revoked" replace />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AuthLanding() {
  const { user, loading } = useAuthStore();
  if (loading) return <PortalLoadingSkeleton label="Checking session" />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homeForRole(user.role)} replace />;
}

function ReportsResultDetailsRoute() {
  const { attemptId } = useParams();
  return <ResultDetails attemptId={attemptId} backPath="/reports" />;
}

function homeForRole(role) {
  if (role === "master_admin") return "/master-admin/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
}

function RequireRole({ roles, children }) {
  const { user, loading, revoked } = useAuthStore();
  if (loading) return <PortalLoadingSkeleton label="Checking session" />;
  if (revoked) return <Navigate to="/access-revoked" replace />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeForRole(user.role)} replace />;
  return children;
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={AuthLanding} />
      <Route path="/login" component={PortalLogin} />
      <Route path="/signup" component={PortalSignup} />
      <Route path="/access-revoked" component={AccessRevoked} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      <Route path="/dashboard">
        <RequireSession>
          <AppShell><DashboardPage /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/interview">
        <RequireSession>
          <AppShell><InterviewPage /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/aptitude">
        <RequireSession>
          <AppShell><AptitudePage /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/aptitude/:assessmentId/start">
        <RequireSession>
          <AppShell><AptitudePage /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/aptitude/results">
        <RequireSession>
          <AppShell><AptitudePage /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/aptitude/results/:attemptId">
        <RequireSession>
          <AppShell><AptitudePage /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/programming">
        <RequireSession>
          <AppShell><ProgrammingLanding /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/programming/practice">
        <RequireSession>
          <AppShell><PracticeTopics /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/programming/practice/topics/:topicName">
        <RequireSession>
          <AppShell><ProgrammingProblems /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/programming/practice/problems/:id">
        <RequireSession>
          <AppShell><ProblemView /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/programming/practice/submissions">
        <RequireSession>
          <AppShell><ProgrammingSubmissions /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/programming/assessments">
        <RequireSession>
          <AppShell><AssessmentList /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/programming/assessments/:assessmentId">
        <RequireSession>
          <AppShell><TakeAssessment /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/programming/assessments/results/:attemptId">
        <RequireSession>
          <AppShell><AssessmentResult /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/report">
        <RequireSession>
          <AppShell><ReportPage /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/reports">
        <RequireSession>
          <AppShell><ReportsResultsPage /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/reports/results/:attemptId">
        <RequireSession>
          <AppShell><ReportsResultDetailsRoute /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/resume-builder">
        <RequireSession>
          <AppShell><ResumeBuilderPage /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/profile">
        <RequireSession>
          <AppShell><ProfilePage /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/communication">
        <RequireSession>
          <AppShell><CommunicationPage /></AppShell>
        </RequireSession>
      </Route>
      <Route path="/communication/report">
        <RequireSession>
          <AppShell><CommunicationReport /></AppShell>
        </RequireSession>
      </Route>

      <Route path="/admin/dashboard">
        <RequireRole roles={["admin"]}>
          <AppShell><EdvolsAdminDashboard /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/admin-dashboard">
        <Navigate to="/admin/dashboard" replace />
      </Route>
      <Route path="/admin/analytics/aptitude">
        <RequireRole roles={["admin"]}>
          <AppShell><AdminAptitudeAnalytics /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/admin/analytics/interviews">
        <RequireRole roles={["admin"]}>
          <AppShell><AdminInterviewAnalytics /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/admin/analytics/communication">
        <RequireRole roles={["admin"]}>
          <AppShell><AdminCommunicationAnalytics /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/admin/assessments">
        <RequireRole roles={["admin"]}>
          <AppShell><AdminAssessments /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/admin/assessments/create">
        <RequireRole roles={["admin"]}>
          <AppShell><CreateAssessment /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/admin/assessments/:id/questions">
        <RequireRole roles={["admin"]}>
          <AppShell><QuestionReview /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/admin/assessments/:id/results">
        <RequireRole roles={["admin"]}>
          <AppShell><AssessmentResults /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/admin/programming">
        <RequireRole roles={["admin"]}>
          <AppShell><AdminProgrammingProblems /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/admin/programming/create">
        <RequireRole roles={["admin"]}>
          <AppShell><AdminProgrammingProblemForm /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/admin/programming/:id/edit">
        <RequireRole roles={["admin"]}>
          <AppShell><AdminProgrammingProblemForm /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/admin/programming/analytics/students">
        <RequireRole roles={["admin"]}>
          <AppShell><AdminProgrammingAnalytics /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/admin/programming/assessments">
        <RequireRole roles={["admin"]}>
          <AppShell><AdminAssessmentList /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/admin/programming/assessments/create">
        <RequireRole roles={["admin"]}>
          <AppShell><AdminAssessmentForm /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/admin/programming/assessments/:assessmentId/problems">
        <RequireRole roles={["admin"]}>
          <AppShell><AdminAssessmentForm /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/admin/programming/assessments/:assessmentId/results">
        <RequireRole roles={["admin"]}>
          <AppShell><AdminAssessmentResults /></AppShell>
        </RequireRole>
      </Route>

      <Route path="/master-admin/dashboard">
        <RequireRole roles={["master_admin"]}>
          <AppShell><MasterAdminDashboard /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/master-admin-dashboard">
        <Navigate to="/master-admin/dashboard" replace />
      </Route>
      <Route path="/master-admin/students">
        <RequireRole roles={["master_admin"]}>
          <AppShell><StudentsList /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/master-admin/admins">
        <RequireRole roles={["master_admin"]}>
          <AppShell><AdminsList /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/master-admin/master-admins">
        <RequireRole roles={["master_admin"]}>
          <AppShell><MasterAdminsList /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/master-admin/institutions">
        <RequireRole roles={["master_admin"]}>
          <AppShell><InstitutionsPage /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/master-admin/institutions/:id">
        <RequireRole roles={["master_admin"]}>
          <AppShell><InstitutionDetailPage /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/master-admin/create-admin">
        <RequireRole roles={["master_admin"]}>
          <AppShell><CreateAdmin /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/master-admin/create-user">
        <RequireRole roles={["master_admin"]}>
          <AppShell><CreateUser /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/master-admin/ai-usage">
        <RequireRole roles={["master_admin"]}>
          <AppShell><AiUsagePage /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/master-admin/programming">
        <RequireRole roles={["master_admin"]}>
          <AppShell><MasterAdminProblems /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/master-admin/programming/create">
        <RequireRole roles={["master_admin"]}>
          <AppShell><MasterAdminProblemForm /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/master-admin/programming/:id/edit">
        <RequireRole roles={["master_admin"]}>
          <AppShell><MasterAdminProblemForm /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/master-admin/programming/assessments">
        <RequireRole roles={["master_admin"]}>
          <AppShell><MasterAdminAssessmentList /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/master-admin/programming/assessments/create">
        <RequireRole roles={["master_admin"]}>
          <AppShell><MasterAdminAssessmentForm /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/master-admin/programming/assessments/:assessmentId/problems">
        <RequireRole roles={["master_admin"]}>
          <AppShell><MasterAdminAssessmentForm /></AppShell>
        </RequireRole>
      </Route>
      <Route path="/master-admin/programming/assessments/:assessmentId/results">
        <RequireRole roles={["master_admin"]}>
          <AppShell><MasterAdminAssessmentResults /></AppShell>
        </RequireRole>
      </Route>

      <Route path="/student/dashboard">
        <RoleGuard roles={["student"]}>
          <PortalSidebar role="student">
            <StudentDashboard />
          </PortalSidebar>
        </RoleGuard>
      </Route>
      <Route path="/student/assessments">
        <RoleGuard roles={["student"]}>
          <PortalSidebar role="student">
            <PortalStudentAssessments />
          </PortalSidebar>
        </RoleGuard>
      </Route>
      <Route path="/student/assessments/:id/start">
        <RoleGuard roles={["student"]}>
          <PortalSidebar role="student">
            <PortalStartAssessment />
          </PortalSidebar>
        </RoleGuard>
      </Route>
      <Route path="/student/results">
        <RoleGuard roles={["student"]}>
          <PortalSidebar role="student">
            <PortalStudentResults />
          </PortalSidebar>
        </RoleGuard>
      </Route>
      <Route path="/student/results/:attemptId">
        <RoleGuard roles={["student"]}>
          <PortalSidebar role="student">
            <PortalResultDetails />
          </PortalSidebar>
        </RoleGuard>
      </Route>
      <Route path="/student/profile">
        <RoleGuard roles={["student"]}>
          <PortalSidebar role="student">
            <ProfilePage />
          </PortalSidebar>
        </RoleGuard>
      </Route>

      <Route>
        <Navigate to="/" replace />
      </Route>
    </Switch>
  );
}
