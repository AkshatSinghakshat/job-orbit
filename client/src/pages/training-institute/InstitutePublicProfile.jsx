import { useEffect, useState } from "react";
import TrainingPageShell, { Button, Field, Notice, Panel } from "./TrainingPageShell";
import { instituteService } from "../../services/trainingApi";

const blank = { name: "", contactEmail: "", contactPhone: "", website: "", address: "", categories: "", logo: "" };

export default function InstitutePublicProfile() {
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    instituteService.getProfile().then((result) => {
      const profile = result.data || result;
      if (active) setForm({ ...blank, ...profile, categories: profile.categories || "" });
    }).catch((err) => { if (active) setError(err.userMessage || "Unable to load institute profile."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function submit(event) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      const result = await instituteService.updateProfile(form);
      setForm({ ...blank, ...(result.data || result) }); setMessage("Institute profile saved.");
    } catch (err) { setError(err.userMessage || "Unable to save institute profile."); }
    finally { setSaving(false); }
  }

  return <TrainingPageShell title="Institute Profile" description="Keep your institute contact and public profile information current.">
    {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}{message && <div className="mb-4"><Notice kind="success">{message}</Notice></div>}
    <div className="max-w-3xl"><Panel title="Profile details">{loading ? <p role="status" className="text-sm text-slate-400">Loading profile…</p> : <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Institute name" value={form.name} onChange={(name) => setForm({ ...form, name })} required/><Field label="Contact email" type="email" value={form.contactEmail} onChange={(contactEmail) => setForm({ ...form, contactEmail })}/><Field label="Contact phone" type="tel" value={form.contactPhone} onChange={(contactPhone) => setForm({ ...form, contactPhone })}/><Field label="Website" type="url" value={form.website} onChange={(website) => setForm({ ...form, website })}/><Field label="Logo URL" type="url" value={form.logo} onChange={(logo) => setForm({ ...form, logo })}/><Field label="Categories" value={form.categories} onChange={(categories) => setForm({ ...form, categories })} placeholder="Web development, data science"/><label className="block text-sm sm:col-span-2"><span className="mb-1.5 block text-slate-300">Address</span><textarea value={form.address || ""} onChange={(event) => setForm({ ...form, address: event.target.value })} rows={4} className="w-full rounded-xl border border-slate-600 bg-slate-950 p-3"/></label><div className="sm:col-span-2"><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button></div>
    </form>}</Panel></div>
  </TrainingPageShell>;
}
