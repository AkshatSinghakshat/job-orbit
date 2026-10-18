import { useState } from "react";
import DeveloperSidebar from "../../components/developer/DeveloperSidebar";
import DeveloperTopbar from "../../components/developer/DeveloperTopbar";

export default function ManageJobs() {
  const [search, setSearch] = useState("");
  const [jobs] = useState([]);

  const filteredJobs = jobs.filter((job) =>
    `${job.title} ${job.company}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <DeveloperSidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <DeveloperTopbar title="Manage Jobs" />

        <div style={{ padding: "28px" }}>
          <h2 style={{ color: "#111827" }}>Job Listings</h2>
          <p style={{ color: "#6b7280" }}>
            Review job posts published by companies.
          </p>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs or companies..."
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
              background: "#fff",
              padding: "22px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}
          >
            {filteredJobs.length === 0 ? (
              <p style={{ color: "#6b7280" }}>
                No jobs loaded yet. Connect a protected jobs API to review,
                approve or remove actual job listings.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left" }}>
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Company</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => (
                      <tr key={job.id}>
                        <td>{job.title}</td>
                        <td>{job.company}</td>
                        <td>{job.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}