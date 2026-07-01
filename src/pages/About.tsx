import { Shield, Radio, Database, Layers } from "lucide-react";

const About = () => {
  return (
    <div className="container py-16 max-w-3xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 mb-6">
        <Shield className="h-3 w-3 text-primary" />
        <span className="text-xs font-mono uppercase tracking-widest text-primary">About</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
        Guarding the <span className="text-gradient">software supply chain</span>
      </h1>
      <div className="prose prose-invert max-w-none text-muted-foreground space-y-4">
        <p className="text-lg">
          Supply Chain Monitor is a live feed of security advisories affecting open-source packages
          across the ecosystems developers depend on every day: npm, PyPI, Maven, NuGet, Go modules,
          Cargo crates, and RubyGems.
        </p>
        <p>
          Modern applications are built from thousands of transitive dependencies. A single
          compromised package — through account takeover, typosquatting, malicious maintainer
          handoff, or upstream infrastructure attack — can cascade into production systems within
          hours. This monitor exists to give security teams and developers a single, human-curated
          stream to watch that noise.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-12">
        <FeatureCard icon={Radio} title="Live updates" desc="New advisories appear instantly via realtime channels — no refresh required." />
        <FeatureCard icon={Layers} title="Multi-ecosystem" desc="Coverage across the seven major package registries used in production." />
        <FeatureCard icon={Database} title="Built to extend" desc="Ready to grow with severity, CVE IDs, references, and RSS feeds." />
      </div>

      <div className="mt-12 rounded-lg border border-border bg-gradient-card p-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Roadmap</h2>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li>CVE identifiers and CVSS severity scoring</li>
          <li>External references (advisories, patches, disclosure threads)</li>
          <li>Per-ecosystem RSS and Atom feeds</li>
          <li>Email and webhook notifications</li>
        </ul>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }: { icon: typeof Shield; title: string; desc: string }) => (
  <div className="rounded-lg border border-border bg-gradient-card p-5">
    <Icon className="h-5 w-5 text-primary mb-3" />
    <h3 className="font-semibold mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{desc}</p>
  </div>
);

export default About;
