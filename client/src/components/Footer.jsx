
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Link to="/" className="text-xl font-extrabold text-blue-700">
            Job<span className="text-gray-900">Orbit</span>
          </Link>
          <p className="mt-1 text-sm text-gray-600">
            Connecting students, talent and opportunities.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-700">Home</Link>
          <Link to="/feed" className="hover:text-blue-700">Feed</Link>
          <Link to="/login" className="hover:text-blue-700">Login</Link>
          <Link to="/register" className="hover:text-blue-700">Register</Link>
        </nav>

        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} JobOrbit
        </p>
      </div>
    </footer>
  );
}
