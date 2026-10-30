import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import TrainingPageShell, { Button, Field, Notice, Panel } from "./TrainingPageShell";
import { courseService } from "../../services/trainingApi";

const blank = { title: "", category: "", description: "", level: "Beginner", duration: "", durationWeeks: "", fee: "", mode: "Online", status: "Draft" };
const pageSize = 10;

export default function TrainingInstituteCourses() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await courseService.list({ page, pageSize, search: search.trim() || undefined });
      const data = result.data || {};
      setItems(result.courses || data.courses || []); setTotal(data.total || 0);
    } catch (err) { setError(err.userMessage || "Unable to load courses."); }
    finally { setLoading(false); }
  }, [page, search]);
  useEffect(() => { load(); }, [load]);

  function edit(item) {
    setEditingId(item.id);
    setForm({ title: item.title || "", category: item.category || "", description: item.description || "", level: item.level || "All levels", duration: item.duration || "", durationWeeks: String(item.durationWeeks || ""), fee: String(item.fee ?? ""), mode: item.mode || "Online", status: item.status || "Draft" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const payload = { ...form, durationWeeks: Number(form.durationWeeks || 0), fee: Number(form.fee || 0) };
    try {
      if (editingId) await courseService.update(editingId, payload);
      else await courseService.create(payload);
      setForm(blank); setEditingId(null); setMessage(editingId ? "Course updated." : "Course created."); await load();
    } catch (err) { setError(err.userMessage || "Unable to save course."); }
    finally { setBusy(false); }
  }

  async function remove(item) {
    if (!window.confirm(`Delete “${item.title}”? Courses with batches or enrollments must be archived.`)) return;
    setError(""); setMessage("");
    try { await courseService.remove(item.id); setMessage("Course deleted."); await load(); }
    catch (err) { setError(err.userMessage || "Unable to delete course."); }
  }

  return <TrainingPageShell title="Course Management" description="Create, update, search, and publish institute courses.">
    {(error || message) && <div className="mb-4"><Notice kind={error ? "error" : "success"}>{error || message}</Notice></div>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Panel title={`Courses (${total})`}>
        <label className="relative mb-4 block"><Search size={16} className="absolute left-3 top-3 text-slate-500"/><input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Search title, category, or description" className="w-full rounded-xl border border-slate-600 bg-slate-950 py-2.5 pl-9 pr-3 text-sm"/></label>
        {loading ? <p role="status" className="text-sm text-slate-400">Loading courses…</p> : items.length === 0 ? <p className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">No courses found. Create your first course.</p> : <div className="space-y-3">{items.map((item) => <article key={item.id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4 sm:flex-row sm:items-center"><div className="min-w-0"><h2 className="font-semibold">{item.title}</h2><p className="mt-1 text-xs text-slate-400">{item.category || "Uncategorised"} · {item.level} · {item.duration || `${item.durationWeeks || 0} weeks`}</p><p className="mt-1 text-sm text-blue-300">₹{Number(item.fee || 0).toLocaleString("en-IN")} · {item.status}</p></div><div className="flex gap-2"><button onClick={() => edit(item)} className="inline-flex items-center gap-1 rounded-lg border border-slate-600 px-3 py-2 text-xs"><Pencil size={14}/>Edit</button><button onClick={() => remove(item)} className="inline-flex items-center gap-1 rounded-lg border border-rose-700 px-3 py-2 text-xs text-rose-300"><Trash2 size={14}/>Delete</button></div></article>)}</div>}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400"><span>Page {page} of {Math.max(1, Math.ceil(total / pageSize))}</span><div className="flex gap-2"><button disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-slate-600 px-3 py-1.5 disabled:opacity-40">Previous</button><button disabled={page >= Math.ceil(total / pageSize) || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-slate-600 px-3 py-1.5 disabled:opacity-40">Next</button></div></div>
      </Panel>
      <Panel title={editingId ? "Update course" : "Create course"}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Course title" value={form.title} onChange={(title) => setForm({ ...form, title })} required/>
          <Field label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })}/>
          <label className="block text-sm"><span className="mb-1.5 block text-slate-300">Description</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} className="w-full rounded-xl border border-slate-600 bg-slate-950 p-3"/></label>
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm"><span className="mb-1.5 block text-slate-300">Level</span><select value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5">{["Beginner", "Intermediate", "Advanced", "All levels"].map((level) => <option key={level}>{level}</option>)}</select></label><Field label="Duration" value={form.duration} onChange={(duration) => setForm({ ...form, duration })} placeholder="12 weeks"/></div>
          <div className="grid grid-cols-2 gap-3"><Field label="Duration (weeks)" type="number" value={form.durationWeeks} onChange={(durationWeeks) => setForm({ ...form, durationWeeks })}/><Field label="Fee (₹)" type="number" value={form.fee} onChange={(fee) => setForm({ ...form, fee })}/></div>
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm"><span className="mb-1.5 block text-slate-300">Mode</span><select value={form.mode} onChange={(event) => setForm({ ...form, mode: event.target.value })} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5">{["Online", "Offline", "Hybrid"].map((mode) => <option key={mode}>{mode}</option>)}</select></label><label className="block text-sm"><span className="mb-1.5 block text-slate-300">Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5">{["Draft", "Published", "Archived"].map((status) => <option key={status}>{status}</option>)}</select></label></div>
          <div className="flex gap-2"><Button type="submit" disabled={busy}><Plus size={15} className="mr-2 inline"/>{busy ? "Saving…" : editingId ? "Save changes" : "Create course"}</Button>{editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(blank); }}><X size={15} className="mr-1 inline"/>Cancel</Button>}</div>
        </form>
      </Panel>
    </div>
  </TrainingPageShell>;
}
