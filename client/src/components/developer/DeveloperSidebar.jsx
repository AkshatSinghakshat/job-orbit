import { NavLink, useNavigate } from "react-router-dom";

const links = [
  { label: "Overview", path: "/developer/dashboard", icon: "▦" },
  { label: "Manage Users", path: "/developer/users", icon: "♙" },
  { label: "Manage Jobs", path: "/developer/jobs", icon: "▤" },
  { label: "CodeArena", path: "/developer/codearena", icon: "⌘" },
  { label: "Website Settings", path: "/developer/settings", icon: "⚙" },
];

export default function DeveloperSidebar() {
  const navigate = useNavigate();

  const sidebarStyle = {
    width: "245px",
    minHeight: "100vh",
    background: "#111827",
    color: "#fff",
    padding: "24px 16px",
    boxSizing: "border-box",
    flexShrink: 0,
  };

  return (
    <aside style={sidebarStyle}>
      <h2 style={{ margin: "0 0 6px", fontSize: "23px" }}>
        JobOrbit
      </h2>
      <p style={{ color: "#9ca3af", marginBottom: "32px" }}>
        Developer Console
      </p>

      <nav style={{ display: "grid", gap: "8px" }}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            style={({ isActive }) => ({
              display: "flex",
              gap: "12px",
              alignItems: "center",
              padding: "13px 14px",
              borderRadius: "9px",
              color: isActive ? "#fff" : "#cbd5e1",
              background: isActive ? "#2563eb" : "transparent",
              textDecoration: "none",
              fontWeight: isActive ? "600" : "400",
            })}
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => navigate("/")}
        style={{
          width: "100%",
          marginTop: "35px",
          padding: "12px",
          background: "#374151",
          color: "#fff",
          border: 0,
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        ← Back to Website
      </button>
    </aside>
  );
}