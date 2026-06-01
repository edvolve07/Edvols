import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BarChart3, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import { DASHBOARD_STATS, METRIC_LABELS, WORKFLOW_STEPS } from "@/src/constants";
import { Link } from "@/src/navigation";
import { useAuth } from "@/src/portal/context/AuthContext";
import { apiFetch } from "@/lib/api";

const toneClass = {
  brand: "bg-brand-50 text-brand-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  purple: "bg-purple-50 text-purple-600",
};

function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "--";
  const number = Number(value);
  return Number.isFinite(number) ? `${Math.round(number)}%` : `${value}%`;
}

function averageNumbers(values) {
  const numbers = values.map(Number).filter((value) => Number.isFinite(value) && value > 0);
  if (!numbers.length) return null;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function metricToPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, Math.round(number * 10)));
}

function formatDuration(seconds) {
  if (!seconds) return "0m";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function formatDateTime(value) {
  if (!value) return "Open";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [assessmentStats, setAssessmentStats] = useState(null);
  const [analyticsError, setAnalyticsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (user?.role !== "student") {
      setAssessmentStats(null);
      setAnalyticsError("");
      return undefined;
    }

    setAnalyticsError("");
    apiFetch("/api/student/dashboard")
      .then((data) => {
        if (isMounted) setAssessmentStats(data);
      })
      .catch((error) => {
        if (isMounted) setAnalyticsError(error.message || "Unable to load assessment analytics.");
      });

    return () => {
      isMounted = false;
    };
  }, [user?.role]);

  const interviewAnalytics = assessmentStats?.interview_analytics || {};
  const combinedAverage = useMemo(
    () => averageNumbers([assessmentStats?.average_percentage, interviewAnalytics.average_percentage]),
    [assessmentStats?.average_percentage, interviewAnalytics.average_percentage],
  );
  const focusMetrics = useMemo(() => {
    const latestMetrics = interviewAnalytics.latest_metrics || {};
    return ["confidence", "fluency", "knowledge", "skill_relevance"]
      .map((key) => ({
        key,
        label: METRIC_LABELS[key] || key,
        value: metricToPercent(latestMetrics[key]),
      }))
      .filter((metric) => metric.value !== null);
  }, [interviewAnalytics.latest_metrics]);

  const dashboardStats = useMemo(
    () =>
      DASHBOARD_STATS.map((item) => {
        if (item.label === "Interviews") {
          return { ...item, value: interviewAnalytics.reports ?? item.value };
        }
        if (item.label === "Average score") {
          return { ...item, value: formatPercent(combinedAverage) };
        }
        if (item.label === "Aptitude attempts") {
          return { ...item, value: assessmentStats?.submitted_attempts ?? item.value };
        }
        if (item.label === "Reports") {
          return {
            ...item,
            value: (assessmentStats?.submitted_attempts ?? 0) + (interviewAnalytics.reports ?? 0),
          };
        }
        return item;
      }),
    [assessmentStats?.submitted_attempts, combinedAverage, interviewAnalytics.reports],
  );

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <section className="mb-4 grid gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:mb-6 sm:p-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div>
          <p className="mb-2 text-sm font-medium text-brand-600">Interview preparation workspace</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Practice interviews, test aptitude, and review scorecards in one place.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Upload a resume, answer AI interview questions with your voice, and use the final report to improve before the real round.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/interview"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-600"
            >
              Start interview <ArrowRight size={16} />
            </Link>
            <Link
              href="/aptitude"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Take aptitude test
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950 p-4 text-white sm:p-5">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-300" />
            <p className="text-sm font-semibold">Today&apos;s focus</p>
          </div>
          <div className="space-y-4">
            {focusMetrics.length ? (
              focusMetrics.map((item) => (
                <div key={item.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-mono text-slate-400">{item.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-brand-400" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-slate-300">
                Complete an interview to unlock live focus metrics from your saved report.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mb-4 grid gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {dashboardStats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:p-5">
            <div className={clsx("mb-4 flex h-11 w-11 items-center justify-center rounded-xl", toneClass[tone])}>
              <Icon size={19} />
            </div>
            <p className="font-display text-2xl font-semibold text-slate-950 sm:text-3xl">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <section className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:mb-6 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-brand-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
                Interview Analytics
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Live interview report data from your saved sessions.
            </p>
          </div>
          <Link
            href="/reports"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            View interview reports <ArrowRight size={15} />
          </Link>
        </div>

        {analyticsError ? (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {analyticsError}
          </div>
        ) : !assessmentStats && user?.role === "student" ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Saved Interviews</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{interviewAnalytics.reports ?? 0}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Average Interview</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-950">
                  {formatPercent(interviewAnalytics.average_percentage)}
                </p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Latest ATS Score</p>
                <p className="mt-2 text-2xl font-semibold text-blue-950">
                  {formatPercent(interviewAnalytics.latest_ats_score)}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-100">
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-900">Recent Interview Reports</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {interviewAnalytics.recent_reports?.length ? (
                  interviewAnalytics.recent_reports.slice(0, 4).map((report) => (
                    <Link
                      key={report.session_id}
                      href={`/reports?session=${report.session_id}`}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{report.role || "Interview Report"}</p>
                        <p className="text-xs text-slate-500">
                          {report.domain || "General"} · {report.generated_date || formatDateTime(report.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{formatPercent(report.percentage)}</p>
                        <p className="text-xs text-slate-500">
                          {report.grade_label || report.grade || "Ungraded"} · ATS {formatPercent(report.ats_score)}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-8 text-center text-sm text-slate-500">
                    No interview reports saved yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={17} className="text-brand-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
                Aptitude Assessment Analytics
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Track available tests, score trends, topic strength, and recent submissions.
            </p>
          </div>
          <Link
            href="/reports"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View reports <ArrowRight size={15} />
          </Link>
        </div>

        {analyticsError ? (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {analyticsError}
          </div>
        ) : !assessmentStats && user?.role === "student" ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : assessmentStats ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Available</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{assessmentStats.available_assessments ?? 0}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Submitted</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-900">{assessmentStats.submitted_attempts ?? 0}</p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Pass Rate</p>
                <p className="mt-2 text-2xl font-semibold text-blue-950">{formatPercent(assessmentStats.pass_rate)}</p>
              </div>
              <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">Average Score</p>
                <p className="mt-2 text-2xl font-semibold text-purple-950">
                  {formatPercent(assessmentStats.average_percentage)}
                </p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-xl border border-slate-100 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Topic Performance</h3>
                <div className="mt-4 space-y-3">
                  {assessmentStats.topic_analytics?.length ? (
                    assessmentStats.topic_analytics.map((topic) => {
                      const score = Math.min(Number(topic.average_percentage) || 0, 100);
                      return (
                        <div key={topic.concept}>
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium text-slate-700">{topic.concept}</span>
                            <span className="font-mono text-slate-500">{formatPercent(topic.average_percentage)}</span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-brand-500" style={{ width: `${score}%` }} />
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {topic.attempts} attempts · Best {formatPercent(topic.best_percentage)} · Pass rate{" "}
                            {formatPercent(topic.pass_rate)}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500">No topic analytics yet.</p>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-100">
                <div className="border-b border-slate-100 px-4 py-3">
                  <h3 className="text-sm font-semibold text-slate-900">Recent Submissions</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Assessment</th>
                        <th className="px-4 py-3">Score</th>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3">Result</th>
                        <th className="px-4 py-3">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assessmentStats.recent_submissions?.length ? (
                        assessmentStats.recent_submissions.slice(0, 5).map((submission) => (
                          <tr key={submission.id} className="text-slate-600">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-900">{submission.assessment_title}</p>
                              <p className="text-xs text-slate-500">
                                {submission.concept} · {submission.difficulty}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-900">{formatPercent(submission.percentage)}</p>
                              <p className="text-xs text-slate-500">
                                {submission.score}/{submission.total_marks}
                              </p>
                            </td>
                            <td className="px-4 py-3">{formatDuration(submission.time_taken_seconds)}</td>
                            <td className="px-4 py-3">
                              <span
                                className={clsx(
                                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                                  submission.passed
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-600",
                                )}
                              >
                                {submission.passed ? "Passed" : "Failed"}
                              </span>
                            </td>
                            <td className="px-4 py-3">{formatDateTime(submission.submitted_at)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-4 py-8 text-center text-slate-500" colSpan="5">
                            No submissions yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Assessment analytics are available for student accounts.</p>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center gap-2">
            <CheckCircle2 size={17} className="text-brand-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Workflow</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {WORKFLOW_STEPS.map(({ title, description, icon: Icon }, index) => (
              <div key={title} className="relative">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand-500">
                  <Icon size={17} />
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {index + 1}. {title}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600">
            <Clock3 size={18} />
          </div>
          <p className="text-sm font-semibold text-brand-900">Recommended practice</p>
          <p className="mt-2 text-sm leading-6 text-brand-700">
            Complete three mock interviews and one aptitude test before a real interview to spot repeated gaps.
          </p>
        </aside>
      </section>
    </div>
  );
}
