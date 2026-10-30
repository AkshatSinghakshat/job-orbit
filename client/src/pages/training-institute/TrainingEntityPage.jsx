import { useEffect, useState } from "react";
import TrainingPageShell, { Notice, Panel } from "./TrainingPageShell";
import { trainingRequest } from "../../services/trainingApi";

function endpointPath(endpoint) {
  const path = String(endpoint || "").replace(/^\/+/, "");
  return `/${path.startsWith("training/") ? path : `training/${path}`}`;
}

const implementedReadEndpoints = new Set([
  "/training/dashboard",
  "/training/institute/profile",
  "/training/profile",
  "/training/courses",
  "/training/batches",
  "/training/instructors",
  "/training/enrollments",
  "/training/applications",
  "/training/students",
  "/training/invoices",
  "/training/payments",
  "/training/fees",
  "/training/certificates",
  "/training/reviews",
  "/training/career-support",
]);

function rowsFrom(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  const array = Object.values(payload?.data || payload || {}).find(Array.isArray);
  return array || [];
}

export default function TrainingEntityPage({ title, endpoint, description }) {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const path = endpointPath(endpoint);
    if (!implementedReadEndpoints.has(path)) {
      setError("This Training Institute feature does not have a backend endpoint yet.");
      setLoading(false);
      return () => { active = false; };
    }
    setError("");
    trainingRequest(path)
      .then((result) => { if (active) setData(rowsFrom(result)); })
      .catch((err) => { if (active) setError(err.userMessage || "Unable to load records."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [endpoint]);

  const columns = data.length ? Object.keys(data[0]).filter((key) => !["createdAt", "updatedAt"].includes(key)).slice(0, 6) : [];
  return <TrainingPageShell title={title} description={description}>
    {error && <div className="mb-4"><Notice kind="error">{error}</Notice></div>}
    <Panel title="Records">
      {loading ? <p role="status" className="text-sm text-slate-400">Loading records…</p> : data.length === 0 ? <p className="text-sm text-slate-400">No records found.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-slate-400"><tr>{columns.map((key) => <th key={key} className="border-b border-slate-700 p-3">{key}</th>)}</tr></thead><tbody>{data.map((row, index) => <tr key={row.id || index}>{columns.map((key) => <td key={key} className="max-w-xs border-b border-slate-800 p-3">{typeof row[key] === "object" && row[key] !== null ? JSON.stringify(row[key]) : String(row[key] ?? "—")}</td>)}</tr>)}</tbody></table></div>}
    </Panel>
  </TrainingPageShell>;
}
