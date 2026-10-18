import { useState } from "react";
import DeveloperSidebar from "../../components/developer/DeveloperSidebar";
import DeveloperTopbar from "../../components/developer/DeveloperTopbar";

export default function ManageCodeArena() {
  const [search, setSearch] = useState("");
  const [questions] = useState([]);

  const filteredQuestions = questions.filter((question) =>
    `${question.title} ${question.difficulty}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <DeveloperSidebar />

      <main style={{ flex: 1, minWidth: 0 }}>
        <DeveloperTopbar title="Manage CodeArena" />

        <div style={{ padding: "28px" }}>
          <h2 style={{ color: "#111827" }}>Coding Challenges</h2>
          <p style={{ color: "#6b7280" }}>
            Review and manage CodeArena questions.
          </p>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or difficulty..."
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

          <section
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "22px",
            }}
          >
            {filteredQuestions.length === 0 ? (
              <p style={{ color: "#6b7280" }}>
                No questions loaded. Connect the CodeArena questions API to
                create, edit, publish or unpublish actual challenges.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left" }}>
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Difficulty</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((question) => (
                      <tr key={question.id}>
                        <td>{question.title}</td>
                        <td>{question.difficulty}</td>
                        <td>{question.isPublished ? "Published" : "Draft"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}