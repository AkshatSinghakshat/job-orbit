
import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <SearchX size={64} className="mx-auto text-blue-600" />

        <h1 className="mt-5 text-6xl font-bold text-slate-900">
          404
        </h1>

        <h2 className="mt-3 text-2xl font-semibold">
          Page Not Found
        </h2>

        <p className="mt-3 text-slate-500">
          Sorry, the page you are looking for does not exist.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
