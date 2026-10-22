# Admin Panel — Store Management Frontend

A production-ready admin dashboard built against the provided "backend-final-production"
API. No mock data, no invented endpoints — every screen is wired to a real admin route
that exists in that backend.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (white background, black typography, no gradients — Stripe/Vercel/Shopify style)
- TanStack Router (code-based route tree, `src/routes/index.tsx`)
- TanStack Query (server state, caching, mutations)
- Zustand (auth + UI state)
- React Hook Form + Zod
- Axios (silent access-token refresh)
- Recharts (dashboard analytics), Lucide icons, Sonner (toasts)

## Getting started

```bash
npm install
# edit .env if your backend runs somewhere other than localhost:5000
npm run dev
```

Log in with an existing account that has `role: "admin"` in the database — the
login screen calls the same `/auth/login` endpoint customers use, then checks
the returned user's role client-side and refuses non-admin accounts.

```bash
npm run build     # production build -> dist/
npm run lint      # oxlint
npm run preview   # preview the production build
```

## Backend contract this app relies on

- Response envelope: `{ success, message, data, error }` on every endpoint.
- Access token returned in the JSON body from `/auth/login`; refresh token lives
  in an httpOnly cookie. On load the app silently calls `/auth/refresh-token`
  (`withCredentials`) then `/auth/me` to restore the session.
- Product/category/brand/blog/page create & update use `multipart/form-data`,
  with array/object fields JSON-stringified into form fields (matching this
  backend's multer + `JSON.parse(req.body.field)` pattern) — see `toFormData`
  in `src/lib/utils.ts`.
- Order status updates go through `PATCH /orders/:id/status`. The backend owns
  the status transition rules; this UI does not hardcode which transitions are
  legal and instead surfaces the backend's validation message if an update is
  rejected, so it never gets out of sync with the real state machine.
- Dashboard analytics come from `/admin/dashboard/*` (stats, recent-orders,
  top-products, low-stock, charts, top-customers, category-analytics,
  monthly-revenue) — each mapped 1:1 to its actual response shape.
- Reports (`/admin/reports/:type`) are downloaded as blobs and saved via an
  anchor tag; the backend's `Content-Disposition` header supplies the filename.

## Notable, deliberately-flagged limitation

**Reviews** in this backend are embedded documents on each `Product`, written
automatically for verified purchases, with **no approval/rejection workflow or
"pending" state in the schema** — only `DELETE /products/:id/reviews/:reviewId`
exists for admin moderation. Rather than inventing an approve/reject endpoint
that doesn't exist, the Reviews page is a product picker + review list with a
delete action only, and says so directly in the UI.

## Structure

```
src/
  api/        one module per backend resource (auth, dashboard, products, orders, ...)
  hooks/      TanStack Query hooks wrapping the api/ layer
  stores/     Zustand stores (auth, ui)
  components/ ui primitives, layout (Sidebar/Topbar/AppLayout), common widgets
  pages/      route-level pages, grouped by module
  routes/     TanStack Router route tree
  types/      TypeScript types mirroring the backend Mongoose models
  lib/        utils (incl. toFormData), query client
```
