import { useState } from "react";
import DeveloperSidebar from "../../components/developer/DeveloperSidebar";
import DeveloperTopbar from "../../components/developer/DeveloperTopbar";

export default function ManageUsers() {
  const [search, setSearch] = useState("");

  // Demo data only. Replace with protected backend API data.
  const [users, setUsers] = useState([]);

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function toggleStatus(id) {
    setUsers((current) =>
      current.map((user) =>
        user.id === id ? { ...user, isActive: !user.isActive } : user
      )
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <DeveloperSidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <DeveloperTopbar title="Manage Users" />

        <div style={{ padding: "28px" }}>
          <h2 style={{ color: "#111827" }}>User Management</h2>
          <p style={{ color: "#6b7280" }}>
            Search and review platform accounts.
          </p>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or role..."
            style={{
              width: "100%",
              maxWidth: "450px",
              boxSizing: "border-box",
              padding: "13px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              margin: "12px 0 20px",
            }}
          />

          <div
            style={{
              overflowX: "auto",
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f9fafb" }}>
                <tr>
                  {["Name", "Email", "Role", "Status", "Action"].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "15px",
                        textAlign: "left",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td style={{ padding: "15px" }}>{user.name}</td>
                    <td style={{ padding: "15px" }}>{user.email}</td>
                    <td style={{ padding: "15px" }}>{user.role}</td>
                    <td style={{ padding: "15px" }}>
                      {user.isActive ? "Active" : "Inactive"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      <button onClick={() => toggleStatus(user.id)}>
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: "25px", color: "#6b7280" }}>
                      No users loaded. Connect the users API to display real
                      accounts.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}