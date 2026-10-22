import { Breadcrumbs } from "./Breadcrumbs";

/** Standard editorial page header for content pages. */
export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: { name: string; path?: string }[];
}) {
  return (
    <div className="border-b border-border bg-surface-muted/50">
      <div className="container-x py-10 sm:py-14">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div className="mt-5 max-w-3xl">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-2 font-display text-5xl font-semibold leading-display text-fg sm:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-fg-muted">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
