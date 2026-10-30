import { useCallback, useEffect, useState } from "react";
import { FileText } from "lucide-react";
import TrainingPageShell, { Button, Field, Notice, Panel } from "./TrainingPageShell";
import { enrollmentService, invoiceService } from "../../services/trainingApi";

const currency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(amount) || 0);

export default function TrainingInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentId, setEnrollmentId] = useState("");
  const [tax, setTax] = useState("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [invoiceResult, enrollmentResult] = await Promise.all([invoiceService.list(), enrollmentService.list()]);
      setInvoices(invoiceResult.invoices || invoiceResult.data || []);
      setEnrollments((enrollmentResult.enrollments || enrollmentResult.data || []).filter((item) => ["approved", "completed"].includes(item.status)));
    } catch (err) { setError(err.userMessage || "Unable to load invoices."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create(event) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try { const result = await invoiceService.create({ enrollmentId: Number(enrollmentId), tax: Number(tax) }); const invoice = result.invoice || result.data; setMessage(`Invoice ${invoice.invoiceNumber} created.`); setEnrollmentId(""); await load(); }
    catch (err) { setError(err.userMessage || "Unable to create invoice."); }
    finally { setSaving(false); }
  }

  return <TrainingPageShell title="Invoices" description="Create and review invoices for approved student enrollments.">
    {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}{message && <div className="mb-4"><Notice kind="success">{message}</Notice></div>}
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Panel title={`Invoices (${invoices.length})`}>
        {loading ? <p role="status" className="text-sm text-slate-400">Loading invoices…</p> : invoices.length === 0 ? <p className="text-sm text-slate-400">No invoices have been created.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-slate-400"><tr><th className="p-3">Invoice</th><th className="p-3">Student</th><th className="p-3">Course</th><th className="p-3">Total</th><th className="p-3">Status</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id} className="border-t border-slate-700"><td className="p-3 font-mono text-xs">{invoice.invoiceNumber}</td><td className="p-3">{invoice.Student?.User?.name || "Student"}</td><td className="p-3">{invoice.TrainingEnrollment?.TrainingCourse?.title || "Course"}</td><td className="p-3">{currency(invoice.total)}</td><td className="p-3 capitalize">{invoice.status}</td></tr>)}</tbody></table></div>}
      </Panel>
      <Panel title="Create invoice"><form onSubmit={create} className="space-y-4"><label className="block text-sm"><span className="mb-1.5 block text-slate-300">Approved enrollment</span><select required value={enrollmentId} onChange={(event) => setEnrollmentId(event.target.value)} className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5"><option value="">Choose student and course</option>{enrollments.map((item) => <option key={item.id} value={item.id}>{item.Student?.User?.name || "Student"} · {item.TrainingCourse?.title || "Course"}</option>)}</select></label><Field label="Tax amount (₹)" type="number" value={tax} onChange={setTax}/><Button type="submit" disabled={saving || !enrollmentId}><FileText size={15} className="mr-2 inline"/>{saving ? "Creating…" : "Create invoice"}</Button></form></Panel>
    </div>
  </TrainingPageShell>;
}
