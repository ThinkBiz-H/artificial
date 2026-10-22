import { Link } from "react-router-dom";

/** Renders admin-entered links: in-app paths via the router, absolute URLs as normal anchors. */
export function SmartLink({
  to,
  className,
  children,
  onClick,
  "aria-label": ariaLabel,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
}) {
  if (/^https?:\/\//i.test(to)) {
    let sameOrigin = false;
    try {
      sameOrigin = new URL(to).origin === window.location.origin;
    } catch {
      /* not a valid URL — treat as external */
    }
    if (sameOrigin) {
      const url = new URL(to);
      return (
        <Link to={`${url.pathname}${url.search}${url.hash}`} className={className} onClick={onClick} aria-label={ariaLabel}>
          {children}
        </Link>
      );
    }
    return (
      <a href={to} className={className} onClick={onClick} aria-label={ariaLabel} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link to={to.startsWith("/") ? to : `/${to}`} className={className} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
