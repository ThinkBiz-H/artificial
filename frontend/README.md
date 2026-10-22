# Storefront — Customer Frontend

A production-ready customer-facing e-commerce frontend built against the provided
"backend-final-production" API. No mock data, no invented endpoints — every screen
is wired to a real route that exists in that backend.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (custom ink / bone / brass design system — Fraunces, Inter, IBM Plex Mono)
- React Router v6
- TanStack Query (server state, caching, mutations)
- Zustand (auth + UI state)
- React Hook Form + Zod (form validation)
- Axios (API client with silent access-token refresh)
- Framer Motion, Lucide icons, Sonner (toasts)

## Getting started

```bash
npm install
# edit .env if your backend runs somewhere other than localhost:5000
npm run dev
```

By default the app expects the backend at `http://localhost:5000/api/v1`
(set in `.env` as `VITE_API_BASE_URL`). Start the backend first.

```bash
npm run build     # production build -> dist/
npm run lint      # oxlint
npm run preview   # preview the production build
```

## Backend contract this app relies on

- Response envelope: `{ success, message, data, error }` on every endpoint.
- Auth: `accessToken` returned in the JSON body from `/auth/login`, kept in memory
  only (never localStorage). The refresh token lives in an httpOnly cookie set by
  the backend; on app load the client silently calls `POST /auth/refresh-token`
  (`withCredentials: true`) to restore the session, then `GET /auth/me`.
- Cart/wishlist require authentication — the backend does not expose a guest cart.
- Products with `hasVariants: true` are matched to a specific `Variant` by its
  `attributes` (key/value pairs, e.g. `Color`/`Size`); `variantId` is sent with
  cart mutations once fully selected.
- Checkout creates the order first (`POST /orders`), then for `paymentMethod:
  "razorpay"` opens Razorpay Checkout using the `razorpayOrder` + `razorpayKeyId`
  returned in that same response, and verifies via `POST /payments/verify`.
- Coupons are validated server-side via `POST /cart/apply-coupon`; the discount
  code is carried into checkout and revalidated by `POST /orders`.

## Structure

```
src/
  api/        one module per backend resource (auth, products, cart, orders, ...)
  hooks/      TanStack Query hooks wrapping the api/ layer
  stores/     Zustand stores (auth, ui)
  components/ ui primitives, layout, product/cart components
  pages/      route-level pages (see src/routes/index.tsx for the full map)
  types/      TypeScript types mirroring the backend Mongoose models
  lib/        utils, razorpay loader, query client
```

## Notes / assumptions (flagged explicitly per your instructions)

- The backend has no public "contact form" endpoint, so the Contact page collects
  the message and shows a confirmation locally, while also surfacing the real
  `settings.contact` email/phone/address from `GET /settings` for a guaranteed
  channel. No new API was created.
- About / Privacy Policy / Terms & Conditions render whatever content exists at
  `GET /pages/about`, `/pages/privacy-policy`, `/pages/terms-conditions` (the
  generic CMS Page resource). If those slugs haven't been created in the admin
  yet, the page shows an honest "not published yet" state rather than fabricated
  copy.
