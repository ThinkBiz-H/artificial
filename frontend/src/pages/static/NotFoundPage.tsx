import { Link } from "react-router-dom";
import { buttonClasses } from "@/components/ui/Button";
import { Seo } from "@/components/common/Seo";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-canvas px-4 py-20 text-center">
      <Seo title="Page not found" noindex />
      <p className="font-display text-8xl font-semibold italic leading-none text-accent-soft/40 sm:text-8xl">404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-fg sm:text-5xl">This piece has gone missing</h1>
      <p className="mt-4 max-w-sm text-base text-fg-muted">The page you're looking for doesn't exist or has moved. Let's find you something beautiful instead.</p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link to="/" className={buttonClasses({ size: "lg" })}>
          Back to home
        </Link>
        <Link to="/categories" className={buttonClasses({ variant: "outline", size: "lg" })}>
          Browse collections
        </Link>
      </div>
    </div>
  );
}
