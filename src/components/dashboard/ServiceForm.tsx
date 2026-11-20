"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ImagePlus } from "lucide-react";
import { api, uploadImage } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import type { Service } from "@/lib/types";
import { Spinner } from "@/components/ui/Spinner";

export function ServiceForm({ initial }: { initial?: Service }) {
  const router = useRouter();
  const [form, setForm] = useState({
    serviceName: initial?.serviceName || "",
    category: initial?.category || "",
    description: initial?.description || "",
    price: initial ? String(initial.price) : "",
    duration: initial ? String(initial.duration) : "",
    status: initial?.status || "active",
  });
  const [image, setImage] = useState(initial?.image || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value });

  const onFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      setImage(await uploadImage(file, "service"));
      toast.success("Image uploaded.");
    } catch (err: any) {
      toast.error(err.message || "Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.serviceName.trim().length < 3) return toast.error("Service name must be at least 3 characters.");
    if (!form.category) return toast.error("Please choose a category.");
    if (form.description.trim().length < 10) return toast.error("Description must be at least 10 characters.");
    if (!(Number(form.price) > 0)) return toast.error("Price must be a positive number.");
    if (!(Number(form.duration) > 0) || !Number.isInteger(Number(form.duration))) return toast.error("Duration must be a positive whole number of minutes.");
    if (!image) return toast.error("Please upload a service image.");

    setSaving(true);
    try {
      const body = { ...form, price: Number(form.price), duration: Number(form.duration), image };
      const res = initial
        ? await api<{ message: string }>(`/services/${initial._id}`, { method: "PUT", body })
        : await api<{ message: string }>("/services", { method: "POST", body });
      toast.success(res.message);
      router.push("/dashboard/admin/services");
    } catch (err: any) {
      toast.error(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card max-w-3xl space-y-5 p-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="serviceName" className="label">Service name</label>
          <input id="serviceName" className="input" value={form.serviceName} onChange={set("serviceName")} required />
        </div>
        <div>
          <label htmlFor="category" className="label">Category</label>
          <select id="category" className="input" value={form.category} onChange={set("category")} required>
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="label">Status</label>
          <select id="status" className="input" value={form.status} onChange={set("status")}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label htmlFor="price" className="label">Price (USD)</label>
          <input id="price" type="number" min="0" step="0.01" className="input" value={form.price} onChange={set("price")} required />
        </div>
        <div>
          <label htmlFor="duration" className="label">Estimated duration (minutes)</label>
          <input id="duration" type="number" min="1" step="1" className="input" value={form.duration} onChange={set("duration")} required />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="label">Description</label>
          <textarea id="description" rows={4} className="input" value={form.description} onChange={set("description")} required />
        </div>
        <div className="sm:col-span-2">
          <span className="label">Service image</span>
          <div className="flex flex-wrap items-center gap-4">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="Service preview" className="h-24 w-32 rounded-lg object-cover" />
            ) : (
              <div className="flex h-24 w-32 items-center justify-center rounded-lg border border-dashed border-plum-200 text-plum-300"><ImagePlus className="h-7 w-7" /></div>
            )}
            <div>
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => onFile(e.target.files?.[0])} disabled={uploading} className="block text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-mulberry-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-mulberry-700" />
              <p className="mt-1.5 flex items-center gap-2 text-xs text-plum-500">
                {uploading ? <><Spinner className="h-3.5 w-3.5" /> Uploading...</> : "JPG, PNG, WEBP or GIF, up to 5 MB."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={saving || uploading}>
          {saving && <Spinner className="h-4 w-4" />} {initial ? "Update service" : "Add service"}
        </button>
        <button type="button" className="btn-outline" onClick={() => router.push("/dashboard/admin/services")} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}
