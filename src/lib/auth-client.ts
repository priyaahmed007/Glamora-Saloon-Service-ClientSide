// import { createAuthClient } from "better-auth/react";
// import { jwtClient } from "better-auth/client/plugins";

// export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
// // Better Auth lives on the Express server at <server-origin>/api/auth
// export const AUTH_ORIGIN = API_URL.replace(/\/api\/?$/, "");

// export const authClient = createAuthClient({
//   baseURL: AUTH_ORIGIN,
//   plugins: [jwtClient()],
//   fetchOptions: { credentials: "include" },
// });

// export const { signIn, signUp, signOut, useSession } = authClient;


import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Auth requests go through the client's own origin (proxied to the server by
// the rewrite in next.config.mjs), so cookies stay first-party.
export const AUTH_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

export const authClient = createAuthClient({
  baseURL: AUTH_ORIGIN,
  plugins: [jwtClient()],
  fetchOptions: { credentials: "include" },
});

export const { signIn, signUp, signOut, useSession } = authClient;