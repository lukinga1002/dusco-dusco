import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-5xl font-semibold text-dusco-ink">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold text-dusco-ink">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The page you were looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-xl bg-dusco-red px-5 text-sm font-medium text-white"
        >
          Back to home
        </Link>
        <Link
          to="/app"
          className="inline-flex min-h-11 items-center rounded-xl border border-dusco-line px-5 text-sm font-medium text-dusco-ink"
        >
          Go to my savings
        </Link>
      </div>
    </div>
  );
}
