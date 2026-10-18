import DeveloperSidebar from "../../components/developer/DeveloperSidebar";
import DeveloperTopbar from "../../components/developer/DeveloperTopbar";

const stats = [
  { label: "Total Users", value: "—", color: "#2563eb", icon: "♙" },
  { label: "Active Jobs", value: "—", color: "#059669", icon: "▤" },
  { label: "CodeArena Questions", value: "—", color: "#7c3aed", icon: "⌘" },
  { label: "Platform Status", value: "Review", color: "#d97706", icon: "●" },
];

const shortcuts = [
  {
    title: "Manage Users",
    description: "Review user accounts and account status.",
    path: "/developer/users",
  },
  {
    title: "Manage Jobs",
    description: "Review job listings on the platform.",
    path: "/developer/jobs",
  },
  {
    title: "Manage CodeArena",
    description: "Manage coding challenge content.",
    path: "/developer/codearena",
  },
  {
    title: "Website Settings",
    description: "Configure supported platform settings.",
    path: "/developer/settings",
  },
];

export default function DeveloperDashboard() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <DeveloperSidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <DeveloperTopbar />

        <div style={{ padding: "28px" }}>
          <div style={{ marginBottom: "25px" }}>
            <h2 style={{ margin: "0 0 8px", color: "#111827" }}>
              Platform Overview
            </h2>
            <p style={{ margin: 0, color: "#6b7280" }}>
              Welcome to the JobOrbit developer console.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "18px",
            }}
          >
            {stats.map((stat) => (
              <section
                key={stat.label}
                style={{
                  background: "#fff",
                  borderRadius: "13px",
                  padding: "22px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ color: stat.color, fontSize: "25px" }}>
                  {stat.icon}
                </div>
                <p style={{ color: "#6b7280", marginBottom: "8px" }}>
                  {stat.label}
                </p>
                <h2 style={{ margin: 0, color: "#111827" }}>{stat.value}</h2>
              </section>
            ))}
          </div>

          <h3 style={{ margin: "30px 0 16px", color: "#111827" }}>
            Management Tools
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
            }}
          >
            {shortcuts.map((item) => (
              <a
                key={item.path}
                href={item.path}
                style={{
                  background: "#fff",
                  padding: "22px",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  textDecoration: "none",
                  color: "#111827",
                }}
              >
                <h3 style={{ marginTop: 0 }}>{item.title}</h3>
                <p style={{ color: "#6b7280", lineHeight: 1.6 }}>
                  {item.description}
                </p>
                <span style={{ color: "#2563eb", fontWeight: 600 }}>
                  Open section →
                </span>
              </a>
            ))}
          </div>

          <p
            style={{
              marginTop: "25px",
              padding: "14px",
              background: "#fffbeb",
              color: "#92400e",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            Live statistics are not connected yet. Connect protected backend
            APIs before using this dashboard for real management.
          </p>
        </div>
      </main>
    </div>
  );
}