import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BadgeCheck, Search, ShieldAlert } from "lucide-react";
import TrainingPageShell, { Button, Field, Notice, Panel } from "./TrainingPageShell";
import { certificateService } from "../../services/trainingApi";

export default function CertificateVerification() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function verify(value) {
    const normalized = value.trim();
    if (!normalized) { setError("Enter a certificate code."); return; }
    setLoading(true); setError(""); setCertificate(null);
    try {
      const result = await certificateService.verify(normalized);
      setCertificate(result.data || result);
      setSearchParams({ code: normalized });
    } catch (err) {
      setError(err.userMessage || "Certificate could not be verified.");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    const initialCode = searchParams.get("code");
    if (initialCode) verify(initialCode);
    // Query parameter changes are handled by the form or initial lookup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <TrainingPageShell title="Verify Certificate" description="Check whether a JobOrbit Training Institute certificate is valid.">
    <div className="mx-auto max-w-2xl"><Panel title="Certificate lookup"><form onSubmit={(event) => { event.preventDefault(); verify(code); }} className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="flex-1"><Field label="Certificate code" value={code} onChange={setCode} required placeholder="Paste the certificate code"/></div><Button type="submit" disabled={loading}><Search size={16} className="mr-2 inline"/>{loading ? "Checking…" : "Verify certificate"}</Button></form>
      {error && <div className="mt-4"><Notice kind="error">{error}</Notice></div>}
      {certificate && <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5"><div className="flex items-center gap-3 text-emerald-300"><BadgeCheck size={24}/><h2 className="text-lg font-bold">Certificate valid</h2></div><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-slate-400">Student</dt><dd className="mt-1 font-medium">{certificate.studentName}</dd></div><div><dt className="text-slate-400">Course</dt><dd className="mt-1 font-medium">{certificate.courseName}</dd></div><div><dt className="text-slate-400">Institute</dt><dd className="mt-1 font-medium">{certificate.instituteName}</dd></div><div><dt className="text-slate-400">Issue date</dt><dd className="mt-1 font-medium">{certificate.issueDate}</dd></div><div className="sm:col-span-2"><dt className="text-slate-400">Code</dt><dd className="mt-1 break-all font-mono">{certificate.certificateCode}</dd></div></dl></div>}
      {!certificate && !error && !loading && <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-700 p-4 text-sm text-slate-400"><ShieldAlert size={19}/>Verification is public and does not require signing in.</div>}
    </Panel></div>
  </TrainingPageShell>;
}
