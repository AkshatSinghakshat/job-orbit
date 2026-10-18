import { useNavigate } from "react-router-dom";

export default function DeveloperTopbar({ title = "Developer Dashboard" }) {
  const navigate = useNavigate();

  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "18px 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: "22px", color: "#111827" }}>
          {title}
        </h2>
        <p style={{ margin: "5px 0 0", color: "#6b7280", fontSize: "13px" }}>
          Manage your JobOrbit platform
        </p>
      </div>

      <button
        onClick={() => navigate("/")}
        style={{
          padding: "10px 15px",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        View Website ↗
      </button>
    </header>
  );
}