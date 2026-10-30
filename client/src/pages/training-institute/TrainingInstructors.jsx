import { useCallback, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import TrainingPageShell, { Button, Field, Notice, Panel } from "./TrainingPageShell";
import { instructorService } from "../../services/trainingApi";

const blank = { name: "", email: "", specialization: "", bio: "" };

export default function TrainingInstructors() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const result = await instructorService.list(); setItems(result.instructors || result.data || []); }
    catch (err) { setError(err.userMessage || "Unable to load instructors."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function submit(event) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try { await instructorService.create(form); setForm(blank); setMessage("Instructor added."); await load(); }
    catch (err) { setError(err.userMessage || "Unable to add instructor."); }
    finally { setSaving(false); }
  }

  async function toggle(item) {
    const status = item.status === "active" ? "inactive" : "active";
    try { await instructorService.update(item.id, { status }); setItems((current) => current.map((row) => row.id === item.id ? { ...row, status } : row)); }
    catch (err) { setError(err.userMessage || "Unable to update instructor."); }
  }

  return <TrainingPageShell title="Training Instructors" description="Maintain your instructor roster and availability." actions={<button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800">Refresh</button>}>
    {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}{message && <div className="mb-4"><Notice kind="success">{message}</Notice></div>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Panel title={`Instructor roster (${items.length})`}>
        {loading ? <p role="status" className="text-sm text-slate-400">Loading instructors…</p> : items.length === 0 ? <p className="text-sm text-slate-400">No instructors added yet.</p> : <div className="space-y-3">{items.map((item) => <article key={item.id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4 sm:flex-row sm:items-center"><div><h2 className="font-semibold">{item.name}</h2><p className="text-sm text-slate-400">{item.email}</p><p className="mt-1 text-xs text-slate-500">{item.specialization || "Specialization not set"}</p></div><button onClick={() => toggle(item)} className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${item.status === "active" ? "bg-emerald-900/70 text-emerald-200" : "bg-slate-700 text-slate-300"}`}>{item.status} · change</button></article>)}</div>}
      </Panel>
      <Panel title="Add instructor">
        <form onSubmit={submit} className="space-y-4"><Field label="Full name" value={form.name} onChange={(name) => setForm({ ...form, name })} required/><Field label="Email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} required/><Field label="Specialization" value={form.specialization} onChange={(specialization) => setForm({ ...form, specialization })}/><label className="block text-sm"><span className="mb-1.5 block text-slate-300">Bio</span><textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} rows={4} className="w-full rounded-xl border border-slate-600 bg-slate-950 p-3"/></label><Button type="submit" disabled={saving}><UserPlus size={16} className="mr-2 inline"/>{saving ? "Saving…" : "Add instructor"}</Button></form>
      </Panel>
    </div>
  </TrainingPageShell>;
}
