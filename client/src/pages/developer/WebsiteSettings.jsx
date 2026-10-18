import { useState } from "react";
import DeveloperSidebar from "../../components/developer/DeveloperSidebar";
import DeveloperTopbar from "../../components/developer/DeveloperTopbar";

export default function WebsiteSettings() {
  const [siteName, setSiteName] = useState("JobOrbit");
  const [maintenance, setMaintenance] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(
      "Settings updated in this page only. Connect the backend API to save them permanently."
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <DeveloperSidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <DeveloperTopbar title="Website Settings" />

        <div style={{ padding: "28px", maxWidth: "850px" }}>
          <h2 style={{ color: "#111827" }}>Platform Configuration</h2>
          <p style={{ color: "#6b7280" }}>
            Configure basic website preferences.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              background: "#fff",
              padding: "24px",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              marginTop: "20px",
            }}
          >
            <label style={{ display: "block", fontWeight: 600 }}>
              Website Name
            </label>
            <input
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              required
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                margin: "9px 0 22px",
              }}
            />

            <label style={{ display: "block", fontWeight: 600 }}>
              Announcement
            </label>
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              rows={4}
              placeholder="Enter a platform announcement..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                margin: "9px 0 22px",
                resize: "vertical",
              }}
            />

            <label
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <input
                type="checkbox"
                checked={maintenance}
                onChange={(e) => setMaintenance(e.target.checked)}
              />
              Maintenance mode (local preview only)
            </label>

            <button
              type="submit"
              style={{
                background: "#2563eb",
                color: "#fff",
                border: 0,
                padding: "12px 20px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Save Settings
            </button>

            {message && (
              <p
                role="status"
                style={{
                  marginTop: "18px",
                  color: "#92400e",
                  background: "#fffbeb",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}