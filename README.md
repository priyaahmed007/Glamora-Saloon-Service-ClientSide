# Glamora Client

Next.js front end for **Glamora**, a salon appointment booking platform. Customers explore services, request appointments and pay for confirmed bookings via Stripe Checkout. The salon admin manages services, appointments, customers and transactions from a role-based dashboard.

- **Live website:** 
- **Client repository:** 
- **Server repository:** 
-

## Important Features

- Public Home and Browse Services pages (search by name, category filter, price sorting, pagination)
- Better Auth: email/password and Google sign-in, role-based redirects after login
- Protected service details page with an appointment booking form and live slot availability
- Customer dashboard: overview stats, my appointments, cancel pending requests, Pay Now (Stripe), payment history, profile
- Admin dashboard: overview, manage services (create/update/delete/activate with image upload), manage appointments, manage users (block/unblock), read-only transactions, profile
- Route guards on every dashboard route plus server-side role verification on all APIs
- Session survives page reloads; navbar updates instantly when auth state changes
- Toast notifications, loaders, confirmation dialogs, custom 404 and error pages
- Fully responsive (mobile, tablet, desktop)

## Technology Stack

Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Better Auth client (with JWT plugin), react-hot-toast, lucide-react.

## Installation Instructions

```bash

npm install
```

## Required Environment Variables

Copy `.env.example` to `.env` (names only are listed here):

```
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_GOOGLE_CLIENT_ID
BETTER_AUTH_URL
```

`NEXT_PUBLIC_API_URL` must end with `/api` (for example `http://localhost:8000/api`). Better Auth is served by the Express server, so the client derives its auth URL from this value. Never commit `.env`.

## How to Run the Project Locally

1. Start the **server** first (see the server README: `npm run seed` then `npm run dev`).
2. Start the client:

```bash
npm run dev
```

Open `http://localhost:3000`. Seeded demo accounts: `admin@glamora.com / Admin@123` and `customer@glamora.com / Customer@123`.

Production build: `npm run build && npm start`.

## Deployment Notes

- Deploy to Vercel (or similar). Set the five environment variables above in the hosting dashboard.
- Set the server's `CLIENT_URL` to this site's URL so CORS and Stripe redirect URLs match.
- Next.js App Router handles refreshes on every route, so reloading `/dashboard/...` or `/services/:id` does not 404. Private pages show a loader while the session is restored, then render or redirect to Sign In.

## Folder Structure

```
src/app          pages (home, services, auth, payment, dashboard/customer, dashboard/admin)
src/components   ui primitives, layout (navbar/footer), dashboard components
src/context      AuthContext (session + role)
src/lib          api client, auth client, types, helpers
```
