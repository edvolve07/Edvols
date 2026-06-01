import { useEffect, useState } from "react";
import { useNavigate } from "../../navigation";
import LoadingSkeleton from "./LoadingSkeleton";
import { getStudentResults } from "@/lib/api";

function formatDateTime(value) {
  if (!value) return "Open";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function StudentResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStudentResults()
      .then((data) => setResults(data.results || []))
      .catch((err) => setError(err.message || "Unable to load results"));
  }, []);

  if (!results) return <LoadingSkeleton label="Loading results" />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-brand-600">Performance archive</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">My results</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Review submitted attempts, scores, pass status, and detailed result pages.
        </p>
        {error && <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
          No submitted attempts yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => navigate(`/aptitude/results/${result.id}`)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-950">{result.assessment_title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {result.concept} · {result.difficulty} · {formatDateTime(result.submitted_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-950">{result.percentage}%</p>
                  <p className={result.passed ? 'text-sm font-bold text-emerald-700' : 'text-sm font-bold text-red-600'}>
                    {result.passed ? 'Passed' : 'Failed'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
