"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { clearTokenCache, uploadImage } from "@/lib/api";
import { dashboardPath, passwordIssues, safeRedirect } from "@/lib/utils";
import { PageLoader, Spinner } from "@/components/ui/Spinner";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { useAuth } from "@/context/AuthContext";

function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", imageUrl: "" });
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });
  const issues = passwordIssues(form.password);

  // Already signed in? No need to see this form: send them on to where they were headed, or their dashboard.
  useEffect(() => {
    if (user) router.replace(safeRedirect(params.get("redirect")) || dashboardPath(user.role));
  }, [user, router, params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast.error("Please enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error("Please enter a valid email address.");
    if (issues.length) return toast.error(`Password needs ${issues.join(", ")}.`);
    if (imageMode === "url" && form.imageUrl && !/^https?:\/\/\S+$/i.test(form.imageUrl)) return toast.error("Please enter a valid image URL.");

    setLoading(true);
    try {
      let image = "";
      if (imageMode === "upload" && file) {
        try {
          image = await uploadImage(file, "avatar");
        } catch (err: any) {
          toast.error(err.message || "Image upload failed. You can add a photo later from your profile.");
        }
      } else if (imageMode === "url") {
        image = form.imageUrl.trim();
      }

      const body: any = { name: form.name.trim(), email: form.email.trim(), password: form.password };
      if (image) body.image = image;
      const res: any = await signUp.email(body);
      if (res?.error) throw new Error(res.error.message || "Could not create your account.");

      clearTokenCache();
      await refresh();
      toast.success("Account created! Welcome to Glamora.");
      router.replace(safeRedirect(params.get("redirect")) || "/dashboard/customer");
    } catch (err: any) {
      toast.error(err?.message || "Could not create your account.");
      setLoading(false);
    }
  };

  if (user) return <PageLoader label="Taking you to your dashboard..." />;

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-plum-500">Book appointments and track them in one place.</p>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="label">Full name</label>
            <input id="name" className="input" autoComplete="name" value={form.name} onChange={set("name")} required />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" className="input" autoComplete="email" value={form.email} onChange={set("email")} required />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <div className="relative">
              <input id="password" type={show ? "text" : "password"} className="input pr-11" autoComplete="new-password" value={form.password} onChange={set("password")} required />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-plum-500" aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className={`mt-1.5 text-xs ${form.password && issues.length ? "text-red-600" : "text-plum-500"}`}>
              {form.password && issues.length ? `Needs ${issues.join(", ")}.` : "At least 6 characters with one uppercase and one lowercase letter."}
            </p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label mb-0">Profile image (optional)</span>
              <div className="flex rounded-lg bg-plum-50 p-0.5 text-xs font-medium">
                {(["upload", "url"] as const).map((m) => (
                  <button type="button" key={m} onClick={() => setImageMode(m)} className={`rounded-md px-2.5 py-1 ${imageMode === m ? "bg-white shadow-sm" : "text-plum-500"}`}>
                    {m === "upload" ? "Upload" : "Image URL"}
                  </button>
                ))}
              </div>
            </div>
            {imageMode === "upload" ? (
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-mulberry-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-mulberry-700" />
            ) : (
              <input className="input" placeholder="https://..." value={form.imageUrl} onChange={set("imageUrl")} />
            )}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading && <Spinner className="h-4 w-4" />} {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-plum-300">
          <span className="h-px flex-1 bg-plum-100" /> or <span className="h-px flex-1 bg-plum-100" />
        </div>
        <GoogleButton label="Sign up with Google" />

        <p className="mt-6 text-center text-sm text-plum-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-mulberry-600 hover:text-mulberry-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  );
}
