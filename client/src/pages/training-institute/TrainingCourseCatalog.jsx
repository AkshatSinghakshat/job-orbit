import { useCallback, useEffect, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import TrainingPageShell, { Notice, Panel } from "./TrainingPageShell";
import { courseCatalogService, enrollmentService } from "../../services/trainingApi";

export default function TrainingCourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const result = await courseCatalogService.list({ pageSize: 50, search: search.trim() || undefined }); setCourses(result.courses || result.data?.courses || []); }
    catch (err) { setError(err.userMessage || "Unable to load published courses."); }
    finally { setLoading(false); }
  }, [search]);
  useEffect(() => { load(); }, [load]);

  async function enroll(batch) {
    setBusy(batch.id); setError(""); setMessage("");
    try { await enrollmentService.request({ batchId: batch.id }); setMessage("Enrollment request sent. The institute will review it."); }
    catch (err) { setError(err.userMessage || "Unable to request enrollment."); }
    finally { setBusy(null); }
  }

  return <TrainingPageShell title="Training Courses" description="Browse published courses and request a seat in an available batch.">
    {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}{message && <div className="mb-4"><Notice kind="success">{message}</Notice></div>}
    <Panel title="Published courses"><label className="relative mb-4 block"><Search size={16} className="absolute left-3 top-3 text-slate-500"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search published courses" className="w-full rounded-xl border border-slate-600 bg-slate-950 py-2.5 pl-9 pr-3 text-sm"/></label>
      {loading ? <p role="status" className="text-sm text-slate-400">Loading courses…</p> : courses.length === 0 ? <p className="text-sm text-slate-400">No published courses are available.</p> : <div className="grid gap-4 lg:grid-cols-2">{courses.map((course) => <article key={course.id} className="rounded-xl border border-slate-700 bg-slate-900 p-5"><div className="flex items-start gap-3"><BookOpen className="mt-1 shrink-0 text-blue-300" size={20}/><div className="min-w-0"><h2 className="text-lg font-semibold">{course.title}</h2><p className="mt-1 text-sm text-slate-400">{course.TrainingInstitute?.name || course.TrainingInstitute?.User?.name || "Training institute"} · {course.category || course.level}</p><p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{course.description || ""}</p><p className="mt-3 text-sm font-medium text-blue-300">₹{Number(course.fee || 0).toLocaleString("en-IN")} · {course.duration || `${course.durationWeeks || 0} weeks`} · {course.mode}</p></div></div><div className="mt-4 space-y-2">{(course.TrainingBatches || []).length === 0 ? <p className="text-xs text-slate-500">No available batches right now.</p> : course.TrainingBatches.map((batch) => { const full = batch.enrolledCount >= batch.capacity; return <div key={batch.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 px-3 py-2"><span className="text-xs text-slate-300">{batch.name} · {batch.startDate} · {Math.max(0, batch.capacity - batch.enrolledCount)} seats</span><button disabled={full || busy === batch.id} onClick={() => enroll(batch)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50">{full ? "Full" : busy === batch.id ? "Sending…" : "Request seat"}</button></div>; })}</div></article>)}</div>}
    </Panel>
  </TrainingPageShell>;
}
