import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
// Better Auth lives on the Express server at <server-origin>/api/auth
export const AUTH_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export const authClient = createAuthClient({
  baseURL: AUTH_ORIGIN,
  plugins: [jwtClient()],
  fetchOptions: { credentials: "include" },
});

export const { signIn, signUp, signOut, useSession } = authClient;
