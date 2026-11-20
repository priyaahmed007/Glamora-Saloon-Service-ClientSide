import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-semibold text-mulberry-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold">This page could not be found</h1>
      <p className="mt-2 max-w-md text-plum-500">The link may be broken or the page may have moved. Head back home or browse our services.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-primary">Back to home</Link>
        <Link href="/services" className="btn-outline">Browse services</Link>
      </div>
    </div>
  );
}
