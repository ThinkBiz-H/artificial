import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Search } from "lucide-react";
import { useGlobalSearch } from "@/hooks/useAdminOps";
import { formatCurrency } from "@/lib/utils";

/** Topbar search across products, orders, customers, coupons, reviews and blogs. */
export function GlobalSearch() {
  const [value, setValue] = useState("");
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const { data, isFetching } = useGlobalSearch(term);

  // Debounce typing so each keystroke doesn't hit the API.
  useEffect(() => {
    const t = setTimeout(() => setTerm(value), 250);
    return () => clearTimeout(t);
  }, [value]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const close = () => {
    setOpen(false);
    setValue("");
  };
  const results = term.trim().length >= 2 ? data : undefined;
  const empty =
    results &&
    !results.products?.length &&
    !results.orders?.length &&
    !results.customers?.length &&
    !results.coupons?.length &&
    !results.reviews?.length &&
    !results.blogs?.length;

  const row = "flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-surface";
  const heading = "px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted";

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface/60 px-3">
        <Search size={15} className="text-muted" />
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && close()}
          placeholder="Search products, orders, customers…"
          aria-label="Search the admin"
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
        {isFetching && <Loader2 size={14} className="animate-spin text-muted" />}
      </div>

      {open && results && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-white py-1 shadow-lg">
          {empty && <p className="px-3 py-4 text-center text-sm text-muted">No matches for “{term}”</p>}
          {!!results.products?.length && (
            <>
              <p className={heading}>Products</p>
              {results.products.map((p) => (
                <Link key={p._id} to="/products/$productId/edit" params={{ productId: p._id }} onClick={close} className={row}>
                  <span className="truncate">{p.title}</span>
                  <span className="flex-none font-mono text-xs text-muted">{formatCurrency(p.salePrice || p.price)}</span>
                </Link>
              ))}
            </>
          )}
          {!!results.orders?.length && (
            <>
              <p className={heading}>Orders</p>
              {results.orders.map((o) => (
                <Link key={o._id} to="/orders/$orderId" params={{ orderId: o._id }} onClick={close} className={row}>
                  <span className="truncate font-mono text-xs">{o.orderNumber}<span className="ml-2 font-sans text-muted">{o.shippingAddress?.fullName}</span></span>
                  <span className="flex-none text-xs text-muted">{o.orderStatus}</span>
                </Link>
              ))}
            </>
          )}
          {!!results.customers?.length && (
            <>
              <p className={heading}>Customers</p>
              {results.customers.map((c) => (
                <Link key={c._id} to="/customers/$customerId" params={{ customerId: c._id }} onClick={close} className={row}>
                  <span className="truncate">{c.name}</span>
                  <span className="flex-none text-xs text-muted">{c.mobile || c.email}</span>
                </Link>
              ))}
            </>
          )}
          {!!results.coupons?.length && (
            <>
              <p className={heading}>Coupons</p>
              {results.coupons.map((c) => (
                <Link key={c._id} to="/coupons" onClick={close} className={row}>
                  <span className="font-mono text-xs">{c.code}</span>
                  <span className="flex-none text-xs text-muted">{c.type === "percentage" ? `${c.discount}%` : formatCurrency(c.discount)}{c.isActive ? "" : " · inactive"}</span>
                </Link>
              ))}
            </>
          )}
          {!!results.reviews?.length && (
            <>
              <p className={heading}>Reviews</p>
              {results.reviews.map((r) => (
                <Link key={r._id} to="/reviews" onClick={close} className={row}>
                  <span className="truncate">“{r.comment}”</span>
                  <span className="flex-none text-xs text-muted">{r.rating}★ · {r.productTitle}</span>
                </Link>
              ))}
            </>
          )}
          {!!results.blogs?.length && (
            <>
              <p className={heading}>Blogs</p>
              {results.blogs.map((b) => (
                <Link key={b._id} to="/blogs/$blogId/edit" params={{ blogId: b._id }} onClick={close} className={row}>
                  <span className="truncate">{b.title}</span>
                  <span className="flex-none text-xs text-muted">{b.status}</span>
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
