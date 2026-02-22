import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-5xl font-extrabold text-slate-900">404</h1>
      <p className="mt-4 text-lg text-slate-600">
        Sorry, the page you are looking for does not exist.
      </p>

      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-emerald-600 text-white px-6 py-3 font-semibold hover:bg-emerald-700 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}