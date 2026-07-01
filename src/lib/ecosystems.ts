export const ECOSYSTEMS = [
  "npm",
  "PyPI",
  "Maven",
  "NuGet",
  "Go",
  "Cargo",
  "RubyGems",
] as const;

export type Ecosystem = (typeof ECOSYSTEMS)[number];

export const ecosystemColor: Record<string, string> = {
  npm: "text-[hsl(0_72%_60%)] border-[hsl(0_72%_60%/0.3)] bg-[hsl(0_72%_60%/0.08)]",
  PyPI: "text-[hsl(48_96%_60%)] border-[hsl(48_96%_60%/0.3)] bg-[hsl(48_96%_60%/0.08)]",
  Maven: "text-[hsl(24_95%_60%)] border-[hsl(24_95%_60%/0.3)] bg-[hsl(24_95%_60%/0.08)]",
  NuGet: "text-[hsl(260_85%_70%)] border-[hsl(260_85%_70%/0.3)] bg-[hsl(260_85%_70%/0.08)]",
  Go: "text-[hsl(190_95%_60%)] border-[hsl(190_95%_60%/0.3)] bg-[hsl(190_95%_60%/0.08)]",
  Cargo: "text-[hsl(20_90%_55%)] border-[hsl(20_90%_55%/0.3)] bg-[hsl(20_90%_55%/0.08)]",
  RubyGems: "text-[hsl(340_82%_65%)] border-[hsl(340_82%_65%/0.3)] bg-[hsl(340_82%_65%/0.08)]",
};
