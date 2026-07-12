import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, ExternalLink, FileText, FolderOpen, Plus, Save, Sparkles, TrendingUp, XCircle } from "lucide-react";
import { apiFetch, downloadResumeLatex, downloadResumePdf } from "@/lib/api";
import useAuthStore from "@/src/stores/useAuthStore";

const emptySection = { title: "", items: [""] };

function listToText(list = []) {
  return list.join(", ");
}

function textToList(value) {
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSections(sections = []) {
  return sections.length ? sections : [{ ...emptySection }];
}

function SectionEditor({ label, sections, onChange }) {
  function updateSection(index, key, value) {
    const next = [...sections];
    next[index] = { ...next[index], [key]: key === "items" ? value.split("\n") : value };
    onChange(next);
  }

  function addSection() {
    onChange([...sections, { ...emptySection }]);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{label}</h2>
        <button type="button" onClick={addSection} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <input
              value={section.title || ""}
              onChange={(event) => updateSection(index, "title", event.target.value)}
              placeholder={`${label} title`}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-brand-400"
            />
            <textarea
              value={(section.items || []).join("\n")}
              onChange={(event) => updateSection(index, "items", event.target.value)}
              placeholder="One bullet per line"
              rows={4}
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function TextListEditor({ label, value, onChange, placeholder }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-slate-900">{label}</h2>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || "One item per line or comma separated"}
        rows={4}
        className="mt-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
      />
    </section>
  );
}

function ScoreGauge({ score }) {
  const hue = score >= 80 ? 142 : score >= 60 ? 38 : 0;
  return (
    <div className="relative flex items-center gap-3">
      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="20" fill="none" stroke="oklch(0.87 0 0)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="24" cy="24" r="20" fill="none" stroke={`hsl(${hue}, 70%, 45%)`} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(score / 100) * 125.6} 125.6`} />
      </svg>
      <div>
        <p className="text-2xl font-bold text-slate-900">{score}</p>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">/ 100</p>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, max }) {
  const pct = Math.min(Math.round((score / max) * 100), 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 shrink-0 text-xs font-medium text-slate-600">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-semibold text-slate-700">{score}/{max}</span>
    </div>
  );
}

export default function ResumeBuilderPage() {
  const { user } = useAuthStore();
  const [versions, setVersions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState("builder");
  const [searchRole, setSearchRole] = useState("");
  const [form, setForm] = useState({
    title: "Placement Resume",
    target_role: user?.interested_role || "",
    phone: user?.phone || "",
    email: user?.email || "",
    linkedin: "",
    github: "",
    location: user?.location || "",
    summary: "",
    skills: "",
    experience: [{ ...emptySection }],
    projects: [{ ...emptySection }],
    education: [{ ...emptySection }],
    certifications: "",
    achievements: [{ ...emptySection }],
  });

  useEffect(() => {
    let active = true;
    apiFetch("/api/student/resume-builder")
      .then((data) => {
        if (!active) return;
        setVersions(data.versions || []);
        const latest = data.versions?.[0];
        if (latest) {
          setForm({
            title: latest.title || "Placement Resume",
            target_role: latest.target_role || user?.interested_role || "",
            phone: latest.phone || user?.phone || "",
            email: latest.email || user?.email || "",
            linkedin: latest.linkedin || "",
            github: latest.github || "",
            location: latest.location || user?.location || "",
            summary: latest.summary || "",
            skills: listToText(latest.skills || []),
            experience: normalizeSections(latest.experience),
            projects: normalizeSections(latest.projects),
            education: normalizeSections(latest.education),
            certifications: listToText(latest.certifications || []),
            achievements: normalizeSections(latest.achievements),
          });
        }
      })
      .catch((err) => setError(err.message || "Unable to load resume versions."));
    apiFetch("/api/student/resume-builder/templates")
      .then((data) => { if (active) setTemplates(data.templates || []); })
      .catch(() => {});
    return () => { active = false; };
  }, [user?.interested_role]);

  const latest = versions[0];
  const ats = latest?.ats_analysis || {};
  const scoreDelta = useMemo(() => {
    if (!ats.ats_score) return 0;
    return (ats.ats_score || 0) - (ats.previous_score || 0);
  }, [ats]);

  async function saveVersion(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = {
        ...form,
        skills: textToList(form.skills),
        certifications: textToList(form.certifications),
        experience: form.experience.map((section) => ({ ...section, items: (section.items || []).filter(Boolean) })),
        projects: form.projects.map((section) => ({ ...section, items: (section.items || []).filter(Boolean) })),
        education: form.education.map((section) => ({ ...section, items: (section.items || []).filter(Boolean) })),
        achievements: form.achievements.map((section) => ({ ...section, items: (section.items || []).filter(Boolean) })),
      };
      const data = await apiFetch("/api/student/resume-builder/versions", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setVersions((current) => [data.version, ...current]);
      setMessage(`Version ${data.version.version} saved with ATS score ${data.version.ats_analysis.ats_score}.`);
    } catch (err) {
      setError(err.message || "Unable to save resume version.");
    } finally {
      setSaving(false);
    }
  }

  function applyTemplate(template) {
    setForm((current) => ({
      ...current,
      target_role: template.role,
      summary: template.summary,
      skills: template.skills.join(", "),
    }));
    setActiveTab("builder");
    setMessage(`Template "${template.role}" applied — customize and save.`);
  }

  const filteredTemplates = templates.filter((t) =>
    !searchRole || t.role.toLowerCase().includes(searchRole.toLowerCase()) || t.category.toLowerCase().includes(searchRole.toLowerCase())
  );

  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Resume Builder</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">ATS-optimized resume</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Build, analyze, and iterate ATS-friendly resumes. Choose from 30+ engineering templates.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-brand-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase text-brand-700">Latest ATS Score</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{ats.ats_score || 0}</p>
            <p className="text-xs text-slate-500">
              {scoreDelta >= 0 ? "+" : ""}{scoreDelta} from previous
            </p>
          </div>
        </div>
        <div className="mt-5 flex gap-1 rounded-lg bg-slate-100 p-1">
          {["builder", "ats", "templates"].map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab === "builder" ? "Resume Builder" : tab === "ats" ? "ATS Analysis" : "Templates"}
            </button>
          ))}
        </div>
      </div>

      {message ? <div className="rounded-lg border border-accent-200 bg-accent-50 p-4 text-sm font-semibold text-accent-800">{message}</div> : null}
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : null}

      {activeTab === "builder" ? (
        <form onSubmit={saveVersion} className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-slate-900">Basics</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" placeholder="Resume title" />
                <input value={form.target_role} onChange={(e) => setForm((c) => ({ ...c, target_role: e.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" placeholder="Target role" />
                <input value={form.phone} onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" placeholder="Phone" />
                <input value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" placeholder="Email" />
                <input value={form.linkedin} onChange={(e) => setForm((c) => ({ ...c, linkedin: e.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" placeholder="LinkedIn URL" />
                <input value={form.github} onChange={(e) => setForm((c) => ({ ...c, github: e.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" placeholder="GitHub URL" />
                <input value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 md:col-span-2" placeholder="Location" />
              </div>
              <textarea value={form.summary} onChange={(e) => setForm((c) => ({ ...c, summary: e.target.value }))}
                rows={5} className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                placeholder="Professional summary with role, skills, and measurable impact" />
              <input value={form.skills} onChange={(e) => setForm((c) => ({ ...c, skills: e.target.value }))}
                className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                placeholder="Skills separated by commas" />
            </section>
            <SectionEditor label="Experience" sections={form.experience} onChange={(v) => setForm((c) => ({ ...c, experience: v }))} />
            <SectionEditor label="Projects" sections={form.projects} onChange={(v) => setForm((c) => ({ ...c, projects: v }))} />
            <SectionEditor label="Education" sections={form.education} onChange={(v) => setForm((c) => ({ ...c, education: v }))} />
            <TextListEditor label="Certifications" value={form.certifications} onChange={(v) => setForm((c) => ({ ...c, certifications: v }))} />
            <SectionEditor label="Achievements" sections={form.achievements} onChange={(v) => setForm((c) => ({ ...c, achievements: v }))} />
          </div>
          <aside className="space-y-5">
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save New Version"}
            </button>
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-700" />
                <h2 className="text-lg font-bold text-slate-900">ATS Suggestions</h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {(ats.improvements || ["Save a version to receive score improvement suggestions."]).map((item) => (
                  <li key={item} className="flex gap-2">
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-700" />
                <h2 className="text-lg font-bold text-slate-900">Versions</h2>
              </div>
              <div className="mt-4 space-y-3">
                {versions.map((version) => (
                  <div key={version.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="font-semibold text-slate-900">Version {version.version}</p>
                    <p className="text-xs text-slate-500">ATS {version.ats_analysis?.ats_score || 0} / 100</p>
                    <button type="button" onClick={() => downloadResumePdf(version.id, version.version)}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50">
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </button>
                    <button type="button" onClick={() => downloadResumeLatex(version.id, version.version)}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-brand-200 hover:text-brand-700 hover:bg-brand-50">
                      <FileText className="h-3.5 w-3.5" />
                      LaTeX
                    </button>
                  </div>
                ))}
                {!versions.length ? <p className="text-sm text-slate-500">No versions saved yet.</p> : null}
              </div>
            </section>
          </aside>
        </form>
      ) : activeTab === "ats" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">ATS Score Breakdown</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">How your resume scores</h2>
                </div>
                <ScoreGauge score={ats.ats_score || 0} />
              </div>
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Section Scores</p>
                {(() => {
                  const sb = ats.score_breakdown || {};
                  return Object.entries({
                    targetRole: { label: "Target Role", max: 8 },
                    summary: { label: "Summary", max: 10 },
                    skills: { label: "Skills", max: 15 },
                    experience: { label: "Experience", max: 15 },
                    projects: { label: "Projects", max: 12 },
                    achievements: { label: "Achievements", max: 4 },
                    certifications: { label: "Certifications", max: 3 },
                    actionVerbs: { label: "Action Verbs", max: 9 },
                    measurableOutcomes: { label: "Measurable Outcomes", max: 6 },
                    keywordMatch: { label: "Keyword Match", max: 12 },
                    contactLinks: { label: "Contact Links", max: 5 },
                  }).map(([key, { label, max }]) => (
                    <ScoreBar key={key} label={label} score={sb[key] || 0} max={max} />
                  ));
                })()}
              </div>
            </section>
            {ats.keyword_matches ? (
              <section className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-slate-900">Keyword Analysis</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Matched {ats.keyword_matches.matched} of {ats.keyword_matches.total} role-specific keywords
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(ats.keyword_matches.found || []).map((kw) => (
                    <span key={kw} className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
                      <CheckCircle2 className="h-3 w-3" />
                      {kw}
                    </span>
                  ))}
                </div>
                {(ats.keyword_matches.missing || []).length > 0 ? (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Missing keywords to add</p>
                    <div className="flex flex-wrap gap-2">
                      {(ats.keyword_matches.missing || []).map((kw) => (
                        <span key={kw} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          <XCircle className="h-3 w-3" />
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}
            {(ats.strengths || []).length > 0 ? (
              <section className="rounded-lg border border-accent-200 bg-accent-50 p-5">
                <h3 className="text-sm font-bold text-accent-900">Strengths</h3>
                <ul className="mt-3 space-y-2">
                  {ats.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-accent-800">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
          <aside className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-700" />
                <h2 className="text-lg font-bold text-slate-900">Improvements</h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {(ats.improvements || ["Save a version to see recommended improvements."]).map((item) => (
                  <li key={item} className="flex gap-2">
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {item}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => setActiveTab("builder")}
                className="btn-secondary mt-5 w-full justify-center">
                Edit Resume
              </button>
            </section>
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-700" />
                <h2 className="text-lg font-bold text-slate-900">Versions</h2>
              </div>
              <div className="mt-4 space-y-3">
                {versions.map((version) => (
                  <div key={version.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="font-semibold text-slate-900">Version {version.version}</p>
                    <p className="text-xs text-slate-500">ATS {version.ats_analysis?.ats_score || 0} / 100</p>
                  </div>
                ))}
                {!versions.length ? <p className="text-sm text-slate-500">No versions saved.</p> : null}
              </div>
            </section>
          </aside>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input value={searchRole} onChange={(e) => setSearchRole(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm outline-none focus:border-brand-400"
                placeholder="Search roles or categories..." />
              <FolderOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">{filteredTemplates.length} templates</p>
          </div>
          {categories.map((cat) => {
            const catTemplates = filteredTemplates.filter((t) => t.category === cat);
            if (!catTemplates.length) return null;
            return (
              <section key={cat}>
                <h2 className="mb-4 text-lg font-bold text-slate-900">{cat}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {catTemplates.map((t) => (
                    <div key={t.id || t.role} className="card-glow-hover rounded-lg border border-slate-200 bg-white p-5 transition-all">
                      <h3 className="font-bold text-slate-900">{t.role}</h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{t.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {t.skills.slice(0, 5).map((s) => (
                          <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{s}</span>
                        ))}
                        {t.skills.length > 5 ? <span className="text-[10px] text-slate-400">+{t.skills.length - 5}</span> : null}
                      </div>
                      <ul className="mt-3 space-y-1">
                        {t.highlights.map((h) => (
                          <li key={h} className="flex gap-1.5 text-[11px] leading-4 text-slate-600">
                            <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                            {h}
                          </li>
                        ))}
                      </ul>
                      <button type="button" onClick={() => applyTemplate(t)}
                        className="btn-primary mt-4 w-full justify-center text-xs py-2">
                        Use Template
                      </button>
                      {t.overleaf_url ? (
                        <a href={t.overleaf_url} target="_blank" rel="noopener noreferrer"
                          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400 hover:text-brand-700 transition">
                          <ExternalLink className="h-3 w-3" />
                          {t.source || 'Open in Overleaf'}
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}