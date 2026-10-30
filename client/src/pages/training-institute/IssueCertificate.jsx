import { useCallback, useEffect, useState } from "react";
import { Award, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import TrainingPageShell, { Button, Notice, Panel } from "./TrainingPageShell";
import { certificateService, enrollmentService } from "../../services/trainingApi";

export default function IssueCertificate() {
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [enrollmentId, setEnrollmentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [enrollmentResult, certificateResult] = await Promise.all([enrollmentService.list({ status: "completed" }), certificateService.list()]);
      setEnrollments((enrollmentResult.enrollments || enrollmentResult.data || []).filter((item) => item.status === "completed"));
      setCertificates(certificateResult.certificates || certificateResult.data || []);
    } catch (err) { setError(err.userMessage || "Unable to load certificate records."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function issue(event) {
    event.preventDefault(); if (!enrollmentId) return;
    setSaving(true); setError(""); setMessage("");
    try { const result = await certificateService.issue({ enrollmentId: Number(enrollmentId) }); const certificate = result.certificate || result.data; setMessage(`Certificate issued: ${certificate.certificateCode}`); setEnrollmentId(""); await load(); }
    catch (err) { setError(err.userMessage || "Unable to issue certificate."); }
    finally { setSaving(false); }
  }

  return <TrainingPageShell title="Certificates" description="Issue a verifiable certificate for a completed enrollment." actions={<Link to="/training-institute/certificates/verify" className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800">Verify certificate <ExternalLink size={15}/></Link>}>
    {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}{message && <div className="mb-4"><Notice kind="success">{message}</Notice></div>}
    <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <Panel title="Issue certificate"><form onSubmit={issue} className="space-y-4"><label className="block text-sm"><span className="mb-1.5 block text-slate-300">Completed enrollment</span><select required value={enrollmentId} onChange={(event) => setEnrollmentId(event.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5"><option value="">Choose student and course</option>{enrollments.map((item) => <option key={item.id} value={item.id}>{item.Student?.User?.name || "Student"} · {item.TrainingCourse?.title || "Course"}</option>)}</select></label><Button type="submit" disabled={saving || !enrollmentId}><Award size={16} className="mr-2 inline"/>{saving ? "Issuing…" : "Issue certificate"}</Button>{!loading && enrollments.length === 0 && <p className="text-xs text-slate-400">Certificates can be issued after an enrollment is marked complete.</p>}</form></Panel>
      <Panel title={`Issued certificates (${certificates.length})`}>{loading ? <p role="status" className="text-sm text-slate-400">Loading certificates…</p> : certificates.length === 0 ? <p className="text-sm text-slate-400">No certificates issued yet.</p> : <div className="space-y-3">{certificates.map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4"><div><p className="font-semibold">{item.Student?.User?.name || "Student"} · {item.TrainingCourse?.title || "Course"}</p><p className="mt-1 break-all font-mono text-xs text-slate-400">{item.certificateCode}</p></div><time className="text-xs text-slate-400">{item.issueDate}</time></article>)}</div>}</Panel>
    </div>
  </TrainingPageShell>;
}
