import { useCallback, useEffect, useState } from "react";
import TrainingPageShell, { Button, Field, Notice, Panel } from "./TrainingPageShell";
import { courseService, curriculumService } from "../../services/trainingApi";

const blank = { title: "", duration: "", lessons: "" };

export default function CourseCurriculum() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [modules, setModules] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCourses = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const result = await courseService.list({ pageSize: 100 });
      const rows = result.courses || result.data?.courses || [];
      setCourses(rows);
      if (!courseId && rows.length) setCourseId(String(rows[0].id));
    } catch (err) { setError(err.userMessage || "Unable to load courses."); }
    finally { setLoading(false); }
  }, [courseId]);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const loadModules = useCallback(async () => {
    if (!courseId) { setModules([]); return; }
    try {
      const result = await curriculumService.list(courseId);
      setModules(result.items || result.data || []);
    } catch (err) { setError(err.userMessage || "Unable to load course curriculum."); }
  }, [courseId]);

  useEffect(() => { loadModules(); }, [loadModules]);

  function edit(item) {
    setEditing(item.id);
    setForm({ title: item.title, duration: item.duration || "", lessons: (item.lessons || []).map((lesson) => typeof lesson === "string" ? lesson : lesson.title || "").join("\n") });
  }

  async function submit(event) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    const payload = { title: form.title.trim(), duration: form.duration.trim() || null, lessons: form.lessons.split("\n").map((line) => line.trim()).filter(Boolean) };
    try {
      if (editing) await curriculumService.update(courseId, editing, payload);
      else await curriculumService.create(courseId, { ...payload, orderIndex: modules.length });
      setForm(blank); setEditing(null); setMessage(editing ? "Module updated." : "Module added."); await loadModules();
    } catch (err) { setError(err.userMessage || "Unable to save module."); }
    finally { setSaving(false); }
  }

  return <TrainingPageShell title="Course Curriculum" description="Organize a course into ordered modules and lessons.">
    {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}{message && <div className="mb-4"><Notice kind="success">{message}</Notice></div>}
    <div className="mb-5 max-w-xl"><label className="block text-sm"><span className="mb-1.5 block text-slate-300">Course</span><select value={courseId} onChange={(event) => { setCourseId(event.target.value); setModules([]); setEditing(null); setForm(blank); }} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5"><option value="">Choose a course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label></div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Panel title="Modules">
        {loading ? <p role="status" className="text-sm text-slate-400">Loading courses…</p> : !courseId ? <p className="text-sm text-slate-400">Create a course before adding curriculum.</p> : modules.length === 0 ? <p className="text-sm text-slate-400">No modules added for this course yet.</p> : <div className="space-y-3">{modules.map((item, index) => <article key={item.id} className="rounded-xl border border-slate-700 bg-slate-900 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-blue-300">Module {index + 1}{item.duration ? ` · ${item.duration}` : ""}</p><h2 className="mt-1 font-semibold">{item.title}</h2><ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-slate-400">{(item.lessons || []).map((lesson, lessonIndex) => <li key={`${item.id}-${lessonIndex}`}>{typeof lesson === "string" ? lesson : lesson.title}</li>)}</ol></div><button onClick={() => edit(item)} className="rounded-lg border border-slate-600 px-3 py-2 text-xs">Edit</button></div></article>)}</div>}
      </Panel>
      <Panel title={editing ? "Edit module" : "Add module"}>
        <form onSubmit={submit} className="space-y-4"><Field label="Module title" value={form.title} onChange={(title) => setForm({ ...form, title })} required/><Field label="Duration" value={form.duration} onChange={(duration) => setForm({ ...form, duration })} placeholder="e.g. 2 weeks"/><label className="block text-sm"><span className="mb-1.5 block text-slate-300">Lessons (one per line)</span><textarea value={form.lessons} onChange={(event) => setForm({ ...form, lessons: event.target.value })} rows={7} className="w-full rounded-xl border border-slate-600 bg-slate-950 p-3"/></label><div className="flex gap-2"><Button type="submit" disabled={saving || !courseId}>{saving ? "Saving…" : editing ? "Save changes" : "Add module"}</Button>{editing && <Button type="button" variant="secondary" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</Button>}</div></form>
      </Panel>
    </div>
  </TrainingPageShell>;
}
