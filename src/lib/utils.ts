export const formatPrice = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount || 0);

export const formatDate = (value?: string) => {
  if (!value) return "-";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const formatDuration = (minutes: number) => {
  if (!minutes) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
};

export const todayISO = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
};

export const shortRef = (id?: string) => (id ? `${id.slice(0, 10)}...${id.slice(-6)}` : "-");

export const dashboardPath = (role?: string) => (role === "admin" ? "/dashboard/admin" : "/dashboard/customer");

export const safeRedirect = (target: string | null | undefined) =>
  target && target.startsWith("/") && !target.startsWith("//") ? target : null;

export const passwordIssues = (password: string) => {
  const issues: string[] = [];
  if (password.length < 6) issues.push("at least 6 characters");
  if (!/[A-Z]/.test(password)) issues.push("one uppercase letter");
  if (!/[a-z]/.test(password)) issues.push("one lowercase letter");
  return issues;
};
