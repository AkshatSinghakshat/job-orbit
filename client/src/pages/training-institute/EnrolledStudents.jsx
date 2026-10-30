import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import TrainingPageShell, { Notice, Panel } from "./TrainingPageShell";
import { enrollmentService } from "../../services/trainingApi";

export default function EnrolledStudents() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await enrollmentService.list();
      setEnrollments(result.enrollments || result.data || []);
    } catch (err) {
      setError(err.userMessage || "Unable to load enrollments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function update(enrollment, status) {
    setBusyId(enrollment.id);
    setError("");
    setMessage("");
    try {
      const result = await enrollmentService.updateStatus(enrollment.id, status);
      const updated = result.enrollment || result.data;
      setEnrollments((current) => current.map((item) => item.id === enrollment.id ? { ...item, ...updated, status } : item));
      setMessage(`Enrollment ${status}.`);
    } catch (err) {
      setError(err.userMessage || "Unable to update enrollment.");
    } finally {
      setBusyId(null);
    }
  }

  return <TrainingPageShell title="Student Enrollments" description="Review enrollment requests and manage approved students." actions={<button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"><RefreshCw size={15}/>Refresh</button>}>
    {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}
    {message && <div className="mb-4"><Notice kind="success">{message}</Notice></div>}
    <Panel title={`Enrollments (${enrollments.length})`}>
      {loading ? <p role="status" className="text-sm text-slate-400">Loading enrollments…</p> : enrollments.length === 0 ? <p className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">No enrollment requests yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="text-slate-400"><tr><th className="p-3">Student</th><th className="p-3">Course</th><th className="p-3">Batch</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>{enrollments.map((item) => <tr key={item.id} className="border-t border-slate-700"><td className="p-3"><div className="font-medium text-white">{item.Student?.User?.name || "Student"}</div><div className="text-xs text-slate-400">{item.Student?.User?.email || ""}</div></td><td className="p-3">{item.TrainingCourse?.title || "—"}</td><td className="p-3">{item.TrainingBatch?.name || "—"}</td><td className="p-3 capitalize">{item.status}</td><td className="p-3"><div className="flex gap-2">{item.status === "pending" && <><button disabled={busyId === item.id} onClick={() => update(item, "approved")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold disabled:opacity-50"><Check size={14}/>Approve</button><button disabled={busyId === item.id} onClick={() => update(item, "rejected")} className="inline-flex items-center gap-1 rounded-lg bg-rose-800 px-3 py-2 text-xs font-semibold disabled:opacity-50"><X size={14}/>Reject</button></>}{item.status === "approved" && <button disabled={busyId === item.id} onClick={() => update(item, "completed")} className="rounded-lg border border-slate-600 px-3 py-2 text-xs disabled:opacity-50">Mark complete</button>}</div></td></tr>)}</tbody></table></div>}
    </Panel>
  </TrainingPageShell>;
}
