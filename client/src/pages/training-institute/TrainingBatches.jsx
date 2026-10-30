import { useCallback, useEffect, useState } from "react";
import TrainingPageShell, { Button, Field, Notice, Panel } from "./TrainingPageShell";
import { batchService, courseService, instructorService } from "../../services/trainingApi";

const empty = { courseId: "", instructorId: "", name: "", startDate: "", endDate: "", capacity: "30" };

export default function TrainingBatches() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [batchResult, courseResult, instructorResult] = await Promise.all([batchService.list(), courseService.list({ pageSize: 100 }), instructorService.list()]);
      setBatches(batchResult.batches || batchResult.data || []);
      setCourses(courseResult.courses || courseResult.data?.courses || []);
      setInstructors(instructorResult.instructors || instructorResult.data || []);
    } catch (err) {
      setError(err.userMessage || "Unable to load batch data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function submit(event) {
    event.preventDefault();
    setSaving(true); setError(""); setMessage("");
    try {
      await batchService.create({ ...form, courseId: Number(form.courseId), instructorId: form.instructorId ? Number(form.instructorId) : null, capacity: Number(form.capacity) });
      setForm(empty); setMessage("Batch created."); await load();
    } catch (err) {
      setError(err.userMessage || "Unable to create batch.");
    } finally { setSaving(false); }
  }

  return <TrainingPageShell title="Training Batches" description="Schedule a course batch and keep its seat capacity up to date.">
    {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}
    {message && <div className="mb-4"><Notice kind="success">{message}</Notice></div>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Panel title="Scheduled batches">
        {loading ? <p role="status" className="text-sm text-slate-400">Loading batches…</p> : batches.length === 0 ? <p className="text-sm text-slate-400">No batches have been scheduled.</p> : <div className="space-y-3">{batches.map((batch) => <article key={batch.id} className="rounded-xl border border-slate-700 bg-slate-900 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-semibold">{batch.name}</h2><p className="mt-1 text-sm text-slate-400">{batch.TrainingCourse?.title || "Course"} · {batch.TrainingInstructor?.name || "Instructor not assigned"}</p></div><span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs capitalize text-blue-300">{batch.status}</span></div><div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400"><span>{batch.startDate} to {batch.endDate}</span><span>{batch.enrolledCount}/{batch.capacity} seats</span></div></article>)}</div>}
      </Panel>
      <Panel title="Create batch">
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm"><span className="mb-1.5 block text-slate-300">Course</span><select required value={form.courseId} onChange={(event) => setForm({ ...form, courseId: event.target.value })} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5"><option value="">Choose a course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
          <Field label="Batch name" value={form.name} onChange={(name) => setForm({ ...form, name })} required placeholder="Weekend Cohort" />
          <label className="block text-sm"><span className="mb-1.5 block text-slate-300">Instructor (optional)</span><select value={form.instructorId} onChange={(event) => setForm({ ...form, instructorId: event.target.value })} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5"><option value="">Unassigned</option>{instructors.map((instructor) => <option key={instructor.id} value={instructor.id}>{instructor.name}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3"><Field label="Start date" type="date" value={form.startDate} onChange={(startDate) => setForm({ ...form, startDate })} required/><Field label="End date" type="date" value={form.endDate} onChange={(endDate) => setForm({ ...form, endDate })} required/></div>
          <Field label="Capacity" type="number" value={form.capacity} onChange={(capacity) => setForm({ ...form, capacity })} required />
          <Button type="submit" disabled={saving || courses.length === 0}>{saving ? "Saving…" : "Create batch"}</Button>
          {courses.length === 0 && !loading && <p className="text-xs text-amber-300">Create a course before scheduling a batch.</p>}
        </form>
      </Panel>
    </div>
  </TrainingPageShell>;
}
