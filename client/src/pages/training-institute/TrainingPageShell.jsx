import React from "react";

export default function TrainingPageShell({ title, description, children, actions }) {
  return (
    <main className="min-h-screen bg-[#080d20] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[.22em] text-blue-400">JobOrbit · Training Institute</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            {description && <p className="mt-2 max-w-3xl text-sm text-slate-400">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </main>
  );
}

export function Panel({ title, children, className = "" }) {
  return <section className={`rounded-2xl border border-[#243047] bg-[#10182e] p-5 shadow-lg shadow-black/10 ${className}`}>
    {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}{children}
  </section>;
}

export function Button({ children, onClick, type = "button", variant = "primary", disabled = false }) {
  const styles = variant === "secondary"
    ? "border border-[#334155] bg-[#0b1224] text-slate-200 hover:bg-[#17213a]"
    : variant === "danger"
    ? "bg-rose-600 text-white hover:bg-rose-500"
    : "bg-blue-600 text-white hover:bg-blue-500";
  return <button type={type} onClick={onClick} disabled={disabled}
    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles}`}>{children}</button>;
}

export function Field({ label, value, onChange, type = "text", placeholder = "", required = false }) {
  return <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}{required ? " *" : ""}</span>
    <input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
      className="w-full rounded-xl border border-[#334155] bg-[#0b1224] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
  </label>;
}

export function Notice({ kind = "info", children }) {
  const cls = kind === "error" ? "border-rose-500/30 bg-rose-500/10 text-rose-200" :
    kind === "success" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" :
    "border-blue-500/30 bg-blue-500/10 text-blue-200";
  return <div className={`rounded-xl border p-3 text-sm ${cls}`}>{children}</div>;
}
