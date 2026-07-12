import { useEffect, useMemo, useState } from "react";
import { Navigate } from "@/src/navigation";
import {
  Award,
  BarChart3,
  Bot,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Code2,
  Download,
  FileText,
  ListChecks,
  Mic2,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import clsx from "clsx";
import { METRIC_LABELS } from "@/src/constants";
import { Link } from "@/src/navigation";
import useAuthStore from "@/src/stores/useAuthStore";
import { apiFetch, downloadCertificatePdf } from "@/lib/api";
import { getTimeBasedGreeting } from "@/src/utils/timeGreeting";

const moduleLabels = {
  aptitude: "Aptitude",
  ai_interview: "Interview",
  programming: "Programming",
  both: "All modules",
};

const tones = {
  brand: { bg: "bg-brand-50", icon: "text-brand-700", ring: "ring-brand-200/50" },
  green: { bg: "bg-accent-50", icon: "text-accent-600", ring: "ring-accent-200/50" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", ring: "ring-amber-200/50" },
  blue: { bg: "bg-brand-100", icon: "text-brand-700", ring: "ring-brand-200/50" },
};

const typeMeta = {
  aptitude: { icon: BrainCircuit, tone: "from-brand-700 to-brand-600", label: "Aptitude" },
  interview: { icon: Mic2, tone: "from-brand-600 to-brand-500", label: "Interview" },
  programming: { icon: Code2, tone: "from-amber-500 to-amber-400", label: "Coding" },
};

function formatPercent(value) {
  const number = Number(value);
  return Number.isFinite(number) ? `${Math.round(number)}%` : "0%";
}

function metricToPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, Math.round(number * 10)));
}

function formatDateTime(value) {
  if (!value) return "No activity yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No activity yet";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRelativeTime(value) {
  if (!value) return "New";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "New";
  const diffSeconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return "Just now";
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateTime(value);
}

function getTypeMeta(type) {
  return typeMeta[type] || { icon: Target, tone: "from-brand-600 to-brand-500", label: "Practice" };
}

function roleHome(role) {
  if (role === "master_admin") return "/master-admin/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return null;
}

function SkeletonCard({ className }) {
  return <div className={clsx("animate-pulse rounded-card-lg bg-slate-100", className)} />;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [certificateBusy, setCertificateBusy] = useState("");
  const [greeting, setGreeting] = useState(() => getTimeBasedGreeting());

  const adminHome = roleHome(user?.role);

  useEffect(() => {
    if (adminHome) return;

    let isMounted = true;
    let intervalId;

    async function loadDashboard({ quiet = false } = {}) {
      if (!quiet) setLoading(true);
      try {
        const data = await apiFetch("/api/student/dashboard");
        if (isMounted) {
          setDashboard(data);
          setAnalyticsError("");
        }
      } catch (error) {
        if (isMounted) setAnalyticsError(error.message || "Unable to load your dashboard.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();
    intervalId = window.setInterval(() => loadDashboard({ quiet: true }), 30 * 1000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [adminHome]);

  useEffect(() => {
    const updateGreeting = () => setGreeting(getTimeBasedGreeting());
    const intervalId = window.setInterval(updateGreeting, 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const modules = dashboard?.user?.modules_access || user?.modules_access || ["both"];
  const hasAllModules = modules.includes("both");
  const hasAptitude = hasAllModules || modules.includes("aptitude");
  const hasInterview = hasAllModules || modules.includes("ai_interview");
  const hasProgramming = hasAllModules || modules.includes("programming");
  const enabledModuleLabels = hasAllModules
    ? ["Aptitude", "Interview", "Programming"]
    : modules.map((module) => moduleLabels[module]).filter(Boolean);

  const interviewAnalytics = dashboard?.interview_analytics || null;
  const programmingAnalytics = dashboard?.programming_analytics || null;
  const weeklyGoal = dashboard?.weekly_goal || { target: 5, completed: 0, raw_completed: 0 };
  const continueItem = dashboard?.continue_learning?.[0] || dashboard?.recommendations?.[0] || null;
  const continueMeta = getTypeMeta(continueItem?.type);
  const ContinueIcon = continueMeta.icon;
  const progress = Math.max(0, Math.min(100, Number(dashboard?.overall_progress || 0)));
  const readiness = dashboard?.placement_readiness || { score: 0, label: "Needs Foundation", components: {} };
  const engagement = dashboard?.engagement || { xp: 0, rank: "Starter", badges: [] };
  const firstName = (user?.name || "Learner").split(" ")[0];

  async function issueCertificate(milestone) {
    setCertificateBusy(milestone);
    setAnalyticsError("");
    try {
      const data = await apiFetch(`/api/student/certificates/${milestone}/issue`, { method: "POST" });
      setDashboard((current) => ({
        ...current,
        certificates: {
          ...(current?.certificates || {}),
          issued: [
            data.certificate,
            ...((current?.certificates?.issued || []).filter((item) => item.milestone !== milestone)),
          ],
        },
      }));
    } catch (error) {
      setAnalyticsError(error.message || "Unable to generate certificate.");
    } finally {
      setCertificateBusy("");
    }
  }

  const focusMetrics = useMemo(() => {
    const latestMetrics = interviewAnalytics?.latest_metrics || {};
    return ["confidence", "fluency", "knowledge", "skill_relevance"]
      .map((key) => ({
        key,
        label: METRIC_LABELS[key] || key,
        value: metricToPercent(latestMetrics[key]),
      }))
      .filter((metric) => metric.value !== null);
  }, [interviewAnalytics?.latest_metrics]);

  const statCards = useMemo(() => {
    const cards = [
      {
        label: "Overall Progress",
        value: formatPercent(dashboard?.overall_progress),
        caption: `${enabledModuleLabels.length || 0} enabled module${enabledModuleLabels.length === 1 ? "" : "s"}`,
        icon: TrendingUp,
        tone: "brand",
      },
    ];

    if (hasAptitude) {
      cards.push({
        label: "Aptitude Attempts",
        value: dashboard?.submitted_attempts || 0,
        caption: `${dashboard?.available_assessments || 0} assessment${dashboard?.available_assessments === 1 ? "" : "s"} available`,
        icon: BrainCircuit,
        tone: "green",
      });
    }

    if (hasInterview) {
      cards.push({
        label: "Mock Interviews",
        value: interviewAnalytics?.reports || 0,
        caption: `${formatPercent(interviewAnalytics?.average_percentage)} average`,
        icon: Mic2,
        tone: "blue",
      });
    }

    if (hasProgramming) {
      cards.push({
        label: "Coding Solved",
        value: programmingAnalytics?.solved_unique || 0,
        caption: `${programmingAnalytics?.total_submissions || 0} submission${programmingAnalytics?.total_submissions === 1 ? "" : "s"}`,
        icon: Code2,
        tone: "amber",
      });
    }

    return cards.slice(0, 4);
  }, [
    dashboard?.available_assessments,
    dashboard?.overall_progress,
    dashboard?.submitted_attempts,
    enabledModuleLabels.length,
    hasAptitude,
    hasInterview,
    hasProgramming,
    interviewAnalytics?.average_percentage,
    interviewAnalytics?.reports,
    programmingAnalytics?.solved_unique,
    programmingAnalytics?.total_submissions,
  ]);

  if (adminHome) return <Navigate to={adminHome} replace />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 animate-fade-in-up">
      <section className="mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Your placement readiness workspace
          </p>
        </div>
      </section>

      {analyticsError ? (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-sm">
          {analyticsError}
        </div>
      ) : null}

      <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {loading && !dashboard ? (
          <>
            <SkeletonCard className="h-52" />
            <SkeletonCard className="h-52" />
          </>
        ) : (
          <>
            <article className="card-elevated card-breathe p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Placement Readiness Score</p>
                  <h2 className="stat-value-animate mt-2 text-5xl font-bold tracking-tight text-slate-900">{readiness.score}</h2>
                  <p className="mt-1.5 text-sm font-semibold text-brand-700">{readiness.label}</p>
                </div>
                <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-200/50">
                  <Award className="h-7 w-7" />
                  <span className="ring-soft-pulse absolute inset-0 rounded-2xl ring-2 ring-brand-300/40" />
                </div>
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-5">
                {Object.entries({
                  Aptitude: readiness.components?.aptitude,
                  Coding: readiness.components?.coding,
                  Interview: readiness.components?.interview,
                  Consistency: readiness.components?.consistency,
                  Resume: readiness.components?.resume,
                }).map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-100">
                    <p className="text-xs font-semibold text-slate-500">{label}</p>
                    <p className="mt-1.5 text-lg font-bold text-slate-900">{formatPercent(value)}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="card-elevated p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Streaks, Badges, XP</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{engagement.rank} Rank</h2>
                </div>
                <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 ring-1 ring-amber-200/50">
                  {engagement.xp || 0} XP
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {(engagement.badges || []).map((badge) => (
                  <span key={badge.title} className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-800 ring-1 ring-brand-200/50">
                    {badge.title}
                  </span>
                ))}
                {!engagement.badges?.length ? (
                  <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-400 ring-1 ring-slate-200/50">
                    Complete milestones to earn badges
                  </span>
                ) : null}
              </div>
              <div className="mt-5 progress-track">
                <div className="progress-fill" style={{ width: `${readiness.score || 0}%` }} />
              </div>
            </article>
          </>
        )}
      </section>

      <section className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {loading && !dashboard ? (
          <>
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
            <SkeletonCard className="h-28" />
          </>
        ) : (
          statCards.map(({ label, value, caption, icon: Icon, tone }, index) => {
            const t = tones[tone];
            return (
              <article className={clsx("card-elevated card-glow-hover p-5 animate-fade-in-up", `animate-stagger-${index + 1}`)}>
                <div className="flex items-center gap-4">
                  <div className={clsx("grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1", t.bg, t.icon, t.ring)}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="mt-0.5 text-2xl font-bold leading-none text-slate-900">{dashboard && !loading ? value : "--"}</p>
                    <p className="mt-1 text-xs font-semibold text-brand-700 truncate">{caption}</p>
                  </div>
                </div>
                {label === "Overall Progress" ? (
                  <div className="mt-4 progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </section>

      <section className="mb-8 card-elevated card-glow-hover p-5">
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/50">
            <Trophy size={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Weekly Goal</p>
            <p className="text-sm text-slate-500">
              {weeklyGoal.completed || 0} of {weeklyGoal.target || 5} sessions complete
            </p>
          </div>
        </div>
        <div className="mt-4 progress-track h-2.5">
          <div className="progress-fill" style={{ width: `${Math.min(100, ((weeklyGoal.completed || 0) / (weeklyGoal.target || 5)) * 100)}%` }} />
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <section className="card-elevated card-glow-hover p-6">
            <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
            {loading && !dashboard ? (
              <div className="mt-6 space-y-4">
                <div className="flex gap-5">
                  <SkeletonCard className="h-24 w-24 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <SkeletonCard className="h-5 w-3/4" />
                    <SkeletonCard className="h-4 w-1/2" />
                    <SkeletonCard className="h-3 w-full" />
                  </div>
                </div>
              </div>
            ) : continueItem ? (
              <div className="mt-6 grid gap-5 md:grid-cols-[96px_1fr_auto] md:items-center">
                <div className={clsx("grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br", continueMeta.tone, "shadow-sm")}>
                  <ContinueIcon size={40} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-slate-900">{continueItem.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">{continueItem.meta || continueMeta.label}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="progress-track flex-1">
                      <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, Number(continueItem.progress || progress)))}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">
                      {formatPercent(continueItem.progress ?? progress)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    Latest update: {formatDateTime(continueItem.updated_at || dashboard?.generated_at)}
                  </p>
                </div>
                <Link href={continueItem.href || "/aptitude"} className="btn-primary whitespace-nowrap">
                  {continueItem.action || "Continue"}
                </Link>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                <p className="font-semibold text-slate-900">No progress yet</p>
                <p className="mt-2 text-sm text-slate-500">Start a practice session — your next step appears here.</p>
              </div>
            )}
          </section>

          <section className="card-elevated p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">Learning Path</h2>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Personalized</span>
            </div>
            {loading && !dashboard ? (
              <div className="grid gap-4 md:grid-cols-2">
                <SkeletonCard className="h-40" />
                <SkeletonCard className="h-40" />
              </div>
            ) : (
              <div className="hover-lift-group grid gap-4 md:grid-cols-2">
                {(dashboard?.learning_path || []).slice(0, 5).map((item, index) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`hover-lift-child card-elevated p-4 transition-all animate-fade-in-up animate-stagger-${index + 1}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">{item.category}</p>
                        <h3 className="mt-1 font-semibold text-slate-900">{item.title}</h3>
                      </div>
                      <span
                        className={clsx(
                          "shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold uppercase",
                          item.priority === "high"
                            ? "bg-red-50 text-red-600 ring-1 ring-red-200/50"
                            : item.priority === "medium"
                              ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200/50"
                              : "bg-accent-50 text-accent-700 ring-1 ring-accent-200/50",
                        )}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-2">{item.task}</p>
                    <div className="mt-4 progress-track">
                      <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, Number(item.progress || 0)))}%` }} />
                    </div>
                  </Link>
                ))}
                {!dashboard?.learning_path?.length ? (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-sm text-slate-500 md:col-span-2">
                    Your learning path will appear after your first activity.
                  </div>
                ) : null}
              </div>
            )}
          </section>

          {hasInterview ? (
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 p-6 shadow-card-elevated sm:p-8">
              <div className="absolute right-5 top-5 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">Live</span>
              </div>
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/[0.06]" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/[0.04]" />
              <div className="relative grid gap-6 md:grid-cols-[1fr_240px] md:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200">AI Mock Interview</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">AI Interview Feedback</h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100/80">
                    Latest average: {formatPercent(interviewAnalytics?.average_percentage)} across {interviewAnalytics?.reports || 0} saved report{interviewAnalytics?.reports === 1 ? "" : "s"}.
                  </p>
                  <Link
                    href="/interview"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow-md transition hover:bg-emerald-50 active:scale-[0.97]"
                  >
                    Try AI Mock Interview
                  </Link>
                </div>
                <div className="hidden md:flex justify-center">
                  <div className="grid h-28 w-28 place-items-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20">
                    <Bot size={56} className="text-white/80" />
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          {loading && !dashboard ? (
            <>
              <SkeletonCard className="h-36" />
              <SkeletonCard className="h-44" />
              <SkeletonCard className="h-52" />
              <SkeletonCard className="h-52" />
              <SkeletonCard className="h-44" />
              <SkeletonCard className="h-48" />
            </>
          ) : (
            <>
          <section className="card-elevated p-5 animate-fade-in-up animate-stagger-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays size={16} className="text-slate-400" />
              <h2 className="text-base font-bold text-slate-900">Role Focus</h2>
            </div>
            <h3 className="text-base font-bold text-brand-700">
              {dashboard?.user?.interested_role || user?.interested_role || "Skill preparation"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {enabledModuleLabels.length ? enabledModuleLabels.join(", ") : "Student workspace"}
            </p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Weekly: {weeklyGoal.raw_completed || weeklyGoal.completed || 0}/{weeklyGoal.target || 5}
              </p>
              <Link
                href={hasInterview ? "/interview" : hasProgramming ? "/programming/practice" : "/aptitude"}
                className="btn-primary whitespace-nowrap"
              >
                Practice
              </Link>
            </div>
          </section>

          <section className="card-elevated p-5 animate-fade-in-up animate-stagger-6">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-600" />
              <h2 className="text-base font-bold text-slate-900">Resume Builder</h2>
            </div>
            <p className="text-sm text-slate-600">
              Latest ATS score:{" "}
              <span className="font-semibold text-brand-800">
                {dashboard?.resume_builder?.latest_version?.ats_score || 0}
              </span>
            </p>
            {dashboard?.resume_builder?.latest_version?.improvements?.length ? (
              <p className="mt-3 text-xs leading-5 text-slate-500 line-clamp-2">
                {dashboard.resume_builder.latest_version.improvements[0]}
              </p>
            ) : null}
            <Link href="/resume-builder" className="btn-secondary mt-4 w-full justify-center">
              Improve Resume
            </Link>
          </section>

          <section className="card-elevated p-5 animate-fade-in-up animate-stagger-7">
            <div className="mb-5 flex items-center gap-2">
              <Award className="h-5 w-5 text-brand-600" />
              <h2 className="text-base font-bold text-slate-900">Certificates</h2>
            </div>
            <div className="space-y-3">
              {(dashboard?.certificates?.issued || []).map((certificate) => (
                <div key={certificate.id || certificate._id} className="rounded-xl bg-brand-50 p-3 ring-1 ring-brand-200/50">
                  <p className="text-sm font-semibold text-slate-900">{certificate.title}</p>
                  <button
                    type="button"
                    onClick={() => downloadCertificatePdf(certificate.id || certificate._id)}
                    className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-brand-700 hover:text-brand-800"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </button>
                </div>
              ))}
              {(dashboard?.certificates?.milestones || [])
                .filter(
                  (milestone) =>
                    milestone.eligible &&
                    !(dashboard?.certificates?.issued || []).some((item) => item.milestone === milestone.milestone),
                )
                .map((milestone) => (
                  <button
                    key={milestone.milestone}
                    type="button"
                    onClick={() => issueCertificate(milestone.milestone)}
                    disabled={certificateBusy === milestone.milestone}
                    className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-brand-800 transition hover:bg-brand-50 disabled:opacity-60"
                  >
                    {certificateBusy === milestone.milestone
                      ? "Generating..."
                      : `Generate: ${milestone.title}`}
                  </button>
                ))}
              {!dashboard?.certificates?.issued?.length &&
              !(dashboard?.certificates?.milestones || []).some((m) => m.eligible) ? (
                <p className="text-sm text-slate-500">
                  Eligible certificates will appear after milestone completion.
                </p>
              ) : null}
            </div>
          </section>

          <section className="card-elevated p-5 animate-fade-in-up animate-stagger-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
              <Link href="/reports" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                View all
              </Link>
            </div>
            {loading && !dashboard ? (
              <div className="space-y-4">
                <SkeletonCard className="h-14" />
                <SkeletonCard className="h-14" />
                <SkeletonCard className="h-14" />
              </div>
            ) : (
              <div className="space-y-3">
                {(dashboard?.recent_activity || []).map((activity) => {
                  const meta = getTypeMeta(activity.type);
                  const Icon =
                    activity.score >= 80 || activity.result === "Accepted"
                      ? CheckCircle2
                      : activity.type === "aptitude"
                        ? Star
                        : meta.icon;
                  return (
                    <Link
                      key={`${activity.type}-${activity.id}`}
                      href={activity.href || "/dashboard"}
                      className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-brand-50/60"
                    >
                      <div className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white", meta.tone)}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{activity.title}</p>
                        <p className="text-xs text-slate-500">{activity.meta}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-400">{formatRelativeTime(activity.occurred_at)}</p>
                        <p className="mt-0.5 text-xs font-semibold text-brand-700">
                          {Number.isFinite(Number(activity.score))
                            ? formatPercent(activity.score)
                            : activity.result}
                        </p>
                      </div>
                    </Link>
                  );
                })}

                {!dashboard?.recent_activity?.length ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    No activity yet.
                  </p>
                ) : null}
              </div>
            )}
          </section>

          {focusMetrics.length ? (
            <section className="card-elevated p-5 animate-fade-in-up animate-stagger-9">
              <h2 className="text-base font-bold text-slate-900">Focus Metrics</h2>
              <div className="mt-5 space-y-4">
                {focusMetrics.map((metric) => (
                  <div key={metric.key}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-600">{metric.label}</span>
                      <span className="font-semibold text-slate-900">{metric.value}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${metric.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}