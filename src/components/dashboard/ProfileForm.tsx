"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api, uploadImage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";

export function ProfileForm() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
      setImage(user.image || "");
    }
  }, [user]);

  const onFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      setImage(await uploadImage(file, "avatar"));
      toast.success("Image uploaded. Save changes to apply it.");
    } catch (err: any) {
      toast.error(err.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error("Name must be at least 2 characters.");
    setSaving(true);
    try {
      const res = await api<{ message: string }>("/users/me", { method: "PATCH", body: { name, phone, image } });
      await refresh();
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={save} className="card max-w-2xl space-y-5 p-6" noValidate>
      <div className="flex items-center gap-4">
        <Avatar src={image} name={name} className="h-20 w-20" />
        <div className="flex-1">
          <div className="mb-2 flex rounded-lg bg-plum-50 p-0.5 text-xs font-medium w-fit">
            {(["upload", "url"] as const).map((m) => (
              <button type="button" key={m} onClick={() => setMode(m)} className={`rounded-md px-3 py-1 ${mode === m ? "bg-white shadow-sm" : "text-plum-500"}`}>
                {m === "upload" ? "Upload image" : "Image URL"}
              </button>
            ))}
          </div>
          {mode === "upload" ? (
            <div className="flex items-center gap-2">
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => onFile(e.target.files?.[0])} disabled={uploading} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-mulberry-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-mulberry-700" />
              {uploading && <Spinner className="h-4 w-4" />}
            </div>
          ) : (
            <input className="input" placeholder="https://..." value={image} onChange={(e) => setImage(e.target.value)} />
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="pname" className="label">Full name</label>
          <input id="pname" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="pphone" className="label">Phone number</label>
          <input id="pphone" className="input" placeholder="+8801XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input bg-plum-50" value={user.email} disabled readOnly />
        </div>
        <div>
          <label className="label">Account type</label>
          <input className="input bg-plum-50 capitalize" value={user.role} disabled readOnly />
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={saving || uploading}>
        {saving && <Spinner className="h-4 w-4" />} Save changes
      </button>
    </form>
  );
}
