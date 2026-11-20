"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { signIn, signOut } from "@/lib/auth-client";
import { api, ApiError, clearTokenCache } from "@/lib/api";
import { dashboardPath, safeRedirect } from "@/lib/utils";
import { PageLoader, Spinner } from "@/components/ui/Spinner";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { useAuth } from "@/context/AuthContext";
import type { Me } from "@/lib/types";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // Already signed in? No need to see this form: send them on to where they were headed, or their dashboard.
  useEffect(() => {
    if (user) router.replace(safeRedirect(params.get("redirect")) || dashboardPath(user.role));
  }, [user, router, params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please enter your email and password.");
    setLoading(true);
    try {
      const res: any = await signIn.email({ email: email.trim(), password });
      if (res?.error) throw new Error(res.error.message || "Invalid email or password.");

      clearTokenCache();
      const me = await api<{ user: Me }>("/users/me");
      await refresh();
      toast.success(`Welcome back, ${me.user.name.split(" ")[0]}!`);
      router.replace(safeRedirect(params.get("redirect")) || dashboardPath(me.user.role));
    } catch (err: any) {
      if (err instanceof ApiError && err.code === "BLOCKED") {
        await signOut({});
      }
      toast.error(err?.message || "Could not sign in. Please try again.");
      setLoading(false);
    }
  };

  if (user) return <PageLoader label="Taking you to your dashboard..." />;

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-plum-500">Sign in to manage your appointments.</p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" autoComplete="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <div className="relative">
              <input id="password" type={show ? "text" : "password"} autoComplete="current-password" className="input pr-11" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-plum-500" aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading && <Spinner className="h-4 w-4" />} {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-plum-300">
          <span className="h-px flex-1 bg-plum-100" /> or <span className="h-px flex-1 bg-plum-100" />
        </div>
        <GoogleButton label="Continue with Google" />

        <p className="mt-6 text-center text-sm text-plum-500">
          New to Glamora?{" "}
          <Link href="/sign-up" className="font-semibold text-mulberry-600 hover:text-mulberry-700">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
