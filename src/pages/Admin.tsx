import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Save, Plus, X, Pencil, Trash2, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ECOSYSTEMS, ecosystemColor } from "@/lib/ecosystems";
import { toast } from "sonner";
import { SecurityUpdate } from "@/components/UpdateCard";
import { format } from "date-fns";

const schema = z.object({
  package: z.string().trim().min(1),
  ecosystem: z.enum(ECOSYSTEMS as unknown as [string, ...string[]]),
  registry: z.string().url("Registry URL is invalid"),
  severity: z.enum(["Critical", "High", "Medium", "Low"]),
  published_date: z.string(),
  summary: z.string().trim().min(1),
});

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [items, setItems] = useState<SecurityUpdate[]>([]);
  const [pkg, setPkg] = useState("");
  const [eco, setEco] = useState<string>("npm");
  const [summary, setSummary] = useState("");
  const [registry, setRegistry] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [publishedDate, setPublishedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading, user, navigate]);

  const load = async () => {
    const { data, error } = await supabase
      .from("security_updates")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setItems(data ?? []);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const reset = () => {
  setPkg("");
  setEco("npm");
  setRegistry("");
  setSeverity("Medium");
  setPublishedDate(new Date().toISOString().split("T")[0]);
  setSummary("");
  setEditingId(null);
};

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
  package: pkg,
  ecosystem: eco,
  registry,
  severity,
  published_date: publishedDate,
  summary,
});
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    try {
      const payload = {
  package: parsed.data.package,
  ecosystem: parsed.data.ecosystem,
  registry: parsed.data.registry,
  severity: parsed.data.severity,
  published_date: parsed.data.published_date,
  summary: parsed.data.summary,
};
      if (editingId) {
        const { error } = await supabase
          .from("security_updates")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Update saved");
      } else {
        const { error } = await supabase.from("security_updates").insert(payload);
        if (error) throw error;
        toast.success("Update published");
      }

      reset();
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (u: SecurityUpdate) => {
  setEditingId(u.id);
  setPkg(u.package);
  setEco(u.ecosystem);
  setRegistry(u.registry ?? "");
  setSeverity(u.severity ?? "Medium");
  setPublishedDate(u.published_date ?? "");
  setSummary(u.summary);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

  const remove = async (u: SecurityUpdate) => {
    if (!confirm(`Delete update for ${u.package}?`)) return;
    const { error } = await supabase.from("security_updates").delete().eq("id", u.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };

  if (loading) return <div className="container py-16 text-muted-foreground">Loading…</div>;

  if (!isAdmin) {
    return (
      <div className="container py-16 max-w-lg">
        <div className="rounded-lg border border-warning/40 bg-warning/5 p-6">
          <ShieldAlert className="h-6 w-6 text-warning mb-3" />
          <h1 className="text-xl font-bold mb-2">Admin role required</h1>
          <p className="text-sm text-muted-foreground mb-4">
            You are signed in as <span className="font-mono">{user?.email}</span>, but your account
            does not have the <code className="font-mono text-primary">admin</code> role. Assign it
            in the backend by inserting into <code className="font-mono text-primary">user_roles</code>.
          </p>
          <code className="block text-xs font-mono bg-secondary/60 p-3 rounded border border-border overflow-x-auto">
            INSERT INTO public.user_roles (user_id, role)<br />
            VALUES ('{user?.id}', 'admin');
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Admin panel</h1>
        <p className="text-muted-foreground text-sm">Publish and manage supply chain security updates.</p>
      </div>

      <form onSubmit={submit} className="rounded-xl border border-border bg-gradient-card p-6 shadow-card mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-mono text-xs uppercase tracking-widest text-primary">
            {editingId ? "Edit update" : "New update"}
          </h2>
          {editingId && (
            <Button type="button" size="sm" variant="ghost" onClick={reset}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Label htmlFor="package">Package</Label>
            <Input id="package" placeholder="e.g. lodash" value={pkg} onChange={(e) => setPkg(e.target.value)} className="font-mono" />
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Label htmlFor="ecosystem">Ecosystem</Label>
            <Select value={eco} onValueChange={setEco}>
              <SelectTrigger id="ecosystem"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ECOSYSTEMS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
  <Label>Severity</Label>

  <Select value={severity} onValueChange={setSeverity}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="Critical">Critical</SelectItem>
      <SelectItem value="High">High</SelectItem>
      <SelectItem value="Medium">Medium</SelectItem>
      <SelectItem value="Low">Low</SelectItem>
    </SelectContent>
  </Select>
</div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
  <Label>Registry URL</Label>

  <Input
    value={registry}
    onChange={(e) => setRegistry(e.target.value)}
    placeholder="https://www.npmjs.com/package/..."
  />
</div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
  <Label>Published Date</Label>

  <Input
    type="date"
    value={publishedDate}
    onChange={(e) => setPublishedDate(e.target.value)}
  />
</div>

        <div className="space-y-1.5 mb-5">
          <Label htmlFor="summary">Summary</Label>
          <Textarea
            id="summary"
            placeholder="Describe the vulnerability, affected versions, and mitigation…"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={5}
          />
        </div>

        <Button type="submit" disabled={busy} className="gap-2">
          {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {busy ? "Saving…" : editingId ? "Save changes" : "Publish update"}
        </Button>
      </form>

      <h2 className="font-mono text-xs uppercase tracking-widest text-primary mb-4">
        Existing updates ({items.length})
      </h2>
      <div className="rounded-lg border border-border overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No updates yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((u) => (
              <li key={u.id} className="flex items-start gap-4 p-4 hover:bg-secondary/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-semibold truncate">{u.package}</span>
                    <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-mono uppercase ${ecosystemColor[u.ecosystem] ?? ""}`}>
                      {u.ecosystem}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{u.summary}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
                    {format(new Date(u.created_at), "yyyy-MM-dd HH:mm")}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(u)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(u)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Admin;
