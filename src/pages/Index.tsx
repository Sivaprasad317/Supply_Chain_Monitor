import { useEffect, useMemo, useState } from "react";
import { Search, Activity, ChevronLeft, ChevronRight, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ECOSYSTEMS } from "@/lib/ecosystems";
import UpdateCard, { SecurityUpdate } from "@/components/UpdateCard";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const PAGE_SIZE = 9;

const Index = () => {
  const { isAdmin } = useAuth();
  const [updates, setUpdates] = useState<SecurityUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ecosystem, setEcosystem] = useState<string>("all");
  const [page, setPage] = useState(1);

  const load = async () => {
    const { data, error } = await supabase
      .from("security_updates")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setUpdates(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("security_updates_feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "security_updates" }, () => {
        load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return updates.filter((u) => {
      if (ecosystem !== "all" && u.ecosystem !== ecosystem) return false;
      if (q && !u.package.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [updates, search, ecosystem]);

  const latest = updates.slice(0, 3);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSlice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search, ecosystem]);

  const handleDelete = async (u: SecurityUpdate) => {
    if (!confirm(`Delete update for ${u.package}?`)) return;
    const { error } = await supabase.from("security_updates").delete().eq("id", u.id);
    if (error) toast.error(error.message);
    else toast.success("Deleted");
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs font-mono uppercase tracking-widest text-primary">Live Feed</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Software supply chain <span className="text-gradient">security updates</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              A live, curated feed of security advisories across npm, PyPI, Maven, NuGet, Go, Cargo, and RubyGems. Stay ahead of the next compromise.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-10 space-y-12">
        {/* Latest */}
        {latest.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Radio className="h-4 w-4 text-primary animate-pulse-glow rounded-full" />
              <h2 className="font-mono text-xs uppercase tracking-widest text-primary">Latest Updates</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {latest.map((u) => (
                <UpdateCard key={u.id} update={u} isAdmin={isAdmin} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        )}

        {/* Feed */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="font-mono text-xs uppercase tracking-widest text-primary">All Advisories</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by package name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 font-mono"
              />
            </div>
            <Select value={ecosystem} onValueChange={setEcosystem}>
              <SelectTrigger className="md:w-56">
                <SelectValue placeholder="Ecosystem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ecosystems</SelectItem>
                {ECOSYSTEMS.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 rounded-lg border border-border bg-card/50 animate-pulse" />
              ))}
            </div>
          ) : pageSlice.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
              No security updates match your filters yet.
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pageSlice.map((u) => (
                  <UpdateCard key={u.id} update={u} isAdmin={isAdmin} onDelete={handleDelete} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <span className="font-mono text-xs text-muted-foreground">
                    Page {page} / {totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
};

export default Index;
