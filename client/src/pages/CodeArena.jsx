
import { useEffect, useState } from "react";
import axios from "axios";
import ProtectedCodeEditor from "./ProtectedCodeEditor";

export default function CodeArena() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/codearena/posts`
        );
        setPosts(response.data.posts || []);
      } catch (err) {
        setError("Coding posts load nahi ho paye. Backend check karo.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-8 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-900/50 to-indigo-900/40 p-6">
          <p className="mb-2 text-sm font-semibold text-violet-300">
            JOBORBIT DEVELOPER COMMUNITY
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            💻 CodeArena
          </h1>
          <p className="mt-3 text-slate-300">
            Solve coding problems, write code and learn together.
          </p>
        </div>

        {/* FEATURE CARDS */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            ["🧩", "Coding Problems"],
            ["🚀", "Code Submissions"],
            ["🏆", "Leaderboard"],
          ].map(([icon, title]) => (
            <div
              key={title}
              className="rounded-xl border border-slate-700 bg-slate-900 p-5"
            >
              <div className="text-2xl">{icon}</div>
              <h2 className="mt-2 font-semibold">{title}</h2>
            </div>
          ))}
        </div>

        {/* PROTECTED CODE EDITOR */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold">
            🛡️ Practice Coding
          </h2>
          <p className="mb-4 text-sm text-slate-400">
            Code khud type karo. Editor mein copy-paste restrictions enabled hain.
          </p>
          <ProtectedCodeEditor />
        </section>

        {/* COMMUNITY FEED */}
        <section>
          <h2 className="mb-4 text-xl font-bold">
            Community Coding Feed
          </h2>

          {loading && (
            <p className="text-slate-400">Loading posts...</p>
          )}

          {error && (
            <p className="rounded-lg bg-red-900/30 p-4 text-red-300">
              {error}
            </p>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-8 text-center">
              <div className="text-4xl">👨‍💻</div>
              <h3 className="mt-3 text-lg font-semibold">
                No coding posts yet
              </h3>
              <p className="mt-2 text-slate-400">
                Be the first to share a coding solution!
              </p>
            </div>
          )}

          <div className="space-y-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-xl border border-slate-700 bg-slate-900 p-5"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold">{post.title}</h3>
                  <span className="rounded-full bg-violet-500/20 px-3 py-1 text-sm text-violet-300">
                    {post.language}
                  </span>
                </div>

                {post.User && (
                  <p className="mb-3 text-sm text-slate-400">
                    By {post.User.name}
                  </p>
                )}

                {post.problemTitle && (
                  <p className="mb-2 text-sm text-slate-300">
                    Problem: {post.problemTitle}
                  </p>
                )}

                {post.explanation && (
                  <p className="mb-4 text-slate-300">
                    {post.explanation}
                  </p>
                )}

                <pre className="overflow-x-auto rounded-lg bg-black/50 p-4 text-sm text-green-300">
                  <code>{post.code}</code>
                </pre>

                {post.difficulty && (
                  <p className="mt-3 text-sm text-slate-400">
                    Difficulty: {post.difficulty}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
