import { Link } from "react-router-dom";
import { Gem, RotateCcw, ShieldCheck } from "lucide-react";
import { useStoreInfo } from "@/hooks/useStoreInfo";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { siteName } = useStoreInfo();

  const image = "/image/editorial.jpg";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Editorial Panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={image}
          alt="Luxury Jewellery"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />

        <div className="absolute bottom-16 left-14 right-14 z-10 text-white">
          <p className="text-xs uppercase tracking-[0.45em] text-white/80">
            {siteName}
          </p>

          <h2 className="mt-5 font-display text-6xl font-light leading-tight">
            Jewellery for
            <br />
            every moment
            <br />
            worth celebrating.
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-white/80">
            Discover timeless artificial jewellery inspired by elegance,
            craftsmanship and modern luxury. Designed to make every celebration
            unforgettable.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md">
              <Gem size={18} />
              <span className="text-sm font-medium">Premium Quality</span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md">
              <ShieldCheck size={18} />
              <span className="text-sm font-medium">Secure Payments</span>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md">
              <RotateCcw size={18} />
              <span className="text-sm font-medium">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex items-center justify-center bg-[#FAF7F2] px-6 py-12 sm:px-10">
        <div className="w-full max-w-[430px] rounded-3xl bg-white p-10 shadow-xl">
          <p className="eyebrow">{eyebrow}</p>

          <h1 className="mt-3 font-display text-5xl font-light leading-tight text-fg">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-4 text-base leading-7 text-fg-muted">{subtitle}</p>
          )}

          <div className="mt-10">{children}</div>

          {footer && (
            <div className="mt-8 border-t border-border pt-6 text-center text-sm text-fg-muted">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AuthLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="font-medium text-primary transition hover:text-primary/80"
    >
      {children}
    </Link>
  );
}
